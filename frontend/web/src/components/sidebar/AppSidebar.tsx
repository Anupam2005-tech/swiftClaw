"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConversations } from "@/lib/hooks/useConversations";
import { usePathname, useRouter } from "next/navigation";
import { NewChatButton } from "./NewChatButton";
import { ConversationList } from "./ConversationList";
import { api } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobileSidebar } from "@/lib/contexts/SidebarContext";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  Terminal,
  Settings,
  LogOut,
  Search,
  SidebarClose,
  SidebarOpen,
  MessageSquare,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const desktopSidebarVariants = {
  open: { width: 260 },
  closed: { width: 56 },
};

const mobileSidebarVariants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const textVariants = {
  open: { opacity: 1, display: "inline", transition: { delay: 0.05 } },
  closed: { opacity: 0, transition: { duration: 0.1 }, transitionEnd: { display: "none" } },
};

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileSidebarOpen, closeMobileSidebar } = useMobileSidebar();
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = React.useState<{ nickname: string; profession: string } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sc_profile");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (_) {}
      }
    }
    return null;
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await api.getProfile();
        setProfile(p);
        localStorage.setItem("sc_profile", JSON.stringify({ nickname: p.nickname, profession: p.profession }));
      } catch (_) {}
    };
    if (user) {
      fetchProfile();
    }
  }, [user, pathname]); // Re-fetch on pathname transition in case they updated settings!

  React.useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMobileSidebar();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMobile, isMobileSidebarOpen, closeMobileSidebar]);

  const displayName = profile?.nickname || (user?.email ? user.email.split("@")[0] : "");
  const userProfession = profile?.profession || "";

  const activeConversationId = pathname?.includes("/chat/")
    ? pathname.split("/chat/")[1]
    : undefined;

  const {
    conversations,
    loading,
    createConversation,
    refreshConversations,
  } = useConversations(activeConversationId);

  // Re-fetch conversation list when ChatWindow dispatches update event
  React.useEffect(() => {
    const handler = () => refreshConversations();
    window.addEventListener("conversations-updated", handler);
    return () => window.removeEventListener("conversations-updated", handler);
  }, [refreshConversations]);

  // Handle global keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isMobile) {
          closeMobileSidebar();
          router.push("/chat/browse");
        } else {
          setSearchOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMobileSidebar, isMobile, router]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.last_message_preview.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const handleNavigation = (id: string) => {
    router.push(`/chat/${id}`);
    if (isMobile) closeMobileSidebar();
  };

  const sidebarVariants = isMobile ? mobileSidebarVariants : desktopSidebarVariants;

  return (
    <>
      <AnimatePresence>
        {isMobile && isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <Skeleton name="app-sidebar" loading={loading} animate="pulse" className="h-full shrink-0 flex flex-col">
        <motion.aside
        className={cn(
          "h-full shrink-0 border-r border-white/[0.04] bg-gradient-to-b from-[#09090C] via-[#050508] to-[#020204] flex flex-col overflow-hidden select-none shadow-2xl relative transition-all",
          isMobile 
            ? "fixed inset-y-0 left-0 z-[100] w-[85vw] max-w-[320px]" 
            : "z-20"
        )}
        initial={isMobile ? (isMobileSidebarOpen ? "open" : "closed") : (collapsed ? "closed" : "open")}
        animate={isMobile ? (isMobileSidebarOpen ? "open" : "closed") : (collapsed ? "closed" : "open")}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        {/* Subtle Decorative Glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.015),transparent_60%)] pointer-events-none" />

        {/* HEADER */}
        <div className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/[0.04] transition-all relative z-10",
          (isMobile ? false : collapsed) ? "justify-center px-0" : "justify-between px-4"
        )}>
          <motion.div
            variants={isMobile ? undefined : textVariants}
            initial={isMobile ? undefined : (collapsed ? "closed" : "open")}
            animate={isMobile ? undefined : (collapsed ? "closed" : "open")}
            className="items-center gap-2.5 overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-sc-text shrink-0" />
              <span className="text-sm font-bold tracking-wider font-display">
                swift<span className="font-serif italic font-normal text-sc-accent">Claw</span>
              </span>
            </div>
          </motion.div>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-sc-text-muted hover:text-sc-text hover:border-white/20 transition-colors cursor-pointer"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <SidebarOpen className="h-3.5 w-3.5" /> : <SidebarClose className="h-3.5 w-3.5" />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={closeMobileSidebar}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-sc-text-muted hover:text-sc-text hover:border-white/20 transition-colors cursor-pointer"
            >
              <SidebarClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* NEW CHAT */}
        <div className={cn("shrink-0 relative z-10", (isMobile ? false : collapsed) ? "p-2" : "p-4 pb-2")}>
          {(isMobile ? false : collapsed) ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => createConversation()}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/5 text-sc-accent hover:text-sc-text transition-all outline-none cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 shadow-2xl backdrop-blur-xl">
                  New Chat
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <NewChatButton onClick={() => createConversation()} />
          )}
        </div>

        {/* SEARCH ICON */}
        <div className={cn("shrink-0", (isMobile ? false : collapsed) ? "px-2 pb-2" : "px-3 pb-2")}>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (isMobile) {
                      closeMobileSidebar();
                      router.push("/chat/browse");
                    } else {
                      setSearchOpen(true);
                    }
                  }}
                  className={cn(
                    "flex items-center rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-all outline-none cursor-pointer",
                    (isMobile ? false : collapsed) ? "h-8 w-8 justify-center" : "h-8 w-full px-2.5"
                  )}
                >
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  {!(isMobile ? false : collapsed) && (
                    <div className="flex flex-1 items-center justify-between ml-2.5 overflow-hidden">
                      <span className="text-[11px] text-sc-text-muted/40 font-medium truncate">Search...</span>
                      {!isMobile && (
                        <span className="font-mono text-[8px] px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-sc-text-muted/40 tracking-wider font-bold">
                          ⌘K
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 shadow-2xl backdrop-blur-xl">
                Search conversations (⌘K)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {(isMobile ? false : collapsed) === false && (
            <div className="px-4 mb-1 shrink-0">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-sc-text-muted/40 select-none">
                History
              </span>
            </div>
          )}
          {(isMobile ? false : collapsed) ? (
            <div className="flex flex-col items-center gap-2 px-2 pt-2">
              {conversations.slice(0, 8).map((conv) => (
                <TooltipProvider key={conv.id}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleNavigation(conv.id)}
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors cursor-pointer",
                          conv.id === activeConversationId
                            ? "bg-sc-accent"
                            : "bg-white/10 hover:bg-white/20"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 shadow-2xl backdrop-blur-xl max-w-[200px]">
                      <p className="truncate">{conv.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="pb-2">
                <ConversationList
                  conversations={conversations}
                  loading={loading}
                  activeId={activeConversationId}
                  onSelect={handleNavigation}
                />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-white/5 bg-black/20 p-2 space-y-0.5">
          {!isMobile && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      router.push("/settings/api-keys");
                      if (isMobile) closeMobileSidebar();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-sc-text-muted hover:bg-white/[0.02] hover:text-sc-text transition-colors cursor-pointer w-full text-left",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <motion.span
                      variants={textVariants}
                      initial={collapsed ? "closed" : "open"}
                      animate={collapsed ? "closed" : "open"}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      Settings
                    </motion.span>
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 shadow-2xl backdrop-blur-xl">
                    Settings
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          <div className={cn(
            "flex items-center pt-1.5 border-t border-white/[0.04]",
            (isMobile ? false : collapsed) ? "justify-center" : "justify-between px-3"
          )}>
            {!(isMobile ? false : collapsed) && (
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] text-sc-text truncate font-semibold">
                    {displayName}
                  </span>
                  {userProfession && (
                    <span className="text-[8px] text-sc-text-muted/65 truncate font-mono mt-0.5 leading-none">
                      {userProfession}
                    </span>
                  )}
                </div>
                {isMobile && (
                  <button
                    onClick={() => {
                      router.push("/settings");
                      closeMobileSidebar();
                    }}
                    className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer shrink-0"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                {(isMobile ? false : collapsed) && (
                  <TooltipContent side="right" sideOffset={12} className="rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 shadow-2xl backdrop-blur-xl">
                    Sign out
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.aside>
      </Skeleton>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Search Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
            >
              {/* Input */}
              <div className="flex items-center border-b border-white/10 px-4 h-14">
                <Search className="h-4 w-4 text-white/40 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-sm font-body text-white placeholder-white/20 outline-none border-none h-full"
                  autoFocus
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="font-mono text-[10px] text-white/30 hover:text-white px-2 py-1 rounded border border-white/10 transition-colors cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <ScrollArea className="max-h-[320px] w-full p-2">
                {filteredConversations.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          router.push(`/chat/${conv.id}`);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3.5 p-3 rounded-lg text-left group transition-all hover:bg-white/5 outline-none"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 shrink-0">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                            {conv.title}
                          </span>
                          {conv.last_message_preview && (
                            <span className="text-[10px] text-white/40 truncate mt-0.5">
                              {conv.last_message_preview}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-white/0 group-hover:text-white/50 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <Terminal className="h-6 w-6 text-white/10 mb-3 animate-pulse" />
                    <p className="text-xs text-white/40 font-medium">
                      {searchQuery ? "No conversations match your search." : "Type to search conversations..."}
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-white/10 bg-black/40 px-4 py-2.5 flex items-center justify-between select-none pointer-events-none">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/20">
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-3 font-mono text-[8px] text-white/30">
                  <span className="flex items-center gap-1"><span className="text-white/50">↑↓</span> Navigate</span>
                  <span><span className="text-white/50">↵</span> Open</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
export default AppSidebar;
