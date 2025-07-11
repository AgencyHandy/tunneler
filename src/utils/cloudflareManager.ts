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

export function validateCloudflareEnvironment() {
  const missingVars: string[] = [];

  if (!process.env.CLOUDFLARE_API_TOKEN) missingVars.push("CLOUDFLARE_API_TOKEN");
  if (!process.env.CLOUDFLARE_ZONE_ID) missingVars.push("CLOUDFLARE_ZONE_ID");

  if (missingVars.length > 0) {
    console.error(chalk.red("❌ Missing required environment variables:"));
    for (const v of missingVars) {
      console.error(` - ${v}`);
    }
    process.exit(1);
  }
}

export async function checkIfCNAMEExists(hostname: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.error(chalk.red("❌ Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN in environment."));
    process.exit(1);
  }

  const resp = await axios.get(
    `${CF_API_BASE}/zones/${zoneId}/dns_records`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      params: {
        type: "CNAME",
        name: hostname
      }
    }
  );

  return resp.data.result.length > 0;
}

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

export async function deleteCNAME(hostname: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.error(chalk.red("❌ Missing CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN in environment."));
    process.exit(1);
  }

  console.log(chalk.blue(`🔍 Looking up DNS record for ${hostname}...`));

  // List records to find the ID
  const listResp = await axios.get(
    `${CF_API_BASE}/zones/${zoneId}/dns_records`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      params: {
        type: "CNAME",
        name: hostname
      }
    }
  );

  const record = listResp.data.result[0];
  if (!record) {
    console.log(chalk.yellow(`⚠️ No CNAME record found for ${hostname}. Nothing to delete.`));
    return;
  }

  const recordId = record.id;

  // Delete it
  await axios.delete(
    `${CF_API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  console.log(chalk.green(`✅ CNAME record deleted: ${hostname}`));
}