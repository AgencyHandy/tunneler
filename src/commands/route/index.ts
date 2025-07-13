import { Command } from "commander";
import { addRoute } from "./add";
import { removeRoute } from "./remove";
import { listRoutes } from "./list";

export const routeCommand = new Command("route")
  .description("Manage ingress routes for tunnels")
  .addHelpText(
    "after",
    `
Examples:
  $ tunneler route add --tunnel my-tunnel --hostname app.example.com --service localhost:3000
  $ tunneler route list --tunnel my-tunnel
  $ tunneler route remove --tunnel my-tunnel --hostname app.example.com
`
  );

routeCommand.addCommand(addRoute);
routeCommand.addCommand(listRoutes)
routeCommand.addCommand(removeRoute);
