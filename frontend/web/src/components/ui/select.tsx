"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select...",
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open); }}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between bg-black/40 border rounded-md px-2.5 text-xs text-sc-text outline-none transition-colors cursor-pointer disabled:opacity-50 h-9",
          open ? "border-sc-accent" : "border-white/10 hover:border-white/20"
        )}
      >
        <span className={cn(
          "truncate",
          !selected && "text-sc-text-muted/50"
        )}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-sc-text-muted/50 shrink-0 ml-1 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute z-[70] mt-1 left-0 right-0 bg-[#0D0D0D] border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="max-h-[200px] overflow-y-auto scrollbar-premium">
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors cursor-pointer",
                      isActive
                        ? "bg-white/10 text-sc-text"
                        : "text-sc-text-muted hover:bg-white/5 hover:text-sc-text"
                    )}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
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
