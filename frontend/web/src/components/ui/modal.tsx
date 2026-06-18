"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen && mounted) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, mounted]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal/Drawer Container */}
          <div className="fixed inset-0 z-[10000] flex items-end justify-center md:items-center p-0 md:p-4 pointer-events-none">
            <motion.div
              key="modal-content"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className={cn(
                "pointer-events-auto relative w-full max-w-lg md:max-w-md bg-sc-surface border-t border-x md:border border-white/10 rounded-t-2xl md:rounded-lg shadow-2xl flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden",
                className
              )}
            >
              {/* Drag indicator line for mobile bottom sheet */}
              <div className="flex justify-center pt-2.5 pb-1 shrink-0 md:hidden">
                <div className="w-8 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-white/[0.04] shrink-0 md:pt-4 md:px-6">
                {title && (
                  <h3 className="text-xs md:text-sm uppercase tracking-wider font-semibold text-sc-text">
                    {title}
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-sc-text-muted hover:text-sc-text hover:bg-white/5 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-5 py-4 md:px-6 md:py-5 text-xs text-sc-text">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
