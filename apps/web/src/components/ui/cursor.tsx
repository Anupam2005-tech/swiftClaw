"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springConfig = { stiffness: 250, damping: 25 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], .cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <motion.div 
        animate={{ 
          width: isHovering ? 64 : 32, 
          height: isHovering ? 64 : 32,
          opacity: isClicking ? 0.5 : 1,
          scale: isClicking ? 0.8 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative rounded-full border border-[#FFFDF9]/50 backdrop-blur-[2px] flex items-center justify-center"
      >
        <motion.div 
          animate={{ 
            width: isHovering ? 4 : 2, 
            height: isHovering ? 4 : 2,
            backgroundColor: isHovering ? "#FFFDF9" : "rgba(255, 253, 249, 0.8)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-full bg-[#FFFDF9]" 
        />
        
        <AnimatePresence>
          {isHovering && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 rounded-full border border-[#FFFDF9]/20 animate-ping"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
