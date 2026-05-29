# 🦅 swiftClaw

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Bun](https://img.shields.io/badge/runtime-bun%20%2F%20node-orange.svg)](#)

**swiftClaw** is an advanced AI agent and terminal companion tool built to execute filesystem mutations, guide developers, run interactive terminal sessions, and deploy excellence directly from your CLI or Telegram.

```
    ███████╗██╗    ██╗██╗███████╗████████╗ ██████╗██╗      █████╗ ██╗    ██╗
    ██╔════╝██║    ██║██║██╔════╝╚══██╔══╝██╔════╝██║     ██╔══██╗██║    ██║
    ███████╗██║ █╗ ██║██║█████╗     ██║   ██║     ██║     ███████║██║ █╗ ██║
    ╚════██║██║███╗██║██║██╔══╝     ██║   ██║     ██║     ██╔══██║██║███╗██║
    ███████║╚███╔███╔╝██║██║        ██║   ╚██████╗███████╗██║  ██║╚███╔███╔╝
    ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝        ╚═╝    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ 
```

---

## 📦 Installation & Setup

swiftClaw can be installed locally in a development project using package managers, or installed globally as a standalone binary via `curl` or PowerShell.

### Method 1: Local Project Installation (Recommended)

To run swiftClaw inside a specific codebase/project directory without polluting your global system environment (and without requiring `-g` global installation), install it locally:

| Package Manager | Installation Command | Execution Command |
| :--- | :--- | :--- |
| **npm** | `npm install swiftClaw` | `npx swiftClaw` |
| **bun** | `bun add swiftClaw` | `bunx swiftClaw` |
| **pnpm** | `pnpm add swiftClaw` | `pnpm swiftClaw` |

> [!IMPORTANT]
> **Install First:** You must download/install the package locally to your project first before running any of the execution commands. Running without installation is not supported.

#### 🚀 Run Directly as `swiftClaw`
If you want to run the locally installed tool by typing just `swiftClaw` or `swiftclaw` in your terminal (without needing `npx`, `bunx`, or `pnpm`), add the project's local bin folder to your shell's search path. Add this line to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export PATH="./node_modules/.bin:$PATH"
```
Once added and your shell is reloaded, you can simply type `swiftClaw` inside any project directory where swiftClaw is installed!

---

### Method 2: Standalone Shell Script (macOS & Linux)

For users who want swiftClaw available system-wide without relying on Node.js or Bun:

```bash
curl -fsSL https://raw.githubusercontent.com/anupam/swiftClaw/main/install.sh | bash
```

#### What this script does:
1. Auto-detects your Operating System (macOS/Linux) and architecture (x64/ARM64).
2. Downloads the latest pre-compiled standalone binary to `$HOME/.local/bin/swiftClaw`.
3. Creates a symlink to `$HOME/.local/bin/swiftclaw` so both `swiftClaw` and `swiftclaw` commands run the tool.
4. Makes the binary executable and prompts you to add `$HOME/.local/bin` to your shell's `PATH` if it isn't already there.

---

### Method 3: Standalone PowerShell (Windows)

For Windows users who want a global standalone CLI:

Open PowerShell (as a normal user) and execute:

```powershell
powershell -Command "$installDir = \"$HOME\AppData\Local\Programs\swiftclaw\"; New-Item -ItemType Directory -Force -Path $installDir; Invoke-WebRequest -Uri \"https://github.com/anupam/swiftClaw/releases/latest/download/swiftclaw-windows-x64.exe\" -OutFile \"$installDir\swiftClaw.exe\"; [System.Environment]::SetEnvironmentVariable(\"PATH\", \"$([System.Environment]::GetEnvironmentVariable(\"PATH\", \"User\"));$installDir\", \"User\"); Write-Host '✓ swiftClaw successfully installed! Please restart your terminal and run: swiftClaw' -ForegroundColor Green"
```

#### What this script does:
1. Creates an installation folder at `~\AppData\Local\Programs\swiftclaw`.
2. Downloads `swiftClaw.exe` from the GitHub release.
3. Appends the folder path to the user environment variable `PATH` so `swiftClaw` is available from Command Prompt or PowerShell.

---

## 🛠️ Local Development & Build

If you are developing or modifying swiftClaw locally:

1. **Install Dependencies:**
   ```bash
   bun install
   ```

2. **Run Dev Environment:**
   ```bash
   bun index.ts
   ```

3. **Build Javascript Bundle:**
   Bundles typescript files into an ES module with shebang target `node` in `dist/index.js`:
   ```bash
   bun run build
   ```

4. **Compile Standalone Binaries:**
   Compiles native standalone executables for macOS, Linux, and Windows:
   ```bash
   bun run scripts/compile.ts
   ```

---

## 📄 License

This project is licensed under the MIT License.