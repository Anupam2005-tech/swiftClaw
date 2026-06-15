import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const script = await readFile(join(process.cwd(), "public", "install.ps1"), "utf-8");
  return new Response(script, {
    headers: {
      "Content-Type": "text/powershell",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
