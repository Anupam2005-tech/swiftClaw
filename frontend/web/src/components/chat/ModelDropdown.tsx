"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApiKeys } from "@/lib/hooks/useApiKeys";
import { useModelPreferences } from "@/lib/hooks/useModelPreferences";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, Check } from "lucide-react";
import { ProviderId } from "@/lib/types/provider";

// Provider display names
const PROVIDER_NAMES: Record<string, string> = {
  gemini: "Gemini",
  claude: "Claude",
  openai: "OpenAI",
  groq: "Groq",
  perplexity: "Perplexity",
  openrouter: "OpenRouter",
  nvidia: "NVIDIA",
};

// Default models per provider
const PROVIDER_MODELS: Record<string, string> = {
  gemini: "gemini-2.0-flash",
  claude: "claude-3-5-sonnet",
  openai: "gpt-4o",
  groq: "llama-3.3-70b",
  perplexity: "sonar-pro",
  openrouter: "auto",
  nvidia: "nvidia-nim",
};

export function ModelDropdown() {
  const { keys } = useApiKeys();
  const { preferences, updatePreference } = useModelPreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasKeys = keys.length > 0;
  const currentModel = preferences?.chat;
  const currentLabel = currentModel
    ? `${PROVIDER_NAMES[currentModel.provider] || currentModel.provider} • ${currentModel.model}`
    : "Select a model";

  const handleSelect = (providerId: ProviderId, model: string) => {
    updatePreference("chat", providerId, model);
    setOpen(false);
  };

  return (
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
            className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-[#0A0A0A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              {keys.map((keyMeta) => {
                const name = PROVIDER_NAMES[keyMeta.provider] || keyMeta.provider;
                const model = PROVIDER_MODELS[keyMeta.provider] || "default";
                const isActive = currentModel?.provider === keyMeta.provider;
                return (
                  <button
                    key={keyMeta.provider}
                    onClick={() => handleSelect(keyMeta.provider, model)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors cursor-pointer",
                      isActive
                        ? "bg-white/10 text-sc-text"
                        : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                    )}
                  >
                    <span className="flex-1 truncate">{name}</span>
                    <span className="text-[10px] text-sc-text-muted/50 truncate max-w-[80px]">{model}</span>
                    {isActive && <Check className="h-3 w-3 text-sc-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default ModelDropdown;
