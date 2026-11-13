"use client";

/**
 * PaletteTrigger — nav button that opens the ⌘K command palette.
 * Shows ⌘K on Apple devices and Ctrl K elsewhere (resolved client-side only).
 */

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";

export const OPEN_PALETTE_EVENT = "open-command-palette";

const noopSubscribe = () => () => {};
const getIsApple = () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

export function PaletteTrigger({ label }: { label: string }) {
  const isApple = useSyncExternalStore(noopSubscribe, getIsApple, () => true);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      aria-label={label}
      title={label}
      aria-keyshortcuts={isApple ? "Meta+K" : "Control+K"}
      className="hidden md:inline-flex h-10 items-center gap-2 pl-3 pr-2 rounded-full border border-border-light dark:border-border-dark bg-white/40 dark:bg-black/40 backdrop-blur-md text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
    >
      <Search className="w-3.5 h-3.5" aria-hidden="true" />
      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70">
        {isApple ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
