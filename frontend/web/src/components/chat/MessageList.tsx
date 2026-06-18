"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "../../lib/types/conversation";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onRegenerate: () => void;
}

export function MessageList({
  messages,
  loading,
  onRegenerate,
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

  return (
    <div className="flex-1 overflow-y-auto flex flex-col scrollbar-none">
      {messages.map((msg, index) => {
        const isLastMsg = index === messages.length - 1;
        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRegenerate={isLastMsg ? onRegenerate : undefined}
          />
        );
      })}
      <div ref={bottomRef} className="h-10 shrink-0" />
    </div>
  );
}
export default MessageList;
