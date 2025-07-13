import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const stopTunnel = new Command("stop")
  .description("Stop the tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = os.platform();

    if (platform === "win32") {
      console.error(
        chalk.red("Stopping a service is not supported on Windows. Use Ctrl+C to stop foreground processes.")
      );
      process.exit(1);
    }

    if (platform === "linux") {
      const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
      if (!fs.existsSync(servicePath)) {
        console.error(
          chalk.red(`The systemd service for tunnel "${tunnel}" does not exist.`)
        );
        process.exit(1);
      }

      console.log(chalk.green(`✅ Stopping service 'tunneler-${tunnel}'...`));
      require("child_process").execSync(`systemctl stop tunneler-${tunnel}`, { stdio: "inherit" });
      console.log(chalk.green(`✅ Service stopped.`));
    } else if (platform === "darwin") {
        const plistPath = path.join(
            os.homedir(),
            "Library/LaunchAgents",
            `com.tunneler.${tunnel}.plist`
        );

        console.log(chalk.green(`✅ Unloading and removing LaunchAgent...`));
        try {
            require("child_process").execSync(
            `launchctl bootout gui/$(id -u) ${plistPath}`,
            { stdio: "ignore" }
            );
        } catch {
            // ignore if not loaded
        }

        if (fs.existsSync(plistPath)) {
            fs.unlinkSync(plistPath);
        }

        console.log(chalk.green(`✅ Killing any remaining cloudflared processes for tunnel '${tunnel}'...`));
        try {
            require("child_process").execSync(
            `pgrep -f "cloudflared tunnel.*${tunnel}" | xargs kill -9`,
            { stdio: "ignore" }
            );
        } catch {
            // no process found is fine
        }

        console.log(chalk.green(`✅ Service uninstalled.`));

    } else {
        console.error(chalk.red(`Unsupported platform '${platform}'.`));
        process.exit(1);
    }
  });
