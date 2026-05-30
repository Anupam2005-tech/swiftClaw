"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Star } from 'lucide-react';

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
    backgroundImageUrl = "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0e2dbea0-c0a9-413f-a57b-af279633c0df_3840w.jpg",
    ctaButtonText = "Star Us",
    ctaButtonHref = "https://github.com",
    badgeLabel = "Live",
    badgeText = "swiftClaw v1.0.0 is Released",
    title = "Code Like a God.",
    titleLine2 = "Supervise Like a Boss.",
    description = "The autonomous terminal agent that never overwrites your directories behind your back. Fully sandboxed, entirely zero-trust, and delightfully sassy.",
    primaryButtonText = "View on GitHub",
    primaryButtonHref = "https://github.com",
    secondaryButtonText = "Read the Docs",
    secondaryButtonHref = "/docs",
    partnersTitle = "BUILT FOR THE 10X ENGINEER. TOLERATED BY DEVOPS.",
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <section className="w-full isolate min-h-screen overflow-hidden relative">
            {/* Inline style for the marquee animation to ensure it works without Tailwind config changes */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>

            <img
                src={backgroundImageUrl}
                alt=""
                className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

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
                    </div>
                </div>
            </header>

            <div className="z-10 relative">
                <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-28 px-6 pb-16">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
                            <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2 font-sans">
                                {badgeLabel}
                            </span>
                            <span className="text-sm font-medium text-white/90 font-sans">
                                {badgeText}
                            </span>
                        </div>

                        <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-instrument-serif font-normal animate-fade-slide-in-2">
                            {title}
                            <br className="hidden sm:block" />
                            {titleLine2}
                        </h1>

                        <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto">
                            {description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
                            <a
                                href={primaryButtonHref}
                                className="inline-flex items-center gap-2 hover:bg-white/15 text-sm font-medium text-white bg-white/10 ring-white/15 ring-1 rounded-full py-3 px-5 font-sans transition-colors"
                            >
                                {primaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href={secondaryButtonHref}
                                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-medium text-white/90 hover:text-white font-sans transition-colors"
                            >
                                {secondaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="mx-auto mt-24 max-w-5xl overflow-hidden">
                        <p className="animate-fade-slide-in-1 text-xs font-bold uppercase tracking-widest text-white/50 text-center mb-8 font-sans">
                            {partnersTitle}
                        </p>
                        
                        {/* Premium Marquee Replacement */}
                        <div className="relative flex w-full overflow-hidden animate-fade-slide-in-2 mask-image-linear">
                            {/* Mask gradient for smooth fade on edges */}
                            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/50 to-transparent z-10" />
                            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/50 to-transparent z-10" />
                            
                            <div className="animate-marquee flex whitespace-nowrap items-center w-[200%]">
                                 {[...Array(4)].map((_, i) => (
                                     <div key={i} className="flex items-center justify-around w-1/2">
                                         <span className="text-xl md:text-2xl font-bold text-white/20 uppercase tracking-[0.2em] font-sans">Zero-Trust</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/20 uppercase tracking-[0.2em] font-sans">Sandboxed</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/20 uppercase tracking-[0.2em] font-sans">Autonomous</span>
                                         <span className="text-xl md:text-2xl font-bold text-white/20 uppercase tracking-[0.2em] font-sans">Local-First</span>
                                     </div>
                                 ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResponsiveHeroBanner;