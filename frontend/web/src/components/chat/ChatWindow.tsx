"use client";

import React, { useCallback } from "react";
import { useConversations } from "@/lib/hooks/useConversations";
import { useChatStream } from "@/lib/hooks/useChatStream";
import { MessageList } from "./MessageList";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ModelDropdown } from "./ModelDropdown";
import { ProviderSwitchToast } from "./ProviderSwitchToast";
import { Modal } from "@/components/ui/modal";
import {
  Activity,
  Terminal,
  MoreVertical,
  Share2,
  Pin,
  Trash2
} from "lucide-react";
import { FileAttachment } from "@/lib/types/conversation";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMobileSidebar } from "@/lib/contexts/SidebarContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const { toast } = useToast();
  const notifySidebar = useCallback(() => {
    window.dispatchEvent(new CustomEvent("conversations-updated"));
  }, []);

  const {
    messages,
    messagesLoading,
    refreshMessages,
    setMessages,
    conversations,
    pinConversation,
    deleteConversation,
  } = useConversations(conversationId);

  const currentConversation = conversations.find((c) => c.id === conversationId);
  const isPinned = currentConversation?.pinned || false;
  const [sharing, setSharing] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleShare = async () => {
    try {
      setSharing(true);
      const res = await api.shareConversation(conversationId);
      const shareUrl = `${window.location.origin}/chat/shared/${res.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "A public, read-only link has been copied to your clipboard.",
      });
    } catch (e) {
      console.error("Failed to share conversation:", e);
      toast({
        title: "Error Sharing",
        description: "Could not generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const onStreamComplete = useCallback(() => {
    refreshMessages();
    notifySidebar();
  }, [refreshMessages, notifySidebar]);

  const {
    sendMessage,
    stopGeneration,
    regenerateMessage,
    editUserMessage,
    streaming,
    providerSwitch,
    setProviderSwitch,
  } = useChatStream(conversationId, onStreamComplete);

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
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(true);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("sc_web_search_enabled");
    if (saved !== null) {
      setWebSearchEnabled(saved === "true");
    }
  }, []);

  // Save to localStorage when state changes
  const handleWebSearchChange = (enabled: boolean) => {
    setWebSearchEnabled(enabled);
    localStorage.setItem("sc_web_search_enabled", String(enabled));
  };

  const formattedName = displayName
    ? displayName.charAt(0).toUpperCase() + displayName.slice(1)
    : "";

  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);

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
    sendMessage(text, attachments, rawFiles, "chat", messages, setMessages, webSearchEnabled);
  };

  return (
    <Skeleton name="chat-window" loading={messagesLoading} animate="pulse" className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--chat-bg)] relative z-0">
        {/* Soft Glow Radial Background on Empty Chat */}
        {messages.length === 0 && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,253,249,0.02),transparent_50%)] pointer-events-none z-0" />
        )}

        {/* Top Header Bar */}
        <header className="h-14 px-6 flex items-center justify-between shrink-0 bg-transparent border-none select-none z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-full text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer bg-transparent border-none hover:bg-white/5"
              aria-label="Open sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-md text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer bg-transparent border-none hover:bg-white/5 outline-none">
                  <MoreVertical className="h-4.5 w-4.5 md:h-4 md:w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1e1f20] border border-white/10 text-sc-text z-[9999]" style={{ backgroundColor: '#1E1F20' }}>

                <DropdownMenuItem
                  onClick={() => pinConversation(conversationId, !isPinned)}
                  className="flex items-center gap-2 cursor-pointer text-xs text-sc-text hover:text-sc-text hover:bg-white/5 focus:bg-white/5 focus:text-sc-text data-[highlighted]:bg-white/5 data-[highlighted]:text-sc-text transition-colors outline-none"
                >
                  <Pin className={cn("h-3.5 w-3.5 rotate-45", isPinned && "text-sc-accent fill-sc-accent")} />
                  {isPinned ? "Unpin Chat" : "Pin Chat"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex items-center gap-2 cursor-pointer text-xs text-sc-text hover:text-sc-text hover:bg-white/5 focus:bg-white/5 focus:text-sc-text data-[highlighted]:bg-white/5 data-[highlighted]:text-sc-text transition-colors outline-none"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {sharing ? "Sharing..." : "Share Link"}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer text-xs text-sc-text hover:text-sc-text hover:bg-white/5 focus:bg-white/5 focus:text-sc-text data-[highlighted]:bg-white/5 data-[highlighted]:text-sc-text transition-colors outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    <ModelDropdown webSearchEnabled={webSearchEnabled} onWebSearchChange={handleWebSearchChange} />

                    
                    <span className="text-[10px] text-sc-text-muted/30 font-mono">
                      swiftClaw
                    </span>
                  </div>
                  <PromptInputBox
                    onSend={handleSend}
                    onStop={stopGeneration}
                    isLoading={streaming}
                    placeholder="Message swiftClaw..."
                    userMessages={userMessages}
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
              onRegenerate={(id) => regenerateMessage(id, messages, setMessages, webSearchEnabled)}
              onEdit={(id, text) => editUserMessage(id, text, messages, setMessages, webSearchEnabled)}
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
              <ModelDropdown webSearchEnabled={webSearchEnabled} onWebSearchChange={handleWebSearchChange} />
              <span className="text-[10px] text-sc-text-muted/30 font-mono">
                swiftClaw
              </span>
            </div>
            <PromptInputBox
              onSend={handleSend}
              onStop={stopGeneration}
              isLoading={streaming}
              placeholder="Message swiftClaw..."
              userMessages={userMessages}
            />
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete chat?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[12px] text-sc-text-muted leading-relaxed">
            This will delete prompts, responses and feedback from your swiftClaw activity, plus any content that you created.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-sc-text-muted hover:text-sc-text hover:bg-white/5 transition-colors cursor-pointer outline-none bg-transparent border-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteConversation(conversationId);
                setIsDeleteDialogOpen(false);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-white/10 text-sc-text hover:text-sc-text bg-white/[0.02] hover:bg-white/5 transition-colors cursor-pointer outline-none"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </Skeleton>
  );
}
export default ChatWindow;
