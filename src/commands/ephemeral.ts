import chalk from "chalk";
import { spawn } from "child_process";
import { Command } from "commander";
import {
    createOrUpdateEphemeralCNAME,
    validateAwsEnvironment,
} from "../utils/route53Manager";

export const ephemeralCommand = new Command("ephemeral")
  .description("Run ephemeral tunnel and create/update Route53 CNAME")
  .requiredOption("--hostname <hostname>", "Public hostname to create/update in Route53")
  .requiredOption("--service <service>", "Local service URL (e.g., localhost:3000)")
  .option("--verbose", "Show cloudflared logs")
  .action(async (opts) => {
    await validateAwsEnvironment();

    const { hostname, service, verbose } = opts;

    console.log(chalk.green(`✅ Starting ephemeral tunnel for service: ${service}`));

    const cloudflared = spawn("cloudflared", ["tunnel", "--url", `http://${service}`]);

    let ephemeralUrl: string | undefined;
    let outputBuffer = "";

    const handleOutput = async (text: string) => {
      if (verbose) {
        process.stdout.write(text);
      }

      if (ephemeralUrl) return;

      outputBuffer += text;

      const match = outputBuffer.match(/https:\/\/([a-z0-9\-]+\.trycloudflare\.com)/i);
      if (match) {
        const fullUrl = match[0].trim();
        const hostnameOnly = match[1].trim();
        ephemeralUrl = hostnameOnly;

        console.log(chalk.yellow(`✅ Ephemeral URL detected: ${fullUrl}`));

        await createOrUpdateEphemeralCNAME(hostname, hostnameOnly);

        console.log(chalk.green(`✅ Tunnel is now active and DNS updated.\nPress Ctrl+C to stop.`));
      }
    };

    cloudflared.stdout!.on("data", (data: Buffer) => handleOutput(data.toString()));
    cloudflared.stderr!.on("data", (data: Buffer) => handleOutput(data.toString()));

    cloudflared.on("exit", (code) => {
      console.log(chalk.yellow(`cloudflared exited with code ${code}`));
      process.exit(code || 0);
    });
  });
