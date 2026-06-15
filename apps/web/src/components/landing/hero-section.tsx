"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const INSTALL_LINE = "curl -fsSL https://swiftclaw.online/install | bash";

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const terminalVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function HeroSection() {
  const [typed, setTyped] = useState("");

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
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pb-24 pt-16 sm:px-6"
    >
      <div className="mx-auto max-w-4xl text-center">
        <motion.div variants={childVariants} transition={{ duration: 0.6, ease: [0, 0, 0.58, 1] }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 font-body text-sm font-medium tracking-wide text-accent shadow-[0_0_24px_rgba(255,92,77,0.14)]">
          <span className="text-base" aria-hidden>
            🦅
          </span>
          SWIFTCLAW V1.0 IS LIVE
        </motion.div>

        <h1 className="font-body text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <motion.span variants={childVariants} transition={{ duration: 0.7, ease: [0, 0, 0.58, 1] }} className="block text-sc-text">Code like a god.</motion.span>
          <motion.span variants={childVariants} transition={{ duration: 0.7, ease: [0, 0, 0.58, 1] }} className="block bg-[linear-gradient(to_right,rgba(255,92,77,1),rgba(255,146,103,1))] bg-clip-text text-transparent">
            Supervise like a boss.
          </motion.span>
        </h1>

        <motion.p variants={childVariants} transition={{ duration: 0.6, ease: [0, 0, 0.58, 1] }} className="mx-auto mt-6 max-w-2xl font-body text-lg font-light text-sc-text-muted">
          A premium AI terminal companion with zero-trust staging. You conduct;
          swiftClaw executes in the sandbox until you approve every mutation.
        </motion.p>

        <motion.div variants={childVariants} transition={{ duration: 0.5, ease: [0, 0, 0.58, 1] }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        </motion.div>
      </div>

      <motion.div variants={terminalVariants} transition={{ duration: 0.8, ease: [0, 0, 0.58, 1], delay: 0.85 }} className="relative mx-auto mt-16 w-full max-w-2xl">
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
      </motion.div>
    </motion.section>
  );
}
