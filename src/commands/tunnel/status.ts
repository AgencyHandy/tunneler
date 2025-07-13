import chalk from "chalk";
import { exec } from "child_process";
import { Command } from "commander";
import { validateCloudflared } from "../../utils/cloudflaredValidator";

export const statusTunnel = new Command("status")
  .description("Check status of the cloudflared tunnel service")
  .requiredOption("--tunnel <name>", "Tunnel name")
  .action(async (opts) => {
    validateCloudflared();
    
    const { tunnel } = opts;

    console.log(chalk.cyan(`Checking cloudflared status for tunnel "${tunnel}"...`));

    const serviceName = `cloudflared@${tunnel}`;

    exec(`systemctl is-active ${serviceName}`, (err, stdout, stderr) => {
      if (err) {
        console.error(chalk.red(`Error: ${stderr.trim()}`));
        process.exit(1);
      }

      const status = stdout.trim();
      if (status === "active") {
        console.log(chalk.green(`✅ Tunnel "${tunnel}" is running.`));
      } else {
        console.log(chalk.red(`❌ Tunnel "${tunnel}" is not running. Status: ${status}`));
      }

      console.log(chalk.cyan("\nRecent logs:"));
      exec(`journalctl -u ${serviceName} -n 10 --no-pager`, (err2, out2) => {
        if (err2) {
          console.error(chalk.red(`Could not get logs: ${err2.message}`));
          process.exit(1);
        }
        console.log(out2);
      });
    });
  });
