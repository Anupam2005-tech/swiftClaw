"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ProviderId } from "../../lib/types/provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { PROVIDERS } from "./ProviderSelectionStep";

interface KeyEntryStepProps {
  selectedProviders: ProviderId[];
  apiKeys: Record<string, string>;
  onKeyChange: (provider: ProviderId, key: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } },
};

export function KeyEntryStep({
  selectedProviders,
  apiKeys,
  onKeyChange,
  onNext,
  onPrev,
}: KeyEntryStepProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getProviderName = (id: ProviderId) => {
    return PROVIDERS.find((p) => p.id === id)?.name || id;
  };

  const toggleShowKey = (provider: ProviderId) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const hasAnyKey = selectedProviders.some((p) => apiKeys[p]?.trim().length > 0);
  const filledCount = selectedProviders.filter((p) => apiKeys[p]?.trim().length > 0).length;

  useEffect(() => {
    const firstEmpty = selectedProviders.find((p) => !apiKeys[p]);
    if (firstEmpty && inputRefs.current[firstEmpty]) {
      inputRefs.current[firstEmpty]?.focus();
    }
  }, [selectedProviders, apiKeys]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-semibold text-sc-text tracking-tight font-display">
          Configure API <span className="font-serif italic font-normal text-sc-accent">Credentials</span>
        </h2>
        <p className="text-xs text-sc-text-muted mt-1 leading-relaxed">
          Enter your API keys for each provider. Keys are encrypted automatically when you finish setup.
        </p>
      </motion.div>

      {/* Progress bar */}
      {selectedProviders.length > 1 && (
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-sc-text-muted mb-1.5">
            <span>Keys entered</span>
            <span>{filledCount}/{selectedProviders.length}</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sc-accent/60 to-sc-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(filledCount / selectedProviders.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 12 }}
            />
          </div>
        </motion.div>
      )}

      {/* Keys List */}
      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-none mb-6"
      >
        {selectedProviders.map((provider) => {
          const key = apiKeys[provider] || "";
          const isVisible = showKeys[provider] || false;
          const hasKey = key.trim().length > 0;

          return (
            <motion.div
              key={provider}
              variants={itemVariants}
              layout
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.01] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sc-text">
                  {getProviderName(provider)}
                </span>
                {hasKey && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="flex items-center gap-1 text-[10px] text-green-400 font-semibold bg-green-500/8 px-2 py-0.5 rounded"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                    Saved
                  </motion.span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={(el) => { inputRefs.current[provider] = el; }}
                    type={isVisible ? "text" : "password"}
                    placeholder={`Paste ${getProviderName(provider)} key here...`}
                    value={key}
                    onChange={(e) => onKeyChange(provider, e.target.value)}
                    className="bg-black/30 border-white/10 h-10 pr-10 text-xs text-sc-text"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sc-text-muted hover:text-sc-text transition-colors"
                    tabIndex={-1}
                  >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 mt-4 border-t border-white/5 pt-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="flex-1 h-11 hover:bg-white/5 cursor-pointer text-sc-text-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <motion.div
          className="flex-1"
          whileHover={hasAnyKey ? { scale: 1.01 } : {}}
          whileTap={hasAnyKey ? { scale: 0.99 } : {}}
        >
          <Button
            onClick={onNext}
            disabled={!hasAnyKey}
            className="w-full h-11 bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
