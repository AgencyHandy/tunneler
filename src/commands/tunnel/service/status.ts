import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const statusTunnel = new Command("status")
  .description("Check the status of a tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = os.platform();

    if (platform === "win32") {
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

    if (platform === "linux") {
      const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
      if (!fs.existsSync(servicePath)) {
        console.log(chalk.red(`❌ Service not installed.`));
        return;
      }

      console.log(chalk.green(`✅ Service installed at:`), servicePath);

      let isActive = "inactive";
      let pid = "N/A";

      try {
        isActive = execSync(`systemctl is-active tunneler-${tunnel}`, {
          encoding: "utf-8",
        }).trim();
      } catch {
        // inactive/stopped
      }

      try {
        const pidOutput = execSync(
          `systemctl show -p MainPID --value tunneler-${tunnel}`,
          { encoding: "utf-8" },
        ).trim();
        if (pidOutput !== "0") pid = pidOutput;
      } catch {
        // ignore
      }

      if (isActive === "active") {
        console.log(chalk.green(`✅ Service is active (running)`));
        console.log(chalk.green(`✅ PID:`), pid);
      } else {
        console.log(chalk.yellow(`❌ Service is inactive (stopped)`));
      }
    } else if (platform === "darwin") {
      const plistPath = path.join(
        os.homedir(),
        "Library/LaunchAgents",
        `com.tunneler.${tunnel}.plist`,
      );
      if (!fs.existsSync(plistPath)) {
        console.log(chalk.red(`❌ Service not installed.`));
        return;
      }

      console.log(chalk.green(`✅ Service installed at:`), plistPath);

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
      console.log(chalk.red(`❌ Unsupported platform: ${platform}`));
    }
  });
