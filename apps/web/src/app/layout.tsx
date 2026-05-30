import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { GlobalBackground } from "@/components/ui/background-components";
import { VerticalMetadata } from "@/components/ui/vertical-metadata";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "swiftClaw — Code like a god. Supervise like a boss.",
  description:
    "Premium AI terminal companion with zero-trust staging, Agent/Plan/Ask modes, and Telegram remote approval.",
  openGraph: {
    title: "swiftClaw",
    description:
      "AI-powered terminal companion with human-in-the-loop staging. Install via npm, pnpm, bun, or curl.",
    url: "https://swiftclaw.dev",
    siteName: "swiftClaw",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} dark`}>
      <body className="relative min-h-screen bg-sc-canvas font-body text-sc-text">
        <VerticalMetadata />
        <GlobalBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
