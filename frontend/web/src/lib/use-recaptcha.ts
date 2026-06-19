"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
        render: (container: string | HTMLElement, parameters: { sitekey: string; theme?: string; size?: string }) => number;
      };
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LcpNwQtAAAAADuGJtSGs1x87mpVvjd8AobE-H0I";

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!SITE_KEY) {
      setIsReady(false);
      return;
    }

    pollRef.current = setInterval(() => {
      if (window.grecaptcha?.enterprise?.ready || window.grecaptcha?.ready) {
        (window.grecaptcha.enterprise?.ready || window.grecaptcha.ready)(() => setIsReady(true));
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 300);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const executeRecaptcha = useCallback(async (action = "submit"): Promise<string | null> => {
    if (!SITE_KEY) return null;

    return new Promise((resolve) => {
      const ready = window.grecaptcha?.enterprise?.ready || window.grecaptcha?.ready;
      const execute = window.grecaptcha?.enterprise?.execute || window.grecaptcha?.execute;
      
      if (!ready || !execute) return resolve(null);
      
      ready(() => {
        execute(SITE_KEY, { action }).then(resolve, () => resolve(null));
      });
    });
  }, []);

  const verifyWithBackend = useCallback(async (action = "submit"): Promise<boolean> => {
    const token = await executeRecaptcha(action);
    if (!token) return false;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/auth/recaptcha/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "submit" }),
      });
      const data = await res.json();
      return data.success === true && data.score >= 0.5;
    } catch {
      return false;
    }
  }, [executeRecaptcha]);

  return { isReady, isConfigured: !!SITE_KEY, executeRecaptcha, verifyWithBackend };
}
