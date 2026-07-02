"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "../../lib/types/conversation";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onRegenerate: (assistantMessageId: string) => void;
  onEdit: (userMessageId: string, newText: string) => void;
}

export function MessageList({
  messages,
  loading,
  onRegenerate,
  onEdit,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom!
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sc-text-muted/50">
        <span className="text-xs font-mono">Loading history...</span>
      </div>
    );
  }

  // Centered empty state is now handled by ChatWindow for animated transitions.
  if (messages.length === 0) {
    return null;
  }

  const lastUserMsg = messages.filter((m) => m.role === "user").pop();
  const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop();
  const firstQueuedIdx = messages.findIndex((m) => m.status === "queued");

  return (
    <div className="flex-1 overflow-y-auto flex flex-col scrollbar-none w-full max-w-3xl mx-auto px-4 md:px-6">
      {messages.map((msg, index) => {
        const isFirstQueued = index === firstQueuedIdx;
        return (
          <React.Fragment key={msg.id}>
            {isFirstQueued && (
              <div className="flex items-center gap-4 my-6 w-full animate-in fade-in duration-300">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-amber-400/80 select-none flex items-center gap-1.5 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Queue
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              </div>
            )}
            <MessageBubble
              message={msg}
              onRegenerate={msg.role === "assistant" ? () => onRegenerate(msg.id) : undefined}
              onEdit={msg.role === "user" ? (newText) => onEdit(msg.id, newText) : undefined}
              isLastUserMessage={msg.role === "user" && lastUserMsg?.id === msg.id}
              isLastAssistantMessage={msg.role === "assistant" && lastAssistantMsg?.id === msg.id}
            />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} className="h-10 shrink-0" />
    </div>
  );
}
export default MessageList;
