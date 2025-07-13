# @agencyhandy/tunneler

A CLI tool to manage Cloudflare Tunnels and DNS records without leaving your terminal.

## Installation

```bash
npm install -g @agencyhandy/tunneler
```

## Requirements
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) must be installed and available in your PATH.
- Node.js 16+

## Environment Variables

Before using the CLI, create a **Cloudflare API token** and note your **Zone ID**.

### Required Environment Variables

| Variable               | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | API Token with permissions (Zone:DNS Edit, Zone:Edit)   |
| `CLOUDFLARE_ZONE_ID`   | Zone ID for the domain you will create records in       |

### Cloudflare API Token Permissions

Your API token must have the following permissions for the relevant zone:

- **Zone:DNS → Edit, Read**
- **Zone → Edit, Read**

These permissions allow the CLI to create, update, and remove DNS records in your Cloudflare zone, as well as manage tunnel resources.

You can set these variables in your shell or in a `.env` file in your working directory:

```env
CLOUDFLARE_API_TOKEN=cf_test_ABC123xyz
CLOUDFLARE_ZONE_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

> 💡 **Tip**: `tunneler login` will prompt you to authenticate via your browser, but you still need a Zone in Cloudflare beforehand.

## Usage

### Authenticate with Cloudflare

```bash
tunneler login
```
This opens a browser window to complete authentication. You must select your zone to complete setup.

### Logout and Clean Up Credentials

```bash
tunneler logout
```
Removes all local credentials and configuration. You may also want to revoke your Cloudflare API token in your dashboard.

---

## Tunnel Management

### Create a Tunnel

```bash
tunneler tunnel create --name <tunnel-name>
```
Creates a new tunnel and saves configuration locally.

### List Tunnels

```bash
tunneler tunnel list
```
Shows all configured tunnels.

### Delete a Tunnel

```bash
tunneler tunnel delete --name <tunnel-name>
```
Deletes a tunnel from Cloudflare and removes local configuration (with confirmation prompt).

### Run a Tunnel in Foreground

```bash
tunneler tunnel run --tunnel <tunnel-name>
```
Runs the tunnel in the foreground. Leave this running to keep the tunnel active.

---

## Ingress Route Management

### Add an Ingress Rule

```bash
tunneler route add --tunnel <tunnel-name> --hostname <hostname> --service <ip:port> [--overwrite]
```
- `--overwrite`: Overwrite existing CNAME if it exists.
- This also creates or updates the CNAME in Cloudflare pointing to the tunnel endpoint.

### Remove an Ingress Rule

```bash
tunneler route remove --tunnel <tunnel-name> --hostname <hostname>
```
Removes both the ingress rule and the CNAME record in Cloudflare.

### List Ingress Rules

```bash
tunneler route list --tunnel <tunnel-name>
```
Shows all ingress rules for the tunnel.

---

## Tunnel as a System Service (Linux/macOS only)

### Install as a Service

```bash
tunneler tunnel service install --tunnel <tunnel-name>
```
Installs the tunnel as a system service (systemd on Linux, LaunchAgent on macOS).

### Start the Service

```bash
tunneler tunnel service start --tunnel <tunnel-name>
```

### Stop the Service

```bash
tunneler tunnel service stop --tunnel <tunnel-name>
```

### Check Service Status

```bash
tunneler tunnel service status --tunnel <tunnel-name>
```

### Uninstall the Service

```bash
tunneler tunnel service uninstall --tunnel <tunnel-name> [--force]
```
- `--force`: Skip confirmation prompt.

> **Note:** Service management is not supported on Windows. Use `tunneler tunnel run` to run in foreground mode on Windows.

---

## Examples

```bash
# Authenticate with Cloudflare
tunneler login

# Create a tunnel
tunneler tunnel create --name my-tunnel

# Add an ingress rule
tunneler route add --tunnel my-tunnel --hostname app.example.com --service localhost:3000

# Run the tunnel in foreground
tunneler tunnel run --tunnel my-tunnel

# Install as a system service (Linux/macOS)
tunneler tunnel service install --tunnel my-tunnel

# Start the service
tunneler tunnel service start --tunnel my-tunnel

# Check service status
tunneler tunnel service status --tunnel my-tunnel

# Stop the service
tunneler tunnel service stop --tunnel my-tunnel

# Uninstall the service
tunneler tunnel service uninstall --tunnel my-tunnel --force

# Remove an ingress rule
tunneler route remove --tunnel my-tunnel --hostname app.example.com

# List ingress rules
tunneler route list --tunnel my-tunnel
```

---

## Help

For detailed help on any command, run:

```bash
tunneler --help
tunneler tunnel --help
tunneler tunnel service --help
tunneler route --help
```

---

## License

MIT
