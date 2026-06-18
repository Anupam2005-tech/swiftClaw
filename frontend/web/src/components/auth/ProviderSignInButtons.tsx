"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface ProviderSignInButtonsProps {
  onSignIn: (email: string, provider: string) => Promise<void>;
  onError: (err: string) => void;
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.5 1.8l2.4-2.4C17.3 1.8 14.9 1 12.24 1c-5.5 0-10 4.5-10 10s4.5 10 10 10c5.5 0 10-4.5 10-10 0-.7-.1-1.3-.2-1.715H12.24z"/>
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.53v-1.84c-3.03.66-3.67-1.46-3.67-1.46-.5-1.27-1.2-1.61-1.2-1.61-.99-.68.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.55 1.18 3.18.9.1-.7.38-1.18.69-1.45-2.42-.28-4.97-1.21-4.97-5.4 0-1.2.43-2.18 1.13-2.95-.12-.28-.49-1.4.11-2.9 0 0 .92-.3 3.02 1.13a10.5 10.5 0 015.5 0c2.1-1.43 3.02-1.13 3.02-1.13.6 1.5.23 2.62.11 2.9.7.77 1.13 1.75 1.13 2.95 0 4.2-2.56 5.12-4.98 5.39.39.34.74 1 .74 2.02v3c0 .3.18.63.74.52A11 11 0 0012 1.27z"/>
  </svg>
);

export function ProviderSignInButtons({ onSignIn, onError }: ProviderSignInButtonsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleProviderSignIn = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      const targetEmail = provider === "email" ? email : `${provider}@swiftclaw.online`;
      await onSignIn(targetEmail, provider);
    } catch (err: any) {
      onError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      onError("Please enter a valid email address.");
      return;
    }
    handleProviderSignIn("email");
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {!showEmailForm ? (
        <>
          <Button
            variant="outline"
            onClick={() => handleProviderSignIn("google")}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 h-11 border-white/10 hover:bg-white/5 font-medium cursor-pointer"
          >
            {loadingProvider === "google" ? (
              <Spinner size="sm" />
            ) : (
              <GoogleIcon className="h-4 w-4 text-sc-text-muted" />
            )}
            Sign in with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleProviderSignIn("github")}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 h-11 border-white/10 hover:bg-white/5 font-medium cursor-pointer"
          >
            {loadingProvider === "github" ? (
              <Spinner size="sm" />
            ) : (
              <GithubIcon className="h-4 w-4 text-sc-text-muted" />
            )}
            Sign in with GitHub
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowEmailForm(true)}
            disabled={loadingProvider !== null}
            className="flex items-center justify-center gap-3 h-11 border-white/10 hover:bg-white/5 font-medium cursor-pointer"
          >
            <Mail className="h-4 w-4 text-sc-text-muted" />
            Sign in with Email
          </Button>
        </>
      ) : (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-input" className="text-xs text-sc-text-muted font-medium ml-1">
              Email Address
            </label>
            <Input
              id="email-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingProvider !== null}
              className="bg-black/40 border-white/10 h-11 focus-visible:ring-sc-accent focus-visible:ring-offset-0 text-sc-text"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={loadingProvider !== null}
              onClick={() => setShowEmailForm(false)}
              className="flex-1 h-11 hover:bg-white/5 cursor-pointer text-sc-text-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loadingProvider !== null || !email}
              className="flex-1 h-11 bg-sc-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-sc-accent/90"
            >
              {loadingProvider === "email" ? (
                <Spinner size="sm" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
