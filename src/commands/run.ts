import chalk from "chalk";
import { spawn } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const runCommand = new Command("run")
  .description("Run cloudflared tunnel in foreground")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
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

    console.log(chalk.green(`✅ Running tunnel "${tunnel}" in foreground...`));

    const proc = spawn(
      "cloudflared",
      ["tunnel", "--config", tunnelInfo.configPath, "run"],
      { stdio: "inherit" }
    );

    proc.on("exit", (code) => {
      console.log(chalk.yellow(`cloudflared exited with code ${code}`));
    });
  });
