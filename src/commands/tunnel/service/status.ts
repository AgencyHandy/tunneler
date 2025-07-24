import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import {
  detectPlatform,
  getServicePath,
  isServiceInstalled,
  isServiceActive,
} from "../../../utils/system";

export const statusTunnel = new Command("status")
  .description("Check the status of a tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.log(
        chalk.yellow("Service management is not supported on Windows."),
      );
      console.log(
        chalk.yellow(
          "Use 'tunneler tunnel run --tunnel <name>' to run in foreground.",
        ),
      );
      return;
    }

    if (!isServiceInstalled(tunnel, platform)) {
      console.log(chalk.red(`❌ Service not installed.`));
      return;
    }

    const servicePath = getServicePath(tunnel, platform);
    console.log(chalk.green(`✅ Service installed at:`), servicePath);

    if (platform.hasSystemctl) {
      let isActive = isServiceActive(tunnel, platform);
      let pid = "N/A";

      try {
        const pidOutput = execSync(
          `systemctl show -p MainPID --value tunneler-${tunnel}`,
          { encoding: "utf-8" },
        ).trim();
        if (pidOutput !== "0") pid = pidOutput;
      } catch {
        // ignore
      }

      if (isActive) {
        console.log(chalk.green(`✅ Service is active (running)`));
        console.log(chalk.green(`✅ PID:`), pid);
      } else {
        console.log(chalk.yellow(`❌ Service is inactive (stopped)`));
      }
    } else if (platform.isMacOS) {
      let loaded = false;
      let pid = "N/A";

      try {
        const listOutput = execSync(
          `launchctl list | grep com.tunneler.${tunnel}`,
          { encoding: "utf-8" },
        ).trim();
        loaded = listOutput.length > 0;
      } catch {
        // not loaded
      }

      if (loaded) {
        try {
          const psOutput = execSync(
            `ps -eo pid,command | grep cloudflared | grep '${tunnel}' | grep -v grep`,
            { encoding: "utf-8" },
          ).trim();
          if (psOutput) {
            // e.g., "12345 cloudflared tunnel --config ... run hasan.local"
            pid = psOutput.split(/\s+/)[0];
          }
        } catch {
          pid = "N/A";
        }
        console.log(chalk.green(`✅ Service is loaded (running)`));
        console.log(chalk.green(`✅ PID:`), pid);
      } else {
        console.log(chalk.yellow(`❌ Service is not loaded (stopped)`));
      }
    } else {
      console.log(chalk.red(`❌ Unsupported platform: ${platform.name}`));
    }
  });
