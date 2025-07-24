import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import {
  detectPlatform,
  getServicePath,
  isServiceInstalled,
} from "../../../utils/system";

export const startTunnel = new Command("start")
  .description("Start the tunnel as a system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.error(
        chalk.red(
          "Starting as a service is not supported on Windows. Use 'tunneler tunnel run' to run in foreground.",
        ),
      );
      process.exit(1);
    }

    if (!isServiceInstalled(tunnel, platform)) {
      const serviceType = platform.hasSystemctl
        ? "systemd service"
        : "LaunchAgent";
      console.error(
        chalk.red(
          `The ${serviceType} for tunnel "${tunnel}" does not exist. Did you run 'tunneler tunnel service install'?`,
        ),
      );
      process.exit(1);
    }

    if (platform.hasSystemctl) {
      console.log(chalk.green(`✅ Starting service 'tunneler-${tunnel}'...`));
      execSync(`systemctl start tunneler-${tunnel}`, {
        stdio: "inherit",
      });
      console.log(chalk.green(`✅ Service started.`));
    } else if (platform.isMacOS) {
      const plistPath = getServicePath(tunnel, platform);
      console.log(chalk.green(`✅ Loading LaunchAgent for '${tunnel}'...`));
      execSync(`launchctl load "${plistPath}"`, {
        stdio: "inherit",
      });
      console.log(chalk.green(`✅ Service started.`));
    } else {
      console.error(chalk.red(`Unsupported platform '${platform.name}'.`));
      process.exit(1);
    }
  });
