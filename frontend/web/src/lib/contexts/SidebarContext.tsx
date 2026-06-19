"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isMobileSidebarOpen: isOpen,
        toggleMobileSidebar: () => setIsOpen((prev) => !prev),
        closeMobileSidebar: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useMobileSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
