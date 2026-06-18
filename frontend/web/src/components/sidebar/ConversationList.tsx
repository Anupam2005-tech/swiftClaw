"use client";

import React from "react";
import { ConversationListItem } from "./ConversationListItem";
import { Conversation } from "../../lib/types/conversation";
import { Spinner } from "../ui/spinner";

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeId?: string;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  loading,
  activeId,
  onDelete,
}: ConversationListProps) {
  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3 items-center justify-center h-20 text-sc-text-muted/40">
        <Spinner size="sm" className="border-t-transparent border-sc-text/30" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-24 select-none">
        <span className="text-[10px] text-sc-text-muted/50 font-medium tracking-wider uppercase">
          No Conversations
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full px-2 py-1 overflow-y-auto scrollbar-none flex-1">
      {conversations.map((conv) => (
        <ConversationListItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
