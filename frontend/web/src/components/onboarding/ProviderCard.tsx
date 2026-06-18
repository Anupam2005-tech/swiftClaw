"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProviderInfo } from "../../lib/types/provider";
import { Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: ProviderInfo;
  selected: boolean;
  onToggle: () => void;
}

export function ProviderCard({ provider, selected, onToggle }: ProviderCardProps) {
  return (
    <motion.div
      onClick={onToggle}
      layout
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-lg border p-4 flex flex-col justify-between h-[130px] transition-colors cursor-pointer select-none overflow-hidden",
        selected
          ? "border-sc-accent bg-sc-accent/[0.03]"
          : "border-white/[0.06] bg-white/[0.01] hover:border-white/[0.15]"
      )}
    >
      {/* Selected glow */}
      {selected && (
        <motion.div
          layoutId="selected-glow"
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sc-accent/[0.04] to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sc-accent/30 to-transparent" />
        </motion.div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-sc-text truncate">{provider.name}</h4>
          <p className="text-[10px] text-sc-text-muted mt-1 leading-relaxed line-clamp-2">
            {provider.description}
          </p>
        </div>

        {/* Selected Check Indicator */}
        <motion.div
          animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn(
            "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
            selected
              ? "border-sc-accent bg-sc-accent text-accent-foreground"
              : "border-white/[0.15] bg-transparent"
          )}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Check className="h-3 w-3 stroke-[3]" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom link to developer console */}
      <div className="relative z-10">
        <a
          href={provider.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[9px] text-sc-text-muted/70 hover:text-sc-text transition-colors uppercase tracking-wider font-semibold"
        >
          Get Key
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </motion.div>
  );
}
