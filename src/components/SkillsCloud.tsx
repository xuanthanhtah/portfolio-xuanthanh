"use client";

/**
 * SkillsCloud — 3D Orbiting Tech Icon Cloud
 *
 * Architecture:
 * - @react-three/fiber Canvas for declarative Three.js
 * - @react-three/drei useTexture for Simple Icons CDN image loading
 * - 15 tech sprites in 3 concentric rings, each ring auto-rotating via
 *   a shared useRef angle (no React state in animation loop = no re-renders)
 * - Hover: R3F onPointerOver raycasting → scale-up + tooltip via React state
 *   hoisted to parent (tooltip state in the DOM layer, not Three.js)
 * - Click: window.open to official docs
 * - Reduced-motion: static anchor grid, no canvas
 *
 * Light Mode Contrast:
 * - isDark=false → defaultColor = slate-700 (#334155), opacity 0.88
 * - isDark=true  → defaultColor = white (#ffffff), opacity 0.6
 * - Hover always cross-fades to the vibrant official brand color in both modes
 */

import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { Dictionary } from "@/lib/dictionary";

// ─── Tech data ─────────────────────────────────────────────────────────────────
interface TechNode {
  name: string;
  slug: string;
  docUrl: string;
  note: string;
  ring: 0 | 1 | 2;
  angleOffset: number;
  brandColor: string;
}

