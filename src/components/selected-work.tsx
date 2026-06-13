"use client";

import { useRef, MouseEvent } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  href: string;
  url: string;
}

// Static asset mapping for non-translatable fields (keeps dictionary clean)
const projectAssets: Record<string, { imageUrl: string; href: string; url: string }> = {
  "kpi-powerhome": {
    imageUrl: "/kpi-powerhome.png",
    href: "#",
    url: "kpi.powerhome.hdbank.com.vn",
  },
  "ehrp": {
    imageUrl: "/ehrp.png",
    href: "#",
    url: "ehrp.hdbank.com.vn",
  },
  "money-transfer": {
    imageUrl: "/money-transfer.png",
    href: "#",
    url: "transfer.hdbank.com.vn",
  },
};

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion Values for mouse offsets
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map offsets to 3D rotation angles (-7.5deg to +7.5deg)
  const rotateX = useTransform(mouseY, [-300, 300], [7.5, -7.5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-7.5, 7.5]);

  // Apply spring transitions for smooth motion
  const springConfig = { stiffness: 150, damping: 20, mass: 0.1 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();

    // Calculate mouse position relative to card center
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative w-full rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900/20 backdrop-blur-md overflow-hidden p-4 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 select-none"
    >
      {/* 3D Image container - Safari Mockup style */}
      <div
        style={{ transform: "translateZ(30px)" }}
        className="w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/60 shadow-md flex flex-col relative"
      >
        {/* Safari Title Bar */}
        <div className="h-9 px-4 flex items-center justify-between bg-neutral-100/80 dark:bg-neutral-800/80 border-b border-neutral-200/50 dark:border-neutral-800/50 select-none shrink-0">
          {/* Left: Traffic light window controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
            <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
            <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
          </div>

          {/* Center: Address Bar */}
          <div className="flex items-center justify-center gap-1 px-2.5 py-0.5 bg-neutral-200/40 dark:bg-neutral-900/40 rounded text-[9px] text-neutral-500 dark:text-neutral-400 font-mono w-[60%] sm:w-[50%] truncate shadow-inner">
            <svg
              className="w-2 h-2 text-neutral-400 dark:text-neutral-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="truncate">{project.url}</span>
          </div>

          {/* Right: Empty space to balance */}
          <div className="w-[36px] shrink-0" />
        </div>

        {/* Browser Content */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-950">
          <div className="absolute inset-0 bg-neutral-950/5 dark:bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover scale-100 group-hover:scale-103 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Text Info */}
      <div
        style={{ transform: "translateZ(15px)" }}
        className="flex justify-between items-end px-2 py-1"
      >
        <div className="flex flex-col gap-1 max-w-[70%]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            {project.category}
          </span>
          <h4 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white truncate">
            {project.title}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            {project.year}
          </span>
          <div className="w-8 h-8 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center bg-white dark:bg-neutral-900 transition-all duration-300 group-hover:bg-neutral-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SelectedWorkProps {
  dict: Dictionary;
}

export function SelectedWork({ dict }: SelectedWorkProps) {
  const { projects } = dict;

  return (
    <section id="work" className="section-padding px-6 md:px-16 w-full max-w-7xl mx-auto select-none">
      {/* Section Indicator */}
      <div className="mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {projects.title}
        </span>
      </div>

      {/* Grid: 3 columns on desktop, 2 columns on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.list.map((proj) => {
          const assets = projectAssets[proj.id] || { imageUrl: "", href: "", url: "" };
          const projectWithAssets: Project = {
            ...proj,
            ...assets,
          };
          return <ProjectCard key={proj.id} project={projectWithAssets} />;
        })}
      </div>
    </section>
  );
}
