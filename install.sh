#!/bin/bash
set -e

# Configuration
REPO_OWNER="anupam" # Update this to your actual GitHub username if different
REPO_NAME="swiftClaw"
INSTALL_DIR="$HOME/.local/bin"

# Aesthetics
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Installing swiftClaw AI Assistant ===${NC}"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin)
        OS_NAME="macos"
        ;;
    Linux)
        OS_NAME="linux"
        ;;
    *)
        echo -e "${RED}Error: Unsupported Operating System: $OS${NC}"
        exit 1
        ;;
esac

# Detect Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)
        ARCH_NAME="x64"
        ;;
    arm64|aarch64)
        ARCH_NAME="arm64"
        ;;
    *)
        echo -e "${RED}Error: Unsupported CPU Architecture: $ARCH${NC}"
        exit 1
        ;;
esac

BINARY_NAME="swiftclaw-$OS_NAME-$ARCH_NAME"
DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/$BINARY_NAME"

echo -e "Detected: ${GREEN}$OS_NAME ($ARCH_NAME)${NC}"

# Ensure install directory exists
mkdir -p "$INSTALL_DIR"

# Download binary
echo -e "Downloading from: $DOWNLOAD_URL..."
curl -L -o "$INSTALL_DIR/swiftClaw" "$DOWNLOAD_URL"
chmod +x "$INSTALL_DIR/swiftClaw"

# Create symlink so both swiftClaw and swiftclaw work
ln -sf "$INSTALL_DIR/swiftClaw" "$INSTALL_DIR/swiftclaw"

echo -e "${GREEN}✓ swiftClaw downloaded and marked as executable!${NC}"
echo ""

# Verify if PATH is set correctly
if [[ :$PATH: != *:"$INSTALL_DIR":* ]]; then
    echo -e "${BLUE}Notice: $INSTALL_DIR is not in your PATH.${NC}"
    echo "To run swiftClaw from anywhere, add the following line to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
    echo -e "${GREEN}export PATH=\"\$PATH:\$HOME/.local/bin\"${NC}"
    echo "Then reload your shell: source ~/.zshrc (or source ~/.bashrc)"
else
    echo -e "${GREEN}✨ swiftClaw is installed and ready to use!${NC}"
    echo "Try running:"
    echo -e "${BLUE}  swiftClaw${NC}"
fi
