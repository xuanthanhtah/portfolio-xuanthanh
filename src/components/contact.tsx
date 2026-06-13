"use client";

import { motion } from "framer-motion";
import { Magnetic } from "./ui/magnetic";
import { ArrowUpRight } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface ContactProps {
  dict: Dictionary;
}

export function Contact({ dict }: ContactProps) {
  const { footer } = dict;

  const socialLinks = [
    { name: footer.socials.email, href: `mailto:${footer.email}` },
    { name: footer.socials.github, href: "https://github.com/xuanthanhtah" },
    { name: footer.socials.linkedin, href: "https://www.linkedin.com/in/xuanthanhtah/" },
    { name: footer.socials.resume, href: "https://drive.google.com/file/d/1egQmUjWM_flHn63QUhG-fAY9P00OGgOd/view?usp=sharing" },
  ];

  return (
    <footer id="contact" className="section-padding px-6 md:px-16 w-full max-w-7xl mx-auto border-t border-border-light dark:border-border-dark select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 items-start">
        {/* Left Side: Direct Call to Action */}
        <div className="flex flex-col items-start gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {footer.title}
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mt-4 text-neutral-900 dark:text-white">
              {footer.cta}
            </h2>
          </div>

          <div className="relative group">
            <Magnetic range={60} actionStrength={0.25}>
              <a
                href={`mailto:${footer.email}`}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200 hover:text-accent-light dark:hover:text-accent-dark transition-colors flex items-center gap-3"
              >
                {footer.email}
                <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-neutral-400 dark:text-neutral-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* Right Side: Social Grid */}
        <div className="flex flex-col gap-8 lg:items-end justify-between h-full py-2">
          {/* Social Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {socialLinks.map((link, index) => (
              <Magnetic key={index} range={40} actionStrength={0.25}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="relative text-sm font-semibold tracking-tight hover:text-accent-light dark:hover:text-accent-dark transition-colors py-1 group/link"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full height-[1.5px] bg-accent-light dark:bg-accent-dark scale-x-0 group-hover/link:scale-x-100 origin-left transition-transform duration-300" />
                </a>
              </Magnetic>
            ))}
          </div>

          {/* Minimal Meta Signature */}
          <div
            style={{ whiteSpace: "pre-line" }}
            className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-12 lg:mt-0 lg:text-right"
          >
            {footer.signature}
          </div>
        </div>
      </div>
    </footer>
  );
}
