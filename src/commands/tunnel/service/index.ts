import { Command } from "commander";
import { installService } from "./install";
import { uninstallService } from "./uninstall";
import { statusTunnel } from "./status";

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

  # Uninstall without confirmation prompt
  $ tunneler tunnel service uninstall --tunnel my-tunnel --force
`,
  );

serviceTunnel.addCommand(installService);
serviceTunnel.addCommand(uninstallService);
serviceTunnel.addCommand(statusTunnel);
