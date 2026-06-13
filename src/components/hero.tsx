"use client";

import { motion, Variants } from "framer-motion";
import { Magnetic } from "./ui/magnetic";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Dictionary } from "@/lib/dictionary";

interface HeroProps {
  dict: Dictionary;
}

export function Hero({ dict }: HeroProps) {
  const { profile, navigation } = dict;

  // Animation variants for stagger reveal
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const maskItemVariants: Variants = {
    initial: { y: "100%" },
    animate: {
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const fadeInVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between pt-24 pb-12 px-6 md:px-16 bg-grid-overlay overflow-hidden select-none">
      {/* Top Navigation Strip */}
      <div className="w-full flex justify-between items-center z-20 gap-3">
        <a href="#home" className="text-sm sm:text-base md:text-lg font-bold tracking-tight select-none shrink-0">
          {profile.name.split(" - ")[0]}
          <span className="text-accent-light dark:text-accent-dark">.</span>
        </a>
        <div className="flex items-center gap-2.5 sm:gap-6">
          <a
            href="#work"
            className="text-xs sm:text-sm font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.work}
          </a>
          <a
            href="#about"
            className="text-xs sm:text-sm font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.about}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area (Asymmetric Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center my-auto z-10">
        {/* Left Side: Typography */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col items-start"
        >
          {/* 1. Magnetic Availability Badge */}
          <div className="mb-6">
            <Magnetic range={50} actionStrength={0.25}>
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-border-light dark:border-border-dark bg-white/40 dark:bg-black/40 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-light dark:bg-accent-dark opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-light dark:bg-accent-dark"></span>
                </span>
                {profile.status}
              </div>
            </Magnetic>
          </div>

          {/* 2. Headline with Text Mask Reveal */}
          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold tracking-tighter leading-[1.3] mb-8 max-w-4xl">
            <span className="mask-container">
              <motion.span variants={maskItemVariants} className="block">
                {profile.headline.line1}
              </motion.span>
            </span>
          </h1>

          {/* 3. Subtext (Max 20 words, max 3-4 lines) */}
          <motion.p
            variants={fadeInVariants}
            className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-[45ch] mb-8 font-normal leading-relaxed"
          >
            {profile.subtext}
          </motion.p>

          {/* 4. CTA Block */}
          <motion.div variants={fadeInVariants}>
            <Magnetic range={50} actionStrength={0.25}>
              <a
                href="#work"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-black dark:bg-white !text-white dark:!text-black !opacity-100 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {profile.ctaText}
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Right Side: Architectural Visual Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="hidden lg:flex justify-center items-center h-[350px] relative"
        >
          {/* Minimal Abstract Geometric Sculpture */}
          <div className="relative w-72 h-72 border border-dashed border-border-light dark:border-border-dark rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]">
            <div className="w-52 h-52 border border-solid border-neutral-300 dark:border-neutral-800 rounded-none transform rotate-45 flex items-center justify-center">
              <div className="w-36 h-36 border border-neutral-300 dark:border-neutral-800 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-accent-light/10 dark:bg-accent-dark/10 border border-accent-light dark:border-accent-dark rounded-none transform -rotate-12" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="w-full flex justify-between items-center z-10 text-xs text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-widest mt-auto">
        <span>© 2026</span>
        <a href="#about" className="hover:text-accent-light dark:hover:text-accent-dark transition-colors">
          Scroll to explore ↓
        </a>
      </div>
    </section>
  );
}
