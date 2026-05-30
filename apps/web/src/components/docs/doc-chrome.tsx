"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function DocBreadcrumb({ section, page }: { section: string; page: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFFDF9]/40 select-none">
      <span>{section}</span>
      <ArrowRight className="h-3 w-3 opacity-30" />
      <span className="text-[#FFFDF9]/80">{page}</span>
    </div>
  );
}

export function DocHeader({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <header className="space-y-4 border-b border-[#FFFDF9]/10 pb-8">
      <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#FFFDF9]">{title}</h1>
      <div className="font-body text-base font-light leading-relaxed text-[#FFFDF9]/60 max-w-2xl">{children}</div>
    </header>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold text-[#FFFDF9]">{title}</h2>
      <div className="space-y-3 font-body text-sm font-light leading-relaxed text-[#FFFDF9]/60">{children}</div>
    </section>
  );
}

export function DocCallout({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l border-[#FFFDF9]/50 bg-[#FFFDF9]/[0.06] p-4 rounded-r-xl">
      <div className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/70">{children}</div>
    </blockquote>
  );
}

export function CopyBlock({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
    <div className="space-y-2">
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFFDF9]/40">{label}</span>
      )}
      <div className="relative overflow-hidden rounded-xl border border-[#FFFDF9]/15 bg-[#050505] p-4 pr-14">
        <pre className="font-mono text-xs sm:text-sm text-[#FFFDF9] overflow-x-auto whitespace-pre-wrap break-all">
          <span className="text-[#FFFDF9]/30 select-none">$ </span>
          {command}
        </pre>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFFDF9]/10 bg-[#FFFDF9]/5 text-[#FFFDF9]/40 transition-all hover:border-[#FFFDF9]/30 hover:text-[#FFFDF9]",
              )}
              aria-label="Copy command"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8} className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
            {copied ? "Copied!" : "Copy to clipboard"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}

export function StepList({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="space-y-6 border-l border-[#FFFDF9]/10 pl-6">
      {steps.map((step, i) => (
        <li key={step.title} className="relative">
          <span className="absolute -left-[1.85rem] flex h-6 w-6 items-center justify-center rounded-full border border-[#FFFDF9]/20 bg-[#0A0A0A] font-mono text-[10px] font-bold text-[#FFFDF9]/60">
            {i + 1}
          </span>
          <h3 className="font-display text-sm font-bold text-[#FFFDF9] mb-1">{step.title}</h3>
          <div className="font-body text-xs font-light leading-relaxed text-[#FFFDF9]/55">{step.body}</div>
        </li>
      ))}
    </ol>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#FFFDF9]/10">
      <table className="w-full text-left font-body text-xs">
        <thead>
          <tr className="border-b border-[#FFFDF9]/10 bg-[#FFFDF9]/[0.03]">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-[#FFFDF9]/50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#FFFDF9]/5 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#FFFDF9]/70 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
