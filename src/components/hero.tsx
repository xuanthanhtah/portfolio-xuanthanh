"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Magnetic } from "./ui/magnetic";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "./language-switcher";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Dictionary } from "@/lib/dictionary";
import { HeroScene } from "./hero-scene";
import { SnowToggle } from "./xmas/SnowToggle";
import { PaletteTrigger } from "./PaletteTrigger";
import { useTemplate } from "@/lib/template-store";
import { LIGHT_MODES, type LightMode } from "./xmas/light-modes";

// Holiday tree is heavy (R3F + postprocessing) — only load it for ?template=xmas, client-side.
const ChristmasTreeScene = dynamic(() => import("./xmas/ChristmasTreeScene"), { ssr: false });

interface HeroProps {
  dict: Dictionary;
}

export function Hero({ dict }: HeroProps) {
  const { profile, navigation, xmas } = dict;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const season = useTemplate() === "xmas";
  const [lightMode, setLightMode] = useState<LightMode>("twinkle");
  const cycleLightMode = () =>
    setLightMode((m) => LIGHT_MODES[(LIGHT_MODES.indexOf(m) + 1) % LIGHT_MODES.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fade out the hero's inline nav as StickyNav fades in (scroll 0 → 80px)
  const { scrollY } = useScroll();
  const heroNavOpacity = useTransform(scrollY, [0, 80], [1, 0]);

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
    <section id="home" className="relative w-full min-h-[100dvh] flex flex-col justify-between pt-24 pb-12 px-6 md:px-16 bg-grid-overlay overflow-hidden select-none">
      {/* Top Navigation Strip — fades out as StickyNav takes over */}
      <motion.div style={{ opacity: heroNavOpacity }} className="w-full flex justify-between items-center z-20 gap-3">
        <a href="#home" className="text-sm sm:text-base md:text-lg font-bold tracking-tight select-none shrink-0">
          {profile.name.split(" - ")[0]}
          <span className="text-accent-light dark:text-accent-dark">.</span>
        </a>
        <div className="flex items-center gap-2.5 sm:gap-6">
          <a
            href="#contact"
            className="text-xs sm:text-sm font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.contact}
          </a>
          <a
            href="#skills"
            className="text-xs sm:text-sm font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors"
          >
            {navigation.skills}
          </a>
          <PaletteTrigger label={dict.palette.trigger} />
          <SnowToggle labelOn={xmas.snowOn} labelOff={xmas.snowOff} />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </motion.div>

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
          <motion.div variants={fadeInVariants} className="flex items-center gap-3 flex-wrap">
            <Magnetic range={50} actionStrength={0.25}>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-black dark:bg-white !text-white dark:!text-black !opacity-100 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {profile.ctaText}
              </a>
            </Magnetic>
            <Magnetic range={50} actionStrength={0.25}>
              <a
                href="https://drive.google.com/file/d/1egQmUjWM_flHn63QUhG-fAY9P00OGgOd/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {profile.cvText}
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        {/* Right Side: holiday tree for ?template=xmas, particle constellation otherwise */}
        {mounted && season ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative h-[360px] sm:h-[420px] lg:h-[520px] -mx-6 sm:mx-0 select-none"
          >
            <ChristmasTreeScene
              isDark={resolvedTheme !== "light"}
              mode={lightMode}
              onCycleMode={cycleLightMode}
            />
            {/* Dev-flavoured caption: the live state of the scene, as code */}
            <div className="absolute left-6 sm:left-2 bottom-1 flex flex-col items-start gap-1 pointer-events-none">
              <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={cycleLightMode}
                aria-label={`${xmas.modeButton}: ${lightMode}`}
                className="pointer-events-auto font-mono text-[11px] sm:text-xs px-2.5 py-1 rounded-md border border-border-light dark:border-border-dark bg-white/60 dark:bg-black/50 backdrop-blur-md text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-sky-600 dark:text-sky-300">lights</span>.mode ={" "}
                <span className="text-amber-600 dark:text-amber-300">&quot;{lightMode}&quot;</span>
              </button>
              <SnowToggle variant="code" labelOn={xmas.snowOn} labelOff={xmas.snowOff} />
              </div>
              <span className="hidden sm:block text-[10px] text-neutral-400 dark:text-neutral-500">
                {xmas.treeHint}
              </span>
            </div>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="hidden lg:block h-[420px] relative rounded-3xl overflow-hidden"
        >
          {/*
           * The canvas fills this container absolutely.
           * pointer-events: none is set on the canvas itself — the
           * parent div can still receive events if needed in future.
           */}
          {mounted && <HeroScene key={resolvedTheme} theme={resolvedTheme} />}

          {/* Subtle vignette overlay to blend edges into the bg */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, var(--background) 100%)",
            }}
          />
        </motion.div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="w-full flex justify-between items-center z-10 text-xs text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-widest mt-auto">
        <span>© 2026</span>
        <a href="#skills" className="hover:text-accent-light dark:hover:text-accent-dark transition-colors">
          Scroll to explore ↓
        </a>
      </div>
    </section>
  );
}
