"use client";

/**
 * CommandPalette — ⌘K / Ctrl+K launcher (the "dev tool" a recruiter didn't expect).
 *
 * - Open: ⌘K / Ctrl+K, or the nav trigger (dispatches OPEN_PALETTE_EVENT)
 * - Fuzzy subsequence search over labels + keywords (EN + VI keywords)
 * - ↑/↓ to move, ↵ to run, Esc / backdrop to close; mouse hover syncs selection
 * - ARIA: dialog + combobox/listbox with aria-activedescendant; focus returns
 *   to the element that opened it; body scroll locked while open
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Briefcase,
  Sparkles,
  GraduationCap,
  Mail,
  Moon,
  Sun,
  Languages,
  Snowflake,
  Copy,
  Check,
  FileText,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { siGithub } from "simple-icons";
import { Dictionary } from "@/lib/dictionary";
import { localeHref, setSnowEnabled, useSnowEnabled, useTemplate } from "@/lib/template-store";
import { OPEN_PALETTE_EVENT } from "@/components/PaletteTrigger";

const GITHUB_URL = "https://github.com/xuanthanhtah";
const LINKEDIN_URL = "https://www.linkedin.com/in/xuanthanhtah/";
const CV_URL =
  "https://drive.google.com/file/d/1egQmUjWM_flHn63QUhG-fAY9P00OGgOd/view?usp=sharing";

type GroupKey = "navigate" | "actions" | "links";

interface Command {
  id: string;
  group: GroupKey;
  label: string;
  keywords: string;
  icon: LucideIcon | "github" | "linkedin";
  hint?: string;
  run: () => void | Promise<void>;
}

/** Subsequence fuzzy match → score (higher is better) or -1. */
function fuzzyScore(query: string, text: string) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return 1000 - direct; // substring beats subsequence
  let ti = 0;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    streak = found === ti ? streak + 1 : 0;
    score += 10 + streak * 5 - (found - ti);
    ti = found + 1;
  }
  return score;
}

