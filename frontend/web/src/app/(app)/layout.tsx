"use client";

import React from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Terminal } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Full-screen Premium loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-sc-canvas text-sc-text gap-4 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.01] flex items-center justify-center animate-pulse">
            <Terminal className="h-5 w-5 text-sc-text" />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sc-text-muted select-none">
            Initializing Session...
          </span>
          <Spinner size="sm" className="border-t-transparent border-sc-text/40" />
        </div>
      </div>
    );
  }

  // If unauthenticated, let useAuth redirect. Render nothing.
  if (!user) {
    return null;
  }

  const isOnboarding = pathname === "/onboarding";

  // Onboarding has a centered fullscreen layout
  if (isOnboarding) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-sc-canvas px-4 py-8">
        {children}
      </div>
    );
  }

  // Authenticated workspace shell (Sidebar + main panel)
  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-sc-canvas text-sc-text">
      {/* Sidebar Panel */}
      <AppSidebar />

      {/* Main Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
