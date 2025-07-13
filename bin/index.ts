#!/usr/bin/env node
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

import { Command } from "commander";
import { loginCommand } from "../src/commands/login";
import { logoutCommand } from "../src/commands/logout";
import { routeCommand } from "../src/commands/route";
import { tunnelCommand } from "../src/commands/tunnel";

const program = new Command();

program
  .name("tunneler")
  .description("Manage Cloudflare tunnels and related DNS operations")
  .version("0.1.0")
  .addHelpText(
    "after",
    `
Examples:
  $ tunneler login
  $ tunneler tunnel create --name my-tunnel
  $ tunneler route add --tunnel my-tunnel --hostname app.example.com --service localhost:3000
  $ tunneler tunnel run --tunnel my-tunnel
  $ tunneler tunnel service install --tunnel my-tunnel
  $ tunneler tunnel service start --tunnel my-tunnel
  $ tunneler tunnel service status --tunnel my-tunnel
  $ tunneler tunnel service stop --tunnel my-tunnel
  $ tunneler tunnel service uinstall --tunnel my-tunnel
`,
  );

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(tunnelCommand);
program.addCommand(routeCommand);

program.parse(process.argv);
