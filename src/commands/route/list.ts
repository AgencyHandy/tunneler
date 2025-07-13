import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import yaml from "yaml";
import { validateCloudflared } from "../../utils/cloudflaredValidator";

export const listRoutes = new Command("list")
  .description("List ingress rules for a tunnel")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    validateCloudflared();

    const { tunnel } = opts;

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

    const yamlDoc = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));

    const ingress = yamlDoc.ingress || [];

    if (ingress.length === 0) {
      console.log(chalk.yellow("No ingress rules configured."));
      return;
    }

    console.log(chalk.cyan(`Ingress rules for tunnel "${tunnel}":`));
    ingress.forEach((rule: any, index: number) => {
      if (rule.hostname) {
        console.log(
          chalk.green(` ${index + 1}. ${rule.hostname} -> ${rule.service}`),
        );
      } else if (rule.service?.startsWith("http_status")) {
        console.log(
          chalk.gray(` ${index + 1}. Default fallback: ${rule.service}`),
        );
      }
    });
    process.exit(0);
  });
