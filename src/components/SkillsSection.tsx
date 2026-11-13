"use client";

/**
 * SkillsSection — Skills & Expertise
 *
 * Default view: scannable bento grid of skill groups (from the dictionary),
 * each skill with an inline brand icon. A toggle dims everything not used in
 * production at HDBank (derived from experience.techStack — no invented data).
 * Alternative view: the 3D orbit, lazy-loaded only when its tab is opened.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CodeXml,
  Layers,
  Palette,
  Database,
  Wrench,
  LayoutGrid,
  Orbit,
  type LucideIcon,
} from "lucide-react";
import { TechIcon } from "@/components/ui/tech-icon";
import { Dictionary } from "@/lib/dictionary";

const SkillsOrbit = dynamic(() => import("@/components/SkillsCloud"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-100/50 dark:bg-neutral-900/40 animate-pulse" />
  ),
});

const GROUP_ICONS: LucideIcon[] = [CodeXml, Layers, Palette, Database, Wrench];
// 6-column bento on large screens: two wide cards on top, three below.
const GROUP_SPANS = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "sm:col-span-2 lg:col-span-2",
];

type View = "grid" | "orbit";

interface SkillsSectionProps {
  dict: Dictionary;
}

export function SkillsSection({ dict }: SkillsSectionProps) {
  const skills = dict.skills;
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("grid");
  const [focusHdbank, setFocusHdbank] = useState(false);

  const usedAtHdbank = new Set(dict.experience.techStack.map((t) => t.toLowerCase()));

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      };

  const tabs: { id: View; label: string; icon: LucideIcon }[] = [
    { id: "grid", label: skills.viewGrid, icon: LayoutGrid },
    { id: "orbit", label: skills.viewOrbit, icon: Orbit },
  ];

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="py-16 md:py-20 border-b border-neutral-200/60 dark:border-neutral-800/60 scroll-mt-20"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-6 bg-accent-light dark:bg-accent-dark" aria-hidden="true" />
            <h2
              id="skills-title"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400"
            >
              {skills.sectionTitle}
            </h2>
          </div>
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-md">
            {skills.subtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={skills.sectionTitle}
          className="inline-flex self-start md:self-auto p-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = view === id;
            return (
              <button
                key={id}
                role="tab"
                id={`skills-tab-${id}`}
                aria-selected={selected}
                aria-controls={`skills-panel-${id}`}
                onClick={() => setView(id)}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light ${
                  selected
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="skills-tab-pill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-neutral-800 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative w-3.5 h-3.5" aria-hidden="true" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "grid" ? (
        <div role="tabpanel" id="skills-panel-grid" aria-labelledby="skills-tab-grid">
          {/* HDBank focus toggle */}
          <button
            type="button"
            aria-pressed={focusHdbank}
            onClick={() => setFocusHdbank((v) => !v)}
            className={`mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-light ${
              focusHdbank
                ? "border-accent-light/60 dark:border-accent-dark/60 bg-accent-light/15 dark:bg-accent-dark/15 text-neutral-900 dark:text-white"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark" aria-hidden="true" />
            {skills.hdbankLegend}
          </button>

          <motion.ul
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4"
          >
            {skills.groups.map((group, gi) => {
              const GroupIcon = GROUP_ICONS[gi] ?? CodeXml;
              return (
                <motion.li
                  key={group.category}
                  variants={item}
                  className={`rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 p-4 md:p-5 ${GROUP_SPANS[gi] ?? "lg:col-span-2"}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                        <GroupIcon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                        {group.category}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                      {group.items.length} {skills.toolsCount}
                    </span>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((skill) => {
                      const used = usedAtHdbank.has(skill.name.toLowerCase());
                      const dimmed = focusHdbank && !used;
                      return (
                        <li
                          key={skill.name}
                          className={`group inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg border text-[13px] font-medium transition-all duration-300 ${
                            dimmed ? "opacity-30" : "opacity-100"
                          } ${
                            used
                              ? "border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                              : "border-neutral-200/70 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <span className="text-neutral-500 dark:text-neutral-400 group-hover:hidden">
                            <TechIcon name={skill.name} className="w-4 h-4" />
                          </span>
                          <span className="hidden group-hover:inline">
                            <TechIcon name={skill.name} className="w-4 h-4" colored />
                          </span>
                          {skill.name}
                          {used && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark"
                              title={skills.hdbankLegend}
                            >
                              <span className="sr-only">{skills.hdbankLegend}</span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      ) : (
        <div role="tabpanel" id="skills-panel-orbit" aria-labelledby="skills-tab-orbit">
          <SkillsOrbit hint={skills.orbitHint} />
        </div>
      )}
    </section>
  );
}
