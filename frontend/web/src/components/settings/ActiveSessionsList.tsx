"use client";

import React, { useState } from "react";
import { ActiveSession } from "../../lib/types/user";
import { ShieldAlert, Laptop, Trash2, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Spinner } from "../ui/spinner";
import { useToast } from "../ui/toast";

interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  onRevoke: (id: string) => Promise<void>;
  onRevokeAll: () => Promise<void>;
  loading: boolean;
}

export function ActiveSessionsList({
  sessions,
  onRevoke,
  onRevokeAll,
  loading,
}: ActiveSessionsListProps) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleRevokeSingle = async () => {
    if (!showConfirm) return;
    setRevoking(true);
    try {
      const isCurrent = sessions.find((s) => s.session_id === showConfirm)?.is_current;
      await onRevoke(showConfirm);
      toast({
        title: isCurrent ? "Session Terminated" : "Device Revoked",
        description: isCurrent ? "Your active session was closed." : "The selected device session was terminated.",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Action Failed",
        description: "Failed to revoke device session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
      setShowConfirm(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setRevoking(true);
    try {
      await onRevokeAll();
      toast({
        title: "All Other Sessions Revoked",
        description: "Successfully logged out of all other devices.",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Action Failed",
        description: "Failed to revoke other sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
      setShowConfirmAll(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-white/[0.01] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="flex flex-col gap-4 text-xs select-none">
      {/* Revoke other sessions button bar */}
      {otherSessions.length > 0 && (
        <div className="flex justify-end shrink-0">
          <Button
            variant="outline"
            onClick={() => setShowConfirmAll(true)}
            className="text-xs h-9 border-white/10 hover:bg-white/5 hover:text-red-400 font-semibold cursor-pointer"
          >
            Log Out Other Devices
          </Button>
        </div>
      )}

      {/* Sessions list */}
      <div className="flex flex-col gap-2">
        {sessions.map((session) => (
          <div
            key={session.session_id}
            className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.015] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                <Laptop className="h-4 w-4 text-sc-text-muted/70" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-sc-text truncate">
                    {session.device_info}
                  </span>
                  {session.is_current && (
                    <span className="text-[8px] font-mono text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded select-none uppercase shrink-0">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-sc-text-muted/65 font-mono">
                  <span>IP: {session.ip_address}</span>
                  <span>Active: {formatDate(session.last_active)}</span>
                </div>
              </div>
            </div>

            {/* Revoke button */}
            <button
              onClick={() => setShowConfirm(session.session_id)}
              className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-red-400 transition-colors cursor-pointer shrink-0"
              title={session.is_current ? "Log out this session" : "Revoke device session"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Revoke Single Confirmation Modal */}
      <Modal
        isOpen={showConfirm !== null}
        onClose={() => !revoking && setShowConfirm(null)}
        title="Revoke Device Session"
      >
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-sc-text-muted leading-relaxed">
            Are you sure you want to terminate this active device session? The selected device will be logged out immediately and lose access to credentials mapping.
          </p>

          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button
              variant="ghost"
              disabled={revoking}
              onClick={() => setShowConfirm(null)}
              className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted"
            >
              Cancel
            </Button>
            <Button
              disabled={revoking}
              onClick={handleRevokeSingle}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
            >
              {revoking ? "Revoking..." : "Revoke Session"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke All Confirmation Modal */}
      <Modal
        isOpen={showConfirmAll}
        onClose={() => !revoking && setShowConfirmAll(false)}
        title="Terminate Other Sessions"
      >
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-sc-text-muted leading-relaxed">
            Are you sure you want to log out of all other active device sessions? All other browsers and devices currently logged into this account will be disconnected.
          </p>

          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button
              variant="ghost"
              disabled={revoking}
              onClick={() => setShowConfirmAll(false)}
              className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted"
            >
              Cancel
            </Button>
            <Button
              disabled={revoking}
              onClick={handleRevokeAllOther}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer"
            >
              {revoking ? "Revoking..." : "Revoke All Other"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default ActiveSessionsList;
