"use client";

/**
 * ConsoleGreeting — easter egg for whoever opens DevTools (often the tech lead).
 * Logs once per page load; renders nothing.
 */

import { useEffect } from "react";

let greeted = false;

export function ConsoleGreeting({ email, cvUrl }: { email: string; cvUrl: string }) {
  useEffect(() => {
    if (greeted) return;
    greeted = true;

    const accent = "color:#9DB3A7";
    const muted = "color:#94a3b8";
    const title =
      "font:800 22px/1.3 system-ui,sans-serif;color:#9DB3A7;text-shadow:0 0 12px rgba(157,179,167,.45)";
    const mono = "font:12px/1.6 ui-monospace,Menlo,monospace";

    console.log("%c👋 Hey, fellow developer!", title);
    console.log(
      "%cYou opened DevTools — so you're probably the one reviewing my code.\n%cThis site: Next.js 16 · React 19 · TypeScript · Tailwind v4 · R3F + postprocessing.",
      `${mono};${muted}`,
      `${mono};${accent}`
    );
    console.log(
      `%c> whoami\n%cLe Xuan Thanh — Frontend Developer @ HDBank\n%c> contact\n%c${email}\n%c> cv\n%c${cvUrl}`,
      `${mono};${muted}`,
      `${mono};color:inherit`,
      `${mono};${muted}`,
      `${mono};${accent}`,
      `${mono};${muted}`,
      `${mono};${accent}`
    );
    console.log("%cTip: press ⌘K / Ctrl+K on the page 😉", `${mono};${muted}`);
  }, [email, cvUrl]);

  return null;
}
