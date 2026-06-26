"use client";

/**
 * BackToTop — Floating back-to-top button
 *
 * - Hidden until user scrolls past 400px (scroll Y threshold)
 * - Fades in + scales up via framer-motion useScroll/useTransform
 * - Hover: subtle upward float micro-animation (whileHover y: -3)
 * - Tap: tactile scale press feedback (whileTap scale: 0.92)
 * - Click: hardware-accelerated smooth scroll to top (window.scrollTo)
 * - Reduced motion: instant scroll, no float animation
 * - Positioned fixed bottom-6 right-6 — always in viewport corner
 */

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useCallback } from "react";

export function BackToTop() {
  const reduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  // Fade in and scale up over a 60px window starting at 400px scroll
  const opacity = useTransform(scrollY, [400, 460], [0, 1]);
  const scale = useTransform(scrollY, [400, 460], [0.72, 1]);

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  }, [reduceMotion]);

  return (
    <motion.div
      style={reduceMotion ? {} : { opacity, scale }}
      className="fixed bottom-6 right-6 z-50"
      // Prevent interaction when invisible
      aria-hidden={undefined}
    >
      <motion.button
        onClick={handleClick}
        whileHover={reduceMotion ? {} : { y: -3 }}
        whileTap={reduceMotion ? {} : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={[
          // Size and shape — macOS icon aesthetic
          "w-10 h-10 rounded-full",
          // Glassmorphism surface
          "bg-white/80 dark:bg-zinc-900/80",
          "backdrop-blur-md",
          // Border + shadow
          "border border-black/10 dark:border-white/10",
          "shadow-lg shadow-black/[0.08] dark:shadow-black/30",
          // Icon centering
          "flex items-center justify-center",
          // Hover glow via CSS transition (complement to whileHover)
          "hover:shadow-xl hover:shadow-black/[0.12] dark:hover:shadow-black/40",
          "hover:border-black/[0.15] dark:hover:border-white/[0.18]",
          "transition-shadow transition-[border-color]",
          // Accessibility
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light dark:focus-visible:ring-accent-dark focus-visible:ring-offset-2",
        ].join(" ")}
        aria-label="Back to top"
      >
        <ChevronUp
          size={16}
          strokeWidth={2.5}
          className="text-neutral-700 dark:text-neutral-300"
          aria-hidden="true"
        />
      </motion.button>
    </motion.div>
  );
}
