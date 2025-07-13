import { Command } from "commander";
import { createTunnel } from "./create";
import { deleteTunnel } from "./delete";
import { runTunnel } from "./run";
import { listTunnel } from "./list";
import { statusTunnel } from "./status";

export const tunnelCommand = new Command("tunnel")
  .description("Manage tunnels");

tunnelCommand.addCommand(createTunnel);
tunnelCommand.addCommand(deleteTunnel);
tunnelCommand.addCommand(runTunnel);
tunnelCommand.addCommand(listTunnel);
tunnelCommand.addCommand(statusTunnel);