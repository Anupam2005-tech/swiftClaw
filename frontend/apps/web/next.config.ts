import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/install.sh",
      headers: [
        { key: "Cache-Control", value: "public, max-age=3600" },
        { key: "Content-Type", value: "text/x-shellscript" },
      ],
    },
    {
      source: "/install.ps1",
      headers: [
        { key: "Cache-Control", value: "public, max-age=3600" },
        { key: "Content-Type", value: "text/powershell" },
      ],
    },
    {
      source: "/:all*(svg|jpg|png|webp|avif|woff2|css)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};

export default nextConfig;
