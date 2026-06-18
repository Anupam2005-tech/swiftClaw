"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useConversations } from "@/lib/hooks/useConversations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function HistorySettingsPage() {
  const { conversations, loading, batchDeleteConversations, refreshConversations } = useConversations();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const totalPages = Math.ceil(conversations.length / PAGE_SIZE);
  const paginated = useMemo(
    () => conversations.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [conversations, page]
  );

  const allSelected = paginated.length > 0 && paginated.every((c) => selectedIds.has(c.id));
  const someSelected = paginated.some((c) => selectedIds.has(c.id));

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((c) => c.id)));
    }
  };

  const handleBatchDelete = async () => {
    setDeleting(true);
    try {
      await batchDeleteConversations(Array.from(selectedIds));
      toast({
        title: "Conversations Deleted",
        description: `Removed ${selectedIds.size} conversation${selectedIds.size > 1 ? "s" : ""}.`,
        variant: "success",
      });
      setSelectedIds(new Set());
      await refreshConversations();
    } catch {
      toast({ title: "Delete Failed", description: "Could not delete some conversations.", variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (diff < 172800000) return "Yesterday";
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch { return ""; }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-sc-text uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </h2>
          <p className="text-[10px] text-sc-text-muted mt-1">Browse and manage your conversation history.</p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            onClick={() => setShowDelete(true)}
            disabled={deleting}
            className="flex items-center gap-1.5 h-9 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 text-[11px] font-semibold cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete ({selectedIds.size})
          </Button>
        )}
      </div>

      {loading && conversations.length === 0 ? (
        <div className="flex items-center justify-center py-16"><Spinner size="md" className="border-t-transparent border-sc-text/30" /></div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sc-text-muted/40 text-xs">
          <MessageSquare className="h-8 w-8 mb-3 opacity-30" />
          No conversations yet
        </div>
      ) : (
        <>
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer self-start">
            {allSelected ? <CheckCircle className="h-3.5 w-3.5 text-sc-accent" /> : <Circle className={cn("h-3.5 w-3.5", someSelected ? "text-sc-accent" : "text-sc-text-muted/50")} />}
            {allSelected ? "Deselect all" : "Select all"}
          </button>

          <div className="space-y-1">
            {paginated.map((conv) => {
              const isSelected = selectedIds.has(conv.id);
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer group",
                    isSelected ? "bg-sc-accent/5 border border-sc-accent/10" : "hover:bg-white/[0.02] border border-transparent"
                  )}
                  onClick={() => toggleSelect(conv.id)}
                >
                  <button onClick={(e) => { e.stopPropagation(); toggleSelect(conv.id); }} className="shrink-0 cursor-pointer">
                    {isSelected ? <CheckCircle className="h-4 w-4 text-sc-accent" /> : <Circle className="h-4 w-4 text-sc-text-muted/30 group-hover:text-sc-text-muted/60 transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/chat/${conv.id}`)}>
                    <span className="text-xs text-sc-text truncate block">{conv.title}</span>
                    <span className="text-[10px] text-sc-text-muted/50 truncate block">{conv.last_message_preview || "No messages"}</span>
                  </div>
                  <span className="text-[9px] text-sc-text-muted/40 shrink-0">{formatDate(conv.updated_at)}</span>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-3">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-sc-text-muted font-mono">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showDelete} onClose={() => !deleting && setShowDelete(false)} title="Delete Conversations">
        <div className="flex flex-col gap-4 text-xs select-none">
          <p className="text-sc-text-muted leading-relaxed">
            Delete <strong className="text-sc-text">{selectedIds.size}</strong> conversation{selectedIds.size > 1 ? "s" : ""}? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
            <Button variant="ghost" disabled={deleting} onClick={() => setShowDelete(false)} className="h-10 px-4 hover:bg-white/5 cursor-pointer text-sc-text-muted">Cancel</Button>
            <Button disabled={deleting} onClick={handleBatchDelete} className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer">
              {deleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
