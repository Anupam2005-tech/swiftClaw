"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Message } from "../../lib/types/conversation";
import { FileAttachmentChip } from "./FileAttachmentChip";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { SourcesPanel } from "./SourcesPanel";
import { ImageMessage } from "./ImageMessage";
import { VideoJobCard } from "./VideoJobCard";
import { ThinkingPanel } from "./ThinkingPanel";
import { RefreshCw, AlertCircle, Terminal, Copy, Check, X, Maximize2, Pencil, ArrowLeft, Clock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  onEdit?: (newText: string) => void;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
}

const STATUS_WORDS = ["Cooking", "Transforming", "Generating", "Processing", "Assembling", "Brewing"];

type TWState = { wordIndex: number; charIndex: number; dir: "typing" | "erasing" | "pause" };
type TWAction =
  | { type: "tick" }
  | { type: "next_char" }
  | { type: "prev_char" }
  | { type: "pause_done" }
  | { type: "word_done" };

function twReducer(state: TWState, action: TWAction): TWState {
  switch (action.type) {
    case "next_char":
      return { ...state, charIndex: state.charIndex + 1 };
    case "pause_done":
      return { ...state, dir: "erasing" };
    case "prev_char":
      return { ...state, charIndex: state.charIndex - 1 };
    case "word_done":
      return { wordIndex: (state.wordIndex + 1) % STATUS_WORDS.length, charIndex: 0, dir: "typing" };
    default:
      return state;
  }
}

function TypewriterStatus() {
  const [state, dispatch] = React.useReducer(twReducer, { wordIndex: 0, charIndex: 0, dir: "typing" });

  React.useEffect(() => {
    const word = STATUS_WORDS[state.wordIndex];

    if (state.dir === "typing") {
      if (state.charIndex < word.length) {
        const t = setTimeout(() => dispatch({ type: "next_char" }), 50);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => dispatch({ type: "pause_done" }), 400);
      return () => clearTimeout(t);
    }

    if (state.dir === "pause") {
      const t = setTimeout(() => dispatch({ type: "pause_done" }), 300);
      return () => clearTimeout(t);
    }

    if (state.dir === "erasing") {
      if (state.charIndex > 0) {
        const t = setTimeout(() => dispatch({ type: "prev_char" }), 30);
        return () => clearTimeout(t);
      }
      dispatch({ type: "word_done" });
    }
  }, [state.wordIndex, state.charIndex, state.dir]);

  return (
    <span>
      {STATUS_WORDS[state.wordIndex].slice(0, state.charIndex)}
      <span className="inline-block w-[2px] h-[12px] bg-sc-accent/70 ml-[1px] animate-pulse align-middle" />
    </span>
  );
}

