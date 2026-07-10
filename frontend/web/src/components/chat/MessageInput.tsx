"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatInputMode, InputModeToggle } from "./InputModeToggle";
import { FileAttachmentPreview } from "./FileAttachmentPreview";
import { FileAttachment } from "../../lib/types/conversation";
import { StopGenerationButton } from "./StopGenerationButton";
import { Paperclip, ArrowUp, Zap, HelpCircle, Image } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (text: string, files: FileAttachment[], mode: ChatInputMode) => void;
  streaming: boolean;
  onStop: () => void;
  mode: ChatInputMode;
  onModeChange: (mode: ChatInputMode) => void;
}

export function MessageInput({
  onSend,
  streaming,
  onStop,
  mode,
  onModeChange,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [forceDisconnect, setForceDisconnect] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea heights
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (streaming) return;

    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    if (forceDisconnect) {
      localStorage.setItem("sc_debug_force_disconnect", "true");
    }

    onSend(trimmed, files, mode);
    setText("");
    setFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const list: FileAttachment[] = [];
    Array.from(selected).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const item: FileAttachment = {
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: event.target?.result as string,
        };
        setFiles((prev) => [...prev, item]);
      };
      reader.readAsDataURL(f);
    });

    // Reset input
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getPlaceholderText = () => {
    if (mode === "image") return "Describe the image you want to generate...";
    if (mode === "video") return "Describe the video clip prompt you want to render...";
    return "Message swiftClaw or upload files...";
  };

  return (
    <div className="p-4 bg-sc-canvas border-t border-white/5 shrink-0 flex flex-col gap-2 relative">
      {/* File Pre-sent preview row */}
      <FileAttachmentPreview files={files} onRemove={removeFile} />

      {/* Floating Stop Button (visible while streaming) */}
      {streaming && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-in fade-in duration-200">
          <StopGenerationButton onStop={onStop} />
        </div>
      )}

      {/* Input Outer boundary container */}
      <form
        onSubmit={handleSend}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-2 shadow-inner focus-within:border-sc-accent transition-colors duration-200"
        )}
      >
        <div className="flex gap-2 items-end">
          {/* File attach inputs */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload-input"
          />
          <input
            type="file"
            multiple
            accept="image/*"
            ref={imageInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload-input"
          />
          
          <div className="flex items-center">
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={streaming}
              className="h-10 w-9 flex items-center justify-center rounded-lg text-sc-text-muted hover:text-sc-text hover:bg-white/5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Attach File"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={streaming}
              className="h-10 w-9 flex items-center justify-center rounded-lg text-sc-text-muted hover:text-sc-text hover:bg-white/5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Attach Image"
            >
              <Image className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Core Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder={getPlaceholderText()}
            className="flex-1 max-h-[160px] min-h-[40px] py-2.5 px-2 bg-transparent text-xs text-sc-text placeholder:text-sc-text-muted/50 border-0 outline-none resize-none font-sans leading-normal scrollbar-none"
          />

          {/* Send Trigger */}
          <Button
            type="submit"
            disabled={streaming || (!text.trim() && files.length === 0)}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-sc-accent text-accent-foreground cursor-pointer hover:bg-sc-accent/90 shrink-0 disabled:opacity-30 disabled:hover:bg-sc-accent"
          >
            <ArrowUp className="h-4 w-4 stroke-[3]" />
          </Button>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2 px-1">
          {/* Chat Mode Toggle */}
          <InputModeToggle mode={mode} onModeChange={onModeChange} disabled={streaming} />

          {/* Developer Debug Utilities */}
          <div className="flex items-center gap-4">
            {/* Force Disconnect Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] text-sc-text-muted/60 hover:text-sc-text-muted/95 transition-colors">
              <input
                type="checkbox"
                checked={forceDisconnect}
                onChange={(e) => setForceDisconnect(e.target.checked)}
                className="rounded border-white/10 bg-black text-sc-accent focus:ring-sc-accent focus:ring-offset-0 h-3 w-3"
              />
              <Zap className="h-3 w-3 text-yellow-500/80" />
              Simulate Disconnect
            </label>

            {/* Help tip */}
            <span title="Tip: Type 'switch' to demo failovers, 'search' for MCP toolcalls, or 'low confidence' to trigger banners.">
              <HelpCircle className="h-3.5 w-3.5 text-sc-text-muted/30 cursor-help hover:text-sc-text-muted/70 transition-colors" />
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
export default MessageInput;
