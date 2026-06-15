import chalk from "chalk";

export interface TranscriptEntry {
  role: "user" | "assistant" | "system";
  content: string;
}

const entries: TranscriptEntry[] = [];

export function addTranscriptEntry(role: TranscriptEntry["role"], content: string): void {
  entries.push({ role, content });
}

export function getTranscript(): TranscriptEntry[] {
  return entries;
}

export function clearTranscript(): void {
  entries.length = 0;
}

export function printUserMessage(message: string): void {
  addTranscriptEntry("user", message.trim());
}

export function printAssistantMessage(message: string): void {
  addTranscriptEntry("assistant", message.trim() || "(no response)");
}

export function printSystemMessage(message: string): void {
  addTranscriptEntry("system", message);
}

export function printErrorMessage(message: string): void {
  addTranscriptEntry("system", `${chalk.red("Error:")} ${message}`);
}
