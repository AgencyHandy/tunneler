import chalk from "chalk";
import { execSync, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import psList from "ps-list";

export async function restartCloudflared(tunnelName: string) {
  console.log(
    chalk.cyan(`Restarting cloudflared for tunnel "${tunnelName}"...`),
  );

  const isWindows = os.platform() === "win32";
  let hasSystemctl = false;

  if (!isWindows) {
    // Check if systemctl exists
    try {
      execSync("command -v systemctl", { stdio: "ignore" });
      hasSystemctl = true;
    } catch {
      hasSystemctl = false;
    }
  }

  if (hasSystemctl) {
    console.log(chalk.gray("Detected systemd, restarting with systemctl..."));
    try {
      execSync(`systemctl restart cloudflared@${tunnelName}`, {
        stdio: "inherit",
      });
      console.log(chalk.green(`✅ cloudflared systemd service restarted.`));
    } catch (err: any) {
      console.error(
        chalk.red(`Failed to restart via systemctl: ${err.message}`),
      );
      process.exit(1);
    }
  } else {
    // No systemd (or Windows): spawn detached process
    console.log(
      chalk.yellow(
        "⚠️ Using process spawn to start cloudflared in background...",
      ),
    );

    // Determine YAML config path
    const yamlPath = path.join(
      os.homedir(),
      ".tunneler",
      `${tunnelName}-config.yml`,
    );

    if (!fs.existsSync(yamlPath)) {
      console.error(chalk.red(`YAML config not found: ${yamlPath}`));
      process.exit(1);
    }

    // On Windows, use "cmd.exe /c start" to detach properly
    if (isWindows) {
      const child = spawn(
        "cmd.exe",
        [
          "/c",
          "start",
          "cloudflared",
          "tunnel",
          "--config",
          `"${yamlPath}"`,
          "run",
          tunnelName,
        ],
        {
          detached: true,
          stdio: "ignore",
          shell: true,
        },
      );

      child.unref();
      console.log(
        chalk.green(`✅ cloudflared process started in background (Windows).`),
      );
    } else {
      const child = spawn(
        "cloudflared",
        ["tunnel", "--config", yamlPath, "run", tunnelName],
        {
          detached: true,
          stdio: "ignore",
        },
      );

      child.unref();
      console.log(chalk.green(`✅ cloudflared process started in background.`));
    }
  }
}

export async function stopCloudflared(tunnelName: string) {
  console.log(chalk.cyan(`Stopping cloudflared for tunnel "${tunnelName}"...`));

  const isWindows = os.platform() === "win32";
  let hasSystemctl = false;

  if (!isWindows) {
    try {
      execSync("command -v systemctl", { stdio: "ignore" });
      hasSystemctl = true;
    } catch {
      hasSystemctl = false;
    }
  }

  if (hasSystemctl) {
    console.log(chalk.gray("Detected systemd, stopping with systemctl..."));
    try {
      execSync(`systemctl stop cloudflared@${tunnelName}`, {
        stdio: "inherit",
      });
      console.log(chalk.green(`✅ cloudflared systemd service stopped.`));
    } catch (err: any) {
      console.error(chalk.red(`Failed to stop via systemctl: ${err.message}`));
      process.exit(1);
    }
  } else {
    // No systemd: attempt to find and kill processes
    console.log(
      chalk.yellow(
        "⚠️ No systemd detected. Attempting to find and kill cloudflared process...",
      ),
    );

    let matches: any[] = [];
    try {
      const processes = await psList();
      matches = processes.filter(
        (p) =>
          p.name.toLowerCase().includes("cloudflared") &&
          p.cmd?.includes(tunnelName),
      );
    } catch (err: any) {
      console.error(chalk.red(`Failed to list processes: ${err.message}`));
      process.exit(1);
    }

    if (matches.length === 0) {
      console.log(chalk.yellow("⚠️ No cloudflared process found."));
      return;
    }

    for (const proc of matches) {
      try {
        process.kill(proc.pid);
        console.log(chalk.green(`✅ Killed process PID ${proc.pid}`));
      } catch (err: any) {
        console.error(
          chalk.red(`Failed to kill PID ${proc.pid}: ${err.message}`),
        );
        process.exit(1);
      }
    }
  }
}
