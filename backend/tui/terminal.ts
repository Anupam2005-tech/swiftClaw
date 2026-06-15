import { stdout as output } from "node:process";

let initialized = false;

export function initScreen(): void {
  if (initialized) return;
  output.write("\x1b[?1049h"); // switch to alternate buffer
  output.write("\x1b[2J");     // clear entire screen
  output.write("\x1b[H");      // cursor to top-left
  output.write("\x1b[?25l");   // hide cursor
  initialized = true;

  process.on("exit", exitScreen);
  process.on("SIGINT", () => {});
  process.on("SIGTERM", () => {});
}

export function exitScreen(): void {
  if (!initialized) return;
  output.write("\x1b[?25h");   // show cursor
  output.write("\x1b[?1049l"); // back to main buffer
  initialized = false;
}

export function getSize(): { columns: number; rows: number } {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

export function hideCursor(): void { output.write("\x1b[?25l"); }
export function showCursor(): void { output.write("\x1b[?25h"); }

export function cursorTo(row: number, col: number): void {
  output.write(`\x1b[${row + 1};${col + 1}H`);
}

export function clearScreen(): void {
  output.write("\x1b[2J\x1b[H");
}