import { Command } from "commander";
import { installService } from "./install";
import { uninstallService } from "./uninstall";
import { statusTunnel } from "./status";
import { startTunnel } from "./start";
import { stopTunnel } from "./stop";
import { restartTunnel } from "./restart";

export const serviceTunnel = new Command("service")
  .description("Manage tunnel system services")
  .addHelpText(
    "after",
    `
Examples:
  # Install a tunnel as a system service
  $ tunneler tunnel service install --tunnel my-tunnel

  # Uninstall the service for a tunnel
  $ tunneler tunnel service uninstall --tunnel my-tunnel

  # Status of a installed service
  $ tunneler tunnel service status --tunnel my-tunnel

  # Start the tunnel system service
  $ tunneler tunnel service start --tunnel my-tunnel

  # Stop the tunnel system service
  $ tunneler tunnel service stop --tunnel my-tunnel

  # Restart the tunnel system service
  $ tunneler tunnel service restart --tunnel my-tunnel

  # Uninstall without confirmation prompt
  $ tunneler tunnel service uninstall --tunnel my-tunnel --force
`,
  );

serviceTunnel.addCommand(installService);
serviceTunnel.addCommand(startTunnel);
serviceTunnel.addCommand(stopTunnel);
serviceTunnel.addCommand(restartTunnel);
serviceTunnel.addCommand(uninstallService);
serviceTunnel.addCommand(statusTunnel);
