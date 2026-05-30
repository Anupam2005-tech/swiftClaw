import { WhatIsSection } from "@/components/landing/what-is-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { FaqSection } from "@/components/landing/faq-section";
import { InstallSection } from "@/components/landing/install-section";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { Footer } from "@/components/ui/footer-section";

function SectionDivider() {
  return (
    <div className="relative py-10 hidden md:block">
      <div className="mx-auto h-px w-3/4 bg-sc-text/10" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-sc-text-muted/30 select-none pointer-events-none">
          // SYSTEM_INDEX_MARKER_0X //
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <ResponsiveHeroBanner />

      <WhatIsSection />

      <CapabilitiesSection />

      <RoadmapSection />

      <FaqSection />

      <InstallSection />
      <Footer />
    </>
  );
}
