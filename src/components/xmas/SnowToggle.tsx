"use client";

/**
 * SnowToggle — nav button to turn the page snow on/off (xmas template only).
 * Hidden for other templates and for prefers-reduced-motion users.
 */

import { Snowflake } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { setSnowEnabled, useSnowEnabled, useTemplate } from "@/lib/template-store";

interface SnowToggleProps {
  labelOn: string;
  labelOff: string;
  /** "nav" = round icon button (sm+ only, nav is too tight on phones); "code" = `snow = on` chip. */
  variant?: "nav" | "code";
}

export function SnowToggle({ labelOn, labelOff, variant = "nav" }: SnowToggleProps) {
  const season = useTemplate() === "xmas";
  const enabled = useSnowEnabled();
  const reduce = useReducedMotion();

  if (!season || reduce) return null;

  if (variant === "code") {
    return (
      <button
        type="button"
        onClick={() => setSnowEnabled(!enabled)}
        aria-pressed={enabled}
        aria-label={enabled ? labelOff : labelOn}
        className="pointer-events-auto font-mono text-[11px] sm:text-xs px-2.5 py-1 rounded-md border border-border-light dark:border-border-dark bg-white/60 dark:bg-black/50 backdrop-blur-md text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-sky-600 dark:text-sky-300">snow</span> ={" "}
        <span className={enabled ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
          {enabled ? "on" : "off"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setSnowEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? labelOff : labelOn}
      title={enabled ? labelOff : labelOn}
      className={`hidden sm:flex w-10 h-10 rounded-full border items-center justify-center transition-colors duration-300 backdrop-blur-md cursor-pointer ${
        enabled
          ? "border-sky-400/40 bg-sky-400/10 text-sky-500 dark:text-sky-300"
          : "border-border-light dark:border-border-dark bg-white/40 dark:bg-black/40 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      }`}
    >
      <Snowflake className={`w-4 h-4 ${enabled ? "motion-safe:animate-[spin_8s_linear_infinite]" : ""}`} aria-hidden="true" />
    </button>
  );
}
