"use client";

import React from "react";
import { Conversation } from "../../lib/types/conversation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect?: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  // Format date helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = diffMs / 3600000;

      if (diffHrs < 24) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (diffHrs < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch (e) {
      return "";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(conversation.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg flex items-center justify-between transition-all w-full text-left overflow-hidden border border-transparent",
        isActive
          ? "bg-gradient-to-r from-white/[0.06] to-white/[0.01] border-white/[0.03] shadow-md shadow-black/20 text-sc-text font-medium"
          : "text-sc-text-muted hover:bg-white/[0.02] hover:text-sc-text"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-sc-accent shadow-[0_0_8px_var(--sc-accent)]" />
      )}
      <Link
        href={`/chat/${conversation.id}`}
        onClick={handleClick}
        className="flex-1 flex gap-2.5 items-center px-3 py-2 min-w-0"
      >
        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-sc-text-muted/70 group-hover:text-sc-text/80 transition-colors" />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-xs truncate block">{conversation.title}</span>
          {conversation.last_message_preview && (
            <span className="text-[10px] text-sc-text-muted/60 truncate block leading-normal">
              {conversation.last_message_preview}
            </span>
          )}
        </div>
        <span className="text-[9px] text-sc-text-muted/40 group-hover:text-sc-text-muted/70 shrink-0 self-start mt-0.5">
          {formatTime(conversation.updated_at)}
        </span>
      </Link>
    </div>
  );
}
