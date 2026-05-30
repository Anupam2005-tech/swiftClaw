"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

export const scrollViewport = {
  once: true,
  margin: "-10% 0px -10% 0px" as const,
  amount: 0.2 as const,
};

type ScrollRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideRight" | "slideLeft" | "slideUp";
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "fadeUp",
  ...props
}: ScrollRevealProps) {
  const variants = { fadeUp, fadeIn, scaleIn, slideRight, slideLeft, slideUp }[variant];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={variants}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type ScrollSectionProps = HTMLMotionProps<"section">;

export function ScrollSection({ children, className, ...props }: ScrollSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={staggerContainer}
      className={`relative ${className ?? ""}`}
      {...props}
    >
      <div className="pointer-events-none hidden md:block absolute left-1/2 top-6 -translate-x-1/2 text-[9px] uppercase tracking-[0.25em] text-[#FFFDF9]/30 font-mono select-none">
        // SYSTEM_INDEX_MARKER_0X //
      </div>
      {children}
    </motion.section>
  );
}
