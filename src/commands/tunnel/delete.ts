import chalk from "chalk";
import { spawnSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import { validateCloudflared } from "../../utils/cloudflaredValidator";
import {
  getConfigData,
  getConfigPath,
  getTunnelInfo,
} from "../../utils/tunnelConfig";

export const deleteTunnel = new Command("delete")
  .description("Delete a tunnel from Cloudflare and remove local configuration")
  .requiredOption("--name <name>", "Tunnel name")
  .action(async (opts) => {
    validateCloudflared();

    const { name } = opts;
    console.log(chalk.cyan(`Preparing to delete tunnel "${name}"...`));

    let tunnelInfo;
    try {
      tunnelInfo = getTunnelInfo(name);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    if (!tunnelInfo) {
      console.error(chalk.red(`Tunnel "${name}" not found.`));
      process.exit(1);
    }

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: `This will delete the tunnel from Cloudflare and remove local config. Continue?`,
        default: false,
      },
    ]);

    if (!confirm.proceed) {
      console.log(chalk.yellow("Aborted."));
      process.exit(0);
    }

    // Delete from Cloudflare
    console.log(chalk.cyan(`Deleting tunnel from Cloudflare...`));
    const result = spawnSync("cloudflared", ["tunnel", "delete", name], {
      stdio: "inherit",
    });

    if (result.status !== 0) {
      console.error(chalk.red(`Failed to delete tunnel from Cloudflare.`));
      process.exit(result.status || 1);
    }

    // Remove YAML config file
    if (fs.existsSync(tunnelInfo.configPath)) {
      fs.unlinkSync(tunnelInfo.configPath);
      console.log(chalk.green(`✅ Removed config: ${tunnelInfo.configPath}`));
    }

    // Remove credentials file
    if (fs.existsSync(tunnelInfo.credentialsPath)) {
      fs.unlinkSync(tunnelInfo.credentialsPath);
      console.log(
        chalk.green(`✅ Removed credentials: ${tunnelInfo.credentialsPath}`),
      );
    }

    // Remove from config.json
    const configPath = getConfigPath();
    const configData = getConfigData();
    delete configData.tunnels[name];
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log(chalk.green(`✅ Removed tunnel "${name}" from local config.`));

    console.log(chalk.green(`✅ Tunnel "${name}" deleted successfully.`));
    process.exit(0);
  });
