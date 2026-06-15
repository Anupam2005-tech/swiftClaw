import chalk from "chalk";
import { loadMemoryStore } from "./store.ts";

export function formatProfileDisplay(): string {
  const store = loadMemoryStore();
  const profession =
    store.profile.profession === "other" && store.profile.professionCustom
      ? store.profile.professionCustom
      : store.profile.profession;

  return [
    "**Profile**",
    `- Name: ${store.profile.name || "(not set)"}`,
    `- Profession: ${profession || "(not set)"}`,
  ].join("\n");
}

export function formatMemoryDisplay(): string {
  const store = loadMemoryStore();
  const lines: string[] = [formatProfileDisplay(), ""];

  lines.push("**Preferences**");
  const prefs = store.preferences;
  const prefEntries = [
    ["Communication style", prefs.communicationStyle],
    ["Tone", prefs.tone],
    ["Response length", prefs.responseLength],
    ["Coding style", prefs.codingStyle],
  ] as const;

  let hasPrefs = false;
  for (const [label, value] of prefEntries) {
    if (value) {
      lines.push(`- ${label}: ${value}`);
      hasPrefs = true;
    }
  }
  if (!hasPrefs) lines.push("- (none)");

  lines.push("");
  lines.push("**Facts**");
  if (store.facts.length === 0) {
    lines.push("- (none)");
  } else {
    for (const fact of store.facts) {
      lines.push(`- [${fact.source}] ${fact.content}`);
    }
  }

  return lines.join("\n");
}

/** Plain-text memory view for legacy/debug use */
export function formatMemoryPlain(): string {
  const store = loadMemoryStore();
  const lines: string[] = [];

  lines.push(chalk.bold("Profile"));
  lines.push(`  Name: ${store.profile.name || "(not set)"}`);
  const profession =
    store.profile.profession === "other" && store.profile.professionCustom
      ? store.profile.professionCustom
      : store.profile.profession;
  lines.push(`  Profession: ${profession || "(not set)"}`);

  lines.push("");
  lines.push(chalk.bold("Preferences"));
  const prefs = store.preferences;
  const prefEntries = [
    ["Communication style", prefs.communicationStyle],
    ["Tone", prefs.tone],
    ["Response length", prefs.responseLength],
    ["Coding style", prefs.codingStyle],
  ] as const;

  let hasPrefs = false;
  for (const [label, value] of prefEntries) {
    if (value) {
      lines.push(`  ${label}: ${value}`);
      hasPrefs = true;
    }
  }
  if (!hasPrefs) lines.push("  (none)");

  lines.push("");
  lines.push(chalk.bold("Facts"));
  if (store.facts.length === 0) {
    lines.push("  (none)");
  } else {
    for (const fact of store.facts) {
      lines.push(`  [${fact.source}] ${fact.content}`);
    }
  }

  return lines.join("\n");
}
