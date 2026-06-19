"use client";

import React from "react";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { MessageList } from "./MessageList";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ModelDropdown } from "./ModelDropdown";
import { ProviderSwitchToast } from "./ProviderSwitchToast";
import { Activity, Terminal } from "lucide-react";
import { FileAttachment } from "@/lib/types/conversation";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMobileSidebar } from "@/lib/contexts/SidebarContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatWindowProps {
  conversationId: string;
}

function fileToAttachment(file: File): Promise<FileAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: e.target?.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { toggleMobileSidebar } = useMobileSidebar();
  const notifySidebar = () => {
    window.dispatchEvent(new CustomEvent("conversations-updated"));
  };

  const {
    messages,
    messagesLoading,
    refreshMessages,
    setMessages,
  } = useConversations(conversationId);

  const {
    sendMessage,
    stopGeneration,
    regenerateMessage,
    streaming,
    providerSwitch,
    setProviderSwitch,
  } = useChatStream(conversationId, () => {
    refreshMessages();
    notifySidebar();
  });

  const { user } = useAuth();
  const [nickname, setNickname] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sc_profile");
      if (stored) {
        try {
          return JSON.parse(stored).nickname || "";
        } catch (_) {}
      }
    }
    return "";
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile();
        if (profile?.nickname) {
          setNickname(profile.nickname);
          localStorage.setItem("sc_profile", JSON.stringify({ nickname: profile.nickname, profession: profile.profession }));
        }
      } catch (err) {
        console.error("Failed to fetch profile nickname:", err);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const displayName = nickname || (user?.email ? user.email.split("@")[0] : "");
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false);
  const formattedName = displayName
    ? displayName.charAt(0).toUpperCase() + displayName.slice(1)
    : "";

  const handleSend = async (text: string, rawFiles?: File[]) => {
    const attachments: FileAttachment[] = [];
    if (rawFiles && rawFiles.length > 0) {
      for (const f of rawFiles) {
        try {
          const attachment = await fileToAttachment(f);
          attachments.push(attachment);
        } catch (e) {
          console.error("Failed to read file:", f.name, e);
        }
      }
    }
    notifySidebar();
    sendMessage(text, attachments, "chat", messages, setMessages, webSearchEnabled);
  };

  return (
    <Skeleton name="chat-window" loading={messagesLoading} animate="pulse" className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--chat-bg)] relative z-0">
        {/* Soft Glow Radial Background on Empty Chat */}
        {messages.length === 0 && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,253,249,0.02),transparent_50%)] pointer-events-none z-0" />
        )}

        {/* Top Header Bar */}
        <header className="h-14 border-b border-[var(--chat-border)] px-6 flex items-center justify-between shrink-0 bg-[var(--chat-header-bg)] select-none z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Activity className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-xs font-semibold text-sc-text tracking-wide truncate max-w-[240px]">
              Workspace Session
            </span>
          </div>
        </header>

        {/* Provider Switch Toast */}
        {providerSwitch && (
          <ProviderSwitchToast
            from={providerSwitch.from}
            to={providerSwitch.to}
            reason={providerSwitch.reason}
            onClose={() => setProviderSwitch(null)}
          />
        )}

        {/* Message List or Welcome State */}
        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-y-auto scrollbar-none">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 select-none">
              {/* Desktop Welcome and Input Centered */}
              <div className="hidden lg:flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500">
                <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sc-text via-sc-text/80 to-sc-text/50 font-display mb-2 text-center">
                  Hi {formattedName || "there"}, what's the plan?
                </h1>
                <p className="text-xs text-sc-text-muted mb-8 text-center max-w-md">
                  Start a conversation, run MCP tasks, or generate media files.
                </p>

                {/* Input box centered */}
                <motion.div
                  layoutId="main-prompt-input"
                  className="w-full max-w-2xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <ModelDropdown webSearchEnabled={webSearchEnabled} onWebSearchChange={setWebSearchEnabled} />

                    
                    <span className="text-[10px] text-sc-text-muted/30 font-mono">
                      swiftClaw
                    </span>
                  </div>
                  <PromptInputBox
                    onSend={handleSend}
                    onStop={stopGeneration}
                    isLoading={streaming}
                    placeholder="Message swiftClaw..."
                  />
                </motion.div>
              </div>

              {/* Mobile Empty State */}
              <div className="lg:hidden flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 select-none">
                <div className="flex flex-col items-center mb-8 text-center animate-in fade-in zoom-in-95 duration-400">
                  <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/[0.01] flex items-center justify-center mb-4">
                    <Terminal className="h-5 w-5 text-sc-text" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-sc-text font-display">
                    Workspace ready
                  </h2>
                  <p className="text-xs text-sc-text-muted mt-2 max-w-[320px] leading-relaxed">
                    Send a query to start chatting.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              loading={messagesLoading}
              onRegenerate={() => regenerateMessage(messages, setMessages)}
            />
          )}
        </div>

        {/* Input Panel — centered with reduced width, hidden on desktop when new chat */}
        <div className={cn(
          "p-4 bg-[var(--chat-bg)] border-t border-[var(--chat-border)] shrink-0 flex justify-center z-10",
          messages.length === 0 && "lg:hidden"
        )}>
          <motion.div
            layoutId="main-prompt-input"
            className="w-full max-w-2xl flex flex-col gap-2"
          >
            <div className="flex items-center justify-between px-1">
              <ModelDropdown webSearchEnabled={webSearchEnabled} onWebSearchChange={setWebSearchEnabled} />
              <span className="text-[10px] text-sc-text-muted/30 font-mono">
                swiftClaw
              </span>
            </div>
            <PromptInputBox
              onSend={handleSend}
              onStop={stopGeneration}
              isLoading={streaming}
              placeholder="Message swiftClaw..."
            />
          </motion.div>
        </div>
      </div>
    </Skeleton>
  );
}
export default ChatWindow;
