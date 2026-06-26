"use client";

/**
 * ProjectSection — Interactive project cards with unique visualizations
 *
 * Each project click expands to reveal a different interactive element:
 * - KPI PowerHome   → Animated Bell Curve SVG visualization
 * - EHRP            → Performance metrics with animated progress bars
 * - Money Transfer  → Step-by-step animated approval workflow
 */

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Dictionary } from "@/lib/dictionary";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectId = "kpi-powerhome" | "ehrp" | "money-transfer";

interface ProjectMeta {
  id: ProjectId;
  title: string;
  category: string;
  year: string;
}

// ─── KPI Bell Curve Visualization ────────────────────────────────────────────
function BellCurveViz({ active }: { active: boolean }) {
  // Approximate Gaussian curve as SVG path
  const w = 340;
  const h = 110;
  const points: [number, number][] = [];
  for (let x = 0; x <= 100; x += 2) {
    const nx = x / 100;
    const y = Math.exp(-Math.pow((nx - 0.5) * 5, 2) / 2);
    points.push([(nx * w), h - y * (h - 14) - 8]);
  }
  const pathD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  const zones = [
    { x: 0, label: "Below", color: "#ef444440", textColor: "#ef4444" },
    { x: 96, label: "Meets", color: "#f59e0b40", textColor: "#f59e0b" },
    { x: 192, label: "Exceeds", color: "#8FA89B40", textColor: "#8FA89B" },
    { x: 260, label: "Outstanding", color: "#6366f140", textColor: "#6366f1" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-light dark:bg-accent-dark" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          KPI Performance Distribution · 15,000+ Employees
        </span>
      </div>
      <div className="relative w-full overflow-hidden rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 p-4">
        <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Zone fills */}
          {zones.map((z, i) => (
            <motion.rect
              key={i}
              x={z.x}
              y={0}
              width={i < zones.length - 1 ? zones[i + 1].x - z.x : w - z.x}
              height={h}
              fill={z.color}
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: i * 0.1 + 0.4 }}
            />
          ))}

          {/* Gridlines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={t * w}
              y1={0}
              x2={t * w}
              y2={h}
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeDasharray="4 4"
            />
          ))}

          {/* Bell curve path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#8FA89B"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={active ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />

          {/* Area fill under curve */}
          <motion.path
            d={`${pathD} L ${w} ${h} L 0 ${h} Z`}
            fill="#8FA89B"
            fillOpacity={0.06}
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          />

          {/* Zone labels at bottom */}
          {zones.map((z, i) => (
            <motion.text
              key={`lbl-${i}`}
              x={z.x + (i < zones.length - 1 ? (zones[i + 1].x - z.x) / 2 : (w - z.x) / 2)}
              y={h + 18}
              textAnchor="middle"
              fontSize={9}
              fontFamily="system-ui"
              fontWeight={600}
              fill={z.textColor}
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: i * 0.1 + 0.8 }}
            >
              {z.label}
            </motion.text>
          ))}
        </svg>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Form Types", value: "12+" },
          { label: "Component Library", value: "30% faster" },
          { label: "Azure SSO", value: "✓ Integrated" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: i * 0.08 + 0.6 }}
            className="flex flex-col gap-0.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/40"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{s.label}</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{s.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── EHRP Performance Metrics ─────────────────────────────────────────────────
function EHRPMetricsViz({ active }: { active: boolean }) {
  const metrics = [
    { label: "API Calls Reduced", before: 100, after: 60, color: "#8FA89B", unit: "%" },
    { label: "Dashboard Load Time", before: 100, after: 28, color: "#6366f1", unit: "s", display: "−1s" },
    { label: "Component Reusability", before: 40, after: 95, color: "#f59e0b", unit: "%" },
    { label: "Bundle Size Optimized", before: 100, after: 68, color: "#ec4899", unit: "%" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          EHRP · Performance Impact Analysis
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{m.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: i * 0.12 + 0.5 }}
                className="text-xs font-bold"
                style={{ color: m.color }}
              >
                {m.display ?? `−${m.before - m.after}${m.unit}`}
              </motion.span>
            </div>
            {/* Before bar (muted) */}
            <div className="relative h-6 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              {/* After bar (colored) */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg flex items-center pl-2"
                style={{ backgroundColor: m.color + "33" }}
                initial={{ width: "0%" }}
                animate={active ? { width: `${m.before}%` } : { width: "0%" }}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-lg flex items-center"
                style={{ backgroundColor: m.color }}
                initial={{ width: "0%" }}
                animate={active ? { width: `${m.after}%` } : { width: "0%" }}
                transition={{ duration: 0.9, delay: i * 0.12 + 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="pl-2 text-[9px] font-bold text-white whitespace-nowrap">
                  After optimization
                </span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      {/* Onboarding/Offboarding badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ delay: 0.9 }}
        className="flex flex-wrap gap-2 mt-1"
      >
        {["Onboarding Flow", "Offboarding Flow", "Leave Management", "Org Chart", "Role Permissions"].map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-indigo-400/30 text-indigo-500 dark:text-indigo-400 bg-indigo-500/5"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Money Transfer Approval Workflow ─────────────────────────────────────────
function WorkflowViz({ active }: { active: boolean }) {
  const steps = [
    { label: "Draft", icon: "📝", color: "#6b7280", desc: "Dossier created" },
    { label: "Validation", icon: "🔍", color: "#f59e0b", desc: "Compliance check" },
    { label: "Core Banking", icon: "🏦", color: "#6366f1", desc: "Sync & verify" },
    { label: "FX Rate", icon: "💱", color: "#8FA89B", desc: "Rate confirmed" },
    { label: "Approved", icon: "✅", color: "#22c55e", desc: "Funds released" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          International Transfer · Approval Pipeline
        </span>
      </div>

      {/* Workflow steps */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-row sm:flex-col items-center gap-2 sm:gap-0 w-full sm:flex-1">
            <div className="flex sm:flex-col items-center sm:items-center w-full sm:w-auto gap-2 sm:gap-0">
              {/* Node */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: i * 0.2 + 0.1, type: "spring", stiffness: 200 }}
                className="flex items-center justify-center w-12 h-12 rounded-full text-xl shrink-0 border-2 relative z-10"
                style={{
                  borderColor: step.color,
                  backgroundColor: step.color + "18",
                }}
              >
                {step.icon}
                {/* Active pulse on final step */}
                {i === steps.length - 1 && active && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: step.color }}
                  />
                )}
              </motion.div>

              {/* Connector line (horizontal on sm+) */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0, scaleY: 0 }}
                  animate={active ? { scaleX: 1, scaleY: 1 } : { scaleX: 0, scaleY: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.2 + 0.4 }}
                  style={{ originX: 0, originY: 0 }}
                  className="hidden sm:block flex-1 h-0.5 bg-gradient-to-r from-neutral-300 to-neutral-200 dark:from-neutral-600 dark:to-neutral-700 w-full"
                />
              )}
            </div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: i * 0.2 + 0.35 }}
              className="sm:text-center mt-0 sm:mt-2 flex-1 sm:flex-none"
            >
              <div className="text-xs font-bold text-neutral-800 dark:text-white" style={{ color: step.color }}>
                {step.label}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{step.desc}</div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom feature list */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          { label: "Excel Import", detail: "Bulk dossier upload" },
          { label: "Excel Export", detail: "Transaction reports" },
          { label: "Core Banking Sync", detail: "Real-time balance" },
          { label: "Multi-currency", detail: "FX rate engine" },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 6 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ delay: i * 0.07 + 1.2 }}
            className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/40"
          >
            <div className="text-xs font-bold text-neutral-800 dark:text-white">{f.label}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">{f.detail}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
