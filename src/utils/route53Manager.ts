import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  Route53Client,
  RRType
} from "@aws-sdk/client-route-53";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import chalk from "chalk";

const HOSTED_ZONE_ID = process.env.ROUTE53_ZONE_ID;

async function checkAwsIdentity() {
  const sts = new STSClient({});
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  console.log("✅ AWS authenticated as:", identity.Arn);
}

export async function validateAwsEnvironment() {
  const missingVars: string[] = [];

  if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push("AWS_ACCESS_KEY_ID");
  if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push("AWS_SECRET_ACCESS_KEY");
  if (!process.env.AWS_REGION) missingVars.push("AWS_REGION");
  if (!process.env.ROUTE53_ZONE_ID) missingVars.push("ROUTE53_ZONE_ID");

  if (missingVars.length > 0) {
    console.error(chalk.red("ERROR: Missing required environment variables:"));
    for (const v of missingVars) {
      console.error(` - ${v}`);
    }
    process.exit(1);
  }

  // Validate AWS credentials by calling STS
  try {
    await checkAwsIdentity();
  } catch (err: any) {
    console.error(chalk.red("ERROR: Failed to authenticate with AWS."));
    console.error(err.message || err);
    process.exit(1);
  }
}

const route53 = new Route53Client({});

export async function createCNAME(hostname: string, tunnelUUID: string) {
  await checkAwsIdentity();

  const fqdn = hostname.endsWith(".") ? hostname : `${hostname}.`;
  const target = `${tunnelUUID}.cfargotunnel.com.`;

  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Comment: "Created by Tunneler CLI",
      Changes: [
        {
          Action: "UPSERT" as ChangeAction,
          ResourceRecordSet: {
            Name: fqdn,
            Type: "CNAME" as RRType,
            TTL: 300,
            ResourceRecords: [
              {
                Value: target
              }
            ]
          }
        }
      ]
    }
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(params);
    const response = await route53.send(command);
    console.log(
      chalk.green(`✅ Route53 CNAME created/updated: ${fqdn} -> ${target}`)
    );
    return response;
  } catch (err: any) {
    console.error(chalk.red("Error creating CNAME in Route53:"));
    console.error(err.message || err);
    process.exit(1);
  }
}

export async function removeCNAME(hostname: string, tunnelUUID: string) {
  const fqdn = hostname.endsWith(".") ? hostname : `${hostname}.`;
  const target = `${tunnelUUID}.cfargotunnel.com.`;

  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Comment: "Deleted by Tunneler CLI",
      Changes: [
        {
          Action: "DELETE" as ChangeAction,
          ResourceRecordSet: {
            Name: fqdn,
            Type: "CNAME" as RRType,
            TTL: 300,
            ResourceRecords: [
              {
                Value: target
              }
            ]
          }
        }
      ]
    }
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(params);
    const response = await route53.send(command);
    console.log(
      chalk.green(`✅ Route53 CNAME deleted: ${fqdn}`)
    );
    return response;
  } catch (err: any) {
    console.error(chalk.red("Error deleting CNAME in Route53:"));
    console.error(err.message || err);

    // Common error: record does not exist
    if (
      err.Code === "InvalidChangeBatch" &&
      err.message.includes("not found")
    ) {
      console.log(chalk.yellow("⚠️ Record not found—nothing to delete."));
      return;
    }

    process.exit(1);
  }
}

export async function listCNAMEs() {
  const params = {
    HostedZoneId: HOSTED_ZONE_ID
  };

  const command = new ListResourceRecordSetsCommand(params);

  try {
    const response = await route53.send(command);
    const records = response.ResourceRecordSets || [];
    const cnames = records.filter(r => r.Type === "CNAME");
    return cnames;
  } catch (err: any) {
    console.error(chalk.red("Error listing Route53 records:"));
    console.error(err.message || err);
    process.exit(1);
  }
}