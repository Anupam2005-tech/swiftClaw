.PHONY: all build compile binaries clean install uninstall release docker help

VERSION := $(shell node -p "require('./package.json').version")

all: build

# ── JS Bundle (npm publish) ──────────────────────────────────────────
build:
	bun run build

# ── Standalone binaries ──────────────────────────────────────────────
compile binaries:
	bun run scripts/compile.ts

# ── Clean ────────────────────────────────────────────────────────────
clean:
	rm -rf dist/

# ── Install locally ──────────────────────────────────────────────────
install: compile
	@echo "Installing swiftClaw v$(VERSION) to ~/.local/bin..."
	mkdir -p ~/.local/bin
	cp dist/bin/swiftclaw-linux-x64 ~/.local/bin/swiftClaw
	ln -sf ~/.local/bin/swiftClaw ~/.local/bin/swiftclaw
	chmod +x ~/.local/bin/swiftClaw
	@echo "Done. Make sure ~/.local/bin is in your PATH."

uninstall:
	rm -f ~/.local/bin/swiftClaw ~/.local/bin/swiftclaw
	@echo "swiftClaw removed."

# ── Release helpers ──────────────────────────────────────────────────
release:
	@echo "To create a release:"
	@echo "  git tag v$(VERSION) && git push origin v$(VERSION)"
	@echo ""
	@echo "This triggers .github/workflows/release.yml which will:"
	@echo "  - Build JS bundle and publish to npm"
	@echo "  - Compile standalone binaries for all platforms"
	@echo "  - Create a GitHub Release with binaries & checksums"
	@echo "  - Build and push Docker image to ghcr.io"

# ── Docker ───────────────────────────────────────────────────────────
docker:
	docker build -t ghcr.io/anupam/swiftclaw:latest -t ghcr.io/anupam/swiftclaw:v$(VERSION) .

# ── Dev ──────────────────────────────────────────────────────────────
dev:
	bun index.ts

.PHONY: all build compile binaries clean install uninstall release docker dev
