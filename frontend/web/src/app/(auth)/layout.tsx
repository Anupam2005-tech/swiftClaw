import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4 bg-sc-canvas">
      {children}
    </div>
  );
}
