import chalk from "chalk";
import { spawn } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import { validateCloudflared } from "../utils/cloudflaredValidator";

export const loginCommand = new Command("login")
  .description("Authenticate with Cloudflare")
  .action(async () => {
    validateCloudflared();

    console.log(chalk.cyan("Launching Cloudflare login..."));

    const proc = spawn("cloudflared", ["tunnel", "login"], {
      stdio: "inherit",
    });

    proc.on("exit", (code) => {
      if (code !== 0) {
        console.error(chalk.red(`cloudflared exited with code ${code}`));
        process.exit(code || 1);
      }

      // Save a timestamp so we know login was done
      const configDir = path.join(os.homedir(), ".tunneler");
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const configPath = path.join(configDir, "config.json");

      let configData: any = {};
      if (fs.existsSync(configPath)) {
        configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
      configData.lastLogin = new Date().toISOString();

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      console.log(chalk.green("✅ Authentication successful."));
    });
  });