function ImageOverlay({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const displayName = alt || "Image Preview";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Disable background page scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
        className="h-14 w-full flex items-center px-4 gap-4 bg-white/20 select-none border-b border-black/[0.05]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-black/5 text-black/80 hover:text-black transition-all cursor-pointer flex items-center justify-center"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-black/80 truncate max-w-[80vw]">
          {displayName}
        </span>
      </div>

      {/* Centered Image display area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.img
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl border border-black/5"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </motion.div>,
    document.body
  );
}

function InlineImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative rounded-2xl overflow-hidden border border-white/10 shrink-0 cursor-pointer bg-white/[0.03] shadow-md transition-all duration-200 hover:border-white/20 h-20 w-fit max-w-[200px]"
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-auto object-contain rounded-2xl group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-2xl">
          <Maximize2 className="h-4 w-4 text-white/0 group-hover:text-white/80 transition-all" />
        </div>
      </button>
      <AnimatePresence>
        {open && <ImageOverlay src={src} alt={alt} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function highlightCode(code: string, language: string): React.ReactNode {
  if (!code) return "";

  const tokenRegex = new RegExp(
    [
      // 1. Comments
      `(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/.*|#.*)`,
      // 2. Strings
      `("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`)`,
      // 3. Keywords
      `\\b(const|let|var|function|return|import|export|class|def|if|else|for|while|try|except|catch|finally|async|await|true|false|null|undefined|nil|and|or|not|in|is|lambda|with|as|elif|print|from|import|yield|break|continue|pass|raise|assert|global|nonlocal|del|struct|interface|package|namespace|public|private|protected|static|readonly|new|this|super|throw|switch|case|default|type|typeof|instanceof|keyof|as|any|never|unknown|void)\\b`,
      // 4. Types / Built-ins
      `\\b(string|number|boolean|any|void|int|float|double|char|long|short|bool|dict|list|set|tuple|self|cls|console|window|document|process|Object|Array|String|Number|Boolean|Function|Promise)\\b`,
      // 5. Numbers
      `\\b(\\d+(?:\\.\\d+)?)\\b`,
      // 6. Functions
      `\\b([a-zA-Z_]\\w*)(?=\\()`,
      // 7. Operators & Punctuation
      `(\\+|-|\\*|\\/|%|=|==|===|!=|!==|&&|\\|\\||!|&|\\||\\^|~|<<|>>|\\?|:|\\.|\\,|;|\\(|\\)|\\{|\\}|\\[|\\])`
    ].join("|"),
    "g"
  );

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    const textBetween = code.substring(lastIndex, match.index);
    if (textBetween) {
      elements.push(textBetween);
    }

    const matchedText = match[0];
    
    // Determine token type by checking which sub-pattern matched
    if (/^\/\*|^\/\/|^#/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#6a9955", fontStyle: "italic" }}>
          {matchedText}
        </span>
      );
    } else if (/^["'`]/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#ce9178" }}>
          {matchedText}
        </span>
      );
    } else if (/^(const|let|var|function|return|import|export|class|def|if|else|for|while|try|except|catch|finally|async|await|true|false|null|undefined|nil|and|or|not|in|is|lambda|with|as|elif|print|from|import|yield|break|continue|pass|raise|assert|global|nonlocal|del|struct|interface|package|namespace|public|private|protected|static|readonly|new|this|super|throw|switch|case|default|type|typeof|instanceof|keyof|as|any|never|unknown|void)$/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#c586c0", fontWeight: "600" }}>
          {matchedText}
        </span>
      );
    } else if (/^(string|number|boolean|any|void|int|float|double|char|long|short|bool|dict|list|set|tuple|self|cls|console|window|document|process|Object|Array|String|Number|Boolean|Function|Promise)$/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#4ec9b0" }}>
          {matchedText}
        </span>
      );
    } else if (/^\d+(\.\d+)?$/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#b5cea8" }}>
          {matchedText}
        </span>
      );
    } else if (/^[a-zA-Z_]\w*$/.test(matchedText) && code[tokenRegex.lastIndex] === "(") {
      elements.push(
        <span key={match.index} style={{ color: "#dcdcaa" }}>
          {matchedText}
        </span>
      );
    } else if (/^(\+|-|\*|\/|%|=|==|===|!=|!==|&&|\|\||!|&|\||\^|~|<<|>>|\?|:|\.|\,|;|\(|\)|\{|\}|\[|\])$/.test(matchedText)) {
      elements.push(
        <span key={match.index} style={{ color: "#d4d4d4" }}>
          {matchedText}
        </span>
      );
    } else {
      elements.push(matchedText);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  const textLeft = code.substring(lastIndex);
  if (textLeft) {
    elements.push(textLeft);
  }

  return <>{elements}</>;
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  const handleDownload = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;
    
    // Map lang to common extensions
    let ext = "txt";
    const extensionMap: Record<string, string> = {
      javascript: "js",
      js: "js",
      typescript: "ts",
      ts: "ts",
      json: "json",
      python: "py",
      py: "py",
      css: "css",
      html: "html",
      dockerfile: "Dockerfile",
      bash: "sh",
      shell: "sh",
      sh: "sh",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
      rust: "rs",
      rs: "rs",
      go: "go",
      cpp: "cpp",
      c: "c",
      java: "java",
      ruby: "rb",
      rb: "rb",
      php: "php",
    };
    
    if (extensionMap[lang.toLowerCase()]) {
      ext = extensionMap[lang.toLowerCase()];
    }

    const filename = `swiftClaw-code-${timestamp}.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-white/5 bg-[#171717] overflow-hidden font-mono text-[10px] my-3 w-full max-w-full shadow-md">
        <div className="flex justify-between items-center px-4 py-1.5 bg-white/[0.01] border-b border-white/5 text-sc-text-muted/60 text-[9px] uppercase tracking-wider select-none font-bold">
          <span>{lang}</span>
          <div className="flex items-center gap-2">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDownload}
                  className="p-1 rounded hover:bg-white/5 text-sc-text-muted/60 hover:text-sc-text transition-colors cursor-pointer animate-in fade-in duration-200"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Download Code
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-white/5 text-sc-text-muted/60 hover:text-sc-text transition-colors cursor-pointer animate-in fade-in duration-200"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {copied ? "Copied!" : "Copy Code"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <pre className="p-4 overflow-x-auto leading-normal scrollbar-none text-[16px] md:text-[16px]" style={{ color: "#d4d4d4" }}>
          <code>{highlightCode(code, lang)}</code>
        </pre>
      </div>
    </TooltipProvider>
  );
}

function FormattedContent({
  content,
  isUser,
  isStreaming
}: {
  content: string;
  isUser: boolean;
  isStreaming: boolean;
}) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  // We want to find the last text block index to append the blinking dots if streaming
  let lastTextIndex = -1;
  if (!isUser && isStreaming) {
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!(parts[i].startsWith("```") && parts[i].endsWith("```")) && parts[i].trim()) {
        lastTextIndex = i;
        break;
      }
    }
  }

  const endsWithCode = parts.length > 0 && parts[parts.length - 1].startsWith("```");
  const showTrailingDots = !isUser && isStreaming && (lastTextIndex === -1 || endsWithCode);

  return (
    <div className="space-y-3 w-full flex flex-col gap-3">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].toLowerCase();
          const hasLang = ["javascript", "typescript", "json", "python", "css", "html", "dockerfile", "bash", "shell", "docker", "sql", "yaml", "yml", "rust", "go", "cpp", "c", "java", "ruby", "php"].includes(firstLine);
          const lang = hasLang ? firstLine : "code";
          const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return <CodeBlock key={index} code={code} lang={lang} />;
        }

        // It is a text part
        if (!part.trim() && index !== lastTextIndex) return null;

        const renderInline = (text: string) => {
          const subParts = text.split(/(`[^`\n]+`)/g);
          return subParts.map((subPart, sIdx) => {
            if (subPart.startsWith("`") && subPart.endsWith("`")) {
              return (
                <code key={sIdx} className="bg-white/15 text-white px-1.5 py-0.5 rounded font-semibold text-[13px] md:text-[14px] tracking-wide">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            const boldParts = subPart.split(/(\*\*[^*\n]+\*\*)/g);
            return (
              <span key={sIdx}>
                {boldParts.map((bPart, bIdx) => {
                  if (bPart.startsWith("**") && bPart.endsWith("**")) {
                    return (
                      <strong key={bIdx} className="font-extrabold text-white text-[14px] md:text-[15px]">
                        {bPart.slice(2, -2)}
                      </strong>
                    );
                  }
                  return bPart;
                })}
              </span>
            );
          });
        };

        const lines = part.split("\n");
        const textElement = (
          <div className="flex flex-col text-[11.5px] md:text-[12px] text-white/90 font-medium leading-relaxed break-words gap-[3px]">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-2" />;

              const headingMatch = line.trim().match(/^(#{1,6})\s+(.*)$/);
              if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2];
                let cls = "text-[18px] md:text-[20px] font-bold mt-4 mb-2 text-white tracking-tight";
                if (level === 1) cls = "text-[26px] md:text-[30px] font-black mt-6 mb-3 text-white tracking-tight leading-tight";
                if (level === 2) cls = "text-[22px] md:text-[26px] font-extrabold mt-5 mb-3 text-white tracking-tight leading-tight";
                if (level === 3) cls = "text-[20px] md:text-[22px] font-bold mt-4 mb-2 text-white tracking-tight";
                
                return <div key={lIdx} className={cls}>{renderInline(text)}</div>;
              }

              const ulMatch = line.match(/^(\s*)([-*])\s+(.*)$/);
              if (ulMatch) {
                const indent = Math.floor(ulMatch[1].length / 2);
                return (
                  <div key={lIdx} className="flex gap-2.5 items-start mt-1.5 mb-0.5 text-[14px] md:text-[15px]" style={{ marginLeft: `${indent * 12}px` }}>
                    <span className="text-white/60 select-none text-[16px] leading-tight mt-[1px]">•</span>
                    <div className="flex-1 text-white/95">{renderInline(ulMatch[3])}</div>
                  </div>
                );
              }

              const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
              if (olMatch) {
                const indent = Math.floor(olMatch[1].length / 2);
                const num = olMatch[2];
                return (
                  <div key={lIdx} className="flex gap-2 items-start mt-1.5 mb-0.5 text-[14px] md:text-[15px]" style={{ marginLeft: `${indent * 12}px` }}>
                    <span className="text-white/60 select-none font-mono text-[13px] min-w-[16px] text-right mt-[3px]">{num}.</span>
                    <div className="flex-1 text-white/95">{renderInline(olMatch[3])}</div>
                  </div>
                );
              }

              return <div key={lIdx} className="min-h-[1.2em] text-[12px]">{renderInline(line)}</div>;
            })}
            {index === lastTextIndex && (
              <div className="mt-1">
                <span className="inline-flex ml-1.5">
                  <BlinkingDots />
                </span>
              </div>
            )}
          </div>
        );

        // Both user (inside bubble wrapper) and assistant text render as plain text.
        return <div key={index}>{textElement}</div>;
      })}

      {showTrailingDots && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-sc-text-muted/40 self-start">
          <span className="text-[10px] font-mono italic">streaming</span>
          <BlinkingDots />
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function BlinkingDots() {
  return (
    <span className="inline-flex gap-[2px]">
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
        className="w-[2px] h-[2px] rounded-full bg-sc-text-muted/50"
      />
    </span>
  );
}

export function MessageBubble({
  message,
  onRegenerate,
  isRegenerating = false,
  onEdit,
  isLastUserMessage = false,
  isLastAssistantMessage = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || "");

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) {
      onEdit?.(editText);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(message.content || "");
    }
  };

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message content copied to clipboard.",
        variant: "success",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const isLoading = !isUser && (isStreaming || isRegenerating) && !message.content;

  return (
    <div className={cn(
      "flex w-full py-2",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI: streaming, no content yet — show typewriter OR the thinking panel if thinking tokens arrived */}
      {!isUser && isStreaming && !message.content ? (
        message.thinking ? (
          // Thinking tokens are streaming — show the thinking panel immediately
          <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[80%]">
            <ThinkingPanel thinking={message.thinking} isStreaming={true} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 select-none">
            <div className="h-7 w-7 flex items-center justify-center shrink-0">
              <Terminal className="h-3.5 w-3.5 text-sc-accent" />
            </div>
            <span className="text-xs font-semibold text-sc-accent">
              <TypewriterStatus />
            </span>
            <BlinkingDots />
          </div>
        )
      ) : (
        <Skeleton name="message-bubble" loading={isLoading} animate="pulse">
         <div className={cn(
          "flex flex-col gap-2.5 group transition-all duration-200",
          isEditing ? "w-full max-w-full" : isUser ? "max-w-[85%] md:max-w-[70%]" : "max-w-[95%] sm:max-w-[90%] md:max-w-[80%] w-full",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Attachments (outside the text bubble for visual separation) */}
          {isUser && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-1 justify-end">
              {message.attachments.map((file, idx) => (
                file.type?.startsWith("image/") && (file.dataUrl || file.content) ? (
                  <InlineImage
                    key={idx}
                    src={file.dataUrl || `data:${file.mime_type || file.type};base64,${file.content}`}
                    alt={file.name}
                  />
                ) : (
                  <FileAttachmentChip key={idx} file={file} />
                )
              ))}
            </div>
          )}

          {/* Bubble Container */}
          <div className="w-full">
            {isEditing ? (
              <div className="flex flex-col gap-3 w-full max-w-full animate-in fade-in duration-200">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="w-full text-sm md:text-base bg-black/40 border border-white/15 rounded-xl p-4 text-sc-text focus:outline-none focus:border-sc-accent/50 resize-y min-h-[180px] leading-relaxed shadow-inner"
                  autoFocus
                />
              </div>
            ) : isUser ? (
              <div className={cn(
                "rounded-2xl px-5 py-3 shadow-sm border rounded-br-sm text-[10.5px] md:text-[10.5px] font-semibold text-white max-w-fit ml-auto transition-all duration-300",
                message.status === "queued"
                  ? "bg-[var(--chat-bubble-user)]/60 border-amber-500/20 opacity-75 scale-[0.98] ring-1 ring-amber-500/10"
                  : "bg-[var(--chat-bubble-user)] border-white/5"
              )}>
                {message.content && <FormattedContent content={message.content} isUser={true} isStreaming={false} />}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2.5 items-start">
                {/* Thinking panel — rendered before the main content */}
                {!isUser && message.thinking && (
                  <ThinkingPanel
                    thinking={message.thinking}
                    isStreaming={isStreaming}
                  />
                )}

                {message.content && (
                  <FormattedContent content={message.content} isUser={false} isStreaming={isStreaming} />
                )}

                {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2 w-full">
                    {message.tool_calls.map((tc) => (
                      <ToolCallIndicator key={tc.id} toolCall={tc} />
                    ))}
                  </div>
                )}

                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="mt-2 w-full">
                    <SourcesPanel sources={message.sources} />
                  </div>
                )}

                {!isUser && message.image_url && (
                  <div className="mt-2 w-full">
                    <ImageMessage imageUrl={message.image_url} />
                  </div>
                )}

                {!isUser && message.media_job_id && (
                  <div className="mt-2 w-full">
                    <VideoJobCard jobId={message.media_job_id} />
                  </div>
                )}

                {!isUser && message.status === "interrupted" && (
                  <div className="mt-3 p-3 rounded-lg border border-red-500/10 bg-red-950/10 text-xs flex items-center justify-between gap-3 select-none w-full">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Stream interrupted.</span>
                    </div>
                    {onRegenerate && isLastAssistantMessage && (
                      <button
                        onClick={onRegenerate}
                        className="text-[10px] uppercase tracking-wider font-semibold text-sc-text hover:text-sc-accent transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Actions - Separated below the bubble container */}
          {isEditing && (
            <div className="flex justify-end gap-2 text-[10px] select-none mt-1.5 w-full">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.content || "");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sc-text-muted hover:text-sc-text transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-2.5 py-1.5 rounded-lg bg-sc-accent/15 hover:bg-sc-accent/25 text-sc-accent hover:text-sc-accent-hover transition-colors font-medium cursor-pointer"
              >
                Update
              </button>
            </div>
          )}

          {/* Footer */}
          {!isEditing && (
            <div className={cn(
              "flex items-center gap-2 px-1",
              isUser ? "flex-row-reverse" : "flex-row"
            )}>
              {isUser && message.status === "queued" ? (
                <span className="flex items-center gap-1 text-[9px] text-amber-400/80 font-mono select-none animate-pulse">
                  <Clock className="h-2.5 w-2.5" />
                  queued
                </span>
              ) : (
                <span className="text-[9px] text-sc-text-muted/30 font-mono select-none">
                  {formatTime(message.created_at)}
                </span>
              )}
              {!isUser ? (
                <div className="flex items-center gap-1.5">
                  {isLastAssistantMessage && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleCopy}
                              className="p-1 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
                            >
                              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Copy
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {onRegenerate && !isStreaming && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={onRegenerate}
                                className="p-1 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Regenerate 
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                  {message.provider && (
                    <span className="text-[8px] text-sc-text-muted/20 font-mono select-none ml-1">
                      {message.provider}
                    </span>
                  )}
                </div>
              ) : (
                isLastUserMessage && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleCopy}
                            className="p-1 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
                          >
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Copy message
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {onEdit && !isEditing && (
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="p-1 rounded hover:bg-white/5 text-sc-text-muted hover:text-sc-text transition-colors cursor-pointer"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Edit message
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
        </Skeleton>
      )}
    </div>
  );
}
export default MessageBubble;
