"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const INSTALL_LINE = "curl -fsSL https://swiftclaw.dev/install | bash";

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { opacity: 0, y: 24, duration: 0.6 })
        .from(".hero-title-line", { opacity: 0, y: 40, stagger: 0.12, duration: 0.7 }, "-=0.35")
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 16, duration: 0.5 }, "-=0.25")
        .from(".hero-terminal", { opacity: 0, y: 30, scale: 0.98, duration: 0.8 }, "-=0.2");
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(INSTALL_LINE.slice(0, i));
      if (i >= INSTALL_LINE.length) window.clearInterval(id);
    }, 35);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pb-24 pt-16 sm:px-6"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 font-body text-sm font-medium tracking-wide text-accent shadow-[0_0_24px_rgba(255,92,77,0.14)]">
          <span className="text-base" aria-hidden>
            🦅
          </span>
          SWIFTCLAW V1.0 IS LIVE
        </div>

        <h1 className="font-body text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="hero-title-line block text-sc-text">Code like a god.</span>
          <span className="hero-title-line block bg-[linear-gradient(to_right,rgba(255,92,77,1),rgba(255,146,103,1))] bg-clip-text text-transparent">
            Supervise like a boss.
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-6 max-w-2xl font-body text-lg font-light text-sc-text-muted">
          A premium AI terminal companion with zero-trust staging. You conduct;
          swiftClaw executes in the sandbox until you approve every mutation.
        </p>

        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="border border-accent bg-accent font-body uppercase tracking-widest text-accent-foreground hover:bg-accent/90"
          >
            <Link href="#install">Install CLI</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="font-body uppercase tracking-widest text-sc-text-muted hover:bg-accent/10 hover:text-accent"
          >
            <Link href="#capabilities">See capabilities</Link>
          </Button>
        </div>
      </div>

      <div className="hero-terminal relative mx-auto mt-16 w-full max-w-2xl">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-2xl border-2 border-accent/30 bg-[#13131A] shadow-[0_12px_48px_rgba(255,92,77,0.25)]"
        >
          <div className="flex items-center gap-2 border-b border-accent/20 bg-[#1B1B23] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="h-3 w-3 rounded-full bg-accent/70" />
            <span className="h-3 w-3 rounded-full bg-accent/30" />
            <span className="ml-2 font-body text-xs text-sc-text-muted">swiftclaw — install</span>
          </div>
          <pre className="overflow-x-auto bg-[#13131A] p-6 font-body text-sm text-accent scrollbar-none">
            <span className="text-sc-text-muted">$ </span>
            {typed}
            <span className="animate-pulse text-accent">▌</span>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
