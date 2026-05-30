"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type WavePathProps = React.ComponentProps<"div">;

export function WavePath({ className, ...props }: WavePathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Trap mutable physics values in a ref so they survive React re-renders.
  const physics = useRef({
    progress: 0,
    x: 0.5,
    time: Math.PI / 2,
    reqId: 0 as number,
  });

  const setPath = (progress: number) => {
    if (!containerRef.current || !pathRef.current) return;
    
    // Dynamically calculate based on actual DOM bounds, not arbitrary window percentages
    const width = containerRef.current.getBoundingClientRect().width;
    
    // M = Move to start (0, 100)
    // Q = Quadratic Bezier Curve (control point X, control point Y, end X, end Y)
    pathRef.current.setAttributeNS(
      null,
      "d",
      `M 0 100 Q ${width * physics.current.x} ${100 + progress}, ${width} 100`
    );
  };

  useEffect(() => {
    // Initial draw
    setPath(physics.current.progress);

    // Handle window resizing cleanly
    const handleResize = () => setPath(physics.current.progress);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (physics.current.reqId) {
        cancelAnimationFrame(physics.current.reqId);
      }
    };
  }, []);

  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

  const manageMouseEnter = () => {
    if (physics.current.reqId) {
      cancelAnimationFrame(physics.current.reqId);
      physics.current.time = Math.PI / 2;
    }
  };

  const manageMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const { movementY, clientX } = e;
    const pathBound = containerRef.current.getBoundingClientRect();
    
    // Calculate exact intersection point
    physics.current.x = (clientX - pathBound.left) / pathBound.width;
    // Scale movement for smoother resistance
    physics.current.progress += movementY * 0.8; 
    
    setPath(physics.current.progress);
  };

  const manageMouseLeave = () => {
    animateOut();
  };

  const animateOut = () => {
    const p = physics.current;
    
    // Elastic snap-back physics
    const newProgress = p.progress * Math.sin(p.time);
    p.progress = lerp(p.progress, 0, 0.04);
    p.time += 0.2;
    
    setPath(newProgress);
    
    // Kill the animation loop once it reaches equilibrium
    if (Math.abs(p.progress) > 0.1) {
      p.reqId = requestAnimationFrame(animateOut);
    } else {
      p.time = Math.PI / 2;
      p.progress = 0;
      setPath(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative h-[2px] w-full max-w-7xl mx-auto text-accent", className)} 
      {...props}
    >
      {/* Invisible Interactive Hitbox */}
      <div
        onMouseEnter={manageMouseEnter}
        onMouseMove={manageMouseMove}
        onMouseLeave={manageMouseLeave}
        className="absolute -top-12 left-0 z-20 h-24 w-full cursor-crosshair hover:-top-24 hover:h-48 transition-all duration-300"
      />
      
      {/* The Visual Render Layer */}
      <svg className="absolute -top-[100px] left-0 h-[200px] w-full overflow-visible pointer-events-none">
        <defs>
          <filter id="sc-wave-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Core Line */}
        <path
          ref={pathRef}
          className="fill-none stroke-current opacity-80"
          strokeWidth={1.5}
          filter="url(#sc-wave-glow)"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}