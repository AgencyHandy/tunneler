import chalk from "chalk";
import { execSync } from "child_process";

export function validateCloudflared() {
  try {
    execSync("cloudflared --version", { stdio: "ignore" });
  } catch {
    console.error(
      chalk.red("❌ ERROR: cloudflared is not installed or not found in PATH."),
    );
    console.error(chalk.yellow("Please install it from:"));
    console.error(
      chalk.blueBright(
        "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/",
      ),
    );
    process.exit(1);
  }
}
