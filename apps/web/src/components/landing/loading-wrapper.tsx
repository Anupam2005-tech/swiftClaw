"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = lazy(() =>
  import("./loading-screen").then((m) => ({ default: m.LoadingScreen }))
);

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("swiftclaw_has_visited");
    if (hasVisited) setPhase("ready");
  }, []);

  const handleFinish = () => {
    sessionStorage.setItem("swiftclaw_has_visited", "true");
    setPhase("ready");
  };

  return (
    <>
      <AnimatePresence>
        {phase === "loading" && (
          <Suspense fallback={null}>
            <LoadingScreen onFinish={handleFinish} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "ready" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
