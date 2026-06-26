"use client";

/**
 * ExperienceCard — HD Bank work experience block
 *
 * Philosophy: Triết lý Vừa đủ nhưng Đầy đủ
 * - INITIAL STATE: Ultra-clean — only Job Title, Company, Timeline, and
 *   one core high-impact accomplishment line visible by default.
 * - HOVER STATE (pointer devices): Elegant expand via AnimatePresence
 *   revealing stats dashboard, highlights, tech stack, and simulator.
 * - TOUCH FALLBACK: Click toggles expansion on devices without fine pointer.
 * - Premium micro-interactions: card scale + localized glow on hover.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants, useReducedMotion } from "framer-motion";
import { BankingWorkflowSimulator } from "@/components/BankingWorkflowSimulator";
import { Dictionary } from "@/lib/dictionary";

interface ExperienceCardProps {
  dict: Dictionary;
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedCount(target: number, duration: number = 1200, active: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) { setCount(0); return; }
    const start = performance.now();
    let raf: number;

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);

  return count;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  rawValue: string;
  suffix: string;
  delay: number;
  active: boolean;
}

function StatCard({ label, rawValue, suffix, delay, active }: StatCardProps) {
  const numericTarget = parseInt(rawValue.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericTarget) && rawValue.replace(/[^0-9]/g, "") !== "";
  const hasPlus = rawValue.includes("+");

  const counted = useAnimatedCount(isNumeric ? numericTarget : 0, 1000, active);

  const displayValue = !active
    ? "0"
    : isNumeric
      ? `${counted.toLocaleString()}${hasPlus ? "+" : ""}`
      : rawValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/50"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
      <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
        {displayValue}
        <span className="text-accent-light dark:text-accent-dark">{active ? suffix : ""}</span>
      </span>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ExperienceCard({ dict }: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const exp = dict.experience;

  // Detect if device supports hover (pointer: fine)
  // This ref is set once on mount and never changes
  const supportsHoverRef = useRef(false);
  useEffect(() => {
    supportsHoverRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (supportsHoverRef.current) setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (supportsHoverRef.current) setIsExpanded(false);
  }, []);

  const handleClick = useCallback(() => {
    // Toggle on touch devices only (no fine pointer hover)
    if (!supportsHoverRef.current) setIsExpanded((v) => !v);
  }, []);

  const expandVariants: Variants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-12 border-b border-neutral-200/60 dark:border-neutral-800/60">
      {/* Section Label */}
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          {exp.sectionTitle}
        </span>
      </div>

      {/* Experience Entry */}
      <motion.div
        layout
        className="glow-on-hover rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileHover={
          reduceMotion
            ? {}
            : {
              scale: 1.004,
              boxShadow:
                "0 0 0 1px rgba(143, 168, 155, 0.35), 0 12px 40px rgba(143, 168, 155, 0.14), 0 4px 16px rgba(0, 0, 0, 0.06)",
            }
        }
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── INITIAL STATE: Ultra-clean header — always visible ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            {/* Company + Role */}
            <div className="flex items-center gap-3">
              {/* HD Bank logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 shadow-md">
                <span className="text-white text-xs font-black tracking-tight">HD</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-none">
                  {exp.company}
                </h3>
                <p className="text-sm text-accent-light dark:text-accent-dark font-semibold mt-0.5">
                  {exp.role}
                </p>
              </div>
            </div>

            {/* Single high-impact line — the one essential accomplishment */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-[52ch] leading-relaxed">
              {exp.summary}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              {exp.period}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {exp.location}
            </span>

            {/* Hover hint — fades out when expanded */}
            <AnimatePresence>
              {!isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 text-[10px] font-medium text-neutral-300 dark:text-neutral-600 hidden sm:block"
                  aria-hidden="true"
                >
                  {supportsHoverRef.current ? "hover to expand" : "tap to expand"} →
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── HOVER/EXPANDED STATE: Rich dashboard reveal ── */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="dashboard"
              variants={expandVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="overflow-hidden"
            >
              <div
                className="border-t border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 px-6 sm:px-8 py-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Live Dashboard · Internal Metrics
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-300 dark:text-neutral-600">
                    HDBank Intranet © 2026
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  {exp.stats.map((stat, i) => (
                    <StatCard
                      key={stat.label}
                      label={stat.label}
                      rawValue={stat.value}
                      suffix={stat.suffix}
                      delay={i * 0.1 + 0.1}
                      active={isExpanded}
                    />
                  ))}
                </div>

                {/* Chart + Highlights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6">
                  {/* Banking Workflow Simulator */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/50">
                    <BankingWorkflowSimulator active={isExpanded} />
                  </div>

                  {/* Highlights list */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-700/50">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-3">
                      Key Achievements
                    </span>
                    <ul className="flex flex-col gap-2">
                      {exp.highlights.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isExpanded ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.4, delay: i * 0.07 + 0.3 }}
                          className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                        >
                          <span className="text-accent-light dark:text-accent-dark mt-0.5 shrink-0">→</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {exp.techStack.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isExpanded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, delay: i * 0.04 + 0.5 }}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
