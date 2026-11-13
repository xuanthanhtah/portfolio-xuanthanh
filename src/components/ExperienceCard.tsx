"use client";

/**
 * ExperienceCard — HD Bank work experience
 *
 * Everything a recruiter needs is visible without clicking:
 * header (company / role / period / location) → summary → CV-backed stats →
 * contributions + key projects → tech stack → auth & data flow strip.
 * Entrance animation is a light staggered fade, disabled for reduced motion.
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { TechIcon } from "@/components/ui/tech-icon";
import { Dictionary } from "@/lib/dictionary";

interface ExperienceCardProps {
  dict: Dictionary;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400 mb-4">
      {children}
    </h4>
  );
}

export function ExperienceCard({ dict }: ExperienceCardProps) {
  const exp = dict.experience;
  const projects = dict.projects.list;
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      };

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="py-16 md:py-20 border-b border-neutral-200/60 dark:border-neutral-800/60 scroll-mt-20"
    >
      {/* ── Section label ── */}
      <div className="flex items-center gap-3 mb-10">
        <span className="h-px w-6 bg-accent-light dark:bg-accent-dark" aria-hidden="true" />
        <h2
          id="experience-title"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400"
        >
          {exp.sectionTitle}
        </h2>
      </div>

      <motion.article
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative"
      >
        {/* ── Header ── */}
        <motion.header
          variants={item}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8"
        >
          <div className="flex items-start gap-4 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0 shadow-sm"
              aria-hidden="true"
            >
              <span className="text-white dark:text-neutral-900 text-base font-black tracking-tight">
                HD
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">
                {exp.role}
              </h3>
              <p className="text-base md:text-lg font-semibold text-[#5E7A6C] dark:text-accent-dark mt-0.5">
                {exp.company}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                  {exp.period}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {exp.location}
                </span>
              </div>
            </div>
          </div>

          <span className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
            <span className="relative flex w-2 h-2" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            {exp.currentBadge}
          </span>
        </motion.header>

        {/* ── Summary ── */}
        <motion.p
          variants={item}
          className="text-base md:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-3xl mb-8"
        >
          {exp.summary}
        </motion.p>

        {/* ── Stats ── */}
        <motion.dl variants={item} className="grid grid-cols-3 gap-3 md:gap-4 mb-12">
          {exp.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 px-3 py-4 md:px-5 md:py-5"
            >
              <dt className="mt-1 text-[11px] md:text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-snug">
                {stat.label}
              </dt>
              <dd className="text-2xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">
                {stat.value}
                <span className="text-accent-light dark:text-accent-dark">{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </motion.dl>

        {/* ── Contributions + Projects ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
          <motion.div variants={item} className="lg:col-span-3">
            <SubHeading>{exp.contributionsTitle}</SubHeading>
            <ol className="flex flex-col">
              {exp.highlights.map((text, i) => (
                <li
                  key={text}
                  className="group flex gap-4 py-3 border-t first:border-t-0 border-neutral-200/60 dark:border-neutral-800/70"
                >
                  <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-500 pt-0.5 w-5 shrink-0 tabular-nums group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm md:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {text}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-2">
            <SubHeading>{exp.projectsTitle}</SubHeading>
            <ol className="relative flex flex-col gap-5 pl-5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
              {projects.map((p) => {
                const [role, domain] = p.category.split("|").map((s) => s.trim());
                return (
                  <li key={p.id} className="relative">
                    <span
                      className="absolute -left-5 top-1.5 w-[11px] h-[11px] rounded-full border-2 border-accent-light dark:border-accent-dark bg-white dark:bg-neutral-950"
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
                      {p.year}
                    </span>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug mt-0.5">
                      {p.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {domain ?? role}
                    </p>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        </div>

        {/* ── Tech stack ── */}
        <motion.div variants={item} className="mb-10">
          <SubHeading>{exp.techTitle}</SubHeading>
          <ul className="flex flex-wrap gap-2">
            {exp.techStack.map((tech) => (
              <li
                key={tech}
                className="group inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <span className="text-neutral-500 dark:text-neutral-400 group-hover:hidden">
                  <TechIcon name={tech} className="w-3.5 h-3.5" />
                </span>
                <span className="hidden group-hover:inline">
                  <TechIcon name={tech} className="w-3.5 h-3.5" colored />
                </span>
                {tech}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Auth & data flow ── */}
        <motion.div
          variants={item}
          className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/40 p-4 md:p-5"
        >
          <SubHeading>{exp.flowTitle}</SubHeading>
          <ol className="flex flex-col md:flex-row md:items-stretch gap-0">
            {exp.flow.map((step, i) => (
              <li key={step.label} className="flex flex-col md:flex-row md:items-center md:flex-1 min-w-0">
                <div className="flex-1 self-stretch min-w-0 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/70 dark:border-neutral-800 px-3 py-2.5">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                    {step.label}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">
                    {step.detail}
                  </p>
                </div>
                {i < exp.flow.length - 1 && (
                  <span
                    className="flex justify-center md:px-1.5 py-1 md:py-0 text-neutral-300 dark:text-neutral-600"
                    aria-hidden="true"
                  >
                    <ArrowRight className="hidden md:block w-3.5 h-3.5" />
                    <ChevronRight className="md:hidden w-3.5 h-3.5 rotate-90" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </motion.div>
      </motion.article>
    </section>
  );
}