const vizComponents: Record<ProjectId, React.ComponentType<{ active: boolean }>> = {
  "kpi-powerhome": BellCurveViz,
  "ehrp": EHRPMetricsViz,
  "money-transfer": WorkflowViz,
};

const projectAccentColors: Record<ProjectId, string> = {
  "kpi-powerhome": "from-blue-600/20 to-indigo-600/10",
  "ehrp": "from-indigo-600/20 to-purple-600/10",
  "money-transfer": "from-emerald-600/20 to-teal-600/10",
};

const projectTechStacks: Record<ProjectId, string[]> = {
  "kpi-powerhome": ["React", "Tailwind", "React Query", "Zustand", "Ant Design", "Azure AD"],
  "ehrp": ["React", "Tailwind", "Zustand", "React Query"],
  "money-transfer": ["React", "TypeScript", "Core Banking API", "Excel.js"],
};

function ProjectCard({ project, index }: { project: ProjectMeta; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const VizComponent = vizComponents[project.id];

  const expandVariants: Variants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glow-on-hover rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden cursor-pointer"
      onClick={() => setIsExpanded((v) => !v)}
    >
      {/* Card header */}
      <div
        className={`bg-gradient-to-br ${projectAccentColors[project.id]} p-6 flex items-start justify-between gap-4`}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
            {project.category}
          </span>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug max-w-[40ch]">
            {project.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">{project.year}</span>
          <motion.div
            className="flex items-center gap-1 text-xs font-semibold text-accent-light dark:text-accent-dark"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              ↓
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Tech stack pills (always visible) */}
      <div className="flex flex-wrap gap-1.5 px-6 py-3 border-t border-b border-neutral-200/60 dark:border-neutral-800/60">
        {projectTechStacks[project.id].map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Expandable visualization */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="viz"
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div
              className="p-6 bg-white/50 dark:bg-neutral-900/30"
              onClick={(e) => e.stopPropagation()}
            >
              <VizComponent active={isExpanded} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
interface ProjectSectionProps {
  dict: Dictionary;
}

export function ProjectSection({ dict }: ProjectSectionProps) {
  const { projects } = dict;

  return (
    <section id="work" className="py-12 border-b border-neutral-200/60 dark:border-neutral-800/60">
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          {projects.title}
        </span>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Click any project to explore the interactive visualization
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {projects.list.map((proj, i) => (
          <ProjectCard key={proj.id} project={proj as ProjectMeta} index={i} />
        ))}
      </div>
    </section>
  );
}
