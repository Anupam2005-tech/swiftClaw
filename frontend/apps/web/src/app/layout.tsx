import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { CustomCursor } from "@/components/ui/cursor";

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
  title: "swiftClaw — AI Terminal Companion",
  description:
    "Premium AI terminal companion with zero-trust staging, Agent/Plan/Ask modes, and Telegram remote approval. Install via npm, Docker, or Homebrew.",
  keywords: ["AI", "terminal", "CLI", "developer tools", "zero-trust", "agent", "open source"],
  authors: [{ name: "anupam", url: "https://github.com/anupam" }],
  creator: "anupam",
  publisher: "swiftClaw",
  metadataBase: new URL("https://swiftclaw.online"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "swiftClaw — AI Terminal Companion",
    description:
      "AI-powered terminal companion with human-in-the-loop staging for secure AI agent collaboration.",
    url: "https://swiftclaw.online",
    siteName: "swiftClaw",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "swiftClaw — AI Terminal Companion",
    description:
      "Premium AI agent with zero-trust staging, Agent/Plan/Ask modes, and remote terminal access.",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} dark`}>
      <body className="relative min-h-screen bg-sc-canvas font-body text-sc-text" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('contextmenu',e=>e.preventDefault())" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "swiftClaw",
              description:
                "Premium AI terminal companion with zero-trust staging, Agent/Plan/Ask modes, and Telegram remote approval.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Linux, macOS, Windows",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "anupam",
              },
              url: "https://swiftclaw.online",
            }),
          }}
        />
        <VerticalMetadata />
        <GlobalBackground />
        <CustomCursor />
        <RecaptchaBadge />
        <div className="relative z-10 flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
