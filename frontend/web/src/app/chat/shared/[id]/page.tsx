"use client";

import React, { useEffect, useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { api } from "@/lib/api/client";
import { Message } from "@/lib/types/conversation";
import { Terminal, Shield, Share2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SharedConversationPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ title: string; messages: Message[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resolvedParams = await params;
        const res = await api.getSharedConversation(resolvedParams.id);
        if (!active) return;
        if (res) {
          setData({
            title: res.title || "Shared Chat",
            messages: res.messages || [],
          });
        } else {
          setError("This shared conversation link does not exist or has expired.");
        }
      } catch (err) {
        console.error("Failed to load shared conversation:", err);
        if (active) {
          setError("Failed to retrieve the shared conversation. Please check the URL.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [params]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sc-canvas text-sc-text gap-4">
        <Spinner size="lg" className="border-t-transparent border-sc-text/40" />
        <span className="text-xs uppercase tracking-wider text-sc-text-muted select-none">
          Retrieving shared snapshot...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sc-canvas px-4 text-center">
        <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/[0.01] flex items-center justify-center mb-4">
          <Shield className="h-5 w-5 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-sc-text mb-2">Snapshot Unavailable</h1>
        <p className="text-xs text-sc-text-muted max-w-sm mb-6 leading-relaxed">
          {error || "The requested link could not be loaded."}
        </p>
        <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 text-xs text-sc-text">
          <Link href="/">Return to Workspace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sc-canvas">
      {/* Header bar */}
      <header className="h-14 border-b border-[var(--chat-border)] px-6 flex items-center justify-between shrink-0 bg-[var(--chat-header-bg)] select-none">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="h-4 w-4 text-sc-accent shrink-0" />
          <span className="text-xs font-semibold text-sc-text tracking-wide truncate max-w-[320px]">
            {data.title}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-sc-text-muted/60 font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Share2 className="h-2.5 w-2.5" />
            Shared View
          </span>
        </div>
        <Button asChild variant="outline" className="h-8 border-white/10 hover:bg-white/5 text-xs text-sc-text px-3">
          <Link href="/">Open Workspace</Link>
        </Button>
      </header>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6">
        <MessageList
          messages={data.messages}
          loading={false}
          onRegenerate={() => {}}
          onEdit={() => {}}
        />
      </div>
    </div>
  );
}
