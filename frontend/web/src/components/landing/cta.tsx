"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Mail, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomCursor } from "@/components/ui/cursor";

const smoothEasing = [0.22, 1, 0.36, 1] as const;

export function CtaSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Real-time scroll tracking for parallax background effects
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start end", "end start"] 
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25, restDelta: 0.001 });
  const rotateShape = useTransform(smoothProgress, [0, 1], [-45, 45]);
  const parallaxY = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);
  const bgParallax = useTransform(smoothProgress, [0, 1], ["0%", "-20%"]);

  return (
    <>
      <CustomCursor />
      <section 
        id="connect" 
        ref={containerRef}
        className="relative px-4 py-40 sm:px-6 bg-[#030305] selection:bg-accent selection:text-background overflow-hidden isolate flex items-center justify-center min-h-screen"
      >
      {/* Crazy Award-Winning Background Components */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center overflow-hidden">
        {/* Deep background mesh */}
        <motion.div 
          style={{ y: bgParallax }}
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,253,249,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,253,249,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" 
        />

        {/* Ambient floating geometry */}
        <motion.div 
          style={{ rotate: rotateShape }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute w-[120vw] h-[120vw] sm:w-[1000px] sm:h-[1000px] border-[0.5px] border-accent/20 rounded-full blur-xs" 
        />
        
        {/* Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] bg-accent/15 rounded-[100%] blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-5xl relative z-10">
        <motion.div 
          style={{ y: parallaxY }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: smoothEasing }}
          className="relative group w-full"
        >
          {/* Glassmorphic Banner Container */}
           <div className="relative overflow-hidden rounded-[40px] border-[0.5px] border-[#FFFDF9]/10 bg-[#FFFDF9]/1 backdrop-blur-3xl transition-colors duration-700 hover:border-accent/30 hover:bg-[#FFFDF9]/2">
            
            {/* Hover flare effect */}
            <div className="absolute -left-32 -top-32 w-64 h-64 bg-accent/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 p-8 sm:p-12 lg:p-16 relative z-10">
              
              {/* Left Side: Typography & Copy */}
              <div className="flex flex-col justify-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: smoothEasing }}
                  className="mb-8 inline-flex items-center gap-3 rounded-full border-[0.5px] border-accent/20 bg-accent/5 px-4 py-2 w-max"
                >
                  <Radio className="h-3 w-3 text-accent animate-pulse" />
                  <span className="font-mono text-[9px] font-light uppercase tracking-[0.4em] text-accent">
                    Open Channel
                  </span>
                </motion.div>
                
                {/* STRICTLY NO BOLD. ONLY THIN AND LIGHT. */}
                 <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-thin tracking-widest text-transparent bg-clip-text bg-linear-to-b from-[#FFFDF9] to-[#FFFDF9]/30 mb-6 leading-[0.9]">
                  INITIATE <br />
                  <span className="italic font-light">PROTOCOL.</span>
                </h2>
                
                <p className="font-body text-sm font-light leading-relaxed text-[#FFFDF9]/50 max-w-sm">
                  Ready to stop manually managing deployments and replace your bottleneck with a swarm? Drop us an email. We reply faster than your CI/CD pipeline.
                </p>
              </div>

              {/* Right Side: Singular Action Button */}
              <div className="flex flex-col justify-center md:pl-10 md:border-l border-[#FFFDF9]/5 pt-8 md:pt-0 mt-4 md:mt-0">
                
                <motion.a 
                  href="mailto:bhowmikanupam33@gmail.com"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/btn relative flex items-center justify-between w-full overflow-hidden rounded-3xl border-[0.5px] border-accent/50 bg-accent/10 p-8 transition-all duration-500 hover:bg-accent hover:border-accent shadow-[0_0_20px_rgba(var(--accent),0.1)] hover:shadow-[0_0_40px_rgba(var(--accent),0.3)]"
                >
                  <div className="flex flex-col items-start gap-2">
                    <span className="font-display text-xl sm:text-2xl font-light tracking-wide text-[#FFFDF9] transition-colors duration-500 group-hover/btn:text-[#030305]">
                      Direct Interface
                    </span>
                    
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFFDF9]/10 transition-all duration-500 group-hover/btn:bg-[#030305]/10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1">
                    <Mail className="h-5 w-5 text-[#FFFDF9] transition-colors duration-500 group-hover/btn:text-[#030305]" />
                  </div>
                </motion.a>

              </div>
            </div>
          </div>
          
        
          
        </motion.div>
      </div>
      </section>
    </>
  );
}
