"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse active locale from pathname (e.g., /en/about -> en)
  const currentLocale = pathname.split("/")[1] || "en";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Set preference cookie to preserve choice
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Replace current locale segment in URL path
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    setIsOpen(false);
    router.push(newPath);
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -8,
      transition: {
        duration: 0.15,
      },
    },
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "vi", name: "Tiếng Việt" },
  ];

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 sm:h-10 px-2.5 sm:px-4 rounded-full border border-border-light dark:border-border-dark flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 bg-white/40 dark:bg-black/40 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 group"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors duration-300" />
        <span>{currentLocale}</span>
        <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Spring Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-950 p-1.5 shadow-xl shadow-black/5 dark:shadow-white/5 backdrop-blur-md flex flex-col gap-0.5"
          >
            {languages.map((lang) => {
              const isActive = lang.code === currentLocale;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLocaleChange(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors duration-300 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>{lang.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
