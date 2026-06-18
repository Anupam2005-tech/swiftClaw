"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      setIsReady(false);
      return;
    }

    pollRef.current = setInterval(() => {
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => setIsReady(true));
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 300);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const executeRecaptcha = useCallback(async (action = "submit"): Promise<string | null> => {
    if (!SITE_KEY || !window.grecaptcha) return null;

    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve, () => resolve(null));
      });
    });
  }, []);

  const verifyWithBackend = useCallback(async (action = "submit"): Promise<boolean> => {
    const token = await executeRecaptcha(action);
    if (!token) return false;

    try {
      const res = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      return data.success === true && data.score >= 0.5;
    } catch {
      return false;
    }
  }, [executeRecaptcha]);

  return { isReady, isConfigured: !!SITE_KEY, executeRecaptcha, verifyWithBackend };
}
