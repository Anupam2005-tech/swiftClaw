"use client";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LcpNwQtAAAAADuGJtSGs1x87mpVvjd8AobE-H0I";

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

export async function executeRecaptcha(action: string): Promise<string> {
  if (typeof window === "undefined") return "";
  
  return new Promise((resolve, reject) => {
    const checkGrecaptcha = () => {
      const enterprise = window.grecaptcha?.enterprise;
      if (enterprise) {
        enterprise.ready(async () => {
          try {
            const token = await enterprise.execute(RECAPTCHA_SITE_KEY, { action });
            resolve(token);
          } catch (err) {
            reject(err);
          }
        });
      } else {
        setTimeout(checkGrecaptcha, 100);
      }
    };
    
    if (window.grecaptcha?.enterprise) {
      checkGrecaptcha();
    } else {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = checkGrecaptcha;
      script.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
      document.head.appendChild(script);
    }
  });
}

export async function verifyRecaptchaToken(token: string, action: string = "login"): Promise<{
  success: boolean;
  score: number;
  error_codes: string[];
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/auth/recaptcha/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action }),
    });
    
    const data = await res.json();
    return {
      success: data.success,
      score: data.score,
      error_codes: data.error_codes || [],
    };
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    return { success: false, score: 0, error_codes: ["NETWORK_ERROR"] };
  }
}

export async function verifyRecaptcha(action: string = "login"): Promise<{
  success: boolean;
  score: number;
  error_codes: string[];
}> {
  try {
    const token = await executeRecaptcha(action);
    if (!token) {
      return { success: false, score: 0, error_codes: ["NO_TOKEN"] };
    }
    return await verifyRecaptchaToken(token, action);
  } catch (err) {
    console.error("reCAPTCHA execution error:", err);
    return { success: false, score: 0, error_codes: ["EXECUTION_ERROR"] };
  }
}