const TECH_NODES: TechNode[] = [
  // Ring 0 — 3 nodes
  { name: "React", slug: "react", docUrl: "https://react.dev", note: "Core UI library across all 4 HDBank enterprise apps", ring: 0, angleOffset: 0, brandColor: "#61dafb" },
  { name: "TypeScript", slug: "typescript", docUrl: "https://typescriptlang.org", note: "End-to-end type safety across banking form pipelines", ring: 0, angleOffset: Math.PI * 0.67, brandColor: "#3178c6" },
  { name: "JavaScript", slug: "javascript", docUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", note: "Legacy-layer scripting for Core Banking integrations", ring: 0, angleOffset: Math.PI * 1.34, brandColor: "#f7df1e" },

  // Ring 1 — 5 nodes
  { name: "Next.js", slug: "nextdotjs", docUrl: "https://nextjs.org", note: "App Router powering this portfolio and internal SSR tools", ring: 1, angleOffset: 0, brandColor: "#ffffff" },
  { name: "Tailwind CSS", slug: "tailwindcss", docUrl: "https://tailwindcss.com", note: "Utility-first styling across KPI PowerHome & EHRP UIs", ring: 1, angleOffset: Math.PI * 0.4, brandColor: "#06b6d4" },
  { name: "Zustand", slug: "npm", docUrl: "https://docs.pmnd.rs/zustand", note: "Global state for banking session and auth contexts", ring: 1, angleOffset: Math.PI * 0.8, brandColor: "#9ca3af" },
  { name: "React Query", slug: "reactquery", docUrl: "https://tanstack.com/query/latest", note: "Cut API calls by 40% in EHRP via smart caching", ring: 1, angleOffset: Math.PI * 1.2, brandColor: "#ff4154" },
  { name: "Ant Design", slug: "antdesign", docUrl: "https://ant.design", note: "Enterprise component library for KPI PowerHome dashboards", ring: 1, angleOffset: Math.PI * 1.6, brandColor: "#0170fe" },

  // Ring 2 — 8 nodes
  { name: "HTML5", slug: "html5", docUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML", note: "Semantic markup foundation for accessible banking UIs", ring: 2, angleOffset: 0, brandColor: "#e34f26" },
  { name: "CSS3", slug: "css", docUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS", note: "Custom animations and scroll-driven interactions", ring: 2, angleOffset: Math.PI * 0.25, brandColor: "#1572b6" },
  { name: "Astro", slug: "astro", docUrl: "https://astro.build", note: "Static site generator for internal documentation portals", ring: 2, angleOffset: Math.PI * 0.5, brandColor: "#bc52ee" },
  { name: "Redux Toolkit", slug: "redux", docUrl: "https://redux-toolkit.js.org", note: "Legacy state management for Money Transfer module", ring: 2, angleOffset: Math.PI * 0.75, brandColor: "#764abc" },
  { name: "Microfrontend", slug: "webpack", docUrl: "https://webpack.js.org/concepts/module-federation/", note: "Module Federation for scalable micro-app architecture", ring: 2, angleOffset: Math.PI * 1.0, brandColor: "#8DD6F9" },
  { name: "Azure AD", slug: "auth0", docUrl: "https://learn.microsoft.com/azure/active-directory", note: "OAuth2 + MSAL silent refresh flow across all banking apps", ring: 2, angleOffset: Math.PI * 1.25, brandColor: "#0078d4" },
  { name: "Git", slug: "git", docUrl: "https://git-scm.com", note: "GitFlow branching strategy across all enterprise repos", ring: 2, angleOffset: Math.PI * 1.5, brandColor: "#f05032" },
  { name: "Material UI", slug: "mui", docUrl: "https://mui.com", note: "Secondary component library for internal admin panels", ring: 2, angleOffset: Math.PI * 1.75, brandColor: "#007fff" },
];

const RING_RADII = [2.5, 4.5, 6.8] as const;
const RING_SPEEDS = [0.003, 0.0017, 0.001] as const;
const RING_TILT = [0, 0.18, -0.12] as const;
const SPRITE_BASE_SCALE = [0.8, 1.0, 1.2] as const;

// Light mode: slate-700 for sharp contrast against white/light backgrounds
const LIGHT_MODE_COLOR = new THREE.Color(0x334155);
// Dark mode: white for visibility against dark backgrounds
const DARK_MODE_COLOR = new THREE.Color(0xffffff);

// ─── SVG Fetch & Patch (Solves Three.js 0x0 Texture Bug) ─────────────────────
function iconUrl(slug: string) {
  return `https://cdn.simpleicons.org/${slug}/ffffff`;
}

const svgCache = new Map<string, string>();
const svgPromises = new Map<string, Promise<string>>();

function useSvgTexture(slug: string) {
  const url = iconUrl(slug);
  if (!svgCache.has(url)) {
    if (!svgPromises.has(url)) {
      const promise = fetch(url)
        .then((res) => res.text())
        .then((text) => {
          if (!text.includes("width=")) {
            text = text.replace("<svg ", '<svg width="256px" height="256px" ');
          }
          const blob = new Blob([text], { type: "image/svg+xml" });
          const objectUrl = URL.createObjectURL(blob);
          svgCache.set(url, objectUrl);
          return objectUrl;
        });
      svgPromises.set(url, promise);
    }
    throw svgPromises.get(url); // Suspend React while fetching
  }
  const texture = useTexture(svgCache.get(url)!);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Tooltip state ─────────────────────────────────────────────────────────────
interface TooltipState {
  name: string;
  note: string;
  docUrl: string;
  screenX: number;
  screenY: number;
  brandColor: string;
}

// ─── Single tech sprite ─────────────────────────────────────────────────────────
interface TechSpriteProps {
  node: TechNode;
  isDark: boolean;
  onHover: (t: TooltipState | null) => void;
}

function TechSprite({ node, isDark, onHover }: TechSpriteProps) {
  const { camera, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null);
  const hoveredRef = useRef(false);
  const scaleRef = useRef(SPRITE_BASE_SCALE[node.ring]);
  const angleRef = useRef(node.angleOffset);

  const texture = useSvgTexture(node.slug);

  const targetScale = SPRITE_BASE_SCALE[node.ring];

  // Theme-aware default color and opacity
  const defaultColor = useMemo(
    () => (isDark ? DARK_MODE_COLOR.clone() : LIGHT_MODE_COLOR.clone()),
    [isDark]
  );
  const defaultOpacity = isDark ? 0.6 : 0.88;

  const hoverColor = useMemo(() => new THREE.Color(node.brandColor), [node.brandColor]);

  useFrame(() => {
    if (!spriteRef.current) return;

    const ring = node.ring;

    // Hover-to-Pause Physics Logic
    if (!hoveredRef.current) {
      angleRef.current += RING_SPEEDS[ring];
    }
    const angle = angleRef.current;

    const radius = RING_RADII[ring];
    const tilt = RING_TILT[ring];

    // Expanded Motion Bounds
    const x = Math.cos(angle) * radius * 1.2;
    const y = Math.sin(angle) * Math.cos(tilt) * radius * 0.4;
    const z = Math.sin(angle) * Math.sin(tilt) * radius * 0.3;

    spriteRef.current.position.set(x, y, z);

    // Smooth scale interpolation toward target
    const hoverScale = hoveredRef.current ? targetScale * 1.8 : targetScale;
    scaleRef.current += (hoverScale - scaleRef.current) * 0.12;
    spriteRef.current.scale.setScalar(scaleRef.current);

    // Brand Color Transition on Hover — seamless cross-fade
    const mat = spriteRef.current.material as THREE.SpriteMaterial;
    const targetOpacity = hoveredRef.current ? 1.0 : defaultOpacity;
    mat.opacity += (targetOpacity - mat.opacity) * 0.12;
    mat.color.lerp(hoveredRef.current ? hoverColor : defaultColor, 0.12);
  });

  const getScreenPos = useCallback(() => {
    if (!spriteRef.current) return { sx: 0, sy: 0 };
    const pos = spriteRef.current.position.clone();
    pos.project(camera);
    return {
      sx: ((pos.x + 1) / 2) * size.width,
      sy: ((-pos.y + 1) / 2) * size.height,
    };
  }, [camera, size]);

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      hoveredRef.current = true;
      document.body.style.cursor = "pointer";
      const { sx, sy } = getScreenPos();
      onHover({
        name: node.name,
        note: node.note,
        docUrl: node.docUrl,
        screenX: sx,
        screenY: sy,
        brandColor: node.brandColor,
      });
    },
    [node, onHover, getScreenPos]
  );

  const handlePointerOut = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      hoveredRef.current = false;
      document.body.style.cursor = "default";
      onHover(null);
    },
    [onHover]
  );

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      window.open(node.docUrl, "_blank", "noopener,noreferrer");
    },
    [node.docUrl]
  );

  return (
    <sprite
      ref={spriteRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={defaultOpacity}
        color={isDark ? 0xffffff : 0x334155}
        depthWrite={false}
        sizeAttenuation
      />
    </sprite>
  );
}

