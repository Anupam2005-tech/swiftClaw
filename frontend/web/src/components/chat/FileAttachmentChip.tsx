"use client";

import React from "react";
import { FileText, FileImage, FileCode, Paperclip } from "lucide-react";
import { FileAttachment } from "../../lib/types/conversation";

interface FileAttachmentChipProps {
  file: FileAttachment;
}

export function FileAttachmentChip({ file }: FileAttachmentChipProps) {
  // Format size helper
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getIcon = () => {
    if (file.type.startsWith("image/")) return FileImage;
    if (file.type.includes("javascript") || file.type.includes("typescript") || file.type.includes("json") || file.type.includes("css") || file.type.includes("html")) {
      return FileCode;
    }
    return FileText;
  };

  const Icon = getIcon();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-xs max-w-[200px] shrink-0 font-medium select-none">
      <Icon className="h-4 w-4 text-sc-text-muted/70 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="truncate block font-semibold text-sc-text">{file.name}</span>
        <span className="text-[9px] text-sc-text-muted/50 block font-mono">
          {formatSize(file.size)}
        </span>
      </div>
    </div>
  );
}
export default FileAttachmentChip;
