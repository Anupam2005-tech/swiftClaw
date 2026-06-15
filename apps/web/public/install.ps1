# swiftClaw Windows installer — downloads release binary and adds to user PATH
$ErrorActionPreference = "Stop"

$RepoOwner = "anupam"
$RepoName = "swiftClaw"
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\swiftclaw"
$BinaryName = "swiftclaw-windows-x64.exe"
$DownloadUrl = "https://github.com/$RepoOwner/$RepoName/releases/latest/download/$BinaryName"
$ExePath = Join-Path $InstallDir "swiftClaw.exe"

Write-Host "=== Installing swiftClaw ===" -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

Write-Host "Downloading $DownloadUrl ..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile $ExePath -UseBasicParsing

# Lowercase alias for consistency with npm global `swiftclaw`
$AliasPath = Join-Path $InstallDir "swiftclaw.exe"
if (Test-Path $AliasPath) { Remove-Item $AliasPath -Force }
Copy-Item $ExePath $AliasPath

$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($userPath -notlike "*$InstallDir*") {
  [Environment]::SetEnvironmentVariable("PATH", "$userPath;$InstallDir", "User")
  $env:PATH = "$env:PATH;$InstallDir"
}

Write-Host ""
Write-Host "swiftClaw installed to $InstallDir" -ForegroundColor Green
Write-Host "Restart your terminal, then run:  swiftclaw" -ForegroundColor Green
Write-Host "First launch opens the setup wizard (OpenRouter API key required)." -ForegroundColor DarkGray
