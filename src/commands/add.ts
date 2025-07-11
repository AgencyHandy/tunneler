import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import yaml from "yaml";
import { restartCloudflared } from "../utils/cloudflaredManager";
import { validateCloudflared } from "../utils/cloudflaredValidator";
import { createOrUpdateCNAME } from "../utils/cloudflareManager";

export const addCommand = new Command("add")
  .description("Add an ingress rule to a tunnel")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .requiredOption("--hostname <hostname>", "Hostname")
  .requiredOption("--service <service>", "Target service (ip:port)")
  .action(async (opts) => {
    validateCloudflared();

    const { tunnel, hostname, service } = opts;

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

    // Load existing YAML
    let yamlDoc: any = { tunnel, credentialsFile: tunnelInfo.credentialsPath, ingress: [] };
    if (fs.existsSync(yamlPath)) {
      yamlDoc = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));
    } else {
      console.log(chalk.yellow("Creating new config YAML..."));
    }

    // Add the new ingress rule
    yamlDoc.ingress = yamlDoc.ingress.filter((rule: any) => rule.hostname !== hostname);
    yamlDoc.ingress.unshift({
      hostname,
      service: `http://${service}`
    });

    // Ensure fallback rule
    if (!yamlDoc.ingress.find((r: any) => r.service?.startsWith("http_status"))) {
      yamlDoc.ingress.push({ service: "http_status:404" });
    }

    // Write YAML
    fs.writeFileSync(yamlPath, yaml.stringify(yamlDoc));

    console.log(chalk.green(`✅ Ingress rule added.`));

    await createOrUpdateCNAME(
      hostname,
      `${tunnelInfo.uuid}.cfargotunnel.com`
    );

    // Restart cloudflared
    await restartCloudflared(tunnel);

    console.log(chalk.green(`✅ cloudflared restarted for tunnel "${tunnel}".`));
  });
