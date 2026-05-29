import { $ } from "bun";
import { mkdir } from "node:fs/promises";

await mkdir("dist/bin", { recursive: true });

const targets = [
  { target: "bun-darwin-arm64", name: "swiftclaw-macos-arm64" },
  { target: "bun-darwin-x64", name: "swiftclaw-macos-x64" },
  { target: "bun-linux-arm64", name: "swiftclaw-linux-arm64" },
  { target: "bun-linux-x64", name: "swiftclaw-linux-x64" },
  { target: "bun-windows-x64", name: "swiftclaw-windows-x64.exe" },
];

console.log("🚀 Compiling standalone binaries...");

for (const t of targets) {
  console.log(`📦 Building for ${t.target}...`);
  try {
    await $`bun build --compile --target=${t.target} ./index.ts --outfile dist/bin/${t.name}`;
  } catch (error) {
    console.error(`❌ Failed to compile for ${t.target}:`, error);
  }
}

console.log("✨ Compilation finished! Binaries saved in dist/bin/");
