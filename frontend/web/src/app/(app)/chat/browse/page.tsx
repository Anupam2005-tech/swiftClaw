"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConversations } from "@/lib/hooks/useConversations";
import { ArrowLeft, Search, MessageSquare, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

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
  } catch {
    return "";
  }
};

const getSuggestionLabel = (index: number): string => {
  const labels = ["Continue where you left off", "Pick up from earlier", "Recently viewed", "Jump back in", "Recent chat"];
  return labels[index % labels.length];
};

export default function BrowseChatsPage() {
  const router = useRouter();
  const { conversations, loading } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.last_message_preview.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const recentConversations = useMemo(() => {
    return [...conversations]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [conversations]);

  const hasSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-sc-canvas">
      {/* Header */}
      <header className="h-14 border-b border-white/5 px-4 flex items-center gap-3 shrink-0 bg-sc-surface/50 backdrop-blur-sm z-10">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-sc-text tracking-wide">
          Conversations
        </h1>
      </header>

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sc-text-muted/60 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-sc-text placeholder-sc-text-muted/40 focus:outline-none focus:border-sc-accent/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center pt-16">
            <Spinner size="md" className="border-t-transparent border-sc-text/40" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <MessageSquare className="h-10 w-10 text-sc-text-muted/20 mb-3" />
            <p className="text-sm text-sc-text-muted/60">No conversations yet</p>
            <p className="text-xs text-sc-text-muted/40 mt-1">Start a new chat to get going</p>
          </div>
        ) : hasSearchResults && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Search className="h-10 w-10 text-sc-text-muted/20 mb-3" />
            <p className="text-sm text-sc-text-muted/60">No results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : hasSearchResults ? (
          /* Search Results */
          <div className="space-y-1">
            <p className="text-[10px] text-sc-text-muted/40 font-medium uppercase tracking-wider px-1 pb-1.5 pt-2">
              {filteredConversations.length} result{filteredConversations.length !== 1 ? "s" : ""}
            </p>
            {filteredConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-sc-text-muted/40 group-hover:text-sc-text-muted/70 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sc-text truncate">{conv.title}</p>
                  {conv.last_message_preview && (
                    <p className="text-xs text-sc-text-muted/50 truncate mt-0.5">
                      {conv.last_message_preview}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-sc-text-muted/30 shrink-0">
                  {formatTime(conv.updated_at)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          /* Suggestions */
          <div>
            <div className="flex items-center gap-2 px-1 pb-3 pt-1">
              <Sparkles className="h-3.5 w-3.5 text-sc-accent/60" />
              <p className="text-[10px] text-sc-text-muted/40 font-medium uppercase tracking-wider">
                Suggestions
              </p>
            </div>
            <div className="grid gap-2">
              {recentConversations.map((conv, idx) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className="block p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.07] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-sc-accent/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-sc-accent/60" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-sc-text truncate">
                          {conv.title || "Untitled"}
                        </p>
                        {conv.last_message_preview && (
                          <p className="text-xs text-sc-text-muted/60 truncate mt-0.5 leading-relaxed">
                            {conv.last_message_preview}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3 w-3 text-sc-text-muted/30" />
                          <span className="text-[10px] text-sc-text-muted/40">
                            {formatTime(conv.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-sc-text-muted/30 font-medium uppercase tracking-wide whitespace-nowrap shrink-0 mt-1">
                      {getSuggestionLabel(idx)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
