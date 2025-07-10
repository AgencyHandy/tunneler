import chalk from "chalk";
import { spawnSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";

export const logoutCommand = new Command("logout")
  .description("Logout from cloudflared and remove credentials")
  .action(() => {
    console.log(chalk.cyan("Logging out from cloudflared..."));

    // Uninstall service (suppress errors)
    try {
      spawnSync("cloudflared", ["service", "uninstall"], { stdio: "ignore" });
    } catch {
      // Ignore error
    }

    // NOTE: We skip tunnel cleanup because we are deleting credentials anyway

    // Remove .cloudflared directory
    const cloudflaredDir = path.join(os.homedir(), ".cloudflared");
    if (fs.existsSync(cloudflaredDir)) {
      fs.rmSync(cloudflaredDir, { recursive: true, force: true });
      console.log(chalk.green(`✅ Removed ${cloudflaredDir}`));
    } else {
      console.log(chalk.yellow(`⚠️ ${cloudflaredDir} not found—skipped.`));
    }

    // Remove .tunneler config
    const tunnelerDir = path.join(os.homedir(), ".tunneler");
    if (fs.existsSync(tunnelerDir)) {
      fs.rmSync(tunnelerDir, { recursive: true, force: true });
      console.log(chalk.green(`✅ Removed ${tunnelerDir}`));
    } else {
      console.log(chalk.yellow(`⚠️ ${tunnelerDir} not found—skipped.`));
    }

    console.log(chalk.green("✅ Successfully logged out and cleaned up."));
    console.log(chalk.yellow("⚠️ Remember to revoke the Cloudflare API token in your dashboard under My Profile > API Tokens if desired."));
  });
