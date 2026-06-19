"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ModelInfo } from "@/lib/api/models";
import { ChevronDown, Search, Check, Eye, Wifi, Cpu } from "lucide-react";

interface ModelSelectProps {
  value: string;
  models: ModelInfo[];
  onChange: (modelId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatContext(n: number | null | undefined): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

const capabilityBadges: {
  key: keyof ModelInfo;
  label: string;
  icon: React.ReactNode;
  show: (m: ModelInfo) => boolean;
}[] = [
  {
    key: "supports_vision",
    label: "Vision",
    icon: <Eye className="h-2.5 w-2.5" />,
    show: (m) => !!m.supports_vision,
  },
  {
    key: "supports_tools",
    label: "Tools",
    icon: <Wifi className="h-2.5 w-2.5" />,
    show: (m) => !!m.supports_tools,
  },
  {
    key: "supports_streaming",
    label: "Stream",
    icon: <Cpu className="h-2.5 w-2.5" />,
    show: (m) => !!m.supports_streaming,
  },
];

export function ModelSelect({
  value,
  models,
  onChange,
  disabled = false,
  placeholder = "Select a model",
}: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
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

  const selected = models.find((m) => m.id === value);
  const ctxLabel = selected ? formatContext(selected.context_length) : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return models;
    const q = query.toLowerCase();
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
    );
  }, [models, query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) { setOpen(!open); setQuery(""); } }}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between h-9 bg-black/40 border rounded-md px-2.5 text-xs text-sc-text outline-none transition-colors cursor-pointer disabled:opacity-50",
          open ? "border-sc-accent" : "border-white/10 hover:border-white/20"
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selected ? (
            <>
              <span>{selected.name}</span>
              {ctxLabel && (
                <span className="text-[9px] text-sc-text-muted/50 font-mono">{ctxLabel}</span>
              )}
            </>
          ) : (
            <span className="text-sc-text-muted/50">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-sc-text-muted/50 shrink-0 ml-1 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute z-[70] mt-1 left-0 right-0 bg-[#0D0D0D] border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="relative border-b border-white/5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sc-text-muted/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-transparent pl-8 pr-3 py-2 text-xs text-sc-text outline-none placeholder:text-sc-text-muted/30"
              />
            </div>

            {/* List */}
            <div className="max-h-[200px] overflow-y-auto scrollbar-premium">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-xs text-sc-text-muted/40 text-center">
                  No models match &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((model) => {
                  const isActive = model.id === value;
                  const ctx = formatContext(model.context_length);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => { onChange(model.id); setOpen(false); setQuery(""); }}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer",
                        isActive
                          ? "bg-white/10 text-sc-text"
                          : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium truncate">{model.name}</span>
                          {isActive && <Check className="h-3 w-3 text-sc-accent shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {ctx && (
                            <span className="text-[9px] font-mono text-sc-text-muted/40 bg-white/5 px-1.5 py-0.5 rounded">
                              {ctx}
                            </span>
                          )}
                          {capabilityBadges.map(
                            (badge) =>
                              badge.show(model) && (
                                <span
                                  key={badge.key}
                                  className="inline-flex items-center gap-0.5 text-[9px] text-sc-text-muted/40 bg-white/5 px-1.5 py-0.5 rounded"
                                >
                                  {badge.icon}
                                  {badge.label}
                                </span>
                              )
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer count */}
            <div className="border-t border-white/5 px-3 py-1.5 text-[9px] text-sc-text-muted/30 text-right">
              {models.length} model{models.length !== 1 ? "s" : ""}
              {query.trim() && ` • ${filtered.length} filtered`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
