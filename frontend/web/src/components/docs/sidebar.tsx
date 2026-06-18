"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Terminal,
  Blocks,
  Network,
  Mic,
  Video,
  ImageIcon,
  Lock,
  ChevronDown,
  SidebarClose,
  SidebarOpen,
  Search,
  ArrowRight
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { CORE_LINKS, INSTALL_LINKS } from "@/lib/docs-links";

// --- ANIMATION VARIANTS ---

const sidebarVariants = {
  open: { width: "16rem" },
  closed: { width: "3.5rem" },
};

const fadeVariants = {
  open: { opacity: 1, display: "flex", transition: { delay: 0.05, duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.1 }, transitionEnd: { display: "none" } },
};

const textVariants = {
  open: { opacity: 1, display: "block", transition: { delay: 0.05 } },
  closed: { opacity: 0, transition: { duration: 0.1 }, transitionEnd: { display: "none" } },
};

const FUTURE_LINKS = [
  { label: "MCP Integration", icon: Blocks, keywords: "model context protocol framework structural server extension lock future" },
  { label: "Workspace Sync", icon: Network, keywords: "cloud synchronization multi-device backup cluster remote dynamic pipeline" },
  { label: "Audio Stream", icon: Mic, keywords: "voice speech vocal commands audio processing audio real-time stream" },
  { label: "Video Analysis", icon: Video, keywords: "vision frames tracking matrix capture real-time camera computer" },
  { label: "Image Vision", icon: ImageIcon, keywords: "upscaling models generation 4k processing generation digital asset canvas" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed: externalCollapsed, setIsCollapsed: externalSetCollapsed }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = externalSetCollapsed !== undefined ? externalSetCollapsed : setInternalCollapsed;

  const pathname = usePathname();
  const router = useRouter();

  // Handle global keyboard shorthand command (Cmd + K or Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter algorithmic logic across all documentation indices
  const allSearchableItems = [
    ...CORE_LINKS.map(item => ({ ...item, category: "Architecture", status: "available" })),
    ...INSTALL_LINKS.map(item => ({ ...item, category: "Deployment / Installation", status: "available" })),
    ...FUTURE_LINKS.map(item => ({ ...item, href: "#", category: "Horizon Block (Locked)", status: "locked" }))
  ];

  const filteredItems = searchQuery === "" 
    ? allSearchableItems.slice(0, 5) // Show top items on clean interaction
    : allSearchableItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[999] h-full shrink-0 border-r border-[#FFFDF9]/10 bg-[#050505] selection:bg-[#FFFDF9] selection:text-black"
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        <div className="relative z-40 flex h-full w-full flex-col overflow-hidden">
          
          {/* --- HEADER WITH COMPACT TOGGLE BUTTON --- */}
          <div className={cn(
            "flex h-16 shrink-0 items-center border-b border-[#FFFDF9]/10 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-3.5"
          )}>
            <Link href="/docs" className="overflow-hidden">
              <motion.div 
                variants={fadeVariants} 
                className="flex items-center gap-3 whitespace-nowrap"
              >
                <div className="flex h-5 w-5 text-[#FFFDF9]">
                  <Terminal strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display  font-black tracking-widest text-[#FFFDF9] ">
                    swiftClaw
                  </span>
                </div>
              </motion.div>
            </Link>

            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="cursor-help">
                  <button
                    onClick={() => {
                      setIsCollapsed(!isCollapsed);
                      if (!isCollapsed) setInstallOpen(false);
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9]/40 transition-colors hover:border-[#FFFDF9]/30 hover:text-[#FFFDF9]"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isCollapsed ? <SidebarOpen className="h-3.5 w-3.5" /> : <SidebarClose className="h-3.5 w-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* --- PREMIUM KINETIC SEARCH CONTROL TRIGGER --- */}
          <div className="px-3 pt-4 shrink-0">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger className="cursor-help">
                  <button
                    onClick={() => setSearchOpen(true)}
                    className={cn(
                      "flex items-center rounded-md border border-[#FFFDF9]/10 bg-[#FFFDF9]/[0.02] transition-all hover:bg-[#FFFDF9]/5 hover:border-[#FFFDF9]/20 text-left outline-none",
                      isCollapsed ? "h-8 w-8 justify-center" : "h-9 w-full px-2.5"
                    )}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-[#FFFDF9]/30" />
                    {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between ml-2.5 overflow-hidden">
                    <span className="font-body text-xs text-[#FFFDF9]/30 font-medium truncate">Search platform docs...</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#FFFDF9]/10 bg-[#000000] text-[#FFFDF9]/40 tracking-wider font-bold">
                      ⌘K
                    </span>
                  </div>
                )}
                  </button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
                  Search (⌘K)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* --- SCROLLABLE NAVIGATION --- */}
          <ScrollArea className="flex-1 w-full py-4">
            <div className="flex w-full flex-col gap-6 px-3">
              
              {/* CORE LOGICAL REPOSITORIES */}
              <div className="flex w-full flex-col gap-1">
                <motion.div variants={textVariants} className="mb-2 px-2 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#FFFDF9]/30">
                  Architecture
                </motion.div>
                
                {CORE_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <div key={link.href}>
                    {isCollapsed ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger className="block">
                            <Link
                              href={link.href}
                              className={cn(
                                "group flex h-9 w-full items-center gap-3 rounded-md transition-all duration-200",
                                isCollapsed ? "justify-center px-0" : "px-2",
                                isActive && !isCollapsed ? "bg-[#FFFDF9]/10 text-[#FFFDF9]" : "text-[#FFFDF9]/50 hover:bg-[#FFFDF9]/5 hover:text-[#FFFDF9]"
                              )}
                            >
                              <link.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive && !isCollapsed ? "text-[#FFFDF9]" : "text-[#FFFDF9]/40 group-hover:text-[#FFFDF9]")} />
                              <motion.div variants={textVariants} className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap">
                                <span className="truncate font-body text-xs font-medium">{link.label}</span>
                                {link.badge && (
                                  <span className="ml-2 shrink-0 rounded-[4px] border border-[#FFFDF9]/20 bg-[#FFFDF9]/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-[#FFFDF9]">
                                    {link.badge}
                                  </span>
                                )}
                              </motion.div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">{link.label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          "group flex h-9 w-full items-center gap-3 rounded-md transition-all duration-200",
                          isCollapsed ? "justify-center px-0" : "px-2",
                          isActive && !isCollapsed ? "bg-[#FFFDF9]/10 text-[#FFFDF9]" : "text-[#FFFDF9]/50 hover:bg-[#FFFDF9]/5 hover:text-[#FFFDF9]"
                        )}
                      >
                        <link.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive && !isCollapsed ? "text-[#FFFDF9]" : "text-[#FFFDF9]/40 group-hover:text-[#FFFDF9]")} />
                        <motion.div variants={textVariants} className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap">
                          <span className="truncate font-body text-xs font-medium">{link.label}</span>
                          {link.badge && (
                            <span className="ml-2 shrink-0 rounded-[4px] border border-[#FFFDF9]/20 bg-[#FFFDF9]/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-[#FFFDF9]">
                              {link.badge}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    )}
                    </div>
                  );
                })}
              </div>

              {/* INSTALLATION MATRIX SEGMENT (FIXED PERFECT SYMMETRY ALIGNMENT) */}
              <div className="flex w-full flex-col gap-1">
                <motion.div variants={textVariants} className="mb-2 px-2 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#FFFDF9]/30">
                  Deployment
                </motion.div>

                {isCollapsed ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger className="block">
                        <button
                          onClick={() => {
                            if (!isCollapsed) setInstallOpen(!installOpen);
                          }}
                          className={cn(
                            "group flex h-9 w-full items-center rounded-md transition-all duration-200 outline-none",
                            "justify-center px-0",
                            (installOpen || pathname?.includes("/install")) && !isCollapsed
                              ? "bg-[#FFFDF9]/5 text-[#FFFDF9]"
                              : "text-[#FFFDF9]/50 hover:bg-[#FFFDF9]/5 hover:text-[#FFFDF9]"
                          )}
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Download className="h-4 w-4 shrink-0 text-[#FFFDF9]/40 group-hover:text-[#FFFDF9]" />
                            </div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">Installation</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <button
                    onClick={() => {
                      if (!isCollapsed) setInstallOpen(!installOpen);
                    }}
                    className={cn(
                      "group flex h-9 w-full items-center rounded-md transition-all duration-200 outline-none",
                      isCollapsed ? "justify-center px-0 pointer-events-none" : "px-2",
                      (installOpen || pathname?.includes("/install")) && !isCollapsed
                        ? "bg-[#FFFDF9]/5 text-[#FFFDF9]"
                        : "text-[#FFFDF9]/50 hover:bg-[#FFFDF9]/5 hover:text-[#FFFDF9]"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Download className="h-4 w-4 shrink-0 text-[#FFFDF9]/40 group-hover:text-[#FFFDF9]" />
                        <span className="truncate font-body text-xs font-medium">Installation</span>
                      </div>
                      <ChevronDown className={cn("h-3 w-3 shrink-0 text-[#FFFDF9]/30 transition-transform duration-300 ml-2", installOpen && "rotate-180")} />
                    </div>
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {installOpen && !isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex w-full flex-col gap-1 overflow-hidden pl-7 pt-1"
                    >
                      {INSTALL_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "group flex h-8 w-full items-center gap-3 rounded-md px-2 transition-all",
                            pathname === link.href ? "bg-[#FFFDF9]/5 text-[#FFFDF9]" : "text-[#FFFDF9]/40 hover:bg-[#FFFDF9]/[0.02] hover:text-[#FFFDF9]"
                          )}
                        >
                          <link.icon className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
                          <span className="truncate font-body text-[11px] font-medium">{link.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* HORIZON LOCK ZONE (FIXED ALIGNMENT TO MIRROR CHEVRONS EXACTLY) */}
              <div className="flex w-full flex-col gap-1">
                <div className="mb-2 px-2 min-h-[14px]">
                  {isCollapsed ? (
                    <div className="flex w-full justify-center text-[#FFFDF9]/30">
                    
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#FFFDF9]/30">
                      <span>Horizon</span>
                      <Lock className="h-2.5 w-2.5 shrink-0 ml-2" />
                    </div>
                  )}
                </div>
                
                {FUTURE_LINKS.map((link) => {
                  return (
                    <div key={link.label}>
                    {isCollapsed ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger className="block">
                            <div
                              className={cn(
                                "group flex h-9 w-full items-center gap-3 rounded-md cursor-not-allowed text-left opacity-30 grayscale",
                                isCollapsed ? "justify-center px-0" : "px-2"
                              )}
                            >
                              <link.icon className="h-4 w-4 shrink-0 text-[#FFFDF9]" />
                              <motion.div variants={textVariants} className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap">
                                <span className="truncate font-body text-xs line-through decoration-[#FFFDF9]/30">{link.label}</span>
                              </motion.div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">{link.label} (Coming Soon)</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div
                        className={cn(
                          "group flex h-9 w-full items-center gap-3 rounded-md cursor-not-allowed text-left opacity-30 grayscale",
                          isCollapsed ? "justify-center px-0" : "px-2"
                        )}
                      >
                        <link.icon className="h-4 w-4 shrink-0 text-[#FFFDF9]" />
                        <motion.div variants={textVariants} className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap">
                          <span className="truncate font-body text-xs line-through decoration-[#FFFDF9]/30">{link.label}</span>
                        </motion.div>
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>

            </div>
          </ScrollArea>

          {/* --- SYSTEM CONSOLE FOOTER --- */}
          <div className="w-full shrink-0 border-t border-[#FFFDF9]/10 bg-[#000000] p-3">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger className="block">
                    <div className={cn(
                      "flex h-10 w-full items-center gap-3 rounded-lg border border-[#FFFDF9]/10 bg-[#FFFDF9]/[0.02] px-2.5 transition-all duration-300",
                      isCollapsed && "justify-center border-transparent bg-transparent px-0"
                    )}>
                      <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E6C3] opacity-50" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E6C3]" />
                      </div>
                      <motion.div variants={textVariants} className="flex flex-col overflow-hidden whitespace-nowrap">
                        <span className="truncate font-mono text-[10px] font-bold text-muted-foreground/80">version: 1.0.1</span>
                      </motion.div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">System online — v1.0.1</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className={cn(
                "flex h-10 w-full items-center gap-3 rounded-lg border border-[#FFFDF9]/10 bg-[#FFFDF9]/[0.02] px-2.5 transition-all duration-300",
                isCollapsed && "justify-center border-transparent bg-transparent px-0"
              )}>
                <div className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E6C3] opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E6C3]" />
                </div>
                <motion.div variants={textVariants} className="flex flex-col overflow-hidden whitespace-nowrap">
                  <span className="truncate font-mono text-[10px] font-bold text-muted-foreground/80">version: 1.0.1</span>
                </motion.div>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* --- PREMIUM COMMAND PALETTE INTERACTIVE MODAL INTERFACE --- */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Search Frame Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#0A0A0A] shadow-2xl"
            >
              {/* Input Boundary */}
              <div className="flex items-center border-b border-[#FFFDF9]/10 px-4 h-14">
                <Search className="h-4 w-4 text-[#FFFDF9]/40 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a documentation query or configuration flag..."
                  className="flex-1 bg-transparent text-sm font-body text-[#FFFDF9] placeholder-[#FFFDF9]/20 outline-none border-none h-full"
                  autoFocus
                />
                <button 
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="font-mono text-[10px] text-[#FFFDF9]/30 hover:text-[#FFFDF9] px-2 py-1 rounded border border-[#FFFDF9]/10 transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Dynamic Results Display */}
              <ScrollArea className="max-h-[320px] w-full p-2">
                <div className="flex flex-col gap-0.5">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => (
                      <button
                        key={`${item.label}-${idx}`}
                        disabled={item.status === "locked"}
                        onClick={() => {
                          if (item.href) {
                            router.push(item.href);
                            setSearchOpen(false);
                            setSearchQuery("");
                          }
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg text-left group transition-all outline-none",
                          item.status === "locked" 
                            ? "opacity-30 cursor-not-allowed" 
                            : "hover:bg-[#FFFDF9]/5 bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9]/60 shrink-0 group-hover:text-[#FFFDF9] group-hover:border-[#FFFDF9]/20 transition-colors">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-body text-xs font-semibold text-[#FFFDF9]/80 group-hover:text-[#FFFDF9] transition-colors truncate">
                              {item.label}
                            </span>
                            <span className="font-mono text-[9px] text-[#FFFDF9]/30 uppercase tracking-wider mt-0.5 truncate">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === "locked" ? (
                            <Lock className="h-3 w-3 text-[#FFFDF9]/30" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-[#FFFDF9]/0 group-hover:text-[#FFFDF9]/50 group-hover:translate-x-0.5 transition-all" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
                      <Terminal className="h-6 w-6 text-[#FFFDF9]/10 mb-3 animate-pulse" />
                      <p className="font-body text-xs text-[#FFFDF9]/40 font-medium">No system indexing matches your parameters.</p>
                      <p className="font-mono text-[9px] text-[#FFFDF9]/20 uppercase tracking-widest mt-1">Verify keyword structure</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Status Command Tray Footer */}
              <div className="border-t border-[#FFFDF9]/10 bg-[#000000] px-4 py-2.5 flex items-center justify-between select-none pointer-events-none">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FFFDF9]/20">
                  Engine Query Router Active
                </span>
                <div className="flex items-center gap-3 font-mono text-[8px] text-[#FFFDF9]/30">
                  <span className="flex items-center gap-1"><span className="text-[#FFFDF9]/50">↑↓</span> Navigate</span>
                  <span><span className="text-[#FFFDF9]/50">↵</span> Execute</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}