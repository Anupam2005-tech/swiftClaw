class Swiftclaw < Formula
  desc "AI agent and terminal companion tool"
  homepage "https://github.com/anupam/swiftClaw"
  version "1.0.1"

  if OS.mac?
    if Hardware::CPU.arm?
      url "https://github.com/anupam/swiftClaw/releases/download/v#{version}/swiftclaw-macos-arm64"
      sha256 "PLACEHOLDER_MACOS_ARM64"
    else
      url "https://github.com/anupam/swiftClaw/releases/download/v#{version}/swiftclaw-macos-x64"
      sha256 "PLACEHOLDER_MACOS_X64"
    end
  elsif OS.linux?
    if Hardware::CPU.arm?
      url "https://github.com/anupam/swiftClaw/releases/download/v#{version}/swiftclaw-linux-arm64"
      sha256 "PLACEHOLDER_LINUX_ARM64"
    else
      url "https://github.com/anupam/swiftClaw/releases/download/v#{version}/swiftclaw-linux-x64"
      sha256 "PLACEHOLDER_LINUX_X64"
    end
  end

  def install
    bin.install Dir["swiftclaw-*"].first => "swiftclaw"
  end

  test do
    assert_match "swiftclaw", shell_output("#{bin}/swiftclaw --version")
  end
end
