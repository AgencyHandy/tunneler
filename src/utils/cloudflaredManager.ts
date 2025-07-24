import chalk from "chalk";
import { execSync } from "child_process";
import {
  detectPlatform,
  getServicePath,
  isServiceInstalled,
  PlatformInfo,
} from "./system";

interface ServiceOperation {
  action: string;
  pastTense: string;
  systemdCommand: string;
  systemdMessage: string;
  macOSMessage: string;
  macOSCommands: (plistPath: string) => string[];
}

function validateServiceInstalled(
  tunnelName: string,
  platform: PlatformInfo,
): void {
  if (!isServiceInstalled(tunnelName, platform)) {
    const runnerType = platform.hasSystemctl
      ? "systemd service"
      : "LaunchAgent";
    const errorMessage = `${runnerType} not found. Have you run "tunneler tunnel service install --tunnel ${tunnelName}"?`;

    console.error(chalk.red(errorMessage));
    process.exit(1);
  }
}

function executeServiceOperation(
  tunnelName: string,
  operation: ServiceOperation,
): void {
  console.log(
    chalk.cyan(`${operation.action} cloudflared for tunnel "${tunnelName}"...`),
  );

  const platform = detectPlatform();
  validateServiceInstalled(tunnelName, platform);

  if (platform.hasSystemctl) {
    console.log(chalk.gray(`Detected systemd, ${operation.systemdMessage}...`));

    try {
      execSync(`${operation.systemdCommand} tunneler-${tunnelName}`, {
        stdio: "ignore",
      });
      console.log(
        chalk.green(
          `✅ tunneler-${tunnelName}.service ${operation.pastTense}.`,
        ),
      );
    } catch (err: any) {
      console.error(
        chalk.red(
          `Failed to ${operation.action.toLowerCase()} service tunneler-${tunnelName}: ${err.message}`,
        ),
      );
      process.exit(1);
    }
    return;
  } else if (platform.isMacOS) {
    const plistPath = getServicePath(tunnelName, platform);
    console.log(chalk.gray(`Detected macOS, ${operation.macOSMessage}...`));

    try {
      const commands = operation.macOSCommands(plistPath);
      commands.forEach((command) => {
        execSync(command, { stdio: "ignore" });
      });
      console.log(
        chalk.green(
          `✅ LaunchAgent com.tunneler.${tunnelName} ${operation.pastTense}.`,
        ),
      );
    } catch (err: any) {
      console.error(
        chalk.red(
          `Failed to ${operation.action.toLowerCase()} LaunchAgent: ${err.message}`,
        ),
      );
      process.exit(1);
    }
    return;
  } else {
    console.error(
      chalk.red(
        `Service operation not supported on platform "${platform.name || platform}".`,
      ),
    );
    process.exit(1);
  }
}

export function restartCloudflared(tunnelName: string) {
  const operation: ServiceOperation = {
    action: "Restarting",
    pastTense: "restarted",
    systemdCommand: "systemctl restart",
    systemdMessage: "restarting with systemctl",
    macOSMessage: "restarting with launchctl",
    macOSCommands: (plistPath: string) => [
      `launchctl unload "${plistPath}"`,
      `launchctl load "${plistPath}"`,
    ],
  };

  executeServiceOperation(tunnelName, operation);
}

export function stopCloudflared(tunnelName: string) {
  const operation: ServiceOperation = {
    action: "Stopping",
    pastTense: "stopped",
    systemdCommand: "systemctl stop",
    systemdMessage: "stopping with systemctl",
    macOSMessage: "unloading LaunchAgent",
    macOSCommands: (plistPath: string) => [`launchctl unload "${plistPath}"`],
  };

  executeServiceOperation(tunnelName, operation);
}
