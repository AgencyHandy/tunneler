import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const startTunnel = new Command("start")
  .description("Start the tunnel as a system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = os.platform();

    if (platform === "win32") {
      console.error(
        chalk.red("Starting as a service is not supported on Windows. Use 'tunneler tunnel run' to run in foreground.")
      );
      process.exit(1);
    }

    if (platform === "linux") {
      const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
      if (!fs.existsSync(servicePath)) {
        console.error(
          chalk.red(`The systemd service for tunnel "${tunnel}" does not exist. Did you run 'tunneler tunnel service install'?`)
        );
        process.exit(1);
      }

      console.log(chalk.green(`✅ Starting service 'tunneler-${tunnel}'...`));
      require("child_process").execSync(`systemctl start tunneler-${tunnel}`, { stdio: "inherit" });
      console.log(chalk.green(`✅ Service started.`));
    } else if (platform === "darwin") {
      const plistPath = path.join(
        os.homedir(),
        "Library/LaunchAgents",
        `com.tunneler.${tunnel}.plist`
      );
      if (!fs.existsSync(plistPath)) {
        console.error(
          chalk.red(`The LaunchAgent plist for tunnel "${tunnel}" does not exist. Did you run 'tunneler tunnel service install'?`)
        );
        process.exit(1);
      }

      console.log(chalk.green(`✅ Loading LaunchAgent for '${tunnel}'...`));
      require("child_process").execSync(`launchctl load ${plistPath}`, { stdio: "inherit" });
      console.log(chalk.green(`✅ Service started.`));
    } else {
      console.error(chalk.red(`Unsupported platform '${platform}'.`));
      process.exit(1);
    }
  });
