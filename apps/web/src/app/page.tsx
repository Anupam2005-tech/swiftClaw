import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { WhatIsSection } from "@/components/landing/what-is-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { RoadmapSection } from "@/components/landing/roadmap-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import { Footer } from "@/components/ui/footer-section";
import { WavePath } from "@/components/ui/wave-path";
import { LoadingWrapper } from "@/components/landing/loading-wrapper";

export default function Home() {
  return (
    <LoadingWrapper>
      <ResponsiveHeroBanner />

      <ScrollReveal variant="fadeUp">
        <WhatIsSection />
      </ScrollReveal>

      <ScrollReveal variant="slideUp" delay={0.1}>
        <CapabilitiesSection />
      </ScrollReveal>

      <ScrollReveal variant="fadeUp" delay={0.05}>
        <RoadmapSection />
      </ScrollReveal>

      <ScrollReveal variant="fadeUp" delay={0.05}>
        <FaqSection />
      </ScrollReveal>

      <ScrollReveal variant="scaleIn" delay={0.1}>
        <CtaSection />
      </ScrollReveal>

      <WavePath/>

      <ScrollReveal variant="fadeIn" delay={0.05}>
        <Footer />
      </ScrollReveal>
    </LoadingWrapper>
  );
}
