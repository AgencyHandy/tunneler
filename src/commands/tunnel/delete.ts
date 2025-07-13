import { Command } from "commander";

export const deleteTunnel = new Command("delete")
  .description("Delete a tunnel and remove its configuration")
  .requiredOption("--name <name>", "Tunnel name")
  .action(async (opts) => {
    // Remove YAML, remove credentials, remove config.json entries
  });
