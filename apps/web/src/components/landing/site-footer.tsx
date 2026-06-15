"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollReveal, ScrollSection } from "@/components/landing/scroll-reveal";
import { useRecaptcha } from "@/lib/use-recaptcha";

const FOOTER_LINKS = [
  {
    label: "Product",
    links: [
      { title: "Capabilities", href: "#capabilities" },
      { title: "Install", href: "#install" },
      { title: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "FAQ", href: "#faq" },
      { title: "GitHub", href: "https://github.com/anupam/swiftClaw" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error" | "success">("idle");
  const { isReady, isConfigured, verifyWithBackend } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "verifying") return;

    const mailtoUrl = `mailto:hello@swiftclaw.online?subject=Subscribe&body=${encodeURIComponent(email)}`;

    if (!isReady) {
      window.location.href = mailtoUrl;
      return;
    }

    setStatus("verifying");

    const valid = await verifyWithBackend("newsletter_subscribe");

    if (!valid) {
      window.location.href = mailtoUrl;
      setStatus("idle");
      setEmail("");
      return;
    }

    setStatus("success");
    window.location.href = mailtoUrl;
    setTimeout(() => setStatus("idle"), 3000);
    setEmail("");
  };

  return (
    <ScrollSection className="relative mt-24">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-linear-to-b from-transparent via-sc-text/10 to-sc-text/20"
        aria-hidden
      />

      <div className="relative border-t border-sc-burgundy/20 bg-sc-surface px-4 py-16 sm:px-6">
        <div className="pointer-events-none hidden md:block absolute right-4 top-4 text-[9px] uppercase tracking-[0.25em] text-[#000000]/30 font-mono select-none">
          MODE // ZERO-TRUST_STAGING
        </div>
        <div className="mx-auto max-w-4xl">
          <div className="pointer-events-none hidden md:block absolute left-4 top-4 text-[9px] uppercase tracking-[0.25em] text-[#000000]/30 font-mono select-none">
            SYS.VER // 1.0.0-STABLE
          </div>
          <ScrollReveal>
            <div className="mb-12 rounded-xl border border-[#800020]/40 bg-sc-surface p-6">
              <label htmlFor="newsletter" className="font-body text-sm text-accent">
                {">"} root@swiftclaw: enter_email --subscribe
              </label>
              <form
                className="mt-3 flex flex-col gap-3 sm:flex-row"
                onSubmit={handleSubmit}
              >
                <input
                  id="newsletter"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 rounded-lg border border-sc-burgundy/40 bg-card px-4 py-3 font-body text-sm text-sc-text placeholder:text-sc-text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  disabled={isConfigured && !isReady}
                  className="rounded-lg border border-accent bg-accent px-6 py-3 font-body text-sm font-medium uppercase tracking-widest text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConfigured && !isReady ? "Loading..." : "Subscribe"}
                </button>
              </form>
              {status === "verifying" && (
                <p className="mt-2 font-mono text-[10px] text-accent/70">Verifying... </p>
              )}
              {status === "error" && (
                <p className="mt-2 font-mono text-[10px] text-red-400/70">Verification failed. Please try again.</p>
              )}
              {status === "success" && (
                <p className="mt-2 font-mono text-[10px] text-green-400/70">Opening mail client...</p>
              )}
            </div>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2">
            {FOOTER_LINKS.map((section, i) => (
              <ScrollReveal key={section.label} delay={0.08 + i * 0.06}>
                <div>
                  <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-[#FFFDF9]">
                    {section.label}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          className="font-body text-sm font-light text-sc-text-muted transition-colors hover:text-[#FFFDF9]"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2} className="mt-12 text-center font-body text-xs text-sc-text-muted/70">
            Built with arrogance and precision · swiftClaw v1.0
          </ScrollReveal>
        </div>
      </div>
    </ScrollSection>
  );
}
