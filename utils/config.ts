import dotenv from "dotenv";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";

export const SWIFTCLAW_DIR = path.join(os.homedir(), ".swiftclaw");
export const ENV_PATH = path.join(SWIFTCLAW_DIR, ".env");

export function loadSwiftClawEnv(): void {
  if (!fs.existsSync(ENV_PATH)) return;
  dotenv.config({ path: ENV_PATH });
}

export function getOpenRouterKey(): string | undefined {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return key || undefined;
}

export function hasOpenRouterKey(): boolean {
  return !!getOpenRouterKey();
}

export function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

export function writeEnvFile(values: Record<string, string>): void {
  if (!fs.existsSync(SWIFTCLAW_DIR)) {
    fs.mkdirSync(SWIFTCLAW_DIR, { recursive: true });
  }
  const existing = fs.existsSync(ENV_PATH)
    ? parseEnvFile(fs.readFileSync(ENV_PATH, "utf8"))
    : {};
  const merged = { ...existing, ...values };
  const body = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(ENV_PATH, `${body}\n`, "utf8");
}

export function printMissingOpenRouterHelp(): void {
  console.log("");
  console.log(chalk.hex("#FFFDF9").bold("  ✖ OpenRouter API key is not configured"));
  console.log(chalk.hex("#71717A")("  swiftClaw needs an API key before Agent, Plan, or Ask modes can run.\n"));
  console.log(chalk.white("  1. Get a key at ") + chalk.cyan("https://openrouter.ai/keys"));
  console.log(chalk.white("  2. Run ") + chalk.cyan("swiftclaw") + chalk.white(" again — the setup wizard will start"));
  console.log(
    chalk.white("  3. Or edit ") +
      chalk.cyan(ENV_PATH) +
      chalk.white(" and set:\n     ") +
      chalk.dim("OPENROUTER_API_KEY=sk-or-v1-...\n"),
  );
}

/** Returns false if user cancelled setup. */
export async function ensureOpenRouterKey(): Promise<boolean> {
  loadSwiftClawEnv();
  if (hasOpenRouterKey()) return true;

  const { runSetup } = await import("./setup.ts");
  const completed = await runSetup();
  if (!completed) {
    printMissingOpenRouterHelp();
    return false;
  }

  loadSwiftClawEnv();
  if (!hasOpenRouterKey()) {
    printMissingOpenRouterHelp();
    return false;
  }
  return true;
}

export function formatAiError(error: unknown): string {
  const err = error as { message?: string; name?: string };
  const msg = err?.message ?? String(error);

  if (
    err?.name === "AI_LoadAPIKeyError" ||
    msg.includes("OpenRouter API key is missing") ||
    msg.includes("OPENROUTER_API_KEY")
  ) {
    return `OpenRouter API key is missing. Add OPENROUTER_API_KEY to ${ENV_PATH} or run swiftclaw to open the setup wizard.`;
  }
  if (msg.includes("429") || err?.name === "RetryError" || err?.name === "AI_APICallError") {
    return "OpenRouter rate limit or API error. Check your key, billing, and model access at openrouter.ai.";
  }
  return msg;
}
