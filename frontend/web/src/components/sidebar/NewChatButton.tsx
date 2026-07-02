"use client";

import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface NewChatButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function NewChatButton({ onClick, disabled }: NewChatButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-start gap-2 h-8 border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 font-semibold text-[11px] rounded-lg transition-all cursor-pointer shrink-0 px-2.5 text-white hover:text-white"
    >
      <Plus className="h-3.5 w-3.5 text-sc-accent shrink-0" />
      Compose
    </Button>
  );
}
