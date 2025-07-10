import chalk from "chalk";
import { spawnSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { validateCloudflared } from "../utils/cloudflaredValidator";

export const createCommand = new Command("create")
  .description("Create a new Cloudflare tunnel")
  .requiredOption("--name <name>", "Name of the tunnel")
  .action(async (opts) => {
    validateCloudflared();

    const tunnelName = opts.name;
    console.log(chalk.cyan(`Creating tunnel "${tunnelName}"...`));

    // Create the tunnel
    const result = spawnSync("cloudflared", ["tunnel", "create", tunnelName], {
      stdio: "pipe",
      encoding: "utf-8"
    });

    if (result.status !== 0) {
      console.error(chalk.red(result.stderr));
      process.exit(result.status || 1);
    }

    console.log(chalk.green(`✅ Tunnel "${tunnelName}" created.`));

    // Extract UUID from stdout
    const uuidMatch = result.stdout.match(/Created tunnel with id ([a-f0-9-]+)/);
    if (!uuidMatch) {
      console.error(chalk.red("Failed to extract tunnel UUID."));
      process.exit(1);
    }

    const uuid = uuidMatch[1];
    console.log(chalk.yellow(`Tunnel UUID: ${uuid}`));

    // Update config
    const configDir = path.join(os.homedir(), ".tunneler");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, "config.json");

    let configData: any = { tunnels: {} };
    if (fs.existsSync(configPath)) {
      configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    if (!configData.tunnels) {
      configData.tunnels = {};
    }

    const credentialsPath = path.join(
      os.homedir(),
      `.cloudflared/${uuid}.json`
    );
    const tunnelConfigPath = path.join(configDir, `${tunnelName}-config.yml`);

    configData.tunnels[tunnelName] = {
      uuid,
      credentialsPath,
      configPath: tunnelConfigPath
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    console.log(chalk.green("✅ Tunnel metadata saved."));
    console.log(chalk.yellow(`Credentials path: ${credentialsPath}`));
    console.log(chalk.yellow(`Config YAML path: ${tunnelConfigPath}`));
  });
