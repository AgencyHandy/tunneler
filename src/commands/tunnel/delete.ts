import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import inquirer from "inquirer";
import { spawnSync } from "child_process";
import { validateCloudflared } from "../../utils/cloudflaredValidator";

export const deleteTunnel = new Command("delete")
  .description("Delete a tunnel from Cloudflare and remove local configuration")
  .requiredOption("--name <name>", "Tunnel name")
  .action(async (opts) => {
    validateCloudflared();

    const { name } = opts;
    console.log(chalk.cyan(`Preparing to delete tunnel "${name}"...`));

    const configDir = path.join(os.homedir(), ".tunneler");
    const configPath = path.join(configDir, "config.json");

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red("No config found. Please run tunneler create first."));
      process.exit(1);
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const tunnelInfo = configData.tunnels?.[name];

    if (!tunnelInfo) {
      console.error(chalk.red(`Tunnel "${name}" not found.`));
      process.exit(1);
    }

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: `This will delete the tunnel from Cloudflare and remove local config. Continue?`,
        default: false
      }
    ]);

    if (!confirm.proceed) {
      console.log(chalk.yellow("Aborted."));
      process.exit(0);
    }

    // Delete from Cloudflare
    console.log(chalk.cyan(`Deleting tunnel from Cloudflare...`));
    const result = spawnSync("cloudflared", ["tunnel", "delete", name], {
      stdio: "inherit"
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
      console.log(chalk.green(`✅ Removed credentials: ${tunnelInfo.credentialsPath}`));
    }

    // Remove from config.json
    delete configData.tunnels[name];
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log(chalk.green(`✅ Removed tunnel "${name}" from local config.`));

    console.log(chalk.green(`✅ Tunnel "${name}" deleted successfully.`));
    process.exit(0);
  });
