import { 
  BookOpen, 
  Settings2, 
  Terminal, 
  Code2, 
  MessageCircle, 
  Cpu, 
  TerminalSquare, 
  Command, 
  AppWindow, 
  HardDrive,
  Blocks
} from "lucide-react";

export const CORE_LINKS = [
  { label: "Introduction", href: "/docs/intro", icon: BookOpen, keywords: "getting started readme welcome overview" },
  { label: "Configuration", href: "/docs/config", icon: Settings2, keywords: "env setup keys options production development variables" },
  { label: "CLI Reference", href: "/docs/cli", icon: Terminal, keywords: "commands execute lines flags terminal script run" },
  { label: "IDE & editors", href: "/docs/ide", icon: Code2, keywords: "vscode cursor terminal editor integrated" },
  { label: "Telegram Gateway", href: "/docs/telegram", icon: MessageCircle, keywords: "bot notification webhooks client channels streams messaging" },
  { label: "Agent Skills", href: "/docs/skills", icon: Cpu, badge: "ACTIVE", keywords: "crewai models tools intelligence multi-agent execution LLM" },
];

export const INSTALL_LINKS = [
  { label: "CMD / One-Liner", href: "/docs/install/cmd", icon: TerminalSquare, keywords: "installation shell curl bash terminal direct setup fast mac linux" },
  { label: "npm / pnpm / bun", href: "/docs/install/npm", icon: Blocks, keywords: "npm pnpm bun node package manager global install registry" },
  { label: "Docker", href: "/docs/install/docker", icon: TerminalSquare, keywords: "container docker ghcr.io image pull containerized" },
  { label: "macOS", href: "/docs/install/mac", icon: Command, keywords: "apple silicon intel arm64 binary manual" },
  { label: "Windows", href: "/docs/install/windows", icon: AppWindow, keywords: "microsoft powershell exe installation" },
  { label: "Linux", href: "/docs/install/debian", icon: HardDrive, keywords: "linux ubuntu debian fedora arch binary apt" },
];
