"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { useModelPreferences } from "@/lib/hooks/useModelPreferences";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Check, Search, Eye, Wifi, Cpu, AlertTriangle, Globe } from "lucide-react";
import { ProviderId } from "@/lib/types/provider";
import { useAllProviderModels } from "@/lib/hooks/useProviderModels";
import { ModelInfo } from "@/lib/api/models";
import { Skeleton } from "@/components/ui/skeleton";

const PROVIDER_NAMES: Record<string, string> = {
  gemini: "Gemini",
  claude: "Claude",
  openai: "OpenAI",
  groq: "Groq",
  perplexity: "Perplexity",
  openrouter: "OpenRouter",
  nvidia: "NVIDIA",
};

const PROVIDER_COLORS: Record<string, string> = {
  gemini: "text-blue-400/80",
  claude: "text-orange-400/80",
  openai: "text-green-400/80",
  groq: "text-purple-400/80",
  perplexity: "text-cyan-400/80",
  openrouter: "text-yellow-400/80",
  nvidia: "text-emerald-400/80",
};

function formatContext(n: number | null | undefined): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function ModelCapabilityBadges({ model }: { model: ModelInfo }) {
  const ctx = formatContext(model.context_length);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {ctx && (
        <span className="text-[8px] font-mono text-sc-text-muted/30 bg-white/5 px-1 py-0.5 rounded">
          {ctx}
        </span>
      )}
      {model.supports_vision && (
        <span className="inline-flex items-center gap-0.5 text-[8px] text-sc-text-muted/30 bg-white/5 px-1 py-0.5 rounded">
          <Eye className="h-2 w-2" /> Vision
        </span>
      )}
      {model.supports_tools && (
        <span className="inline-flex items-center gap-0.5 text-[8px] text-sc-text-muted/30 bg-white/5 px-1 py-0.5 rounded">
          <Wifi className="h-2 w-2" /> Tools
        </span>
      )}
      {model.supports_streaming && (
        <span className="inline-flex items-center gap-0.5 text-[8px] text-sc-text-muted/30 bg-white/5 px-1 py-0.5 rounded">
          <Cpu className="h-2 w-2" /> Stream
        </span>
      )}
    </div>
  );
}

interface ModelDropdownProps {
  webSearchEnabled?: boolean;
  onWebSearchChange?: (enabled: boolean) => void;
}

