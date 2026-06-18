"use client";

import React, { useState } from "react";
import { Download, ZoomIn, X } from "lucide-react";
import { Button } from "../ui/button";

interface ImageMessageProps {
  imageUrl: string;
}

export function ImageMessage({ imageUrl }: ImageMessageProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `swiftclaw-generated-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback direct open
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-lg mt-2 relative select-none">
      {/* Thumbnail Container */}
      <div className="group relative rounded-lg border border-white/10 overflow-hidden bg-black/40 shadow-lg cursor-zoom-in">
        <img
          src={imageUrl}
          alt="Generated Image Result"
          onClick={() => setFullscreen(true)}
          className="w-full h-auto max-h-[320px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Hover overlay buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFullscreen(true)}
            className="h-10 w-10 border-white/20 bg-black/80 hover:bg-black text-sc-text cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="h-10 w-10 border-white/20 bg-black/80 hover:bg-black text-sc-text cursor-pointer"
            title="Download Image"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setFullscreen(false)} />
          
          <div className="relative z-10 max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setFullscreen(false)}
              className="absolute -top-12 right-0 p-2 text-sc-text-muted hover:text-sc-text bg-white/5 rounded-full cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <img
              src={imageUrl}
              alt="Fullscreen View"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg border border-white/10"
            />

            <Button
              onClick={handleDownload}
              className="mt-4 bg-sc-accent text-accent-foreground font-semibold flex items-center gap-2 cursor-pointer hover:bg-sc-accent/90"
            >
              <Download className="h-4 w-4" />
              Download Full Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ImageMessage;
