"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [isMobile, setIsMobile] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSize = useMotionValue(28);
  const cursorScale = useMotionValue(1);
  const dotSize = useMotionValue(3);
  const dotOpacity = useMotionValue(0.8);
  const ringVisible = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const sizeSpring = useSpring(cursorSize, { stiffness: 300, damping: 20 });
  const scaleSpring = useSpring(cursorScale, { stiffness: 300, damping: 20 });
  const dotSizeSpring = useSpring(dotSize, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !isLanding) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hovering = !!target.closest('a, button, [role="button"], .cursor-pointer');
      cursorSize.set(hovering ? 48 : 28);
      dotSize.set(hovering ? 6 : 3);
      ringVisible.set(hovering ? 1 : 0);
    };

    const handleMouseDown = () => cursorScale.set(0.85);
    const handleMouseUp = () => cursorScale.set(1);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isLanding]);

  if (!isLanding || isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <motion.div 
        style={{ 
          width: sizeSpring, 
          height: sizeSpring,
          scale: scaleSpring,
        }}
        className="relative rounded-full border border-[#FFFDF9]/60 flex items-center justify-center"
      >
        <motion.div 
          style={{ 
            width: dotSizeSpring, 
            height: dotSizeSpring,
            backgroundColor: dotOpacity.get() > 0.5 ? "#FFFDF9" : "rgba(255, 253, 249, 0.8)"
          }}
          className="rounded-full bg-[#FFFDF9]" 
        />
        
        <motion.div 
          style={{ opacity: ringVisible }}
          initial={{ opacity: 0, scale: 0 }}
          className="absolute inset-0 rounded-full border border-[#FFFDF9]/30"
        />
      </motion.div>
    </motion.div>
  );
}
