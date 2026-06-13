"use client";

import { motion } from "framer-motion";
import { Dictionary } from "@/lib/dictionary";

interface PhilosophyProps {
  dict: Dictionary;
}

export function Philosophy({ dict }: PhilosophyProps) {
  const { philosophy } = dict;

  return (
    <section id="about" className="section-padding px-6 md:px-16 w-full max-w-7xl mx-auto flex flex-col justify-center select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_1.6fr] gap-8 lg:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 pt-3"
        >
          {philosophy.title}
        </motion.div>

        {/* Large Typography Manifesto */}
        <div className="flex flex-col gap-6 max-w-4xl">
          {philosophy.clauses.map((clause, index) => (
            <div key={index} className="overflow-hidden">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 70,
                  damping: 15,
                }}
                className={`text-2xl sm:text-4xl lg:text-[2.85rem] leading-[1.3] tracking-tight font-medium ${
                  index === philosophy.clauses.length - 1
                    ? "text-accent-light dark:text-accent-dark font-semibold"
                    : "text-neutral-800 dark:text-neutral-200"
                }`}
              >
                {clause}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
