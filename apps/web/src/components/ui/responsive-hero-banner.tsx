"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Star, ChevronRight, Play } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ResponsiveHeroBannerProps {
    backgroundImageUrl?: string;
    ctaButtonText?: string;
    ctaButtonHref?: string;
    badgeText?: string;
    badgeLabel?: string;
    title?: string;
    titleLine2?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonHref?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    partnersTitle?: string;
}

const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
    backgroundImageUrl = "/BG.avif",
    ctaButtonText = "Star Us",
    ctaButtonHref = "https://github.com",
    badgeLabel = "v1.0.0 Live",
    badgeText = "swiftClaw",
    title = "Orchestrate Complexity.",
    titleLine2 = "Scale with Confidence.",
    description = "The  autonomous agent alternative to OpenClaw for  intelligent architectural planning,Asking, Implementing & Security.",
    primaryButtonText = "GitHub Repository",
    primaryButtonHref = "https://github.com/Anupam2005-tech/swiftClaw",
    secondaryButtonText = "Read the Docs",
    secondaryButtonHref = "/docs",
    partnersTitle = "BUILDING ENTERPRISE ENGINEERING SOLUTIONS.",
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <TooltipProvider>
        <section className="w-full isolate min-h-screen overflow-hidden relative bg-black font-sans selection:bg-white/20">
            {/* Custom Animations & Gradients */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
                .text-gradient {
                    background: linear-gradient(to right bottom, #ffffff 30%, rgba(255, 255, 255, 0.4));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

            {/* Background Image with Lighter Masking */}
            <div className="absolute inset-0 z-0">
                <img
                    src={backgroundImageUrl}
                    alt="Background"
                    className="w-full h-full object-cover object-center"
                />
                {/* Lighter radial gradient just to frame the edges gently for text readability */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_rgba(0,0,0,0.7)_100%)]" />
                {/* Very subtle dark overlay */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* EXACT ORIGINAL NAVBAR (Untouched) */}
            <header className="z-10 xl:top-4 relative">
                <div className="mx-6">
                    <div className="flex items-center justify-between pt-4">
                        
                        {/* New Text & Terminal Logo */}
                        <a href="#" className="flex items-center gap-2 group">
                            <Terminal className="h-7 w-7 text-white" strokeWidth={2.5} />
                            <span className="text-xl font-bold tracking-tight text-white font-sans">
                                swiftClaw
                            </span>
                        </a>

                        <nav className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                                
                                 {/* Documentation Link */}
                                 <Link 
                                     href="/docs" 
                                     className="px-3 py-2 text-sm font-medium hover:text-white font-sans transition-colors text-white/80"
                                 >
                                     Documentation
                                 </Link>

                                {/* Star Us Button (Exact same styling as Reserve Seat) */}
                                <a
                                    href={ctaButtonHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 font-sans transition-colors"
                                >
                                    {ctaButtonText}
                                    <Star className="h-4 w-4 fill-neutral-900" />
                                </a>
                            </div>
                        </nav>

                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
                                    aria-expanded={mobileMenuOpen}
                                    aria-label="Toggle menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/90">
                                        <path d="M4 5h16" />
                                        <path d="M4 12h16" />
                                        <path d="M4 19h16" />
                                    </svg>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs rounded-xl border border-white/10 bg-[#07070C] px-4 py-2 text-sm text-white/60 leading-relaxed shadow-2xl backdrop-blur-xl">
                                {mobileMenuOpen ? "Close menu" : "Open menu"}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </header>

            {/* Main Hero Content (Premium & Sassy) */}
            <div className="z-10 relative flex flex-col justify-center min-h-[calc(100vh-6rem)]">
                <div className="max-w-7xl mx-auto px-6 py-20 w-full">
                    <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
                        
                        {/* Premium Sassy Badge */}
                        <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 border border-white/15 pr-4 pl-1 py-1 backdrop-blur-md shadow-2xl">
                            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-neutral-900 bg-white rounded-full py-1 px-3">
                                {badgeLabel}
                            </span>
                            <span className="text-sm font-medium text-neutral-200">
                                {badgeText}
                            </span>
                        </div>

                        {/* Title with Linear-style text gradient */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-transparent text-gradient mb-6 leading-[1.1]">
                            {title}
                            <br className="hidden sm:block" />
                            {titleLine2}
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                            {description}
                        </p>

                        {/* Premium Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
                            <a
                                href={primaryButtonHref}
                                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-neutral-200 w-full sm:w-auto overflow-hidden"
                            >
                                {primaryButtonText}
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href={secondaryButtonHref}
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-white/20 w-full sm:w-auto backdrop-blur-sm"
                            >
                                <Play className="h-4 w-4 text-neutral-300 group-hover:text-white transition-colors" fill="currentColor" />
                                {secondaryButtonText}
                            </a>
                        </div>
                    </div>

                    {/* Premium Marquee */}
                    <div className="mx-auto mt-32 max-w-5xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 text-center mb-10">
                            {partnersTitle}
                        </p>
                        
                        <div className="relative flex w-full overflow-hidden">
                            {/* Seamless fade edges */}
                            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent z-10" />
                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent z-10" />
                            
                            <div className="animate-marquee flex whitespace-nowrap items-center w-[200%]">
                                 {[...Array(4)].map((_, i) => (
                                     <div key={i} className="flex items-center justify-around w-1/2">
                                         <span className="text-xl md:text-2xl font-bold text-white/30 uppercase tracking-[0.15em]">Zero-Trust</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/30 uppercase tracking-[0.15em]">Sandboxed</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/30 uppercase tracking-[0.15em]">Autonomous</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/30 uppercase tracking-[0.15em]">Local-First</span>
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </TooltipProvider>
    );
};

export default ResponsiveHeroBanner;
