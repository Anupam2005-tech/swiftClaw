import { cn } from "@/lib/utils";

/** Boneyard-style skeleton primitive. Pulse animation out of the box. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#FFFDF9]/10", className)}
      {...props}
    />
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
