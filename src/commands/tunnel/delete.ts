import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { validateCloudflared } from "../../utils/cloudflaredValidator";

export const deleteTunnel = new Command("delete")
  .description("Delete a tunnel and remove its configuration")
  .requiredOption("--name <name>", "Tunnel name")
  .action(async (opts) => {
    validateCloudflared();
    
    const { name } = opts;
    console.log(chalk.cyan(`Deleting tunnel "${name}"...`));

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
    console.log(chalk.green(`✅ Removed tunnel "${name}" from config.`));

    console.log(chalk.green(`✅ Tunnel "${name}" deleted successfully.`));
    process.exit(0);
  });
