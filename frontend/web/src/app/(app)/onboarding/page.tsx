import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Wizard — swiftClaw",
  description: "Complete your swiftClaw workspace credentials mapping to enable agent services.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
