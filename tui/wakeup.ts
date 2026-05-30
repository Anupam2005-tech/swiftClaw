import { select, isCancel } from "@clack/prompts";
import chalk from "chalk";
import figlet,  { type FontName } from "figlet";
import { runCliMode } from "../modes/cli";
import { runTelegramMode } from "../modes/telegram";
import pkg from "../package.json" with { type: "json" };

// ── DESIGN SYSTEM (SaaS Premium Palette) ───────────────────────────
export const THEME = {
  accent: chalk.hex("#10B981").bold,    // High-contrast Emerald
  primary: chalk.hex("#bc5c5cff").bold,   // Crisp White
  secondary: chalk.hex("#71717A"),      // Muted Slate
  background: chalk.hex("#18181B"),     // Deep Zinc
  error: chalk.hex("#EF4444"),
};

/**
 * Responsive Banner Logic
 * Detects terminal width and adjusts font/spacing to prevent wrapping.
 */
function renderResponsiveBanner(text: string) {
  const terminalWidth = process.stdout.columns || 80;
  let font: FontName = "ANSI Shadow";

  // If terminal is narrow, switch to a more condensed font
  if (terminalWidth < 70) font = "Small";
  if (terminalWidth < 40) font = "Mini";

  try {
    const ascii = figlet.textSync(text, { font, horizontalLayout: "fitted" });
    const lines = ascii.split("\n");

    console.log(""); // Top margin
    lines.forEach((line) => {
      if (!line.trim()) return;
      // Centering logic based on terminal width
      const padding = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
      console.log(" ".repeat(padding) + THEME.primary(line));
    });
    console.log(""); 
  } catch (err) {
    console.log(THEME.primary(`--- ${text} ---`));
  }
}

/**
 * Modern SaaS status bar
 */
function printStatusLine() {
  const terminalWidth = process.stdout.columns || 80;
  const label = " ENGINE: ACTIVE ";
  const version = ` v${pkg.version} `;
  const line = "─".repeat(Math.max(10, terminalWidth - (label.length + version.length + 4)));
  
  console.log(
    `  ${THEME.accent(label)}${THEME.secondary(line)}${THEME.secondary(version)}`
  );
  console.log("");
}

export async function runwakeup(): Promise<void> {
  // Clear terminal for a fresh SaaS entry
  process.stdout.write("\u001b[2J\u001b[0;0H");

  renderResponsiveBanner("SWIFTCLAW");
  printStatusLine();

  console.log(`  ${THEME.secondary("Ready to deploy excellence. Select your entry point.")}\n`);

  const mode = await select({
    message: THEME.primary("Execution Environment"),
    options: [
      { 
        value: "cli", 
        label: "CLI Mode", 
        hint: "Direct kernel access and filesystem mutations" 
      },
      { 
        value: "telegram", 
        label: "Remote Gateway", 
        hint: "Telegram bot orchestration" 
      },
      { 
        value: "exit", 
        label: "Terminate Session", 
        hint: "Close agent and release resources" 
      }
    ]
  });

  if (isCancel(mode) || mode === "exit") {
    console.log(`\n  ${THEME.secondary("Session terminated. See you in production.")}\n`);
    process.exit(0);
  }

  if (mode === "cli") {
    console.log(`\n  ${THEME.accent("»")} ${THEME.primary("Initializing Local CLI...")}\n`);
    await runCliMode();
  } else if (mode === "telegram") {
    console.log(`\n  ${THEME.accent("»")} ${THEME.primary("Synchronizing with Telegram Cloud...")}\n`);
    await runTelegramMode();
    return;
  }
}