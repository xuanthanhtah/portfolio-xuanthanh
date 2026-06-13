"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-border-light dark:bg-border-dark animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If browser doesn't support View Transitions or prefers-reduced-motion is active, skip transition
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate maximum radius to fully cover the screen
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.85, 0, 0.15, 1)",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 group"
      aria-label="Toggle dark mode"
    >
      <div className="relative overflow-hidden w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-text-dark transition-all duration-300 group-hover:scale-110" />
        ) : (
          <Moon className="w-4 h-4 text-text-light transition-all duration-300 group-hover:scale-110" />
        )}
      </div>
    </button>
  );
}
