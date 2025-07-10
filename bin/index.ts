#!/usr/bin/env node
import * as dotenv from "dotenv";
dotenv.config();

import { Command } from "commander";
import { loginCommand } from "../src/commands/login";
import { addCommand } from "../src/commands/add";
import { removeCommand } from "../src/commands/remove";
import { listCommand } from "../src/commands/list";
import { statusCommand } from "../src/commands/status";

const program = new Command();

program
  .name("tunneler")
  .description("Manage Cloudflare tunnels and Route53 records")
  .version("0.1.0");

program.addCommand(loginCommand);
program.addCommand(addCommand);
program.addCommand(removeCommand);
program.addCommand(listCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
