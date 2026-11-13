"use client";

/**
 * Site template (theme pack) + snow preference.
 *
 * Template resolution, in order:
 *   1. URL `?template=<name>` (e.g. /en?template=xmas) — must be in TEMPLATES
 *   2. NEXT_PUBLIC_TEMPLATE (build-time site-wide default, e.g. "xmas" in December)
 *   3. "default"
 * Unknown values fall through to the next step, so ?template=foo → default.
 *
 * To add a template: add its name to TEMPLATES, then branch on
 * `useTemplate() === "<name>"` where the UI should change.
 *
 * Read on the client only (server snapshot = "default"), so SSR always renders
 * the default template and hydration is safe.
 */

import { useSyncExternalStore } from "react";

export const TEMPLATES = ["default", "xmas"] as const;
export type Template = (typeof TEMPLATES)[number];

const SNOW_KEY = "snow-enabled";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
    window.removeEventListener("popstate", cb);
  };
}

function isTemplate(value: string | null | undefined): value is Template {
  return !!value && (TEMPLATES as readonly string[]).includes(value);
}

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked — preference just won't persist */
  }
}

function getTemplate(): Template {
  const fromUrl = new URLSearchParams(window.location.search).get("template");
  if (isTemplate(fromUrl)) return fromUrl;
  const fromEnv = process.env.NEXT_PUBLIC_TEMPLATE;
  if (isTemplate(fromEnv)) return fromEnv;
  return "default";
}

function getSnowEnabled() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return safeGet(SNOW_KEY) !== "0";
}

/** Current template. Re-read on every render, so client-side navigations pick it up. */
export function useTemplate(): Template {
  return useSyncExternalStore(subscribe, getTemplate, () => "default");
}

export function useSnowEnabled() {
  return useSyncExternalStore(subscribe, getSnowEnabled, () => false);
}

export function setSnowEnabled(on: boolean) {
  safeSet(SNOW_KEY, on ? "1" : "0");
  emit();
}

/**
 * Build a same-page URL for another locale, keeping ?template=… (and any other
 * query) so the chosen template survives a language switch.
 */
export function localeHref(pathname: string, nextLocale: string) {
  const segments = pathname.split("/");
  segments[1] = nextLocale;
  return segments.join("/") + window.location.search;
}

// One-time cleanup of the old ?xmas=1 override key.
if (typeof window !== "undefined") safeSet("xmas-override", null);
