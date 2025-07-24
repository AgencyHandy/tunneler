import chalk from "chalk";
import { Command } from "commander";
import { detectPlatform, isServiceInstalled } from "../../../utils/system";
import { restartCloudflared } from "../../../utils/cloudflaredManager";

export const restartTunnel = new Command("restart")
  .description("Restart the tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action(async (opts) => {
    const { tunnel } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.error(
        chalk.red(
          "Restarting as a service is not supported on Windows. Use Ctrl+C to stop and 'tunneler tunnel run' to start in foreground.",
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

    try {
      await restartCloudflared(tunnel);
      console.log(chalk.green(`✅ Service restarted successfully.`));
    } catch (err: any) {
      console.error(
        chalk.red(`Failed to restart service: ${err.message || err}`),
      );
      process.exit(1);
    }
  });
