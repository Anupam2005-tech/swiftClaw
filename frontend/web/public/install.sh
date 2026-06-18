#!/bin/bash
set -euo pipefail

REPO_OWNER="anupam"
REPO_NAME="swiftClaw"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
VERSION="${VERSION:-latest}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Installing swiftClaw AI Assistant ===${NC}"

# ── OS Detection ──────────────────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
    Darwin) OS_NAME="macos" ;;
    Linux)  OS_NAME="linux" ;;
    *)
        echo -e "${RED}Error: Unsupported OS: $OS${NC}"
        exit 1
        ;;
esac

# ── Architecture Detection ────────────────────────────────────────────
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64) ARCH_NAME="x64" ;;
    arm64|aarch64) ARCH_NAME="arm64" ;;
    *)
        echo -e "${RED}Error: Unsupported CPU: $ARCH${NC}"
        exit 1
        ;;
esac

BINARY_NAME="swiftclaw-$OS_NAME-$ARCH_NAME"
echo -e "Detected: ${GREEN}$OS_NAME ($ARCH_NAME)${NC}"

# ── Resolve version ───────────────────────────────────────────────────
if [ "$VERSION" = "latest" ]; then
    DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/$BINARY_NAME"
    CHECKSUM_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/SHA256SUMS.txt"
else
    DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v${VERSION}/$BINARY_NAME"
    CHECKSUM_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/v${VERSION}/SHA256SUMS.txt"
fi

mkdir -p "$INSTALL_DIR"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# ── Download binary ───────────────────────────────────────────────────
echo -e "Downloading: ${BLUE}$BINARY_NAME${NC}${VERSION:+ (v$VERSION)}..."
if ! curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/swiftClaw"; then
    echo -e "${RED}Download failed. Check your internet connection or version.${NC}"
    exit 1
fi

# ── Verify checksum ───────────────────────────────────────────────────
echo "Verifying checksum..."
if CHECKSUMS=$(curl -fsSL "$CHECKSUM_URL" 2>/dev/null); then
    EXPECTED=$(echo "$CHECKSUMS" | grep "$BINARY_NAME" | awk '{print $1}')
    if [ -n "$EXPECTED" ]; then
        ACTUAL=$(sha256sum "$TMP_DIR/swiftClaw" | awk '{print $1}')
        if [ "$ACTUAL" != "$EXPECTED" ]; then
            echo -e "${RED}Checksum mismatch!${NC}"
            echo "  Expected: $EXPECTED"
            echo "  Actual:   $ACTUAL"
            exit 1
        fi
        echo -e "${GREEN}Checksum verified.${NC}"
    else
        echo -e "${BLUE}No checksum found for this binary — skipping verification.${NC}"
    fi
else
    echo -e "${BLUE}Checksums unavailable — skipping verification.${NC}"
fi

# ── Install ───────────────────────────────────────────────────────────
chmod +x "$TMP_DIR/swiftClaw"
cp "$TMP_DIR/swiftClaw" "$INSTALL_DIR/swiftClaw"
ln -sf "$INSTALL_DIR/swiftClaw" "$INSTALL_DIR/swiftclaw"

echo -e "${GREEN}✓ swiftClaw installed to $INSTALL_DIR/swiftClaw${NC}"

# ── PATH check ────────────────────────────────────────────────────────
if [[ :$PATH: != *:"$INSTALL_DIR":* ]]; then
    SHELL_NAME=$(basename "${SHELL:-bash}")
    echo -e "${BLUE}Notice: $INSTALL_DIR is not in your PATH.${NC}"
    echo "Add this line to your ~/.${SHELL_NAME}rc:"
    echo -e "${GREEN}export PATH=\"\$PATH:\$INSTALL_DIR\"${NC}"
    echo "Then: source ~/.${SHELL_NAME}rc"
else
    echo -e "${GREEN}✨ swiftClaw v${VERSION:-latest} is ready. Run: swiftClaw${NC}"
fi
