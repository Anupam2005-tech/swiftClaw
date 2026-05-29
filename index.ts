#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { runwakeup } from "./tui/wakeup.ts";

const program = new Command();

program
  .name("swiftClaw")
  .description("swiftClaw cli")
  .version("0.0.1")
  .action(async () => {
    await runwakeup();
  });

await program.parseAsync(process.argv);