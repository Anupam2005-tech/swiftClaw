"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ActiveSession } from "../types/user";
import { api } from "../api/client";
import { auth } from "../firebase/config";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  sessions: ActiveSession[];
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie
const setCookie = (name: string, value: string, days = 30) => {
  if (typeof window === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
};

// Helper to get cookie
const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Failed to get current user:", err);
      setUser(null);
    }
  };

  const refreshSessions = async () => {
    if (!user) return;
    try {
      const activeSessions = await api.listSessions();
      setSessions(activeSessions);
    } catch (err) {
      console.error("Failed to list active sessions:", err);
    }
  };

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || "";

        // Always set a local user immediately so routing works
        // even if backend is temporarily unavailable
        let onboardingComplete = false;
        let sessionId = getCookie("sc_session_id");

        const idToken = await firebaseUser.getIdToken().catch(() => "");

        // Try backend session creation with retries
        if (!sessionId && idToken) {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/session`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: JSON.stringify({
                    device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Web",
                  }),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const sessId: string = data.session_id || "";
                sessionId = sessId;
                setCookie("sc_session_id", sessId);
                setCookie("sc_uid", uid);
                setCookie("sc_email", email);
                break;
              }
              // Wait before retry (exponential backoff)
              if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            } catch {
              if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            }
          }
        }

        // Try fetching onboarding status
        if (sessionId && idToken) {
          try {
            const statusRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/onboarding/status`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                  "X-Session-Id": sessionId,
                },
              }
            );

            if (statusRes.ok) {
              const statusData = await statusRes.json();
              onboardingComplete = statusData.is_onboarded;
              setCookie("sc_onboarding_complete", onboardingComplete ? "true" : "false");
            }
          } catch {
            // Backend unavailable - proceed with default onboarding state
          }
        }

        setUser({
          uid,
          email,
          onboarding_complete: onboardingComplete,
          created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
        });
      } else {
        setUser(null);
        deleteCookie("sc_uid");
        deleteCookie("sc_session_id");
        deleteCookie("sc_email");
        deleteCookie("sc_onboarding_complete");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshSessions();
    } else {
      setSessions([]);
    }
  }, [user]);

  // Auth guarding and routing logic
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";
    const isOnboardingRoute = pathname === "/onboarding";
    const isPublicRoute =
      pathname === "/" ||
      pathname?.startsWith("/faq") ||
      pathname?.startsWith("/terms") ||
      pathname?.startsWith("/privacy") ||
      pathname?.startsWith("/install");

    if (!user) {
      if (!isPublicRoute && !isAuthRoute) {
        router.push("/login");
      }
    } else {
      if (isAuthRoute) {
        router.push(user.onboarding_complete ? "/chat" : "/onboarding");
      }
      if (isOnboardingRoute && user.onboarding_complete) {
        router.push("/chat");
      }
    }
  }, [user, loading, pathname, router]);

  const signIn = async (email: string, provider: string) => {
    setLoading(true);
    try {
      if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
      } else if (provider === "github") {
        const githubProvider = new GithubAuthProvider();
        await signInWithPopup(auth, githubProvider);
      } else if (provider === "email") {
        try {
          await signInWithEmailAndPassword(auth, email, "Password123!");
        } catch (err: any) {
          if (
            err.code === "auth/user-not-found" ||
            err.code === "auth/invalid-credential" ||
            err.code === "auth/invalid-email"
          ) {
            await createUserWithEmailAndPassword(auth, email, "Password123!");
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.signOut();
      setUser(null);
      deleteCookie("sc_uid");
      deleteCookie("sc_session_id");
      deleteCookie("sc_email");
      deleteCookie("sc_onboarding_complete");
      router.push("/login");
    } catch (err) {
      console.error("Sign-out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await api.revokeSession(sessionId);
      await refreshSessions();
      const currentUser = await api.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        router.push("/login");
      }
    } catch (err) {
      console.error("Revoking session failed:", err);
    }
  };

  const revokeAllSessions = async () => {
    try {
      await api.revokeAllSessions();
      await refreshSessions();
      const currentUser = await api.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        router.push("/login");
      }
    } catch (err) {
      console.error("Revoking all sessions failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        sessions,
        refreshSessions,
        revokeSession,
        revokeAllSessions,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
