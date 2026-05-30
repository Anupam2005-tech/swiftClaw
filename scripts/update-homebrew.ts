/**
 * Updates ci/homebrew/swiftclaw.rb with actual SHA256 checksums.
 * Usage: bun run scripts/update-homebrew.ts <version>
 *
 * This is called after a release to update the Homebrew formula
 * in the homebrew-tap repository.
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

const version = process.argv[2];
if (!version) {
  console.error("Usage: bun run scripts/update-homebrew.ts <version>");
  process.exit(1);
}

const targets = [
  { name: "swiftclaw-macos-arm64", os: "macOS", arch: "ARM" },
  { name: "swiftclaw-macos-x64", os: "macOS", arch: "Intel" },
  { name: "swiftclaw-linux-arm64", os: "Linux", arch: "ARM" },
  { name: "swiftclaw-linux-x64", os: "Linux", arch: "Intel" },
];

async function sha256(filePath: string): Promise<string> {
  const buf = await readFile(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

const formulaPath = "ci/homebrew/swiftclaw.rb";
if (!existsSync(formulaPath)) {
  console.error(`Formula not found at ${formulaPath}`);
  process.exit(1);
}

let formula = await readFile(formulaPath, "utf-8");

// Update version
formula = formula.replace(/version ".*"/, `version "${version}"`);

// Update checksums
for (const t of targets) {
  const binaryPath = `dist/bin/${t.name}`;
  if (!existsSync(binaryPath)) {
    console.warn(`⚠️  Binary not found: ${binaryPath}, skipping checksum`);
    continue;
  }
  const hash = await sha256(binaryPath);
  const placeholder = `PLACEHOLDER_${t.name.replace(/swiftclaw-/g, "").toUpperCase().replace(/-/g, "_")}`;
  formula = formula.replace(placeholder, hash);
  console.log(`  ✅ ${t.name}: ${hash}`);
}

await writeFile(formulaPath, formula);
console.log(`\nUpdated ${formulaPath} for v${version}`);
