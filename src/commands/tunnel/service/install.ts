import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { installAsService } from "../../../utils/system";

export const installService = new Command("install")
  .description("Install the tunnel as a system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action(async (opts) => {
    const { tunnel } = opts;
    const platform = os.platform();

    if (platform === "win32") {
      console.error(
        chalk.red("Installing as a service is not supported on Windows."),
      );
      process.exit(1);
    }

    const configDir = path.join(os.homedir(), ".tunneler");
    const configPath = path.join(configDir, "config.json");

    if (!fs.existsSync(configPath)) {
      console.error(
        chalk.red("No config found. Please run tunneler create first."),
      );
      process.exit(1);
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const tunnelInfo = configData.tunnels?.[tunnel];

    if (!tunnelInfo) {
      console.error(chalk.red(`Tunnel "${tunnel}" not found.`));
      process.exit(1);
    }

    // Check if service already exists
    if (platform === "linux") {
      const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
      if (fs.existsSync(servicePath)) {
        console.error(
          chalk.red(
            `Service already exists. Uninstall it first if you want to replace it.`,
          ),
        );
        process.exit(1);
      }
    } else if (platform === "darwin") {
      const plistPath = path.join(
        os.homedir(),
        "Library/LaunchAgents",
        `com.tunneler.${tunnel}.plist`,
      );
      if (fs.existsSync(plistPath)) {
        console.error(
          chalk.red(
            `Service already exists. Uninstall it first if you want to replace it.`,
          ),
        );
        process.exit(1);
      }
    }

    console.log(chalk.green(`✅ Installing system service...`));
    await installAsService(tunnel, tunnelInfo.configPath);

    if (platform === "linux") {
      execSync(`systemctl enable tunneler-${tunnel}`);
      console.log(chalk.green(`✅ Service installed and enabled.`));
      console.log(chalk.yellow(`You can start it with:`));
      console.log(`  tunneler tunnel start --tunnel ${tunnel}`);
    } else {
      console.log(chalk.green(`✅ Service installed.`));
      console.log(chalk.yellow(`You can start it with:`));
      console.log(`  tunneler tunnel start --tunnel ${tunnel}`);
    }
  });
