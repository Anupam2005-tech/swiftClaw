"use client";

import React from "react";
import { ConversationListItem } from "./ConversationListItem";
import { Conversation } from "../../lib/types/conversation";
import { Spinner } from "../ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Pin } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  activeId?: string;
  onSelect?: (id: string) => void;
}

export function ConversationList({
  conversations,
  loading,
  activeId,
  onSelect,
}: ConversationListProps) {
  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  return (
    <Skeleton name="conversation-list" loading={loading} animate="pulse" className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
      {loading && conversations.length === 0 ? (
        <div className="flex flex-col gap-2 p-3 items-center justify-center h-20 text-sc-text-muted/40">
          <Spinner size="sm" className="border-t-transparent border-sc-text/30" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center h-24 select-none">
          <span className="text-[10px] text-sc-text-muted/50 font-medium tracking-wider uppercase">
            No Conversations
          </span>
        </div>
      ) : (
        <div className="flex flex-col w-full overflow-y-auto scrollbar-none flex-1">
          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div className="flex flex-col w-full shrink-0">
              <div className="px-6 py-1.5 mx-1 mb-1 flex items-center gap-1.5">
                <Pin className="h-3 w-3 text-sc-text-muted/40 rotate-45" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-sc-text-muted/40 select-none">
                  Pinned
                </span>
              </div>
              <div className="flex flex-col gap-1 w-full px-2 pb-3">
                {pinned.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* History Section */}
          {unpinned.length > 0 && (
            <div className="flex flex-col w-full shrink-0">
              <div className="px-6 py-1.5 mx-1 mb-1">
                <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-sc-text-muted/40 select-none">
                  History
                </span>
              </div>
              <div className="flex flex-col gap-1 w-full px-2 pb-2">
                {unpinned.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Skeleton>
  );
}
