import fs from "fs";
import os from "os";
import path from "path";

export function getConfigPath() {
  const configDir = path.join(os.homedir(), ".tunneler");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return path.join(configDir, "config.json");
}

export function getConfigData() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    throw new Error("No config found. Please run tunneler create first.");
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function getTunnelInfo(tunnel: string) {
  const configData = getConfigData();
  const tunnelInfo = configData.tunnels?.[tunnel];
  if (!tunnelInfo) {
    throw new Error(`Tunnel \"${tunnel}\" not found.`);
  }
  return tunnelInfo;
}
