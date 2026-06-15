import { describe, expect, test } from "bun:test";
import { createSlashCommandRegistry } from "./slash-commands.ts";
import { cycleMode, filterPaletteItems, modePlaceholder } from "./command-palette.ts";

const ctx = {
  getMode: () => "agent" as const,
  setMode: () => {},
  askConfirm: async () => true,
  requestExit: () => {},
};

describe("command palette", () => {
  const registry = createSlashCommandRegistry(ctx);

  test("filters by slash prefix", () => {
    const items = filterPaletteItems(registry, "/mem");
    const names = items.map((i) => i.name);
    expect(names).toContain("memory");
    expect(names).toContain("memoryClear");
  });

  test("shows all commands for ctrl+p palette", () => {
    const items = filterPaletteItems(registry, "", true);
    expect(items.length).toBeGreaterThan(5);
  });

  test("cycles modes on tab order", () => {
    expect(cycleMode("agent")).toBe("plan");
    expect(cycleMode("plan")).toBe("ask");
    expect(cycleMode("ask")).toBe("agent");
  });

  test("mode placeholders are non-empty", () => {
    expect(modePlaceholder("agent").length).toBeGreaterThan(0);
    expect(modePlaceholder("plan").length).toBeGreaterThan(0);
    expect(modePlaceholder("ask").length).toBeGreaterThan(0);
  });
});
