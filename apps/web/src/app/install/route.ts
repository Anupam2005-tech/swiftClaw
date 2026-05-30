import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const script = await readFile(join(process.cwd(), "public", "install.sh"), "utf-8");
  return new Response(script, {
    headers: {
      "Content-Type": "text/x-shellscript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
