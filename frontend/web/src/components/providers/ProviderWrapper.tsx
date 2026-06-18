"use client";

import React from "react";
import { AuthProvider } from "../../lib/hooks/useAuth";
import { ToastProvider } from "../ui/toast";

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
