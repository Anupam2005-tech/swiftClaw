"use client";

import { useEffect } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function RecaptchaBadge() {
  useEffect(() => {
    if (!SITE_KEY) return;

    if (document.querySelector(`script[src*="recaptcha/api.js"]`)) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
