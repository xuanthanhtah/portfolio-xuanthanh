"use client";

/**
 * BankingWorkflowSimulator
 *
 * Replaces the static Sparkline chart in ExperienceCard's expanded dashboard.
 * Renders an animated SVG pipeline: Azure Auth → JWT → Core Banking → Data Layer.
 *
 * Architecture:
 * - Pure SVG + Framer Motion — no Three.js (2D diagram doesn't need a 3D renderer)
 * - Animated dashed stroke-dashoffset on paths simulates live data flow
 * - Pulsing glow auras on nodes indicate active processing state
 * - Active prop gates all animation (matches Sparkline / WorkflowViz pattern)
 * - Fully reduced-motion safe via useReducedMotion
 */

import { useReducedMotion, motion } from "framer-motion";

interface BankingWorkflowSimulatorProps {
  active: boolean;
}

// ─── Pipeline node definitions ────────────────────────────────────────────────
const NODES = [
  {
    id: "azure",
    label: "Azure Auth",
    sublabel: "OAuth2 + MSAL",
    color: "#0078d4",
    glow: "rgba(0,120,212,0.30)",
    emoji: "🔷",
  },
  {
    id: "jwt",
    label: "JWT Validator",
    sublabel: "Silent Refresh",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.30)",
    emoji: "🔐",
  },
  {
    id: "core",
    label: "Core Banking",
    sublabel: "Sync Hub",
    color: "#8FA89B",
    glow: "rgba(143,168,155,0.30)",
    emoji: "🏦",
  },
  {
    id: "data",
    label: "Data Layer",
    sublabel: "10K+ Sessions",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.30)",
    emoji: "⚡",
  },
] as const;

// ─── Live stats strip ─────────────────────────────────────────────────────────
const LIVE_STATS = [
  { label: "Concurrent Sessions", value: "15,000+", color: "#8FA89B" },
  { label: "Avg. Response", value: "48 ms", color: "#6366f1" },
  { label: "Uptime SLA", value: "99.9%", color: "#22c55e" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function BankingWorkflowSimulator({ active }: BankingWorkflowSimulatorProps) {
  const reduceMotion = useReducedMotion();
  const animated = active && !reduceMotion;

  // SVG layout
  const SVG_W = 480;
  const SVG_H = 120;
  const NODE_W = 88;
  const NODE_H = 56;
  const NODE_R = 10;
  const COUNT = NODES.length;
  const GAP = (SVG_W - COUNT * NODE_W) / (COUNT - 1);
  const nodeX = (i: number) => i * (NODE_W + GAP) + NODE_W / 2;
  const nodeY = SVG_H / 2;

  const connectorPath = (i: number) => {
    const x1 = nodeX(i) + NODE_W / 2;
    const x2 = nodeX(i + 1) - NODE_W / 2;
    const y = nodeY;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y} C ${mx} ${y - 16}, ${mx} ${y + 16}, ${x2} ${y}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full bg-emerald-400"
          animate={animated ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Core Banking Workflow · Live Simulation
        </span>
      </div>

      {/* SVG Pipeline */}
      <div className="relative w-full rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 p-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ minHeight: 80 }}
        >
          <defs>
            {NODES.slice(0, -1).map((node, i) => (
              <linearGradient
                key={`grad-${i}`}
                id={`flow-grad-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={node.color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={NODES[i + 1].color} stopOpacity={0.85} />
              </linearGradient>
            ))}
          </defs>

          {/* ── Connectors ── */}
          {NODES.slice(0, -1).map((_, i) => (
            <g key={`conn-${i}`}>
              {/* dim base track */}
              <path
                d={connectorPath(i)}
                fill="none"
                stroke="#d4d4d4"
                strokeWidth={1.5}
                className="dark:stroke-neutral-700"
              />
              {/* animated dashed flow */}
              <motion.path
                d={connectorPath(i)}
                fill="none"
                stroke={`url(#flow-grad-${i})`}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="7 9"
                initial={{ strokeDashoffset: 32, opacity: 0 }}
                animate={
                  animated
                    ? { strokeDashoffset: [32, 0], opacity: 1 }
                    : { strokeDashoffset: 32, opacity: 0 }
                }
                transition={{
                  strokeDashoffset: {
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.18,
                  },
                  opacity: { duration: 0.4, delay: i * 0.15 + 0.2 },
                }}
              />
            </g>
          ))}

          {/* ── Nodes ── */}
          {NODES.map((node, i) => {
            const cx = nodeX(i);
            const x = cx - NODE_W / 2;
            const y = nodeY - NODE_H / 2;

            return (
              <g key={node.id}>
                {/* Glow pulse */}
                <motion.ellipse
                  cx={cx}
                  cy={nodeY}
                  rx={NODE_W / 2 + 6}
                  ry={NODE_H / 2 + 6}
                  fill={node.glow}
                  initial={{ opacity: 0 }}
                  animate={
                    animated
                      ? { opacity: [0.3, 0.8, 0.3] }
                      : { opacity: 0 }
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />

                {/* Card body — use rect with fill class via foreignObject trick not needed;
                    SVG fill inherits CSS custom properties so we set explicit light/dark fills */}
                <motion.rect
                  x={x}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={NODE_R}
                  stroke={node.color}
                  strokeWidth={1.5}
                  fill="white"
                  className="dark:fill-neutral-900"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.12 + 0.1,
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }}
                  style={{ transformOrigin: `${cx}px ${nodeY}px` }}
                />

                {/* Emoji icon */}
                <motion.text
                  x={cx}
                  y={nodeY - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={15}
                  initial={{ opacity: 0 }}
                  animate={active ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: i * 0.12 + 0.28 }}
                >
                  {node.emoji}
                </motion.text>

                {/* Primary label */}
                <motion.text
                  x={cx}
                  y={nodeY + 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={700}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fill={node.color}
                  initial={{ opacity: 0 }}
                  animate={active ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: i * 0.12 + 0.34 }}
                >
                  {node.label}
                </motion.text>

                {/* Sublabel */}
                <motion.text
                  x={cx}
                  y={nodeY + 21}
                  textAnchor="middle"
                  fontSize={6.5}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fill="#9ca3af"
                  initial={{ opacity: 0 }}
                  animate={active ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: i * 0.12 + 0.44 }}
                >
                  {node.sublabel}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {LIVE_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: i * 0.1 + 0.75, duration: 0.4 }}
            className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/40"
          >
            <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
              {stat.label}
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
