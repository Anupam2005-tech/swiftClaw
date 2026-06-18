"use client";

import React from "react";
import { Message } from "../../lib/types/conversation";
import { FileAttachmentChip } from "./FileAttachmentChip";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { SourcesPanel } from "./SourcesPanel";
import { ImageMessage } from "./ImageMessage";
import { VideoJobCard } from "./VideoJobCard";
import { RefreshCw, AlertCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

const STATUS_WORDS = ["Cooking", "Transforming", "Generating", "Processing", "Assembling", "Brewing"];

type TWState = { wordIndex: number; charIndex: number; dir: "typing" | "erasing" | "pause" };
type TWAction =
  | { type: "tick" }
  | { type: "next_char" }
  | { type: "prev_char" }
  | { type: "pause_done" }
  | { type: "word_done" };

function twReducer(state: TWState, action: TWAction): TWState {
  switch (action.type) {
    case "next_char":
      return { ...state, charIndex: state.charIndex + 1 };
    case "pause_done":
      return { ...state, dir: "erasing" };
    case "prev_char":
      return { ...state, charIndex: state.charIndex - 1 };
    case "word_done":
      return { wordIndex: (state.wordIndex + 1) % STATUS_WORDS.length, charIndex: 0, dir: "typing" };
    default:
      return state;
  }
}

function TypewriterStatus() {
  const [state, dispatch] = React.useReducer(twReducer, { wordIndex: 0, charIndex: 0, dir: "typing" });

  React.useEffect(() => {
    const word = STATUS_WORDS[state.wordIndex];

    if (state.dir === "typing") {
      if (state.charIndex < word.length) {
        const t = setTimeout(() => dispatch({ type: "next_char" }), 50);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => dispatch({ type: "pause_done" }), 400);
      return () => clearTimeout(t);
    }

    if (state.dir === "pause") {
      const t = setTimeout(() => dispatch({ type: "pause_done" }), 300);
      return () => clearTimeout(t);
    }

    if (state.dir === "erasing") {
      if (state.charIndex > 0) {
        const t = setTimeout(() => dispatch({ type: "prev_char" }), 30);
        return () => clearTimeout(t);
      }
      dispatch({ type: "word_done" });
    }
  }, [state.wordIndex, state.charIndex, state.dir]);

  return (
    <span>
      {STATUS_WORDS[state.wordIndex].slice(0, state.charIndex)}
      <span className="inline-block w-[2px] h-[12px] bg-sc-accent/70 ml-[1px] animate-pulse align-middle" />
    </span>
  );
}

function FormattedContent({ content }: { content: string }) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 whitespace-pre-wrap break-words leading-relaxed text-xs">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].toLowerCase();
          const hasLang = ["javascript", "typescript", "json", "python", "css", "html", "dockerfile", "bash", "shell", "docker"].includes(firstLine);
          const lang = hasLang ? firstLine : "code";
          const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div key={index} className="rounded-lg border border-white/5 bg-black/60 overflow-hidden font-mono text-[10px] my-3">
              <div className="flex justify-between items-center px-4 py-1.5 bg-white/[0.01] border-b border-white/5 text-sc-text-muted/60 text-[9px] uppercase tracking-wider select-none font-bold">
                <span>{lang}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sc-text-muted/95 leading-normal scrollbar-none">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const subParts = part.split(/(`[^`\n]+`)/g);

        return (
          <span key={index}>
            {subParts.map((subPart, sIdx) => {
              if (subPart.startsWith("`") && subPart.endsWith("`")) {
                return (
                  <code key={sIdx} className="bg-white/10 text-sc-text px-1.5 py-0.5 rounded font-mono text-[10.5px]">
                    {subPart.slice(1, -1)}
                  </code>
                );
              }

              const boldParts = subPart.split(/(\*\*[^*\n]+\*\*)/g);
              return (
                <span key={sIdx}>
                  {boldParts.map((bPart, bIdx) => {
                    if (bPart.startsWith("**") && bPart.endsWith("**")) {
                      return (
                        <strong key={bIdx} className="font-bold text-sc-text">
                          {bPart.slice(2, -2)}
                        </strong>
                      );
                    }
                    return bPart;
                  })}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function BlinkingDots() {
  return (
    <span className="inline-flex gap-[2px]">
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
    </span>
  );
}

export function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";

  return (
    <div className={cn(
      "flex w-full px-4 md:px-6 py-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI: streaming, no content yet — show icon + typewriter status */}
      {!isUser && isStreaming && !message.content ? (
        <div className="flex items-center gap-2.5 select-none">
          <div className="h-7 w-7 rounded-lg border border-sc-accent/15 bg-sc-accent/5 flex items-center justify-center shrink-0">
            <Terminal className="h-3.5 w-3.5 " />
          </div>
          <span className="text-xs font-semibold text-sc-accent">
            <TypewriterStatus />
          </span>
          <BlinkingDots />
        </div>
      ) : (
        <div className={cn(
          "flex flex-col max-w-[85%] md:max-w-[75%] gap-1",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Bubble */}
          <div className={cn(
            "rounded-2xl px-4 py-2.5 min-w-0 w-fit break-words",
            isUser
              ? "bg-[var(--chat-bubble-user)] border border-white/5 rounded-br-sm"
              : "bg-[var(--chat-bubble-assistant)] border border-white/5 rounded-bl-sm"
          )}>
            {isUser && message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.attachments.map((file, idx) => (
                  <FileAttachmentChip key={idx} file={file} />
                ))}
              </div>
            )}

            {message.content && <FormattedContent content={message.content} />}

            {!isUser && isStreaming && message.content && (
              <span className="inline-flex ml-0.5">
                <BlinkingDots />
              </span>
            )}

            {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
              <div className="flex flex-col gap-1 mt-2 border-t border-white/5 pt-2">
                {message.tool_calls.map((tc) => (
                  <ToolCallIndicator key={tc.id} toolCall={tc} />
                ))}
              </div>
            )}

            {!isUser && message.sources && message.sources.length > 0 && (
              <div className="mt-2 border-t border-white/5 pt-2">
                <SourcesPanel sources={message.sources} />
              </div>
            )}

            {!isUser && message.image_url && (
              <div className="mt-2">
                <ImageMessage imageUrl={message.image_url} />
              </div>
            )}

            {!isUser && message.media_job_id && (
              <div className="mt-2">
                <VideoJobCard jobId={message.media_job_id} />
              </div>
            )}

            {!isUser && message.status === "interrupted" && (
              <div className="mt-3 p-3 rounded-lg border border-red-500/10 bg-red-950/10 text-xs flex items-center justify-between gap-3 select-none">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Stream interrupted.</span>
                </div>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="text-[10px] uppercase tracking-wider font-semibold text-sc-text hover:text-sc-accent transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn(
            "flex items-center gap-2 px-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-[9px] text-sc-text-muted/30 font-mono select-none">
              {formatTime(message.created_at)}
            </span>
            {!isUser && message.provider && (
              <span className="text-[8px] text-sc-text-muted/20 font-mono select-none">
                {message.provider}
              </span>
            )}
            {!isUser && message.tokens_used && (
              <span className="text-[8px] text-sc-text-muted/20 font-mono select-none">
                {message.tokens_used}t
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default MessageBubble;
