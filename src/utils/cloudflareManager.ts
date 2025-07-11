import axios from "axios";
import chalk from "chalk";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

const api = axios.create({
  baseURL: CF_API_BASE,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json"
  },
  timeout: 10_000
});

export async function createOrUpdateCNAME(hostname: string, target: string) {
  const recordName = hostname;
  const recordContent = target.endsWith(".") ? target.slice(0, -1) : target;

  console.log(chalk.cyan(`🔍 Checking if CNAME "${recordName}" exists in Cloudflare...`));

  try {
    const listResp = await api.get(`/zones/${ZONE_ID}/dns_records`, {
      params: { type: "CNAME", name: recordName }
    });

    const existing = listResp.data.result[0];

    if (existing) {
      console.log(chalk.yellow(`⚠️ Existing CNAME found. Updating...`));

      const updateResp = await api.put(
        `/zones/${ZONE_ID}/dns_records/${existing.id}`,
        {
          type: "CNAME",
          name: recordName,
          content: recordContent,
          ttl: 300,
          proxied: true
        }
      );

      console.log(
        chalk.green(
          `✅ Updated CNAME: ${recordName} -> ${recordContent}`
        )
      );
    } else {
      console.log(chalk.cyan(`Creating new CNAME "${recordName}"...`));

      const createResp = await api.post(
        `/zones/${ZONE_ID}/dns_records`,
        {
          type: "CNAME",
          name: recordName,
          content: recordContent,
          ttl: 300,
          proxied: true
        }
      );

      console.log(
        chalk.green(
          `✅ Created CNAME: ${recordName} -> ${recordContent}`
        )
      );
    }
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error(
        chalk.red("❌ Cloudflare API error:"),
        JSON.stringify(err.response?.data, null, 2)
      );
    } else {
      console.error(chalk.red("❌ Unexpected error:"), err);
    }
    process.exit(1);
  }
}
