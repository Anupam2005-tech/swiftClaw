"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProviderId } from "../../lib/types/provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Plus, Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/modal";
import { useToast } from "../ui/toast";
import { PROVIDERS } from "../onboarding/ProviderSelectionStep";
import { cn } from "@/lib/utils";

interface ApiKeyFormProps {
  onAddKey: (provider: ProviderId, key: string) => Promise<{ success: boolean; error?: string }>;
  existingKeys: ProviderId[];
  initialProvider?: ProviderId | null;
  onClose?: () => void;
}

export function ApiKeyForm({ onAddKey, existingKeys, initialProvider, onClose }: ApiKeyFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(!!initialProvider);
  const [provider, setProvider] = useState<ProviderId>(initialProvider || getDefaultProvider());
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function getDefaultProvider(): ProviderId {
    const remaining = PROVIDERS.filter((p) => !existingKeys.includes(p.id));
    return remaining.length > 0 ? remaining[0].id : "gemini";
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const isEditing = initialProvider !== undefined && initialProvider !== null;

  const handleOpen = () => {
    const remaining = PROVIDERS.filter((p) => !existingKeys.includes(p.id));
    setProvider(remaining.length > 0 ? remaining[0].id : "gemini");
    setKey("");
    setShowKey(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setSaving(true);
    try {
      const res = await onAddKey(provider, key);
      if (res.success) {
        toast({
          title: isEditing ? "Key Updated" : "Key Saved",
          description: `API key for ${getProviderName(provider)} ${isEditing ? "updated" : "encrypted and stored"}.`,
          variant: "success",
        });
        setIsOpen(false);
        onClose?.();
      } else {
        toast({
          title: "Failed to Save",
          description: res.error || "Could not save the key.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "Failed to add key.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const availableProviders = isEditing
    ? PROVIDERS.filter((p) => p.id === initialProvider || !existingKeys.includes(p.id))
    : PROVIDERS.filter((p) => !existingKeys.includes(p.id));

  return (
    <div className="shrink-0 select-none">
      {!initialProvider && (
        <Button
          onClick={handleOpen}
          disabled={availableProviders.length === 0}
          className="bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Add API Key</span>
          <span className="sm:hidden">Add</span>
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={() => { if (!saving) { setIsOpen(false); onClose?.(); } }} title={isEditing ? `Update ${getProviderName(provider)} Key` : "Add Provider Key"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">
                Select Provider
              </label>
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={saving}
                  className="w-full flex items-center justify-between h-10 bg-black/40 border border-white/10 rounded-md px-3 text-xs text-sc-text outline-none focus:border-sc-accent transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate">{getProviderName(provider)}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-sc-text-muted/50 shrink-0 ml-2 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute z-[60] top-full mt-1 left-0 right-0 bg-[#0D0D0D] border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-[180px] overflow-y-auto"
                    >
                      {availableProviders.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProvider(p.id); setKey(""); setDropdownOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-xs text-left transition-colors cursor-pointer",
                            provider === p.id
                              ? "bg-white/10 text-sc-text"
                              : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                          )}
                        >
                          <span className="flex-1 truncate">{p.name}</span>
                          {provider === p.id && <Check className="h-3 w-3 text-sc-accent shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">Provider</label>
              <div className="h-10 bg-black/30 border border-white/10 rounded-md px-3 flex items-center text-xs text-sc-text/60">
                {getProviderName(provider)}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-sc-text-muted uppercase tracking-wider font-semibold">
              API Key Value
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={`Paste your ${getProviderName(provider)} API key...`}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={saving}
                className="bg-black/30 border-white/10 h-10 pr-10 text-sc-text text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sc-text-muted hover:text-sc-text transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-white/5 pt-3 mt-2 flex-wrap">
            <Button type="button" variant="ghost" disabled={saving} onClick={() => { setIsOpen(false); onClose?.(); }} className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !key.trim()} className="h-10 px-4 bg-sc-accent text-accent-foreground font-semibold cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50 text-xs">
              {saving ? <Spinner size="sm" /> : isEditing ? "Update Key" : "Add to Vault"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default ApiKeyForm;
