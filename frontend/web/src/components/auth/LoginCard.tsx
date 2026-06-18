"use client";

import React, { useState } from "react";
import { ProviderSignInButtons } from "./ProviderSignInButtons";
import { useAuth } from "../../lib/hooks/useAuth";
import { ShieldAlert, Terminal } from "lucide-react";
import { useToast } from "../ui/toast";

export function LoginCard() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, provider: string) => {
    setError(null);
    try {
      await signIn(email, provider);
      toast({
        title: "Authenticated Successfully",
        description: `Logged in as ${email}.`,
        variant: "success",
      });
    } catch (err: any) {
      const msg = err.message || "Authentication failed.";
      setError(msg);
      toast({
        title: "Authentication Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleButtonsError = (errMsg: string) => {
    setError(errMsg);
    toast({
      title: "Input Error",
      description: errMsg,
      variant: "destructive",
    });
  };

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sc-accent/40 to-transparent" />

      {/* Brand logo header */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-lg border border-white/15 bg-white/[0.02] flex items-center justify-center mb-3">
          <Terminal className="h-6 w-6 text-sc-text" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-sc-text font-display">
          swift<span className="font-serif italic font-normal text-sc-accent">Claw</span>
        </h1>
        <p className="text-xs text-sc-text-muted mt-2 text-center max-w-[280px]">
          Connect your API keys, orchestrate tasks, and explore unified workspace agents.
        </p>
      </div>

      {error && (
        <div className="w-full p-3.5 mb-6 rounded-lg bg-red-950/20 border border-red-500/20 flex gap-2.5 items-start text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Mock sign in buttons */}
      <ProviderSignInButtons onSignIn={handleSignIn} onError={handleButtonsError} />

      {/* Security note */}
      <p className="text-[10px] text-sc-text-muted/60 mt-8 text-center leading-relaxed">
        By continuing, you agree to our Terms of Service. All credentials are encrypted locally. Zero-trust keys vault.
      </p>
    </div>
  );
}
