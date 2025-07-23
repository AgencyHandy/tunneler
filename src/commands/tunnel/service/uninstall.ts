import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import {
  detectPlatform,
  isServiceInstalled,
  uninstallService as uninstallServiceUtil,
} from "../../../utils/system";

export const uninstallService = new Command("uninstall")
  .description("Uninstall the tunnel system service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .option("--force", "Skip confirmation prompt")
  .action(async (opts) => {
    const { tunnel, force } = opts;
    const platform = detectPlatform();

    if (platform.isWindows) {
      console.error(
        chalk.red("Service uninstall is not applicable on Windows."),
      );
      process.exit(1);
    }

    if (!isServiceInstalled(tunnel)) {
      console.log(
        chalk.yellow(`⚠️ Service is not installed for tunnel "${tunnel}".`),
      );
      process.exit(0);
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

    console.log(chalk.green(`✅ Uninstalling service...`));
    try {
      await uninstallServiceUtil(tunnel);
      console.log(chalk.green(`✅ Service uninstalled.`));
    } catch (err: any) {
      console.error(
        chalk.red(`Failed to uninstall service: ${err.message || err}`),
      );
      process.exit(1);
    }
  });
