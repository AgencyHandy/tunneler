import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const listTunnel = new Command("list")
  .description("List all tunnels")
  .action(() => {
    const configDir = path.join(os.homedir(), ".tunneler");
    const configPath = path.join(configDir, "config.json");

    if (!fs.existsSync(configPath)) {
      console.log(chalk.yellow("No tunnels found."));
      process.exit(0);
    }

    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
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
