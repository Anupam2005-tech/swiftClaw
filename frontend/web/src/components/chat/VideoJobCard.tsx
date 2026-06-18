"use client";

import React from "react";
import { useMediaJob } from "../../lib/hooks/useMediaJob";
import { ProgressBar } from "../ui/progress-bar";
import { Spinner } from "../ui/spinner";
import { Video, AlertCircle, Download, Film } from "lucide-react";
import { Button } from "../ui/button";

interface VideoJobCardProps {
  jobId: string;
}

export function VideoJobCard({ jobId }: VideoJobCardProps) {
  const { job, error } = useMediaJob(jobId);

  const handleDownload = () => {
    if (job?.url) {
      window.open(job.url, "_blank");
    }
  };

  // 1. Error state
  if (error || job?.status === "failed") {
    return (
      <div className="my-3 p-4 rounded-lg border border-red-500/10 bg-red-950/10 text-xs flex gap-3 max-w-md">
        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-red-400 uppercase tracking-wider text-[9px]">
            Video Generation Failed
          </span>
          <p className="text-sc-text-muted leading-relaxed">
            {error || job?.error || "Rendering pipeline encountered a processing error."}
          </p>
        </div>
      </div>
    );
  }

  // 2. Loading initial job info
  if (!job) {
    return (
      <div className="my-3 p-5 rounded-lg border border-white/5 bg-black/40 flex items-center gap-4 max-w-sm">
        <Spinner size="sm" className="border-t-transparent border-sc-text/40" />
        <span className="text-xs font-mono text-sc-text-muted">Contacting video pipeline...</span>
      </div>
    );
  }

  // 3. Queued state
  if (job.status === "queued") {
    return (
      <div className="my-3 p-5 rounded-lg border border-white/5 bg-black/40 flex flex-col gap-3 max-w-md animate-pulse">
        <div className="flex items-center gap-3">
          <Spinner size="sm" className="border-t-transparent border-sc-text/50" />
          <span className="text-xs font-semibold text-sc-text tracking-wide uppercase font-mono">
            Job Queued
          </span>
        </div>
        <p className="text-[10px] text-sc-text-muted leading-normal">
          Waiting for visual synthesis GPU worker slot allocation. This usually takes under 5 seconds...
        </p>
      </div>
    );
  }

  // 4. Processing state
  if (job.status === "processing") {
    const progress = job.progress || 0;
    return (
      <div className="my-3 p-5 rounded-lg border border-white/5 bg-black/40 flex flex-col gap-3.5 max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="h-4 w-4 text-sc-accent animate-spin shrink-0" />
            <span className="text-xs font-semibold text-sc-text tracking-wide font-mono">
              Rendering Video
            </span>
          </div>
          <span className="text-[10px] font-mono text-sc-accent font-bold">{progress}%</span>
        </div>
        
        <ProgressBar progress={progress} />

        <p className="text-[10px] text-sc-text-muted leading-normal font-mono">
          Compiling latent frames using NVIDIA Cosmos Video foundation pipelines...
        </p>
      </div>
    );
  }

  // 5. Done state (HTML5 Player)
  return (
    <div className="my-3 flex flex-col gap-2.5 max-w-lg select-none">
      {/* Premium Video Frame */}
      <div className="rounded-lg border border-white/10 overflow-hidden bg-black shadow-2xl relative group">
        <video
          src={job.url}
          controls
          autoPlay
          loop
          className="w-full h-auto max-h-[320px] object-cover"
        />

        {/* Floating download button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="h-8 w-8 border-white/20 bg-black/80 hover:bg-black text-sc-text cursor-pointer"
            title="Open in new tab"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-sc-text-muted uppercase tracking-wider font-mono">
          Job Completed (via NVIDIA)
        </span>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 text-[10px] text-sc-text hover:text-sc-accent font-semibold transition-colors cursor-pointer"
        >
          Open Link
        </button>
      </div>
    </div>
  );
}
export default VideoJobCard;
