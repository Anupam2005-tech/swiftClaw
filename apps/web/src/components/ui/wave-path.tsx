"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type WavePathProps = React.ComponentProps<"div">;

export function WavePath({ className, ...props }: WavePathProps) {
  const path = useRef<SVGPathElement>(null);
  let progress = 0;
  let x = 0.2;
  let time = Math.PI / 2;
  let reqId: number | null = null;

  useEffect(() => {
    setPath(progress);
  }, []);

  const setPath = (p: number) => {
    const width = window.innerWidth * 0.7;
    if (path.current) {
      path.current.setAttributeNS(
        null,
        "d",
        `M0 100 Q${width * x} ${100 + p * 0.6}, ${width} 100`,
      );
    }
  };

  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

  const manageMouseEnter = () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      resetAnimation();
    }
  };

  const manageMouseMove = (e: React.MouseEvent) => {
    const { movementY, clientX } = e;
    if (path.current) {
      const pathBound = path.current.getBoundingClientRect();
      x = (clientX - pathBound.left) / pathBound.width;
      progress += movementY;
      setPath(progress);
    }
  };

  const manageMouseLeave = () => {
    animateOut();
  };

  const animateOut = () => {
    const newProgress = progress * Math.sin(time);
    progress = lerp(progress, 0, 0.025);
    time += 0.2;
    setPath(newProgress);
    if (Math.abs(progress) > 0.75) {
      reqId = requestAnimationFrame(animateOut);
    } else {
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    time = Math.PI / 2;
    progress = 0;
  };

  return (
    <div className={cn("relative h-px w-[70vw] text-[#FF3800]", className)} {...props}>
      <div
        onMouseEnter={manageMouseEnter}
        onMouseMove={manageMouseMove}
        onMouseLeave={manageMouseLeave}
        className="relative -top-5 z-10 h-10 w-full hover:-top-[150px] hover:h-[300px]"
      />
      <svg className="absolute -top-[100px] h-[300px] w-full overflow-visible">
        <defs>
          <filter id="sc-wave-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          ref={path}
          className="fill-none stroke-[#FF3800]"
          strokeWidth={2}
          filter="url(#sc-wave-glow)"
        />
      </svg>
    </div>
  );
}
