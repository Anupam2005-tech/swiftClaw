import type { SlashCommand } from "./slash-commands.ts";
import type { CliMode } from "./slash-commands.ts";

export interface PaletteItem {
  name: string;
  description: string;
}

export function listPaletteItems(registry: SlashCommand[]): PaletteItem[] {
  return registry
    .filter((cmd) => cmd.name !== "help")
    .map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
    }));
}

export function filterPaletteItems(
  registry: SlashCommand[],
  input: string,
  forceShowAll = false,
): PaletteItem[] {
  const items = listPaletteItems(registry);
  if (forceShowAll) return items;

  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return [];

  const query = trimmed.slice(1).toLowerCase();
  if (!query) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().startsWith(query) ||
      item.description.toLowerCase().includes(query),
  );
}

export function modePlaceholder(mode: CliMode): string {
  switch (mode) {
    case "agent":
      return 'Ask anything… "Implement auth for the API"';
    case "plan":
      return 'Plan a change… "Refactor the database layer"';
    case "ask":
      return 'Ask anything… "How does routing work?"';
  }
}

export function modeStatusLabel(mode: CliMode): string {
  switch (mode) {
    case "agent":
      return "Build";
    case "plan":
      return "Plan";
    case "ask":
      return "Ask";
  }
}

export const MODE_CYCLE: CliMode[] = ["agent", "plan", "ask"];

export function cycleMode(mode: CliMode): CliMode {
  const index = MODE_CYCLE.indexOf(mode);
  return MODE_CYCLE[(index + 1) % MODE_CYCLE.length] ?? "agent";
}

export function getActivePaletteItem(
  registry: SlashCommand[],
  input: string,
  paletteIndex: number,
  forceShowAll = false,
): PaletteItem | undefined {
  const items = filterPaletteItems(registry, input, forceShowAll);
  return items[paletteIndex];
}