// ─── Scene root ────────────────────────────────────────────────────────────────
function CloudScene({
  isDark,
  onHover,
}: {
  isDark: boolean;
  onHover: (t: TooltipState | null) => void;
}) {
  return (
    <>
      {TECH_NODES.map((node) => (
        <TechSprite key={node.name} node={node} isDark={isDark} onHover={onHover} />
      ))}
    </>
  );
}

// ─── HTML Tooltip overlay ───────────────────────────────────────────────────────
function Tooltip({ tip }: { tip: TooltipState | null }) {
  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          key={tip.name}
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 6 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute z-20 max-w-[200px]"
          style={{ left: Math.min(tip.screenX + 16, 680), top: tip.screenY - 40 }}
        >
          <div
            className="rounded-xl border px-3 py-2 shadow-xl"
            style={{
              borderColor: `${tip.brandColor}55`,
              background: "rgba(9,9,11,0.92)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-xs font-bold mb-0.5" style={{ color: tip.brandColor }}>
              {tip.name}
            </p>
            <p className="text-[10px] text-neutral-300 leading-snug">{tip.note}</p>
            <p className="text-[9px] text-neutral-600 mt-1 font-mono">click to open docs →</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Static fallback (reduced-motion / no-JS) ──────────────────────────────────
function StaticFallback() {
  return (
    <div className="flex flex-wrap gap-2.5 py-2">
      {TECH_NODES.map((node) => (
        <a
          key={node.name}
          href={node.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700/70 bg-white dark:bg-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors text-xs font-semibold text-neutral-700 dark:text-neutral-300"
          title={node.note}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl(node.slug)}
            alt={node.name}
            width={14}
            height={14}
            className="w-3.5 h-3.5 object-contain opacity-75"
          />
          {node.name}
        </a>
      ))}
    </div>
  );
}

// ─── Main exported component ────────────────────────────────────────────────────
interface SkillsCloudProps {
  dict: Dictionary;
}

export function SkillsCloud({ dict }: SkillsCloudProps) {
  const reduceMotion = useReducedMotion();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const { resolvedTheme } = useTheme();
  const skills = dict.skills;

  // Derive isDark from resolvedTheme — safe default to dark until hydrated
  const isDark = resolvedTheme !== "light";

  return (
    <section
      id="skills"
      className="py-12 border-b border-neutral-200/60 dark:border-neutral-800/60"
    >
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          {skills.sectionTitle}
        </span>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Hover to preview · Click to open official docs
        </p>
      </div>

      {reduceMotion ? (
        <StaticFallback />
      ) : (
        <div
          className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-950/[0.02] dark:bg-neutral-950/50 z-10 pointer-events-auto"
        >
          {/* Ambient radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(143,168,155,0.07) 0%, transparent 72%)",
            }}
          />

          <Canvas
            camera={{ position: [0, 0, 9.5], fov: 54 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.8} />
            <Suspense fallback={<Html center><div className="text-sm font-mono text-neutral-500 bg-white/80 dark:bg-black/80 px-4 py-2 rounded-lg backdrop-blur-md">Loading 3D Stack...</div></Html>}>
              <CloudScene isDark={isDark} onHover={setTooltip} />
            </Suspense>
          </Canvas>

          <Tooltip tip={tooltip} />

          <div className="absolute bottom-3 right-4 text-[9px] font-mono text-neutral-300 dark:text-neutral-600 select-none pointer-events-none">
            16 technologies · 3 orbit rings
          </div>
        </div>
      )}
    </section>
  );
}
