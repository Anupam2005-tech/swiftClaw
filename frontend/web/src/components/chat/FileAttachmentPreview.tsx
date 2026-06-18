"use client";

import React from "react";
import { FileAttachment } from "../../lib/types/conversation";
import { X, FileText, FileImage, FileCode } from "lucide-react";

interface FileAttachmentPreviewProps {
  files: FileAttachment[];
  onRemove: (index: number) => void;
}

export function FileAttachmentPreview({ files, onRemove }: FileAttachmentPreviewProps) {
  if (files.length === 0) return null;

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.includes("javascript") || type.includes("typescript") || type.includes("json")) {
      return FileCode;
    }
    return FileText;
  };

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-white/5 bg-white/[0.005] animate-in slide-in-from-bottom-1 duration-200">
      {files.map((file, idx) => {
        const Icon = getIcon(file.type);
        return (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-md border border-white/10 bg-black/40 text-xs shrink-0 select-none"
          >
            {file.dataUrl && file.type.startsWith("image/") ? (
              <img src={file.dataUrl} alt="preview" className="h-5 w-5 rounded object-cover shrink-0" />
            ) : (
              <Icon className="h-3.5 w-3.5 text-sc-text-muted shrink-0" />
            )}
            <span className="truncate max-w-[120px] font-medium text-sc-text">{file.name}</span>
            
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-1 rounded text-sc-text-muted hover:text-sc-text hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
export default FileAttachmentPreview;
