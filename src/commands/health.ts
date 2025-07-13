import axios from "axios";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import yaml from "yaml";
import { validateCloudflared } from "../utils/cloudflaredValidator";

export const healthCommand = new Command("health")
  .description("Check health of ingress hostnames")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action(async (opts) => {
    validateCloudflared();
    
    const { tunnel } = opts;

    const configDir = path.join(os.homedir(), ".tunneler");
    const configPath = path.join(configDir, "config.json");

    if (!fs.existsSync(configPath)) {
      console.error(chalk.red("No config found. Please run tunneler create first."));
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

    const yamlDoc = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));
    const ingress = yamlDoc.ingress || [];

    for (const rule of ingress) {
      if (!rule.hostname) continue;

      const url = `https://${rule.hostname}`;
      process.stdout.write(`Checking ${url}... `);

      try {
        const res = await axios.get(url, { timeout: 5000 });
        if (res.status === 200) {
          console.log(chalk.green("✅ OK"));
        } else {
          console.log(chalk.yellow(`⚠️ HTTP ${res.status}`));
        }
      } catch (err: any) {
        console.log(chalk.red(`❌ ${err.message}`));
      }
    }
    process.exit(0);
  });
