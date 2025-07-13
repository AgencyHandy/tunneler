import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import yaml from "yaml";
import { restartCloudflared } from "../../utils/cloudflaredManager";
import { validateCloudflared } from "../../utils/cloudflaredValidator";
import {
  deleteCNAME,
  validateCloudflareEnvironment,
} from "../../utils/cloudflareManager";

export const removeRoute = new Command("remove")
  .description("Remove an ingress rule and Cloudflare DNS record from a tunnel")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .requiredOption("--hostname <hostname>", "Hostname to remove")
  .action(async (opts) => {
    validateCloudflared();
    validateCloudflareEnvironment();

    const { tunnel, hostname } = opts;

    const configDir = path.join(os.homedir(), ".tunneler");
    const configPath = path.join(configDir, "config.json");

    if (!fs.existsSync(configPath)) {
      console.error(
        chalk.red("No config found. Please run tunneler create first."),
      );
      process.exit(1);
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const tunnelInfo = configData.tunnels?.[tunnel];

    if (!tunnelInfo) {
      console.error(chalk.red(`Tunnel "${tunnel}" not found.`));
      process.exit(1);
    }

    const yamlPath = tunnelInfo.configPath;

    if (!fs.existsSync(yamlPath)) {
      console.error(chalk.red(`YAML config not found: ${yamlPath}`));
      process.exit(1);
    }

    // Load YAML
    const yamlDoc = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));

    const beforeCount = yamlDoc.ingress?.length || 0;
    yamlDoc.ingress = yamlDoc.ingress.filter(
      (rule: any) => rule.hostname !== hostname,
    );

    if (yamlDoc.ingress.length === beforeCount) {
      console.log(
        chalk.yellow(`⚠️ No matching ingress rule found for ${hostname}.`),
      );
    } else {
      fs.writeFileSync(yamlPath, yaml.stringify(yamlDoc));
      console.log(chalk.green(`✅ Removed ingress rule for ${hostname}.`));
    }

    // Delete DNS
    await deleteCNAME(hostname);

    // Restart cloudflared
    await restartCloudflared(tunnel);

    console.log(
      chalk.green(`✅ cloudflared restarted for tunnel "${tunnel}".`),
    );
    process.exit(0);
  });
