#!/usr/bin/env node
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

import { Command } from "commander";
import { addCommand } from "../src/commands/add";
import { createCommand } from "../src/commands/create";
import { ephemeralCommand } from "../src/commands/ephemeral";
import { listCommand } from "../src/commands/list";
import { loginCommand } from "../src/commands/login";
import { removeCommand } from "../src/commands/remove";
import { runCommand } from "../src/commands/run";
import { statusCommand } from "../src/commands/status";

const program = new Command();

program
  .name("tunneler")
  .description("Manage Cloudflare tunnels and Route53 records")
  .version("0.1.0");

program.addCommand(loginCommand);
program.addCommand(createCommand)
program.addCommand(addCommand);
program.addCommand(ephemeralCommand)
program.addCommand(runCommand)
program.addCommand(removeCommand);
program.addCommand(listCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
