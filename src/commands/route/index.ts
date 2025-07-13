import { Command } from "commander";
import { addRoute } from "./add";
import { removeRoute } from "./remove";

export const routeCommand = new Command("route")
  .description("Manage ingress routes for tunnels");

routeCommand.addCommand(addRoute);
routeCommand.addCommand(removeRoute);
