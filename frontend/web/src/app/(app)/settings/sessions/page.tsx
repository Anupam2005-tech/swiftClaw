"use client";

import React from "react";
import { ActiveSessionsList } from "@/components/settings/ActiveSessionsList";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SessionsSettingsPage() {
  const { sessions, loading, revokeSession, revokeAllSessions } = useAuth();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider">
          Active Device Sessions
        </h2>
        <p className="text-[10px] text-sc-text-muted mt-1 leading-normal">
          Manage browser sessions logged into this account. Multi-device 30-day session vault.
        </p>
      </div>

      <ActiveSessionsList
        sessions={sessions}
        onRevoke={revokeSession}
        onRevokeAll={revokeAllSessions}
        loading={loading}
      />
    </div>
  );
}
