import { Command } from "commander";
import { createTunnel } from "./create";
import { deleteTunnel } from "./delete";
import { listTunnel } from "./list";
import { runTunnel } from "./run";
import { serviceTunnel } from "./service";
import { startTunnel } from "./start";
import { stopTunnel } from "./stop";

export const tunnelCommand = new Command("tunnel")
  .description("Manage tunnels")
  .addHelpText(
    "after",
    `
Examples:
  # Create a new tunnel
  $ tunneler tunnel create --name my-tunnel

  # Run a tunnel in the foreground
  $ tunneler tunnel run --tunnel my-tunnel

  # List all tunnels
  $ tunneler tunnel list

  # Delete a tunnel
  $ tunneler tunnel delete --name my-tunnel

  # Install a tunnel as a system service
  $ tunneler tunnel service install --tunnel my-tunnel

  # Uninstall the tunnel system service
  $ tunneler tunnel service uninstall --tunnel my-tunnel

  # Start the tunnel system service
  $ tunneler tunnel start --tunnel my-tunnel

  # Stop the tunnel system service
  $ tunneler tunnel stop --tunnel my-tunnel
`,
  );

tunnelCommand.addCommand(createTunnel);
tunnelCommand.addCommand(deleteTunnel);
tunnelCommand.addCommand(serviceTunnel);
tunnelCommand.addCommand(startTunnel);
tunnelCommand.addCommand(stopTunnel);
tunnelCommand.addCommand(runTunnel);
tunnelCommand.addCommand(listTunnel);
