"use client";

/**
 * EducationTimeline — Scroll-triggered timeline for HUTECH University
 *
 * A vertical line "draws" itself downward as the section enters the viewport.
 * The education card then fades in with staggered content animation.
 * Uses useInView + Framer Motion for precise scroll triggering.
 */

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Dictionary } from "@/lib/dictionary";

interface EducationTimelineProps {
  dict: Dictionary;
}

// ─── GPA Radial Ring ──────────────────────────────────────────────────────────
function GPARing({ gpa, active }: { gpa: string; active: boolean }) {
  const numericGpa = parseFloat(gpa.split(" / ")[0]);
  const maxGpa = parseFloat(gpa.split(" / ")[1]);
  const pct = numericGpa / maxGpa;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex flex-col items-center gap-1 shrink-0">
      <svg width={72} height={72} viewBox="0 0 72 72">
        {/* Track */}
        <circle cx={36} cy={36} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={5} />
        {/* Progress */}
        <motion.circle
          cx={36}
          cy={36}
          r={r}
          fill="none"
          stroke="#8FA89B"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: active ? offset : circ }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ rotate: -90, transformOrigin: "36px 36px" }}
        />
        {/* GPA text */}
        <text
          x={36}
          y={36}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={700}
          fontFamily="system-ui"
          fill="currentColor"
        >
          {numericGpa.toFixed(2)}
        </text>
      </svg>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        GPA
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function EducationTimeline({ dict }: EducationTimelineProps) {
  const edu = dict.education;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section ref={sectionRef} className="py-12">
      {/* Section label */}
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          {edu.sectionTitle}
        </span>
      </div>

      <div className="flex gap-6">
        {/* Timeline track + dot */}
        <div className="flex flex-col items-center gap-0 pt-1 select-none" aria-hidden="true">
          {/* Top dot */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-3 h-3 rounded-full bg-accent-light dark:bg-accent-dark shrink-0"
          />
          {/* Vertical line draws downward */}
          <div className="relative w-0.5 flex-1 bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full bg-accent-light dark:bg-accent-dark rounded-full"
              initial={{ height: "0%" }}
              animate={isInView ? { height: "100%" } : { height: "0%" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            />
          </div>
          {/* Bottom dot */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, delay: 1.3, type: "spring", stiffness: 300 }}
            className="w-2 h-2 rounded-full border-2 border-accent-light dark:border-accent-dark shrink-0"
          />
        </div>

        {/* Education card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex-1 pb-4"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <motion.h3
                variants={itemVariants}
                className="text-xl font-bold text-neutral-900 dark:text-white"
              >
                {edu.university}
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-sm font-semibold text-accent-light dark:text-accent-dark mt-0.5"
              >
                {edu.degree}
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5"
              >
                {edu.location} · {edu.period}
              </motion.p>
            </div>
            {/* GPA Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GPARing gpa={edu.gpa} active={isInView} />
            </motion.div>
          </div>

          {/* Highlight list */}
          <ul className="flex flex-col gap-2.5">
            {edu.highlights.map((item, i) => (
              <motion.li
                key={i}
                variants={itemVariants}
                className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300"
              >
                <span className="text-accent-light dark:text-accent-dark mt-0.5 shrink-0 text-base leading-none">
                  ◆
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
