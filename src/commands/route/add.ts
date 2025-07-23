import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import yaml from "yaml";
import { restartCloudflared } from "../../utils/cloudflaredManager";
import { validateCloudflared } from "../../utils/cloudflaredValidator";
import {
  checkIfCNAMEExists,
  createOrUpdateCNAME,
  validateCloudflareEnvironment,
} from "../../utils/cloudflareManager";
import { getTunnelInfo } from "../../utils/tunnelConfig";

export const addRoute = new Command("add")
  .description("Add an ingress rule to a tunnel")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .requiredOption("--hostname <hostname>", "Hostname")
  .requiredOption("--service <service>", "Target service (ip:port)")
  .option("--overwrite", "Overwrite existing CNAME if it exists")
  .action(async (opts) => {
    validateCloudflared();
    validateCloudflareEnvironment();

    const { tunnel, hostname, service, overwrite } = opts;

    let tunnelInfo;
    try {
      tunnelInfo = getTunnelInfo(tunnel);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    // ✅ Check if CNAME exists before proceeding
    const exists = await checkIfCNAMEExists(hostname);
    if (exists && !overwrite) {
      console.error(
        chalk.red(
          `❌ A CNAME for "${hostname}" already exists. Use --overwrite to replace it.`,
        ),
      );
      process.exit(1);
    }

    const yamlPath = tunnelInfo.configPath;

    // Load existing YAML
    let yamlDoc: any = {
      tunnel,
      credentialsFile: tunnelInfo.credentialsPath,
      ingress: [],
    };
    if (fs.existsSync(yamlPath)) {
      yamlDoc = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));
    } else {
      console.log(chalk.yellow("Creating new config YAML..."));
    }

    // Remove any old rule for this hostname
    yamlDoc.ingress = yamlDoc.ingress.filter(
      (rule: any) => rule.hostname !== hostname,
    );
    yamlDoc.ingress.unshift({
      hostname,
      service: `http://${service}`,
    });

    // Ensure fallback rule
    if (
      !yamlDoc.ingress.find((r: any) => r.service?.startsWith("http_status"))
    ) {
      yamlDoc.ingress.push({ service: "http_status:404" });
    }

    // Write YAML
    fs.writeFileSync(yamlPath, yaml.stringify(yamlDoc));
    console.log(chalk.green(`✅ Ingress rule added.`));

    // Create or update CNAME in Cloudflare
    await createOrUpdateCNAME(hostname, `${tunnelInfo.uuid}.cfargotunnel.com`);

    // Restart cloudflared
    await restartCloudflared(tunnel);

    console.log(
      chalk.green(`✅ cloudflared restarted for tunnel "${tunnel}".`),
    );
    process.exit(0);
  });
