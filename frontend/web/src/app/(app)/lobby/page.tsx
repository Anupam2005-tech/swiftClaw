"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api/client";
import { LobbyImage } from "@/lib/types/conversation";
import { Spinner } from "@/components/ui/spinner";
import {
  Image as ImageIcon,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Copy,
  Download,
  Search,
  MessageSquare,
  Clock,
  RefreshCw,
  Maximize2,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Fullscreen image viewer portal
interface ImageOverlayProps {
  src: string;
  alt: string;
  onClose: () => void;
  prompt: string;
  conversationId: string;
  conversationTitle: string;
  createdAt: string;
}

function ImageOverlay({
  src,
  alt,
  onClose,
  prompt,
  conversationId,
  conversationTitle,
  createdAt,
}: ImageOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleGoToConversation = () => {
    document.body.style.overflow = "";
    router.push(`/chat/${conversationId}`);
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-white/70 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Header bar at the top */}
      <div
        className="h-14 w-full flex items-center justify-between px-4 bg-white/30 border-b border-black/[0.05] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-black/80 hover:text-black transition-all cursor-pointer flex items-center justify-center"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-black/80 truncate max-w-[50vw]">
            Generated Image Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/85 hover:text-black text-xs font-semibold transition-all cursor-pointer"
            title="Open original conversation"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Go to Chat</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-black/80 hover:text-black transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main split display area */}
      <div
        className="flex-1 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left pane: Centered Image */}
        <div className="flex-1 flex items-center justify-center p-6 bg-black/[0.02]">
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={src}
            alt={alt}
            className="max-w-[90vw] md:max-w-full max-h-[50vh] md:max-h-[80vh] object-contain rounded-xl shadow-2xl border border-black/5"
          />
        </div>

        {/* Right pane: Metadata & Prompt */}
        <div className="w-full md:w-80 bg-white/60 border-t md:border-t-0 md:border-l border-black/[0.05] p-5 flex flex-col gap-5 overflow-y-auto select-none">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-black/40 font-mono block">
              Original Prompt
            </span>
            <div className="mt-2 p-3 rounded-lg bg-black/5 border border-black/[0.03] text-xs text-black/80 font-body leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {prompt || "No prompt context recorded."}
            </div>
            <button
              onClick={handleCopyPrompt}
              className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-black/50 hover:text-black transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className="border-t border-black/[0.05] pt-4 flex flex-col gap-3">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-black/40 font-mono block">
                Conversation
              </span>
              <span className="text-xs font-semibold text-black/85 block truncate mt-1">
                {conversationTitle}
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-black/40 font-mono block">
                Created At
              </span>
              <span className="text-xs text-black/70 flex items-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5 text-black/40" />
                {new Date(createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

export default function LobbyPage() {
  const [images, setImages] = useState<LobbyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<LobbyImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.getLobbyImages();
      setImages(list);
    } catch (err) {
      console.error("Failed to load lobby images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Copy prompt helper from grid card
  const handleCopyPrompt = async (id: string, prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  // Filter images by search prompt or conversation title
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();
    return images.filter(
      (img) =>
        img.prompt.toLowerCase().includes(query) ||
        img.conversation_title.toLowerCase().includes(query)
    );
  }, [images, searchQuery]);

  // Group images by date
  const groupedImages = useMemo(() => {
    const groups: Record<string, LobbyImage[]> = {};
    filteredImages.forEach((img) => {
      const date = new Date(img.created_at);
      let groupKey = "Unknown Date";

      if (!isNaN(date.getTime())) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          groupKey = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          groupKey = "Yesterday";
        } else {
          groupKey = date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(img);
    });

    return groups;
  }, [filteredImages]);

  // Navigate to chat
  const handleGoToChat = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030303] text-sc-text overflow-hidden">
      {/* Header bar */}
      <div className="h-14 shrink-0 border-b border-white/[0.04] bg-[#09090C] px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.01] flex items-center justify-center text-sc-text-muted">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide font-display">Lobby</h1>
            <p className="text-[10px] text-sc-text-muted mt-0.5 leading-none">
              Generated images from conversation logs
            </p>
          </div>
        </div>

        <button
          onClick={fetchImages}
          className="h-8 px-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-sc-text hover:text-sc-accent transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Refresh lobby gallery"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main content body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-none">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative w-full max-w-full sm:max-w-md select-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sc-text-muted/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt or chat title..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] text-xs text-sc-text placeholder-sc-text-muted/30 focus:border-sc-accent/40 focus:outline-none transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-sc-text-muted/40">
              <Spinner size="md" className="border-t-transparent border-sc-text/40" />
              <span className="text-[10px] uppercase tracking-wider font-semibold mt-3 select-none">
                Fetching Images...
              </span>
            </div>
          ) : images.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.005] select-none">
              <ImageIcon className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <h3 className="text-xs font-bold text-sc-text">No Images Found</h3>
              <p className="text-[10px] text-sc-text-muted mt-1 leading-normal max-w-sm mx-auto">
                Any images generated by assistant models in your chat conversations will be listed here.
              </p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-24 text-center border border-white/5 rounded-xl bg-white/[0.002] select-none">
              <Search className="h-6 w-6 text-white/10 mx-auto mb-2" />
              <h3 className="text-xs font-semibold text-sc-text">No matches</h3>
              <p className="text-[10px] text-sc-text-muted mt-1">
                No images matched your query "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-10">
              {Object.entries(groupedImages).map(([dateLabel, groupImages]) => (
                <div key={dateLabel} className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {/* Date Heading */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-sc-text-muted/50 uppercase tracking-widest font-mono select-none">
                    <Calendar className="h-3.5 w-3.5 text-sc-text-muted/30" />
                    <span>{dateLabel}</span>
                    <span className="h-[1px] flex-1 bg-white/5 ml-2" />
                  </div>

                  {/* Grid of Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {groupImages.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImage(img)}
                        className="group relative flex flex-col rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.02] shadow-lg select-none"
                      >
                        {/* Aspect Ratio Box */}
                        <div className="relative aspect-square w-full bg-black/40 overflow-hidden">
                          <img
                            src={img.image_url}
                            alt={img.prompt || "Generated image"}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={(e) => handleCopyPrompt(img.id, img.prompt, e)}
                                className="h-7 w-7 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                                title="Copy original prompt"
                              >
                                {copiedId === img.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={(e) => handleGoToChat(img.conversation_id, e)}
                                className="h-7 w-7 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                                title="Open in chat"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <span className="text-[10px] text-white/90 font-medium line-clamp-2 leading-relaxed">
                              {img.prompt || "No prompt context available."}
                            </span>
                          </div>
                        </div>

                        {/* Card Info Footer */}
                        <div className="p-3 border-t border-white/5 flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-sc-text truncate">
                            {img.conversation_title}
                          </span>
                          <span className="text-[8px] text-sc-text-muted/50 font-mono">
                            {new Date(img.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <ImageOverlay
            src={selectedImage.image_url}
            alt={selectedImage.prompt || "Expanded preview"}
            prompt={selectedImage.prompt}
            conversationId={selectedImage.conversation_id}
            conversationTitle={selectedImage.conversation_title}
            createdAt={selectedImage.created_at}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