function BrandGlyph({ kind }: { kind: "github" | "linkedin" }) {
  if (kind === "github") {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
        <path d={siGithub.path} />
      </svg>
    );
  }
  // LinkedIn isn't in simple-icons — simple "in" glyph
  return (
    <span className="w-4 h-4 rounded-[3px] bg-current flex items-center justify-center" aria-hidden="true">
      <span className="text-[9px] font-black leading-none text-white dark:text-neutral-900">in</span>
    </span>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const noopSubscribe = () => () => {};

export function CommandPalette({ dict }: { dict: Dictionary }) {
  const p = dict.palette;
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const season = useTemplate() === "xmas";
  const snowOn = useSnowEnabled();

  const locale = pathname.split("/")[1] === "vi" ? "vi" : "en";
  const isDark = resolvedTheme !== "light";

  const close = useCallback(() => setOpen(false), []);

  const show = useCallback(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setCopied(false);
    setOpen(true);
  }, []);

  // Global shortcut + external trigger
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, show);
    };
  }, [open, show, close]);

  // Focus, scroll lock, focus restore
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const nav = (id: string) => () => {
      close();
      // Wait one frame for the scroll lock to lift before scrolling
      requestAnimationFrame(() => scrollToId(id));
    };
    const openUrl = (url: string) => () => {
      window.open(url, "_blank", "noopener,noreferrer");
      close();
    };
    return [
      { id: "home", group: "navigate", label: p.items.home, keywords: "top home hero đầu trang", icon: ArrowUp, run: nav("home") },
      { id: "experience", group: "navigate", label: p.items.experience, keywords: "experience work job hdbank kinh nghiệm", icon: Briefcase, run: nav("experience") },
      { id: "skills", group: "navigate", label: p.items.skills, keywords: "skills stack tech react kỹ năng", icon: Sparkles, run: nav("skills") },
      { id: "education", group: "navigate", label: p.items.education, keywords: "education university hutech học vấn", icon: GraduationCap, run: nav("education") },
      { id: "contact", group: "navigate", label: p.items.contact, keywords: "contact hire liên hệ", icon: Mail, run: nav("contact") },
      {
        id: "theme",
        group: "actions",
        label: isDark ? p.items.themeLight : p.items.themeDark,
        keywords: "theme dark light mode giao diện sáng tối",
        icon: isDark ? Sun : Moon,
        run: () => {
          setTheme(isDark ? "light" : "dark");
          close();
        },
      },
      {
        id: "language",
        group: "actions",
        label: p.items.language,
        keywords: "language english vietnamese tiếng việt ngôn ngữ",
        icon: Languages,
        hint: locale === "en" ? "VI" : "EN",
        run: () => {
          const next = locale === "en" ? "vi" : "en";
          document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
          close();
          router.push(localeHref(pathname, next));
        },
      },
      ...(season
        ? [
            {
              id: "snow",
              group: "actions" as const,
              label: snowOn ? p.items.snowOff : p.items.snowOn,
              keywords: "snow christmas xmas tuyết",
              icon: Snowflake,
              run: () => {
                setSnowEnabled(!snowOn);
                close();
              },
            },
          ]
        : []),
      {
        id: "copy-email",
        group: "actions",
        label: copied ? p.items.copied : p.items.copyEmail,
        keywords: "copy email mail sao chép",
        icon: copied ? Check : Copy,
        hint: dict.footer.email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(dict.footer.email);
            setCopied(true);
            setTimeout(close, 900);
          } catch {
            window.location.href = `mailto:${dict.footer.email}`;
            close();
          }
        },
      },
      { id: "cv", group: "links", label: p.items.cv, keywords: "cv resume pdf download", icon: FileText, hint: "↗", run: openUrl(CV_URL) },
      { id: "github", group: "links", label: p.items.github, keywords: "github code repo", icon: "github", hint: "↗", run: openUrl(GITHUB_URL) },
      { id: "linkedin", group: "links", label: p.items.linkedin, keywords: "linkedin profile", icon: "linkedin", hint: "↗", run: openUrl(LINKEDIN_URL) },
      {
        id: "email",
        group: "links",
        label: p.items.email,
        keywords: "email mail contact gửi",
        icon: Mail,
        run: () => {
          window.location.href = `mailto:${dict.footer.email}`;
          close();
        },
      },
    ];
  }, [p, dict.footer.email, isDark, locale, pathname, router, season, snowOn, copied, setTheme, close]);

  const searching = query.trim() !== "";

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    return commands
      .map((c) => ({ c, s: Math.max(fuzzyScore(q, c.label) + 50, fuzzyScore(q, c.keywords)) }))
      .filter((x) => x.s > 40)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [commands, query]);

  const safeActive = Math.min(active, Math.max(results.length - 1, 0));

  // Keep the active row visible
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${safeActive}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [safeActive]);

  const runAt = (i: number) => {
    void results[i]?.run();
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = Math.max(results.length, 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((safeActive + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((safeActive - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(safeActive);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      e.preventDefault(); // keep focus inside the dialog
    }
  };

  // Browsing: grouped sections. Searching: one flat list ranked by score.
  const sections: { group: GroupKey | null; items: { cmd: Command; index: number }[] }[] = [];
  results.forEach((cmd, index) => {
    const key = searching ? null : cmd.group;
    const last = sections[sections.length - 1];
    if (last && last.group === key) last.items.push({ cmd, index });
    else sections.push({ group: key, items: [{ cmd, index }] });
  });

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={p.trigger}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-neutral-200 dark:border-neutral-800">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
              <span className="font-mono text-sm text-[#5E7A6C] dark:text-accent-dark select-none" aria-hidden="true">
                &gt;
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder={p.placeholder}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[safeActive] ? `palette-opt-${results[safeActive].id}` : undefined}
                aria-autocomplete="list"
                spellCheck={false}
                autoComplete="off"
                className="flex-1 min-w-0 h-14 bg-transparent text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
              />
              <kbd className="hidden sm:inline-flex font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-500">
                esc
              </kbd>
            </div>

            {/* Results */}
            <ul ref={listRef} id="palette-list" role="listbox" className="max-h-[min(60vh,380px)] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-neutral-500">{p.empty}</li>
              )}
              {sections.map(({ group, items }, si) => (
                <li key={`${group ?? "results"}-${si}`} role="presentation">
                  {group && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                      {p.groups[group]}
                    </div>
                  )}
                  <ul role="presentation">
                    {items.map(({ cmd, index }) => {
                      const selected = index === safeActive;
                      const Icon = cmd.icon;
                      return (
                        <li
                          key={cmd.id}
                          id={`palette-opt-${cmd.id}`}
                          role="option"
                          aria-selected={selected}
                          data-index={index}
                          onMouseMove={() => index !== safeActive && setActive(index)}
                          onClick={() => runAt(index)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                            selected
                              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                              : "text-neutral-600 dark:text-neutral-300"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                              selected
                                ? "border-accent-light/60 dark:border-accent-dark/50 text-[#5E7A6C] dark:text-accent-dark bg-white dark:bg-neutral-900"
                                : "border-neutral-200 dark:border-neutral-700/80 text-neutral-500 dark:text-neutral-400"
                            }`}
                          >
                            {typeof Icon === "string" ? (
                              <BrandGlyph kind={Icon} />
                            ) : (
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="flex-1 truncate">{cmd.label}</span>
                          {cmd.hint && (
                            <span className="hidden sm:inline font-mono text-[11px] text-neutral-400 dark:text-neutral-500 truncate max-w-[45%]">
                              {cmd.hint}
                            </span>
                          )}
                          {selected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <kbd className="font-mono px-1 rounded border border-neutral-200 dark:border-neutral-700">↑</kbd>
                <kbd className="font-mono px-1 rounded border border-neutral-200 dark:border-neutral-700">↓</kbd>
                {p.footer.navigate}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="font-mono px-1 rounded border border-neutral-200 dark:border-neutral-700">↵</kbd>
                {p.footer.select}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="font-mono px-1 rounded border border-neutral-200 dark:border-neutral-700">esc</kbd>
                {p.footer.close}
              </span>
              <span className="ml-auto font-mono text-neutral-400">{results.length} cmd</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
