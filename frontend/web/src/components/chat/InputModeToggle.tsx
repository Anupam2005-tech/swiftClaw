"use client";

import React from "react";
import { MessageSquare, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ChatInputMode = "chat" | "image" | "video";

interface InputModeToggleProps {
  mode: ChatInputMode;
  onModeChange: (mode: ChatInputMode) => void;
  disabled?: boolean;
}

export function InputModeToggle({ mode, onModeChange, disabled }: InputModeToggleProps) {
  const modes: { value: ChatInputMode; label: string; icon: any; comingSoon?: boolean }[] = [
    { value: "chat", label: "Chat", icon: MessageSquare },
    { value: "image", label: "Image", icon: Image, comingSoon: true },
    { value: "video", label: "Video", icon: Video, comingSoon: true },
  ];

  return (
    <div className="inline-flex rounded-lg bg-secondary/50 p-0.5 border border-white/5 shrink-0 select-none">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.value;
        const isComingSoon = m.comingSoon;

        const buttonEl = (
          <button
            key={m.value}
            type="button"
            disabled={disabled || isComingSoon}
            onClick={() => onModeChange(m.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all select-none",
              isActive
                ? "bg-sc-accent text-accent-foreground shadow-sm scale-100"
                : isComingSoon
                ? "text-sc-text-muted/30 cursor-not-allowed"
                : "text-sc-text-muted hover:text-sc-text hover:bg-white/[0.03] cursor-pointer"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {m.label}
              {isComingSoon && <span className="ml-1 text-[8px] text-sc-text-muted/40 font-normal">(Soon)</span>}
            </span>
          </button>
        );

        if (isComingSoon) {
          return (
            <TooltipProvider key={m.value} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {buttonEl}
                </TooltipTrigger>
                <TooltipContent side="top">
                  {m.label} generation coming soon
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return buttonEl;
      })}
    </div>
  );
}
export default InputModeToggle;
