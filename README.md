# @agencyhandy/tunneler

A CLI tool to manage Cloudflare Tunnels and DNS records without needing to leave your terminal.

## Installation

```bash
npm install -g @agencyhandy/tunneler
```

## Environment Variables

Before using the CLI, create a **Cloudflare API token** and note your **Zone ID**.

### Required Environment Variables

| Variable               | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | API Token with permissions (Zone\:DNS Edit, Zone\:Edit) |
| `CLOUDFLARE_ZONE_ID`   | Zone ID for the domain you will create records in       |

Specify these environment variables depending on your machine. `export` is used most Linux / Unix machines. For Windows, please follow appropriate settings or powershell command.

#### Cloudflare API Token Permissions

Your **API Token** must have:

- **Zone:DNS → Edit, Read**
- **Zone → Edit, Read**

This allows creating/updating/removing DNS records in your zone.

#### `.env` Support

.env file should be where you are running the tunneler command from.

```bash
CLOUDFLARE_API_TOKEN=cf_test_ABC123xyz
CLOUDFLARE_ZONE_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

> 💡 **Tip**: `tunneler login` will prompt you to authenticate via your browser, but you still need a Zone in Cloudflare beforehand.

## Usage Guide

### Login to Cloudflare

Authenticate your `cloudflared` client,

```bash
tunneler login
```

This opens a browser window to complete authentication where you must select your zone to complete setup.

### Create a Tunnel

Creates a named tunnel and saves configuration,

```bash
tunneler create --name my-tunnel
```

### Add an Ingress Rule

Defines which local service to expose via your chosen hostname,

```bash
tunneler add --tunnel my-tunnel --hostname app.yourdomain.com --service localhost:3000
```

> This also automatically creates or updates the CNAME in Cloudflare pointing to the tunnel endpoint.

### Start the Tunnel

Runs the tunnel in the foreground,

```bash
tunneler run --tunnel my-tunnel
```

Leave this running to keep the tunnel active.

### Remove an Ingress Rule

Removes both the ingress rule and the CNAME record in Cloudflare,

```bash
tunneler remove --tunnel my-tunnel --hostname app.yourdomain.com
```

### List Ingress Rules

Show all ingress rules for the tunnel,

```bash
tunneler list --tunnel my-tunnel
```

### TODO: Status, health and others
