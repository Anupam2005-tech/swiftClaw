"use client";

import { Terminal, ShieldAlert, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

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

export const FullScreenSignup = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 8;
  };

  const handleProviderSignIn = async (provider: string) => {
    setError(null);
    setLoadingProvider(provider);
    try {
      const targetEmail = provider === "email" ? email : `${provider}@swiftclaw.online`;
      await signIn(targetEmail, provider);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      await handleProviderSignIn("email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sc-canvas">
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden">
        {/* Left Brand Panel */}
        <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white p-10 md:p-12 md:w-[42%] relative overflow-hidden flex flex-col justify-between min-h-[260px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,146,60,0.1)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative z-10">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
              <Terminal className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              swift<span className="font-serif italic font-normal text-orange-400">Claw</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed max-w-[260px]">
              AI-powered workspace with multi-provider orchestration, encrypted key vault, and agent automation.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-white dark:bg-zinc-950 p-10 md:p-12 md:w-[58%] flex flex-col">
          <div className="flex-1 max-w-sm mx-auto w-full">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Get Started
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              Sign in to your workspace to continue
            </p>

            {error && (
              <div className="w-full p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2.5 items-start text-xs text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleProviderSignIn("google")}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {loadingProvider === "google" ? (
                  <Spinner size="sm" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleProviderSignIn("github")}
                disabled={loadingProvider !== null}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {loadingProvider === "github" ? (
                  <Spinner size="sm" />
                ) : (
                  <GithubIcon className="h-4 w-4" />
                )}
                Continue with GitHub
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-xs text-zinc-400">or continue with email</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            <form className="flex flex-col gap-4 mt-1" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  className={`w-full text-sm h-10 px-3 rounded-lg border bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 ${
                    emailError ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  aria-describedby="email-error"
                />
                {emailError && (
                  <p id="email-error" className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="At least 8 characters"
                  className={`w-full text-sm h-10 px-3 rounded-lg border bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 ${
                    passwordError ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                />
                {passwordError && (
                  <p id="password-error" className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingProvider !== null}
                className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loadingProvider === "email" ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-zinc-400 mt-6 text-center leading-relaxed">
              By continuing, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
