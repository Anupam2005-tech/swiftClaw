"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingPanelProps {
  thinking: string;
  isStreaming?: boolean;
}

/** Animated "thinking" dots shown while tokens are still arriving */
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1.5">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
          className="w-[3px] h-[3px] rounded-full bg-violet-400/70"
        />
      ))}
    </span>
  );
}

export function ThinkingPanel({ thinking, isStreaming = false }: ThinkingPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinking, isStreaming, expanded]);

  // Auto-collapse once streaming finishes
  useEffect(() => {
    if (!isStreaming) {
      const timer = setTimeout(() => setExpanded(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isStreaming]);

  if (!thinking) return null;

  return (
    <div className="w-full mb-1">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg w-full text-left",
          "transition-colors duration-150 cursor-pointer select-none",
          "hover:bg-white/[0.03] group"
        )}
      >
        {/* Pulsing brain icon while streaming */}
        <span className="relative flex items-center justify-center">
          <Brain
            className={cn(
              "h-3.5 w-3.5 transition-colors duration-300",
              isStreaming ? "text-violet-400" : "text-violet-400/50"
            )}
          />
          {isStreaming && (
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
          )}
        </span>

        <span
          className={cn(
            "text-[10px] font-semibold tracking-wide transition-colors duration-200",
            isStreaming ? "text-violet-300" : "text-violet-400/50"
          )}
        >
          {isStreaming ? (
            <>
              Thinking
              <ThinkingDots />
            </>
          ) : (
            "Thought process"
          )}
        </span>

        <ChevronDown
          className={cn(
            "h-3 w-3 ml-auto transition-all duration-200",
            expanded ? "rotate-0" : "-rotate-90",
            "text-white/20 group-hover:text-white/40"
          )}
        />
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="thinking-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              ref={scrollRef}
              className={cn(
                "relative mx-1 mb-1 rounded-lg overflow-y-auto",
                "max-h-52 scrollbar-none",
                "border border-violet-500/10 bg-violet-950/10",
                isStreaming && "border-violet-500/20"
              )}
            >
              {/* Animated left-border accent */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[2px] rounded-l-lg transition-colors duration-300",
                  isStreaming
                    ? "bg-gradient-to-b from-violet-500/60 via-violet-400/40 to-transparent"
                    : "bg-violet-500/15"
                )}
              />

              <p className="pl-4 pr-3 py-2.5 text-[10px] leading-relaxed font-mono text-white/35 whitespace-pre-wrap break-words">
                {thinking}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThinkingPanel;
