"use client";

import React from "react";
import { MessageSquare, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatInputMode = "chat" | "image" | "video";

interface InputModeToggleProps {
  mode: ChatInputMode;
  onModeChange: (mode: ChatInputMode) => void;
  disabled?: boolean;
}

export function InputModeToggle({ mode, onModeChange, disabled }: InputModeToggleProps) {
  const modes: { value: ChatInputMode; label: string; icon: any }[] = [
    { value: "chat", label: "Chat", icon: MessageSquare },
    { value: "image", label: "Image", icon: Image },
    { value: "video", label: "Video", icon: Video },
  ];

  return (
    <div className="inline-flex rounded-lg bg-secondary/50 p-0.5 border border-white/5 shrink-0 select-none">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.value;
        return (
          <button
            key={m.value}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              isActive
                ? "bg-sc-accent text-accent-foreground shadow-sm scale-100"
                : "text-sc-text-muted hover:text-sc-text hover:bg-white/[0.03]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
export default InputModeToggle;
