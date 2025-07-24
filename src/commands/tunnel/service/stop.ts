import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import {
  detectPlatform,
  getServicePath,
  isServiceInstalled,
} from "../../../utils/system";

export const stopTunnel = new Command("stop")
  .description("Stop the tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.error(
        chalk.red(
          "Stopping a service is not supported on Windows. Use Ctrl+C to stop foreground processes.",
        ),
      );
      process.exit(1);
    }

    if (!isServiceInstalled(tunnel, platform)) {
      const serviceType = platform.hasSystemctl
        ? "systemd service"
        : "LaunchAgent";
      console.error(
        chalk.red(`The ${serviceType} for tunnel "${tunnel}" does not exist.`),
      );
      process.exit(1);
    }

    if (platform.hasSystemctl) {
      console.log(chalk.green(`✅ Stopping service 'tunneler-${tunnel}'...`));
      execSync(`systemctl stop tunneler-${tunnel}`, {
        stdio: "inherit",
      });
      console.log(chalk.green(`✅ Service stopped.`));
    } else if (platform.isMacOS) {
      const plistPath = getServicePath(tunnel, platform);
      console.log(chalk.green(`✅ Unloading LaunchAgent for '${tunnel}'...`));
      try {
        execSync(`launchctl bootout gui/$(id -u) "${plistPath}"`, {
          stdio: "ignore",
        });
      } catch {
        // ignore if not loaded
      }

      console.log(chalk.green(`✅ Service stopped.`));
    } else {
      console.error(chalk.red(`Unsupported platform '${platform.name}'.`));
      process.exit(1);
    }
  });
