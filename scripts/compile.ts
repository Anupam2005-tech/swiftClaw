import { $ } from "bun";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import pkg from "../package.json" with { type: "json" };

await mkdir("dist/bin", { recursive: true });

const VERSION = pkg.version;

const targets = [
  { target: "bun-darwin-arm64", name: "swiftclaw-macos-arm64" },
  { target: "bun-darwin-x64", name: "swiftclaw-macos-x64" },
  { target: "bun-linux-arm64", name: "swiftclaw-linux-arm64" },
  { target: "bun-linux-x64", name: "swiftclaw-linux-x64" },
  { target: "bun-windows-x64", name: "swiftclaw-windows-x64.exe" },
];

console.log(`🚀 Compiling swiftClaw v${VERSION} standalone binaries...`);
console.log(`   Targets: ${targets.map(t => t.name).join(", ")}\n`);

const results = await Promise.allSettled(
  targets.map(async (t) => {
    const outfile = `dist/bin/${t.name}`;
    if (existsSync(outfile) && process.argv.includes("--skip-existing")) {
      console.log(`⏭️  Skipping ${t.name} (already exists)`);
      return { target: t.target, status: "skipped" };
    }
    console.log(`📦 Building ${t.name} (${t.target})...`);
    await $`bun build --compile --target=${t.target} ./index.ts --outfile ${outfile}`;
    return { target: t.target, status: "ok", outfile };
  })
);

let ok = 0, fail = 0;
for (const r of results) {
  if (r.status === "fulfilled" && r.value.status === "ok") {
    ok++;
    console.log(`  ✅ ${r.value.target}`);
  } else if (r.status === "fulfilled") {
    console.log(`  ⏭️  ${r.value.target}`);
  } else {
    fail++;
    console.error(`  ❌ ${r.reason}`);
  }
}

// Generate SHA256 checksums
console.log("\n🔐 Generating SHA256 checksums...");
const checksums: string[] = [];
for (const t of targets) {
  const filePath = `dist/bin/${t.name}`;
  if (existsSync(filePath)) {
    const buf = await readFile(filePath);
    const hash = createHash("sha256").update(buf).digest("hex");
    checksums.push(`${hash}  ${t.name}`);
  }
}
const checksumFile = "dist/bin/SHA256SUMS.txt";
await writeFile(checksumFile, checksums.join("\n") + "\n");
console.log(`   Written to ${checksumFile}`);

console.log(`\n✨ Done! ${ok} built, ${fail} failed.`);