export function ModelDropdown({ webSearchEnabled, onWebSearchChange }: ModelDropdownProps = {}) {
  const { keys } = useApiKeys();
  const { preferences, updatePreference } = useModelPreferences();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeProviders = keys.map((k) => k.provider);
  const { modelMap, errorMap, loading: modelsLoading } = useAllProviderModels(activeProviders);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const hasKeys = keys.length > 0;
  const currentModel = preferences?.chat;
  const currentLabel = currentModel
    ? `${PROVIDER_NAMES[currentModel.provider] || currentModel.provider} • ${currentModel.model}`
    : "Select a model";

  const getDefaultModel = (providerId: ProviderId): string => {
    const models = modelMap[providerId];
    if (models && models.length > 0) return models[0].id;
    return "default";
  };

  const handleSelect = (providerId: ProviderId, model?: string) => {
    const useModel = model || getDefaultModel(providerId);
    updatePreference("chat", providerId, useModel);
    setOpen(false);
    setSearchQuery("");
  };

  // Build flat list of all models for search
  const allModels = useMemo(() => {
    const result: { providerId: ProviderId; model: ModelInfo }[] = [];
    for (const key of keys) {
      const pid = key.provider as ProviderId;
      const models = modelMap[pid] || [];
      for (const m of models) {
        result.push({ providerId: pid, model: m });
      }
    }
    return result;
  }, [keys, modelMap]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allModels.filter(
      ({ model }) =>
        model.id.toLowerCase().includes(q) || model.name.toLowerCase().includes(q)
    );
  }, [allModels, searchQuery]);

  const groupedSearchResults = useMemo(() => {
    if (!searchResults) return null;
    const groups: Record<string, { providerId: ProviderId; model: ModelInfo }[]> = {};
    for (const item of searchResults) {
      const pid = item.providerId;
      if (!groups[pid]) groups[pid] = [];
      groups[pid].push(item);
    }
    return groups;
  }, [searchResults]);

  return (
    <Skeleton name="model-dropdown" loading={modelsLoading} animate="pulse">
      <div ref={ref} className="relative">
        <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer select-none",
          hasKeys
            ? "text-sc-text-muted/70 hover:text-sc-text hover:bg-white/5"
            : "text-sc-text-muted/30 cursor-not-allowed"
        )}
      >
        <Sparkles className="h-3 w-3 shrink-0" />
        <span className="truncate max-w-[140px]">{currentLabel}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && hasKeys && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-2 left-0 min-w-[240px] bg-[#0A0A0A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {/* Search */}
            <div className="relative border-b border-white/5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-sc-text-muted/40" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent pl-7 pr-3 py-2 text-[11px] text-sc-text outline-none placeholder:text-sc-text-muted/30"
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto py-1">
              {searchQuery.trim() && groupedSearchResults ? (
                /* Search results grouped by provider */
                Object.entries(groupedSearchResults).length === 0 ? (
                  <div className="px-3 py-4 text-xs text-sc-text-muted/40 text-center">
                    No models match &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  Object.entries(groupedSearchResults).map(([pid, items]) => (
                    <div key={pid}>
                      <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-sc-text-muted/40">
                        {PROVIDER_NAMES[pid] || pid}
                      </div>
                      {items.map(({ providerId, model }) => {
                        const isActive = currentModel?.provider === providerId && currentModel?.model === model.id;
                        return (
                          <button
                            key={`${providerId}:${model.id}`}
                            onClick={() => handleSelect(providerId, model.id)}
                            className={cn(
                              "w-full flex items-start gap-2 px-3 py-1.5 text-[11px] text-left transition-colors cursor-pointer",
                              isActive
                                ? "bg-white/10 text-sc-text"
                                : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{model.name}</span>
                                {isActive && <Check className="h-2.5 w-2.5 text-sc-accent shrink-0" />}
                              </div>
                              <ModelCapabilityBadges model={model} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )
              ) : (
                /* Default: provider list */
                keys.map((keyMeta) => {
                  const pid = keyMeta.provider as ProviderId;
                  const name = PROVIDER_NAMES[pid] || pid;
                  const models = modelMap[pid] || [];
                  const providerError = errorMap[pid];
                  const displayModel = models[0]?.name || currentModel?.model || "";
                  const isActive = currentModel?.provider === pid;

                  const errorLabel = providerError
                    ? providerError.code === "rate_limited"
                      ? "Rate limited"
                      : providerError.code === "invalid_key"
                      ? "Invalid key"
                      : "Connection error"
                    : null;

                  return (
                    <div
                      key={pid}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors",
                        providerError
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer hover:bg-white/5"
                      )}
                      title={providerError?.message}
                      onClick={() => !providerError && handleSelect(pid)}
                    >
                      <span className={cn("text-[10px] font-semibold", PROVIDER_COLORS[pid])}>
                        {name}
                      </span>
                      {providerError ? (
                        <span className="flex items-center gap-1 text-[9px] text-amber-400/80 font-mono truncate">
                          <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                          {errorLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] text-sc-text-muted/50 truncate max-w-[100px]">
                          {displayModel || "default"}
                        </span>
                      )}
                      {isActive && !providerError && <Check className="h-3 w-3 text-sc-accent shrink-0 ml-auto" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Web Search Toggle */}
            <div className="border-t border-white/5 px-3 py-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWebSearchChange?.(!webSearchEnabled);
                  }}
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors shrink-0",
                    webSearchEnabled ? "bg-sc-accent" : "bg-white/10"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                    webSearchEnabled && "translate-x-3"
                  )} />
                </button>
                <Globe className={cn(
                  "h-3 w-3 shrink-0 transition-colors",
                  webSearchEnabled ? "text-sc-accent" : "text-sc-text-muted/40"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  webSearchEnabled ? "text-sc-text" : "text-sc-text-muted/50"
                )}>
                  Search the web
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </Skeleton>
  );
}
export default ModelDropdown;
