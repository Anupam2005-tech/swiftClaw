"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Key, Sliders, ShieldAlert, Cpu, User, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/api-keys", label: "API Keys", icon: Key },
  { href: "/settings/history", label: "History", icon: History },
  { href: "/settings/model-preferences", label: "Task Mapping", icon: Sliders },
  { href: "/settings/integrations", label: "MCP", icon: Cpu, comingSoon: true },
  { href: "/settings/sessions", label: "Sessions", icon: ShieldAlert },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:flex-col gap-1 w-full md:max-w-[200px] shrink-0 select-none overflow-x-auto scrollbar-none pb-1 md:pb-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.comingSoon) {
          return (
            <div
              key={item.href}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-xs font-semibold text-sc-text-muted/30 select-none cursor-not-allowed shrink-0 whitespace-nowrap"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 opacity-40" />
                {item.label}
              </span>
              <span className="text-[8px] px-1 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400/70 font-bold uppercase tracking-wider font-mono">
                Soon
              </span>
            </div>
          );
        }

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
