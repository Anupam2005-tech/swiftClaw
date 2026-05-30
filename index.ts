#!/usr/bin/env node
import { Command } from "commander";
import { runwakeup } from "./tui/wakeup.ts";
import { runSetup } from "./utils/setup.ts";
import { loadSwiftClawEnv } from "./utils/config.ts";
import pkg from "./package.json" with { type: "json" };

loadSwiftClawEnv();

const program = new Command();

program
  .name("swiftclaw")
  .description("swiftClaw — AI terminal companion with zero-trust staging")
  .version(pkg.version)
  .action(async () => {
    await runSetup();
    loadSwiftClawEnv();
    await runwakeup();
  });

await program.parseAsync(process.argv);
