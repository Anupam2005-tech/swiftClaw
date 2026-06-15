import figlet, { type FontName } from "figlet";
import { THEME } from "./wakeup.ts";

/**
 * Dynamically generates and centers the responsive SWIFTCLAW logo 
 * matching the premium SaaS design system.
 */
export function renderLogo(termWidth: number): string[] {
  let font: FontName = "ANSI Shadow";
  
  // Responsive fallbacks for smaller terminal windows
  if (termWidth < 70) font = "Small";
  if (termWidth < 40) font = "Mini";

  try {
    const ascii = figlet.textSync("SWIFTCLAW", { font, horizontalLayout: "fitted" });
    const lines = ascii.split("\n").filter(line => line.trim().length > 0);
    
    return lines.map(line => {
      const padding = Math.max(0, Math.floor((termWidth - line.length) / 2));
      // Changed to THEME.primary to lock in that exact signature coral/red color
      return " ".repeat(padding) + THEME.primary(line);
    });
  } catch {
    // Graceful raw text fallback centered if figlet fails
    const fallback = `--- SWIFTCLAW ---`;
    const padding = Math.max(0, Math.floor((termWidth - fallback.length) / 2));
    return [" ".repeat(padding) + THEME.primary(fallback)];
  }
}