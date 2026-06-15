import type { MemoryStore } from "./types.ts";

export const MEMORY_CONTEXT_CHAR_LIMIT = 800;

const PROFESSION_LABELS: Record<string, string> = {
  doctor: "Doctor",
  engineer: "Developer",
  student: "Student",
  corporate: "Corporate",
  other: "Other",
};

function formatProfession(store: MemoryStore): string | undefined {
  const { profession, professionCustom } = store.profile;
  if (profession === "other" && professionCustom?.trim()) {
    return professionCustom.trim();
  }
  return PROFESSION_LABELS[profession] ?? profession;
}

export function formatMemoryContext(store: MemoryStore): string {
  const profileLines: string[] = [];
  const name = store.profile.name.trim();
  const profession = formatProfession(store);

  if (name) {
    profileLines.push(`- Name: ${name}`);
    if (profession) profileLines.push(`- Profession: ${profession}`);
  }

  const { preferences } = store;
  if (preferences.communicationStyle) {
    profileLines.push(`- Communication style: ${preferences.communicationStyle}`);
  }
  if (preferences.tone) {
    profileLines.push(`- Tone: ${preferences.tone}`);
  }
  if (preferences.responseLength) {
    profileLines.push(`- Response length: ${preferences.responseLength}`);
  }
  if (preferences.codingStyle) {
    profileLines.push(`- Coding style: ${preferences.codingStyle}`);
  }

  const sortedFacts = [...store.facts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  if (profileLines.length === 0 && sortedFacts.length === 0) {
    return "";
  }

  const header = "## User Context (long-term memory)";

  function buildBlock(factCount: number): string {
    const lines = [...profileLines];
    const factsToShow = sortedFacts.slice(0, factCount);
    if (factsToShow.length > 0) {
      lines.push("- Known preferences and facts:");
      for (const fact of factsToShow) {
        lines.push(`  - ${fact.content}`);
      }
    }
    return `${header}\n${lines.join("\n")}`;
  }

  let factCount = Math.min(sortedFacts.length, 10);
  let block = buildBlock(factCount);

  while (block.length > MEMORY_CONTEXT_CHAR_LIMIT && factCount > 0) {
    factCount -= 1;
    block = buildBlock(factCount);
  }

  if (block.length > MEMORY_CONTEXT_CHAR_LIMIT) {
    block = `${block.slice(0, MEMORY_CONTEXT_CHAR_LIMIT - 3)}...`;
  }

  return block;
}
