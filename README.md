# @agencyhandy/tunneler

A CLI tool to manage Cloudflare tunnels and Route53 DNS records.

## Installation
```bash
npm install -g @agencyhandy/tunneler
```
## Environment Variables

The CLI requires several AWS environment variables to function:

| Variable                | Description                             | Example              |
| ----------------------- | --------------------------------------- | -------------------- |
| `AWS_ACCESS_KEY_ID`     | Your AWS access key                     | `AKIA...`            |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key                     | `abcd...`            |
| `AWS_REGION`            | AWS region to use                       | `us-east-1`          |
| `ROUTE53_ZONE_ID`       | The Route53 Hosted Zone ID for your DNS | `Z1234567890ABCDEFG` |


**All these variables are **required**.**  
If any are missing, the CLI will exit with an error.

* * *

## `.env` File Support

You can create a `.env` file in your working directory to avoid exporting environment variables manually:

```ini
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=abcd...
AWS_REGION=us-east-1
ROUTE53_ZONE_ID=Z1234567890ABCDEFG
```

The CLI loads this automatically.

* * *

## Environment Validation

Before any AWS operation, `tunneler` performs these checks:

-   Confirms all required environment variables are present.
    
-   Verifies AWS credentials by calling `sts:GetCallerIdentity`.
    
-   Prints the authenticated IAM ARN.
    

This ensures you never encounter partial or invalid configurations during execution.

## Commands

### 1\. Login to Cloudflare

```bash
tunneler login
```

### 2\. Create a new tunnel

```bash
tunneler create --name my-tunnel
```

### 3\. Add ingress rule

```bash
tunneler add --tunnel my-tunnel --hostname app.example.com --service 192.168.1.100:8080
```

### 4\. Remove ingress rule

```bash
tunneler remove --tunnel my-tunnel --hostname app.example.com
```

### 5\. List ingress rules

```bash
tunneler list --tunnel my-tunnel
```

### 6\. Restart tunnel

```ts
restartCloudflared("my-tunnel");
```

### 7\. Stop tunnel

```ts
stopCloudflared("my-tunnel");
```

### 8\. Check health

```bash
tunneler health --tunnel my-tunnel
```

## Environment Variables
-   `ROUTE53_ZONE_ID`: Your Route53 Hosted Zone ID.    
-   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: AWS credentials.

## License
MIT