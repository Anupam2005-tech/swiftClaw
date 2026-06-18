"use client";

import React from "react";
import { Square } from "lucide-react";
import { Button } from "../ui/button";

interface StopGenerationButtonProps {
  onStop: () => void;
}

export function StopGenerationButton({ onStop }: StopGenerationButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onStop}
      className="flex items-center gap-2 h-9 border-white/10 hover:bg-white/5 text-sc-text-muted hover:text-sc-text text-xs font-semibold px-4 cursor-pointer shrink-0"
    >
      <Square className="h-3.5 w-3.5 fill-current shrink-0" />
      Stop Generating
    </Button>
  );
}
export default StopGenerationButton;
