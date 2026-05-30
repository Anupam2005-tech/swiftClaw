import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const GlobalBackground = dynamic(
  () => import("@/components/ui/background-components").then((m) => m.GlobalBackground)
);
const VerticalMetadata = dynamic(
  () => import("@/components/ui/vertical-metadata").then((m) => m.VerticalMetadata)
);
const RecaptchaBadge = dynamic(
  () => import("@/components/ui/recaptcha-badge").then((m) => m.RecaptchaBadge)
);

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
    url: "https://swiftclaw.online",
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
        <RecaptchaBadge />
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
