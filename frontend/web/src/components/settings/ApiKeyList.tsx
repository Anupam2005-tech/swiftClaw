"use client";

import React, { useState } from "react";
import { KeyMeta, ProviderId } from "../../lib/types/provider";
import { Trash2, ShieldCheck, Check, Calendar, Activity, Edit3 } from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { useToast } from "../ui/toast";
import { ApiKeyForm } from "./ApiKeyForm";
import { PROVIDERS } from "../onboarding/ProviderSelectionStep";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiKeyListProps {
  keys: KeyMeta[];
  onRemove: (provider: ProviderId) => Promise<void>;
  onUpdateKey: (provider: ProviderId, key: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

export function ApiKeyList({ keys, onRemove, onUpdateKey, loading }: ApiKeyListProps) {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState<ProviderId | null>(null);
  const [removing, setRemoving] = useState(false);
  const [editProvider, setEditProvider] = useState<ProviderId | null>(null);

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const handleConfirmRemove = async () => {
    if (!showConfirm) return;
    setRemoving(true);
    try {
      const target = showConfirm;
      await onRemove(target);
      toast({
        title: "Key Revoked",
        description: `Successfully removed credentials for ${getProviderName(target)}.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Removal Failed",
        description: "Failed to remove the credential. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
      setShowConfirm(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  if (loading && keys.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-white/[0.01] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Skeleton name="api-key-list" loading={loading} animate="pulse">
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-lg text-center bg-black/20 select-none">
          <ShieldCheck className="h-8 w-8 text-sc-text-muted/30 mb-3" />
          <h4 className="text-xs font-semibold text-sc-text">Key Vault Empty</h4>
          <p className="text-[10px] text-sc-text-muted mt-1 max-w-[280px] leading-relaxed">
            Configure an LLM provider key below to enable agent routing, file analysis, and generations.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
      {keys.map((keyMeta) => (
        <div
          key={keyMeta.provider}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.015] transition-colors gap-3"
        >
          {/* Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center font-bold text-sc-accent text-xs shrink-0">
              {keyMeta.provider.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-sc-text truncate">
                {getProviderName(keyMeta.provider)}
              </span>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-sc-text-muted/60 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  Added {formatDate(keyMeta.added_at)}
                </span>
                {keyMeta.last_used && (
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 shrink-0" />
                    Last used {formatDate(keyMeta.last_used)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="flex items-center gap-1 text-[9px] text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded font-mono select-none">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
              <span className="hidden xs:inline">Vaulted</span>
            </span>

            <button
              onClick={() => setEditProvider(keyMeta.provider)}
              className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-accent transition-colors cursor-pointer"
              title="Edit Key"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setShowConfirm(keyMeta.provider)}
              className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-red-400 transition-colors cursor-pointer"
              title="Revoke Key"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal via ApiKeyForm */}
      {editProvider && (
        <ApiKeyForm
          key={editProvider}
          onAddKey={onUpdateKey}
          existingKeys={keys.map((k) => k.provider)}
          initialProvider={editProvider}
          onClose={() => setEditProvider(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showConfirm !== null}
        onClose={() => !removing && setShowConfirm(null)}
        title="Revoke API Key"
      >
        <div className="flex flex-col gap-4 text-xs select-none">
          <p className="text-sc-text-muted leading-relaxed">
            Are you sure you want to delete the credentials for{" "}
            <strong className="text-sc-text">
              {showConfirm ? getProviderName(showConfirm) : ""}
            </strong>
            ? This action cannot be undone and will disable all mapped task preferences.
          </p>

          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button
              variant="ghost"
              disabled={removing}
              onClick={() => setShowConfirm(null)}
              className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted text-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={removing}
              onClick={handleConfirmRemove}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer text-xs"
            >
              {removing ? "Revoking..." : "Revoke Key"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
      )}
    </Skeleton>
  );
}
export default ApiKeyList;
