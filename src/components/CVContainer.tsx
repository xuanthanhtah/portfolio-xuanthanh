"use client";

/**
 * CVContainer — Scroll-driven glassmorphic CV wrapper
 *
 * The sheet "rises" from below the hero on first scroll,
 * creating the visual metaphor of a live CV coming to life.
 * Uses useScroll + useTransform for a physics-feel entrance.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface CVContainerProps {
  children: React.ReactNode;
}

export function CVContainer({ children }: CVContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Sheet rises from a slight downward position as user scrolls
  const rawY = useTransform(scrollY, [0, 300], [40, 0]);
  const rawOpacity = useTransform(scrollY, [0, 200], [0, 1]);

  // Apply spring physics to the Y transform
  const springY = useSpring(rawY, { stiffness: 80, damping: 18, mass: 0.8 });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Ambient background glow behind the sheet */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(143, 168, 155, 0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        style={{ y: springY, opacity: rawOpacity }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-32"
      >
        {/* Glassmorphic CV Paper */}
        <div className="cv-sheet rounded-3xl overflow-hidden">
          {/* Paper top-edge label strip — mimics a real CV header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-light dark:bg-accent-dark animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 select-none">
                Curriculum Vitae · 2026
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-300 dark:text-neutral-600 select-none">
              Lê Xuân Thành · Frontend Developer
            </span>
          </div>

          {/* Main CV Content */}
          <div className="px-6 sm:px-10 md:px-14 py-12 flex flex-col gap-0">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
