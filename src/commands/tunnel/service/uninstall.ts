import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import os from "os";
import path from "path";

export const uninstallService = new Command("uninstall")
  .description("Uninstall the tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .option("--force", "Skip confirmation prompt")
  .action(async (opts) => {
    const { tunnel, force } = opts;
    const platform = os.platform();

    if (platform === "win32") {
      console.error(
        chalk.red("Service uninstall is not applicable on Windows."),
      );
      process.exit(1);
    }

    if (!force) {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to uninstall the service for tunnel "${tunnel}"?`,
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.cyan("Aborted."));
        process.exit(0);
      }
    }

    const { execSync } = require("child_process");
    if (platform === "linux") {
      console.log(chalk.green(`✅ Stopping and disabling the service...`));
      try {
        execSync(`systemctl stop tunneler-${tunnel}`, { stdio: "ignore" });
        execSync(`systemctl disable tunneler-${tunnel}`, { stdio: "ignore" });
      } catch {
        // ignore if not running
      }

      const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
      if (fs.existsSync(servicePath)) {
        fs.unlinkSync(servicePath);
      }
      execSync(`systemctl daemon-reload`);
      console.log(chalk.green(`✅ Service uninstalled.`));
    } else if (platform === "darwin") {
      const plistPath = path.join(
        os.homedir(),
        "Library/LaunchAgents",
        `com.tunneler.${tunnel}.plist`,
      );
      console.log(chalk.green(`✅ Unloading and removing LaunchAgent...`));
      try {
        execSync(`launchctl unload ${plistPath}`);
      } catch {
        // ignore if not loaded
      }
      if (fs.existsSync(plistPath)) {
        fs.unlinkSync(plistPath);
      }
      console.log(chalk.green(`✅ Service uninstalled.`));
    } else {
      console.error(chalk.red(`Unsupported platform '${platform}'.`));
      process.exit(1);
    }
  });
