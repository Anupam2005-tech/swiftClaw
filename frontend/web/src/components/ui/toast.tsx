"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  duration?: number;
  position?: "bottom-right" | "top-right";
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
  toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = "default", duration = 4000, position = "bottom-right" }: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration, position }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      {/* Toast Container — bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.filter((t) => (t.position || "bottom-right") === "bottom-right").map((t) => {
          let Icon = Info;
          let variantClasses = "bg-sc-surface border-white/10 text-sc-text";
          
          if (t.variant === "success") {
            Icon = CheckCircle;
            variantClasses = "bg-sc-surface border-green-500/20 text-green-400";
          } else if (t.variant === "warning") {
            Icon = AlertTriangle;
            variantClasses = "bg-sc-surface border-yellow-500/20 text-yellow-400";
          } else if (t.variant === "destructive") {
            Icon = AlertCircle;
            variantClasses = "bg-sc-surface border-red-500/20 text-red-400";
          }

          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-bottom-5",
                variantClasses
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{t.title}</h4>
                {t.description && (
                  <p className="text-xs text-sc-text-muted mt-1 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-sc-text-muted hover:text-sc-text hover:bg-white/5 p-1 rounded shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Toast Container — top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.filter((t) => t.position === "top-right").map((t) => {
          let Icon = Info;
          let variantClasses = "bg-sc-surface border-white/10 text-sc-text";

          if (t.variant === "success") {
            Icon = CheckCircle;
            variantClasses = "bg-sc-surface border-green-500/20 text-green-400";
          } else if (t.variant === "warning") {
            Icon = AlertTriangle;
            variantClasses = "bg-sc-surface border-yellow-500/20 text-yellow-400";
          } else if (t.variant === "destructive") {
            Icon = AlertCircle;
            variantClasses = "bg-sc-surface border-red-500/20 text-red-400";
          }

          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-top-5",
                variantClasses
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold">{t.title}</h4>
                {t.description && (
                  <p className="text-xs text-sc-text-muted mt-1 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-sc-text-muted hover:text-sc-text hover:bg-white/5 p-1 rounded shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
