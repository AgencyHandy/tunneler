import chalk from "chalk";
import { Command } from "commander";
import {
  detectPlatform,
  installAsService,
  isServiceInstalled,
} from "../../../utils/system";
import { getTunnelInfo } from "../../../utils/tunnelConfig";

export const installService = new Command("install")
  .description("Install the tunnel as a system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action(async (opts) => {
    const { tunnel } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.error(
        chalk.red("Installing as a service is not supported on Windows."),
      );
      process.exit(1);
    }

    let tunnelInfo;
    try {
      tunnelInfo = getTunnelInfo(tunnel);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    // Check if service already exists
    if (isServiceInstalled(tunnel, platform)) {
      console.error(
        chalk.red(
          `Service already exists. Uninstall it first if you want to replace it.`,
        ),
      );
      process.exit(1);
    }

    console.log(chalk.green(`✅ Installing system service...`));
    await installAsService(tunnel, tunnelInfo.configPath);

    console.log(chalk.green(`✅ Service installed and enabled.`));
    console.log(chalk.yellow(`You can start it with:`));
    console.log(`  tunneler tunnel service start --tunnel ${tunnel}`);
  });
