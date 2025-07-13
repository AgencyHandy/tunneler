import chalk from "chalk";
import { Command } from "commander";
import { getConfigData } from "../../utils/tunnelConfig";

export const listTunnel = new Command("list")
  .description("List all tunnels")
  .action(() => {
    let configData;
    try {
      configData = getConfigData();
    } catch (err: any) {
      console.log(chalk.yellow(err.message));
      process.exit(0);
    }
    const tunnels = configData.tunnels || {};

    const names = Object.keys(tunnels);
    if (names.length === 0) {
      console.log(chalk.yellow("No tunnels found."));
      process.exit(0);
    }

    console.log(chalk.cyan("Configured tunnels:"));
    names.forEach((name) => {
      const info = tunnels[name];
      console.log(chalk.green(`• ${name}`));
      console.log(chalk.gray(`   UUID: ${info.uuid}`));
      console.log(chalk.gray(`   Config: ${info.configPath}`));
    });

    process.exit(0);
  });
