"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, Sliders, ShieldAlert, Cpu, BarChart, User, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/settings/history", label: "History", icon: History },
  { href: "/settings/model-preferences", label: "Task Mapping", icon: Sliders },
  { href: "/settings/integrations", label: "MCP", icon: Cpu },
  { href: "/settings/sessions", label: "Sessions", icon: ShieldAlert },
  { href: "/settings/usage", label: "Usage", icon: BarChart },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:flex-col gap-1 w-full md:max-w-[200px] shrink-0 select-none overflow-x-auto scrollbar-none pb-1 md:pb-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors shrink-0 whitespace-nowrap",
              isActive
                ? "bg-white/5 text-sc-text"
                : "text-sc-text-muted hover:bg-white/[0.02] hover:text-sc-text"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
export default SettingsNav;
