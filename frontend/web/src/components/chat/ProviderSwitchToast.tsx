"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../ui/button";

interface ProviderSwitchToastProps {
  from: string;
  to: string;
  reason: string;
  onClose: () => void;
}

export function ProviderSwitchToast({ from, to, reason, onClose }: ProviderSwitchToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const getProviderName = (id: string) => {
    switch (id.toLowerCase()) {
      case "gemini":
        return "Google Gemini";
      case "claude":
        return "Anthropic Claude";
      case "openai":
        return "OpenAI GPT";
      case "groq":
        return "Groq Cloud";
      default:
        return id;
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none">
      <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-500/20 bg-black/95 backdrop-blur-md shadow-2xl pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-top-4">
        <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
            Provider Switch Active
          </h4>
          <p className="text-xs text-sc-text font-medium mt-1 leading-normal">
            Switched from {getProviderName(from)} to {getProviderName(to)}.
          </p>
          <p className="text-[10px] text-sc-text-muted mt-1 leading-relaxed">
            {reason}
          </p>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className="text-sc-text-muted hover:text-sc-text hover:bg-white/5 p-1 rounded shrink-0 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
export default ProviderSwitchToast;
