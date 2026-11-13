"use client";

/**
 * Snowfall — page-wide falling snow behind all content (holiday mode).
 *
 * - One fixed <canvas> (2D, no extra WebGL context), pointer-events: none
 * - Flakes have depth: size, speed, opacity and sway scale together
 * - Cursor pushes nearby flakes aside; a slow global gust drifts them
 * - Rendered first in the DOM so the glass CV sheet blurs it naturally
 * - Off when: template is not "xmas", user toggled it off, or prefers-reduced-motion
 * - Pauses when the tab is hidden; density scales with viewport area
 */

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSnowEnabled, useTemplate } from "@/lib/template-store";

interface Flake {
  x: number;
  y: number;
  depth: number; // 0 (far) → 1 (near)
  r: number;
  vy: number;
  sway: number;
  phase: number;
  pushX: number;
}

const REPEL_RADIUS = 90;

function makeSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return c;
}

/** Tint a white sprite (light mode needs darker flakes to be visible). */
function tintSprite(sprite: HTMLCanvasElement, color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = sprite.width;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(sprite, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

export function Snowfall() {
  const season = useTemplate() === "xmas";
  const enabled = useSnowEnabled();
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDarkRef = useRef(true);
  useEffect(() => {
    isDarkRef.current = resolvedTheme !== "light";
  }, [resolvedTheme]);

  const active = season && enabled;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const white = makeSprite();
    const slate = tintSprite(white, "#5b6b7d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    const pointer = { x: -9999, y: -9999 };

    const spawn = (anywhere: boolean): Flake => {
      const depth = Math.random() ** 1.6; // most flakes far away
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        depth,
        r: 1 + depth * 3.2,
        vy: 18 + depth * 55, // px / s
        sway: 8 + depth * 22,
        phase: Math.random() * Math.PI * 2,
        pushX: 0,
      };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(w < 768 ? 260 : 900, (w * h) / 1500));
      if (flakes.length < target) {
        flakes = flakes.concat(Array.from({ length: target - flakes.length }, () => spawn(true)));
      } else {
        flakes.length = target;
      }
    };
    resize();

    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;

      const t = now / 1000;
      const gust = Math.sin(t * 0.23) * 14 + Math.sin(t * 0.61) * 6;
      const sprite = isDarkRef.current ? white : slate;
      const baseAlpha = isDarkRef.current ? 0.6 : 0.5;

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.vy * dt;
        f.x += (gust * (0.4 + f.depth) + Math.sin(t * 0.9 + f.phase) * f.sway) * dt;

        // Cursor repulsion (near flakes react more)
        const dx = f.x - pointer.x;
        const dy = f.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
          const d = Math.sqrt(d2) || 1;
          f.pushX += (dx / d) * (1 - d / REPEL_RADIUS) * 260 * (0.3 + f.depth) * dt;
        }
        f.pushX *= 0.92;
        f.x += f.pushX;

        if (f.y > h + 10) {
          flakes[i] = spawn(false);
          continue;
        }
        if (f.x < -10) f.x = w + 10;
        else if (f.x > w + 10) f.x = -10;

        const size = f.r * 2.4;
        ctx.globalAlpha = baseAlpha * (0.35 + 0.65 * f.depth);
        ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
