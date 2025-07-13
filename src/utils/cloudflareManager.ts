import axios from "axios";
import chalk from "chalk";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export function validateCloudflareEnvironment() {
  const missingVars: string[] = [];

  if (!process.env.CLOUDFLARE_API_TOKEN)
    missingVars.push("CLOUDFLARE_API_TOKEN");
  if (!process.env.CLOUDFLARE_ZONE_ID) missingVars.push("CLOUDFLARE_ZONE_ID");

  if (missingVars.length > 0) {
    console.error(chalk.red("❌ Missing required environment variables:"));
    for (const v of missingVars) {
      console.error(` - ${v}`);
    }
    process.exit(1);
  }
}

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

const api = axios.create({
  baseURL: CF_API_BASE,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

// Shared helper to get existing record
async function getDnsRecord(type: string, name: string) {
  const resp = await api.get(`/zones/${ZONE_ID}/dns_records`, {
    params: { type, name },
  });
  return resp.data.result[0]; // Returns first matching record or undefined
}

export async function checkIfCNAMEExists(hostname: string): Promise<boolean> {
  const record = await getDnsRecord("CNAME", hostname);
  return Boolean(record);
}

export async function createOrUpdateCNAME(hostname: string, target: string) {
  const recordName = hostname;
  const recordContent = target.endsWith(".") ? target.slice(0, -1) : target;

  console.log(
    chalk.cyan(`🔍 Checking if CNAME "${recordName}" exists in Cloudflare...`),
  );

  try {
    const existing = await getDnsRecord("CNAME", recordName);

    if (existing) {
      console.log(chalk.yellow(`⚠️ Existing CNAME found. Updating...`));
      await api.put(`/zones/${ZONE_ID}/dns_records/${existing.id}`, {
        type: "CNAME",
        name: recordName,
        content: recordContent,
        ttl: 300,
        proxied: true,
      });
      console.log(
        chalk.green(`✅ Updated CNAME: ${recordName} -> ${recordContent}`),
      );
    } else {
      console.log(chalk.cyan(`Creating new CNAME "${recordName}"...`));
      await api.post(`/zones/${ZONE_ID}/dns_records`, {
        type: "CNAME",
        name: recordName,
        content: recordContent,
        ttl: 300,
        proxied: true,
      });
      console.log(
        chalk.green(`✅ Created CNAME: ${recordName} -> ${recordContent}`),
      );
    }
  } catch (err: any) {
    handleApiError(err);
  }
}

export async function deleteCNAME(hostname: string) {
  console.log(chalk.blue(`🔍 Looking up DNS record for ${hostname}...`));

  try {
    const existing = await getDnsRecord("CNAME", hostname);

    if (!existing) {
      console.log(
        chalk.yellow(
          `⚠️ No CNAME record found for ${hostname}. Nothing to delete.`,
        ),
      );
      return;
    }

    await api.delete(`/zones/${ZONE_ID}/dns_records/${existing.id}`);

    console.log(chalk.green(`✅ CNAME record deleted: ${hostname}`));
  } catch (err: any) {
    handleApiError(err);
  }
}

function handleApiError(err: any) {
  if (axios.isAxiosError(err)) {
    console.error(
      chalk.red("❌ Cloudflare API error:"),
      JSON.stringify(err.response?.data, null, 2),
    );
  } else {
    console.error(chalk.red("❌ Unexpected error:"), err);
  }
  process.exit(1);
}
