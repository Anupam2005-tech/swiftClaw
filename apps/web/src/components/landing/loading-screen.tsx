"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SASSY_PHRASES = [
  "Waking up the swarm...",
  "Bypassing standard protocols...",
  "Judging your architecture...",
  "Compiling award-winning aesthetics...",
  "Injecting zero-trust logic...",
  "Almost tolerable...",
];

// The "Golden" Awwwards Easing Curve (Expo InOut)
const premiumEasing: [number, number, number, number] = [0.76, 0, 0.24, 1];

export function LoadingScreen({ onFinish }: { onFinish?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const onFinishRef = useRef(onFinish);
  
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Non-linear pacing to feel like real loading
      const step = Math.random() > 0.5 ? Math.floor(Math.random() * 8) + 1 : 0;
      currentProgress += step;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        setIsExiting(true);

        // Inner content fades (0.6s) → curtain slides up (1s) → done
        setTimeout(() => setIsLoading(false), 600);
        setTimeout(() => {
          document.body.style.overflow = "auto";
          onFinishRef.current?.();
        }, 1600);
      }
      
      setProgress(currentProgress);
      
      // Update phrases
      if (currentProgress < 20) setPhraseIndex(0);
      else if (currentProgress < 40) setPhraseIndex(1);
      else if (currentProgress < 60) setPhraseIndex(2);
      else if (currentProgress < 80) setPhraseIndex(3);
      else if (currentProgress < 95) setPhraseIndex(4);
      else setPhraseIndex(5);

    }, 100);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "auto";
    };
  }, []);

  // Formats to "00", "07", "45", "100"
  const formattedProgress = progress.toString().padStart(2, "0");

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-curtain"
          initial={{ y: 0 }}
          exit={{ 
            y: "-100vh", 
            transition: { duration: 1, ease: premiumEasing } 
          }}
          className="fixed inset-0 z-[99999] bg-[#030305] text-[#FFFDF9] overflow-hidden isolate"
        >
          {/* Subtle Grid Architecture */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center">
             <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#FFFDF9]/20 to-transparent absolute left-1/4" />
             <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#FFFDF9]/20 to-transparent absolute right-1/4" />
          </div>

          <AnimatePresence>
            {!isExiting && (
              <motion.div
                key="inner-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95,
                  filter: "blur(10px)",
                  transition: { duration: 0.6, ease: premiumEasing } 
                }}
                className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-12"
              >
                
                {/* Header Row */}
                <div className="flex justify-between items-start w-full font-mono text-[9px] font-light uppercase tracking-[0.4em] text-[#FFFDF9]/40">
                  <div className="flex flex-col gap-2">
                    <span className="text-accent flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent animate-pulse rounded-full" />
                      System.Init
                    </span>
                    <span>v2.0.0-Stable</span>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span>Latency // &lt;2ms</span>
                    <span>{new Date().getFullYear()} ©</span>
                  </div>
                </div>

                {/* Bottom Asymmetric Row */}
                <div className="flex flex-col md:flex-row items-end justify-between w-full gap-8">
                  
                  {/* Left: The Sassy Phrase */}
                  <div className="overflow-hidden mb-2 md:mb-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={phraseIndex}
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: "0%" }}
                        exit={{ opacity: 0, y: "-100%", position: "absolute" }}
                        transition={{ duration: 0.5, ease: premiumEasing }}
                        className="font-display text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide text-[#FFFDF9]/80"
                      >
                        {SASSY_PHRASES[phraseIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Right: The Massive Off-Grid Percentage */}
                  <div className="flex items-baseline gap-2 translate-y-[15%] md:translate-y-[20%]">
                    <div className="font-display text-[25vw] md:text-[20vw] leading-none font-thin tracking-tighter text-[#FFFDF9]">
                      {formattedProgress}
                    </div>
                    <div className="font-mono text-xl sm:text-3xl font-light text-accent mb-[5vw] md:mb-[3vw]">
                      %
                    </div>
                  </div>

                </div>

                {/* Laser Progress Line */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#FFFDF9]/10">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-accent shadow-[0_0_20px_rgba(var(--accent),1)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  >
                    {/* Glowing Head */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-[1px] bg-[#FFFDF9] blur-[2px]" />
                  </motion.div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}