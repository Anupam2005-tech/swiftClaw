import { FullScreenSignup } from "@/components/ui/full-screen-signup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — swiftClaw",
  description: "Sign in to your swiftClaw workspace using Google, GitHub, or Email credentials.",
};

export default function LoginPage() {
  return <FullScreenSignup />;
}
