"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface RegenerateButtonProps {
  onRegenerate: () => void;
  disabled?: boolean;
}

export function RegenerateButton({ onRegenerate, disabled }: RegenerateButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onRegenerate}
      disabled={disabled}
      className="flex items-center gap-2 h-9 border-white/10 hover:bg-white/5 text-sc-text-muted hover:text-sc-text text-xs font-semibold px-4 cursor-pointer shrink-0 disabled:opacity-50"
    >
      <RotateCcw className="h-3.5 w-3.5 shrink-0" />
      Regenerate Response
    </Button>
  );
}
export default RegenerateButton;
