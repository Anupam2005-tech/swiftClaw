# swiftClaw

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)

**swiftClaw** is an AI agent and terminal companion tool — CLI agent, Telegram bot, and developer copilot in one binary.

## Installation

### macOS & Linux (standalone binary)
```bash
curl -fsSL https://swiftclaw.online/install | bash
```
Pin a specific version: `VERSION=1.0.1 curl -fsSL https://swiftclaw.online/install | bash`

### Windows (standalone binary)
```powershell
iwr -useb https://swiftclaw.online/install.ps1 | iex
```

### npm (requires Node.js >= 18)
```bash
npm install -g swiftclaw
```

### Docker
```bash
docker pull ghcr.io/anupam/swiftclaw:latest
docker run --rm -it ghcr.io/anupam/swiftclaw:latest
```

### Homebrew (once tapped)
```bash
brew install anupam/tap/swiftclaw
```

## Quick Start
```bash
swiftClaw
```
First launch opens the setup wizard (OpenRouter API key required).

## Build from Source
```bash
bun install           # install dependencies
bun run build         # JS bundle (for npm publish)
bun run compile       # standalone binaries for all platforms
make install          # build + install local binary
```

## Release Process
Tag a version and push — CI handles the rest:
```bash
git tag v1.0.1 && git push origin v1.0.1
```
This triggers GitHub Actions to:
- Publish to npm
- Compile binaries for macOS (arm64/x64), Linux (arm64/x64), Windows (x64)
- Generate SHA256 checksums
- Create a GitHub Release
- Build and push Docker image to ghcr.io

## License
MIT