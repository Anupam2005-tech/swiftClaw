import { readFileSync } from "fs";
import { join } from "path";

let version = "1.0.0";
try {
  const rootPkg = JSON.parse(readFileSync(join(process.cwd(), "../../package.json"), "utf-8"));
  version = rootPkg.version;
} catch (e) {
  try {
    const localPkg = JSON.parse(readFileSync(join(process.cwd(), "./package.json"), "utf-8"));
    version = localPkg.version;
  } catch (e2) {
    // default fallback
  }
}

/** Canonical install URLs and copy for /docs — keep in sync with root install.sh and package.json */
export const DOMAIN = "swiftclaw.online";
export const GITHUB_OWNER = "anupam";
export const GITHUB_REPO = "swiftClaw";
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`;
export const INSTALL_SH_URL = `https://${DOMAIN}/install.sh`;
export const INSTALL_PS1_URL = `https://${DOMAIN}/install.ps1`;

export const VERSION: string = version;
export const CONFIG_DIR = "~/.swiftclaw";
export const ENV_FILE = "~/.swiftclaw/.env";
export const BIN_DIR = "~/.local/bin";

export const INSTALL = {
  curlOneLiner: `curl -fsSL https://${DOMAIN}/install | bash`,
  powershellOneLiner: `iwr -useb https://${DOMAIN}/install.ps1 | iex`,
  dockerPull: "docker pull ghcr.io/anupam/swiftclaw:latest",
  dockerRun: "docker run --rm -it ghcr.io/anupam/swiftclaw:latest",
  npmGlobal: "npm install -g swiftclaw",
  pnpmGlobal: "pnpm add -g swiftclaw",
  bunGlobal: "bun install -g swiftclaw",
  npmLocal: "npm install swiftclaw",
  pnpmLocal: "pnpm add swiftclaw",
  bunLocal: "bun add swiftclaw",
  npx: "./node_modules/.bin/swiftclaw",
  pnpmExec: "./node_modules/.bin/swiftclaw",
  bunx: "./node_modules/.bin/swiftclaw",
  pathLocalBin: 'export PATH="./node_modules/.bin:$PATH"',
  verify: "swiftclaw --version",
  run: "swiftclaw",
} as const;

export const BINARIES = {
  macos: { x64: "swiftclaw-macos-x64", arm64: "swiftclaw-macos-arm64" },
  linux: { x64: "swiftclaw-linux-x64", arm64: "swiftclaw-linux-arm64" },
  windows: { x64: "swiftclaw-windows-x64.exe" },
} as const;

export function releaseAssetUrl(asset: string): string {
  return `${RELEASES_URL}/download/${asset}`;
}

export const ENV_VARS = [
  {
    name: "OPENROUTER_API_KEY",
    required: true,
    description: "API key from openrouter.ai. Required for Agent, Plan, and Ask modes.",
    example: "sk-or-v1-...",
  },
  {
    name: "USER_NAME",
    required: true,
    description: "Display name the agent uses when addressing you (set during setup).",
    example: "Alex",
  },
  {
    name: "FIRECRAWL_API_KEY",
    required: false,
    description: "Optional. Enables web search/scrape tools in Plan and Ask modes.",
    example: "fc-...",
  },
  {
    name: "TELEGRAM_OWNER_ID",
    required: false,
    description: "Optional. Your Telegram user ID for Remote Gateway access control.",
    example: "123456789",
  },
  {
    name: "TELEGRAM_BOT_TOKEN",
    required: false,
    description: "Optional. Bot token from @BotFather for Remote Gateway mode.",
    example: "123456:ABC...",
  },
  {
    name: "OPENROUTER_DEFAULT_MODEL",
    required: false,
    description: "Override the default model (default: google/gemini-2.5-pro).",
    example: "anthropic/claude-sonnet-4",
  },
] as const;
