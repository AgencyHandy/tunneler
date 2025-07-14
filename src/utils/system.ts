import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export async function installAsService(tunnel: string, configPath: string) {
  const platform = os.platform();

  if (platform === "linux") {
    // Dynamically find the binary path
    const cloudflaredPath = execSync("which cloudflared", {
      encoding: "utf-8",
    }).trim();

    const unitFile = `
[Unit]
Description=Tunneler Cloudflared Tunnel (${tunnel})
After=network.target

[Service]
ExecStart=${cloudflaredPath} tunnel --config ${configPath} run
Restart=always
User=${process.env.USER}
Environment=PATH=/usr/bin:/bin

[Install]
WantedBy=multi-user.target
`;

    const servicePath = `/etc/systemd/system/tunneler-${tunnel}.service`;
    fs.writeFileSync(servicePath, unitFile, { mode: 0o644 });
    execSync(`systemctl daemon-reload`);
    execSync(`systemctl enable tunneler-${tunnel}`);
  } else if (platform === "darwin") {
    const cloudflaredPath = execSync("which cloudflared", {
      encoding: "utf-8",
    }).trim();

    const plist = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.tunneler.${tunnel}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${cloudflaredPath}</string>
    <string>tunnel</string>
    <string>--config</string>
    <string>${configPath}</string>
    <string>run</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/tunneler-${tunnel}.out.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/tunneler-${tunnel}.err.log</string>
</dict>
</plist>
`;

    const plistPath = path.join(
      os.homedir(),
      "Library/LaunchAgents",
      `com.tunneler.${tunnel}.plist`,
    );
    fs.writeFileSync(plistPath, plist, { mode: 0o644 });
  } else {
    console.error(
      `Service installation not supported on platform "${platform}".`,
    );
    process.exit(1);
  }
}
