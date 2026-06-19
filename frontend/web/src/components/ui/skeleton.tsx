import { cn } from "@/lib/utils";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  name?: string;
  animate?: "pulse" | "shimmer" | "solid" | boolean;
  fallback?: React.ReactNode;
}

/** Boneyard-style skeleton primitive with intelligent dynamic layouts. */
export function Skeleton({
  className,
  loading,
  name,
  animate = "pulse",
  fallback,
  children,
  ...props
}: SkeletonProps) {
  // If loading is undefined, treat it as a standard inline skeleton element (compat with shadcn/ui)
  if (loading === undefined) {
    return (
      <div
        className={cn("animate-pulse rounded-md bg-[#FFFDF9]/10", className)}
        {...props}
      />
    );
  }

  // If loading is false, render children normally
  if (!loading) {
    return <>{children}</>;
  }

  // If loading is true, render a dynamic skeleton layout or mask based on name
  if (name === "conversation-list") {
    return (
      <div className={cn("w-full flex-1 flex flex-col min-h-0 overflow-hidden", className)}>
        <div className="flex flex-col gap-1 w-full px-2 py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="h-7 w-7 rounded-full bg-white/5 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-3 bg-white/10 rounded w-[60%] animate-pulse" />
                <div className="h-2.5 bg-white/5 rounded w-[35%] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (name === "api-key-list") {
    return (
      <div className={cn("space-y-3 w-full", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-28 animate-pulse" />
              <div className="h-3 bg-white/5 rounded w-48 animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-white/10 rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (name === "chat-window") {
    return (
      <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden relative bg-black", className)}>
        {/* Header */}
        <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-transparent">
          <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
          <div className="h-7 w-24 bg-white/5 rounded-md animate-pulse" />
        </div>
        {/* Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          <div className="flex gap-3 max-w-[70%]">
            <div className="h-7 w-7 rounded-lg bg-white/10 shrink-0 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-white/10 rounded w-[80%] animate-pulse" />
              <div className="h-3.5 bg-white/5 rounded w-[60%] animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 max-w-[70%] ml-auto justify-end">
            <div className="space-y-2">
              <div className="h-3.5 bg-white/10 rounded w-40 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 max-w-[70%]">
            <div className="h-7 w-7 rounded-lg bg-white/10 shrink-0 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-white/10 rounded w-[90%] animate-pulse" />
              <div className="h-3.5 bg-white/5 rounded w-[75%] animate-pulse" />
            </div>
          </div>
        </div>
        {/* Footer input */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="h-12 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  // Default: mask children with the dynamic skeleton class
  return (
    <div className={cn("boneyard-dynamic-skeleton", className)} {...props}>
      {fallback ?? children}
    </div>
  );
}

/** Text line skeleton — mimics a line of text at a given width percentage. */
export function SkeletonText({ className, width = "100%", ...props }: React.HTMLAttributes<HTMLDivElement> & { width?: string }) {
  return (
    <Skeleton className={cn("h-4", className)} style={{ width }} {...props} />
  );
}

/** Card skeleton — common pattern for loading card layouts. */
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-[#FFFDF9]/10 bg-[#0A0A0A] p-4 space-y-3", className)} {...props}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <SkeletonText width="75%" />
      <SkeletonText width="50%" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

/** Skeleton for a doc page content block. */
export function SkeletonDoc({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 p-6", className)} {...props}>
      <Skeleton className="h-8 w-64 rounded-md" />
      <SkeletonText width="90%" />
      <SkeletonText width="75%" />
      <SkeletonText width="85%" />
      <div className="pt-4 space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <SkeletonText width="60%" />
        <SkeletonText width="40%" />
      </div>
    </div>
  );
}

/** Page-level skeleton for routes that load heavy components. */
export function SkeletonPage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-in fade-in duration-500", className)} {...props}>
      <Skeleton className="h-12 w-48 rounded-md mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="mt-8 space-y-4">
        <SkeletonText width="70%" />
        <SkeletonText width="90%" />
        <SkeletonText width="55%" />
      </div>
    </div>
  );
}
