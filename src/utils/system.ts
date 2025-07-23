import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export interface PlatformInfo {
  isWindows: boolean;
  isMacOS: boolean;
  isLinux: boolean;
  hasSystemctl: boolean;
  name: string;
  cloudflaredPath?: string;
}

/**
 * Detect platform and available service management systems
 */
export function detectPlatform(): PlatformInfo {
  const platform = os.platform();
  const isWindows = platform === "win32";
  const isMacOS = platform === "darwin";
  const isLinux = platform === "linux";
  const cloudflaredPath = execSync("which cloudflared", {
    encoding: "utf-8",
  }).trim();
  let hasSystemctl = false;

  // Only check for systemctl on non-Windows, non-macOS systems
  if (!isWindows && !isMacOS) {
    try {
      execSync("command -v systemctl", { stdio: "ignore" });
      // Also verify systemd is actually running to avoid container issues
      execSync("systemctl is-system-running", { stdio: "ignore" });
      hasSystemctl = true;
    } catch {
      hasSystemctl = false;
    }
  }

  return {
    isWindows,
    isMacOS,
    isLinux,
    hasSystemctl,
    name: platform,
    cloudflaredPath,
  };
}

/**
 * Get the service file path for the current platform
 */
export function getServicePath(
  tunnelName: string,
  platformInfo?: PlatformInfo,
): string {
  const platform = platformInfo || detectPlatform();

  if (platform.hasSystemctl) {
    return `/etc/systemd/system/tunneler-${tunnelName}.service`;
  } else if (platform.isMacOS) {
    return path.join(
      os.homedir(),
      "Library/LaunchAgents",
      `com.tunneler.${tunnelName}.plist`,
    );
  } else {
    throw new Error(
      `Service management not supported on platform: ${platform.name}`,
    );
  }
}

/**
 * Check if a service is installed for the given tunnel
 */
export function isServiceInstalled(
  tunnelName: string,
  platformInfo?: PlatformInfo,
): boolean {
  try {
    const servicePath = getServicePath(tunnelName, platformInfo);
    return fs.existsSync(servicePath);
  } catch {
    return false;
  }
}

export async function installAsService(tunnel: string, configPath: string) {
  const platform = detectPlatform();

  if (platform.hasSystemctl) {
    const unitFile = `
[Unit]
Description=Tunneler Cloudflared Tunnel (${tunnel})
After=network.target

[Service]
ExecStart=${platform.cloudflaredPath} tunnel --config ${configPath} run
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
  } else if (platform.isMacOS) {
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
    <string>${platform.cloudflaredPath}</string>
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
      `Service installation not supported on platform "${platform.name}".`,
    );
    process.exit(1);
  }
}

export function shouldRestartService(
  tunnelName: string,
  platformInfo?: PlatformInfo,
): boolean {
  const platform = platformInfo || detectPlatform();
  if (platform.hasSystemctl) {
    try {
      execSync(`systemctl is-active tunneler-${tunnelName}`, {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  } else if (platform.isMacOS) {
    try {
      execSync(`launchctl list com.tunneler.${tunnelName}`, {
        stdio: "ignore",
      });

      return true;
    } catch {
      return false;
    }
  }
  return false;
}
