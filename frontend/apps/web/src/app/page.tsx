import { WhatIsSection } from "@/components/landing/what-is-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { Footer } from "@/components/ui/footer-section";
import { LoadingWrapper } from "@/components/landing/loading-wrapper";

export default function Home() {
  return (
    <LoadingWrapper>
      <ResponsiveHeroBanner />
      <WhatIsSection />
      <CapabilitiesSection />
      <RoadmapSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </LoadingWrapper>
  );
}
