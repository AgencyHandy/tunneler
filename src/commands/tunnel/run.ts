import chalk from "chalk";
import { spawn } from "child_process";
import { Command } from "commander";
import { getTunnelInfo } from "../../utils/tunnelConfig";

export const runTunnel = new Command("run")
  .description("Run cloudflared tunnel in foreground")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action((opts) => {
    const { tunnel } = opts;

    let tunnelInfo;
    try {
      tunnelInfo = getTunnelInfo(tunnel);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }

    console.log(chalk.green(`✅ Running tunnel "${tunnel}" in foreground...`));

    const proc = spawn(
      "cloudflared",
      ["tunnel", "--config", tunnelInfo.configPath, "run"],
      { stdio: "inherit" },
    );

    proc.on("exit", (code) => {
      console.log(chalk.yellow(`cloudflared exited with code ${code}`));
    });
  });
