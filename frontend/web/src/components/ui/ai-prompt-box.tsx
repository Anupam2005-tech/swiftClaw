import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUp, Paperclip, X, Square, Image, FileText, Compass, ChevronRight, Sparkles, Plus, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-sm text-[var(--prompt-text)] placeholder:text-[var(--prompt-placeholder)] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
      className
    )}
    ref={ref}
    rows={1}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-white/10 bg-[#1A1A1A] px-3 py-1.5 text-xs text-white/80 shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Dialog
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#0D0D0D] p-0 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 hover:bg-black/80 transition-all">
        <X className="h-5 w-5 text-white/70" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Button
const iconButtonClass = "flex h-8 w-8 items-center justify-center rounded-full transition-colors text-white/40 hover:text-white/70 hover:bg-white/5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

// PromptInput Context
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
  userMessages?: string[];
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
  userMessages: undefined,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

// PromptInput Container
interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  userMessages?: string[];
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false, onDragOver, onDragLeave, onDrop, userMessages }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider value={{ isLoading, value: value ?? internalValue, setValue: onValueChange ?? handleChange, maxHeight, onSubmit, disabled, userMessages }}>
          <div
            ref={ref}
            className={cn(
              "rounded-2xl border border-[var(--prompt-border)] bg-[var(--prompt-bg)] p-2 shadow-lg transition-all duration-200",
              "focus-within:border-[var(--prompt-border-focus)]",
              className
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

// Textarea with autosize
interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
}
const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled, userMessages } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [draft, setDraft] = React.useState<string>("");

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp" && userMessages && userMessages.length > 0 && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < userMessages.length) {
        if (historyIndex === -1) {
          setDraft(value);
        }
        setHistoryIndex(nextIndex);
        setValue(userMessages[userMessages.length - 1 - nextIndex]);
      }
    } else if (e.key === "ArrowDown" && userMessages && userMessages.length > 0 && historyIndex > -1) {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      if (nextIndex === -1) {
        setValue(draft);
      } else {
        setValue(userMessages[userMessages.length - 1 - nextIndex]);
      }
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        setHistoryIndex(-1);
      }}
      onKeyDown={handleKeyDown}
      className={cn("text-sm", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

// Actions container
const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center justify-between gap-2 pt-2", className)} {...props}>
    {children}
  </div>
);

// Action tooltip wrapper
interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({ tooltip, children, className, side = "top", ...props }) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger disabled={disabled} asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className={className}>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

// Image Preview Dialog
interface ImageViewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-[#0D0D0D] rounded-2xl overflow-hidden shadow-2xl"
        >
          <img src={imageUrl} alt="Full preview" className="w-full max-h-[80vh] object-contain rounded-2xl" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// ─── MAIN PROMPTINPUTBOX ───

interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  userMessages?: string[];
}

interface PromptAttachment {
  id: string;
  type: "image" | "file" | "plan";
  name: string;
  size?: number;
  previewUrl?: string;
  content?: string; // e.g. plan details
  file?: File;
}

export const PromptInputBox = React.forwardRef((props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
  const { onSend = () => {}, onStop, isLoading = false, placeholder = "Type your message...", className, userMessages } = props;
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<PromptAttachment[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const promptBoxRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddImage = React.useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) return;
    const id = Math.random().toString(36).substring(7);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachments(prev => [
        ...prev,
        {
          id,
          type: "image",
          name: file.name,
          size: file.size,
          previewUrl: e.target?.result as string,
          file,
        }
      ]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAddFile = React.useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) return;
    const id = Math.random().toString(36).substring(7);
    setAttachments(prev => [
      ...prev,
      {
        id,
        type: "file",
        name: file.name,
        size: file.size,
        file,
      }
    ]);
  }, []);

  const handleAddPlan = (name: string, content: string) => {
    setDropdownOpen(false);
    const id = Math.random().toString(36).substring(7);
    setAttachments(prev => [
      ...prev.filter(a => a.type !== "plan"),
      {
        id,
        type: "plan",
        name,
        content,
      }
    ]);
  };

  const processFile = React.useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      handleAddImage(file);
    } else {
      handleAddFile(file);
    }
  }, [handleAddImage, handleAddFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      processFile(dropped[0]);
    }
  };

  const handlePaste = React.useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("file") !== -1) {
        const file = items[i].getAsFile();
        if (file) { e.preventDefault(); processFile(file); break; }
      }
    }
  }, [processFile]);

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleSubmit = () => {
    let finalPrompt = input;
    const planAttachment = attachments.find(a => a.type === "plan");
    if (planAttachment && planAttachment.content) {
      finalPrompt = `${finalPrompt}\n\n[Attached Plan: ${planAttachment.name}]\n${planAttachment.content}`;
    }
    
    const imageAndFiles = attachments
      .filter(a => a.type !== "plan" && a.file)
      .map(a => a.file as File);

    if (finalPrompt.trim() || attachments.length > 0) {
      onSend(finalPrompt, imageAndFiles);
      setInput("");
      setAttachments([]);
    }
  };

  const hasContent = input.trim() !== "" || attachments.length > 0;

  return (
    <>
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn("prompt-input-box w-full relative", className)}
        disabled={false}
        ref={ref || promptBoxRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        userMessages={userMessages}
      >
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2 px-3 pt-1 border-b border-white/[0.04]">
            {attachments.map((att) => (
              <div
                key={att.id}
                className={cn(
                  "relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border backdrop-blur-md transition-all select-none animate-in fade-in zoom-in-95 duration-200",
                  att.type === "image" && "bg-white/[0.02] border-white/10 hover:border-white/20",
                  att.type === "file" && "bg-white/[0.02] border-white/10 hover:border-white/20 text-sc-text-muted hover:text-sc-text",
                  att.type === "plan" && "bg-purple-500/10 border-purple-500/20 text-purple-200 hover:border-purple-500/30"
                )}
              >
                {att.type === "image" && att.previewUrl && (
                  <div
                    className="w-5 h-5 rounded-md overflow-hidden cursor-pointer shrink-0"
                    onClick={() => setSelectedImage(att.previewUrl || null)}
                  >
                    <img src={att.previewUrl} alt={att.name} className="h-full w-full object-cover" />
                  </div>
                )}
                {att.type === "file" && <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                {att.type === "plan" && <Compass className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                
                <span className="max-w-[120px] truncate font-medium">
                  {att.name}
                </span>

                {att.size && (
                  <span className="text-[9px] text-sc-text-muted/60 font-mono">
                    ({(att.size / 1024).toFixed(0)} KB)
                  </span>
                )}

                <button
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                  className="rounded-full bg-white/5 p-0.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <PromptInputTextarea placeholder={placeholder} className="text-sm" />

        {/* Actions bar */}
        <PromptInputActions>
          {/* Dropdown Container */}
          <div className="flex items-center gap-1 relative" ref={dropdownRef}>
            <PromptInputAction tooltip="Attachments">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  iconButtonClass,
                  dropdownOpen && "bg-white/10 text-white/90"
                )}
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </PromptInputAction>

            {/* Hidden Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAddImage(e.target.files[0]);
                if (e.target) e.target.value = "";
              }}
              accept="image/*"
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAddFile(e.target.files[0]);
                if (e.target) e.target.value = "";
              }}
              accept=".pdf,.doc,.docx,.txt,.csv,.json,.md"
            />

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute bottom-full left-0 mb-2 z-50 w-52 rounded-2xl border border-white/[0.06] bg-[#09090C]/95 backdrop-blur-xl p-1.5 shadow-2xl flex flex-col gap-0.5"
                >
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      imageInputRef.current?.click();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-sc-text-muted hover:text-sc-text hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <Image className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="flex-1">Upload Image</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-sc-text-muted hover:text-sc-text hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="flex-1">Upload File</span>
                  </button>

                  <div className="h-px bg-white/[0.04] my-1" />

                  <div className="px-3 py-1 text-[8px] uppercase tracking-wider font-semibold text-sc-text-muted/40 font-mono">
                    Plans & Templates
                  </div>

                  <button
                    onClick={() => handleAddPlan("Architecture Plan", "Create a comprehensive architectural blueprint detailing system modules, data flow, and deployment topology.")}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl text-sc-text-muted hover:text-sc-text hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">Architecture Plan</span>
                      <span className="text-[8px] text-sc-text-muted/40 truncate w-36 leading-none">System modules blueprint</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddPlan("Implementation Plan", "Define a step-by-step checklist, database migrations, security controls, and testing strategies for development.")}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl text-sc-text-muted hover:text-sc-text hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">Implementation Plan</span>
                      <span className="text-[8px] text-sc-text-muted/40 truncate w-36 leading-none">Checklist & security flow</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAddPlan("Research Plan", "Establish a comparative matrix of tools, benchmark criteria, reference papers, and feasibility studies.")}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl text-sc-text-muted hover:text-sc-text hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium leading-tight">Research Plan</span>
                      <span className="text-[8px] text-sc-text-muted/40 truncate w-36 leading-none">Benchmarks & comparisons</span>
                    </div>
                  </button>

                  <div className="h-px bg-white/[0.04] my-1" />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        disabled
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl text-sc-text-muted/40 opacity-40 cursor-not-allowed select-none w-full text-left"
                      >
                        <Cpu className="h-3.5 w-3.5 text-cyan-400/50 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">MCP Server</span>
                          <span className="text-[8px] text-white/20 truncate w-36 leading-none">Coming soon</span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      MCP connections coming soon
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            {isLoading && (
              <PromptInputAction tooltip="Stop generation">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 cursor-pointer"
                  onClick={onStop}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              </PromptInputAction>
            )}

            <PromptInputAction tooltip="Send message">
              <button
                type="button"
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer",
                  hasContent
                    ? "bg-[var(--prompt-send-bg)] text-[var(--prompt-send-text)] hover:opacity-90"
                    : "bg-[var(--prompt-button-bg)] text-white/40"
                )}
                onClick={() => {
                  if (hasContent) handleSubmit();
                }}
                disabled={!hasContent}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </PromptInputAction>
          </div>
        </PromptInputActions>
      </PromptInput>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
});
PromptInputBox.displayName = "PromptInputBox";
