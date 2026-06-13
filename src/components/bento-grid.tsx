"use client";

import { motion, Variants } from "framer-motion";
import { Dictionary } from "@/lib/dictionary";

interface BentoGridProps {
  dict: Dictionary;
}

export function BentoGrid({ dict }: BentoGridProps) {
  const { capabilities } = dict;

  const cardVariants: Variants = {
    hover: {
      y: -4,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const coreCard = capabilities.cards.core;
  const motionCard = capabilities.cards.motion;
  const systemCard = capabilities.cards.system;
  const toolingCard = capabilities.cards.tooling;
  const creativeCard = capabilities.cards.creative;

  return (
    <section className="section-padding px-6 md:px-16 w-full max-w-7xl mx-auto select-none">
      {/* Section Indicator */}
      <div className="mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {capabilities.title}
        </span>
      </div>

      {/* Asymmetric Bento Grid (3 columns, 5 items, no empty slots) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[220px]">
        {/* Cell 1: Core Stack - Double Width */}
        <motion.div
          whileHover="hover"
          variants={cardVariants}
          className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-light/5 dark:bg-accent-dark/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <span className="text-xs font-semibold uppercase text-accent-light dark:text-accent-dark tracking-wider">
              {coreCard.tag}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 text-neutral-900 dark:text-white">
              {coreCard.title}
            </h3>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[50ch] whitespace-pre-line">
            {coreCard.description}
          </p>
        </motion.div>

        {/* Cell 2: Performance Optimization - Double Height */}
        <motion.div
          whileHover="hover"
          variants={cardVariants}
          className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 p-8 rounded-3xl border border-accent-light/25 dark:border-accent-dark/25 bg-accent-light/10 dark:bg-accent-dark/10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-accent-light/20 dark:bg-accent-dark/20 rounded-full blur-2xl animate-pulse" />

          <div>
            <span className="text-xs font-semibold uppercase text-accent-light dark:text-accent-dark tracking-wider">
              {motionCard.tag}
            </span>
            <h3 className="text-2xl font-bold tracking-tight mt-2 text-neutral-900 dark:text-white">
              {motionCard.title}
            </h3>
          </div>

          <div className="my-auto py-4 flex justify-center">
            {/* Minimal SVG physics demonstration */}
            <svg width="64" height="64" viewBox="0 0 100 100" className="animate-[spin_12s_linear_infinite]">
              <rect x="25" y="25" width="50" height="50" rx="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="15" className="fill-accent-light dark:fill-accent-dark opacity-80" />
            </svg>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
            {motionCard.description}
          </p>
        </motion.div>

        {/* Cell 3: UI Architecture */}
        <motion.div
          whileHover="hover"
          variants={cardVariants}
          className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {systemCard.tag}
            </span>
            <h3 className="text-xl font-bold tracking-tight mt-1 text-neutral-900 dark:text-white">
              {systemCard.title}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
            {systemCard.description}
          </p>
        </motion.div>

        {/* Cell 4: DevOps Ecosystem */}
        <motion.div
          whileHover="hover"
          variants={cardVariants}
          className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 p-8 rounded-3xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {toolingCard.tag}
            </span>
            <h3 className="text-xl font-bold tracking-tight mt-1 text-neutral-900 dark:text-white">
              {toolingCard.title}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
            {toolingCard.description}
          </p>
        </motion.div>

        {/* Cell 5: Fintech Security - Spans Entire Width */}
        <motion.div
          whileHover="hover"
          variants={cardVariants}
          className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-8 rounded-3xl border border-border-light dark:border-border-dark bg-neutral-900 text-neutral-100 dark:bg-neutral-950/80 bg-grid-overlay flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 left-1/3 w-64 h-64 bg-accent-light/10 dark:bg-accent-dark/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[450px]">
            <span className="text-xs font-semibold uppercase text-accent-light dark:text-accent-dark tracking-wider">
              {creativeCard.tag}
            </span>
            <h3 className="text-2xl font-bold tracking-tight mt-2 text-white">
              {creativeCard.title}
            </h3>
            <p className="text-sm text-neutral-400 mt-2 whitespace-pre-line">
              {creativeCard.description}
            </p>
          </div>

          {/* Abstract Canvas visual wrapper mock */}
          <div className="w-full md:w-auto flex items-center justify-end font-mono text-[10px] text-neutral-500 gap-6 select-none bg-black/30 p-4 rounded-xl border border-neutral-800">
            <div>
              <span className="text-neutral-400">FPS:</span> 120.0<br />
              <span className="text-neutral-400">VERTICES:</span> 1,024
            </div>
            <div className="h-8 w-[1px] bg-neutral-800" />
            <div>
              <span className="text-neutral-400">MEM:</span> 14.8 MB<br />
              <span className="text-neutral-400">RENDER:</span> WebGL2
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
