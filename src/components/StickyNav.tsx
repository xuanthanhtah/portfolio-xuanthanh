"use client";

/**
 * StickyNav — Fixed glassmorphic navigation bar
 *
 * - Floats at top-0 with backdrop-blur glassmorphism
 * - Fades in over scroll range [0, 120px] via framer-motion useScroll
 * - Mirrors the hero nav contents: name, nav links, language switcher, theme toggle
 * - Zero layout shift: fixed positioning doesn't affect document flow
 * - Reduced motion: skip opacity animation, nav is always visible at full opacity
 */

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Dictionary } from "@/lib/dictionary";

interface StickyNavProps {
  dict: Dictionary;
}

export function StickyNav({ dict }: StickyNavProps) {
  const { profile, navigation } = dict;
  const reduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  // Fade in from invisible to fully opaque over the first 120px of scroll
  const opacity = useTransform(scrollY, [0, 120], [0, 1]);
  // Subtle upward slide-in from 4px below
  const y = useTransform(scrollY, [0, 120], [-4, 0]);

  return (
    <motion.header
      style={
        reduceMotion
          ? { opacity: 1 }
          : { opacity, y }
      }
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "h-14",
        // Glassmorphism backdrop
        "bg-white/70 dark:bg-zinc-950/70",
        "backdrop-blur-md",
        "-webkit-backdrop-blur-md",
        // Border separator
        "border-b border-black/[0.06] dark:border-white/[0.06]",
        // Pointer events: only receive when visible (opacity > 0)
        "pointer-events-auto",
      ].join(" ")}
      role="banner"
      aria-label="Site navigation"
    >
      <div className="w-full h-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        {/* Logo / Name */}
        <a
          href="#home"
          className="text-sm font-bold tracking-tight select-none shrink-0 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          aria-label="Back to top"
        >
          {profile.name.split(" - ")[0]}
          <span className="text-accent-light dark:text-accent-dark">.</span>
        </a>

        {/* Nav links + controls */}
        <div className="flex items-center gap-2.5 sm:gap-5">
          <a
            href="#contact"
            className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.contact}
          </a>
          <a
            href="#skills"
            className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.skills}
          </a>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" aria-hidden="true" />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
