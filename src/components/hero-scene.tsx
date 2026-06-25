"use client";

/**
 * HeroScene — Three.js interactive particle constellation
 *
 * Design choices:
 * - ~800 particles (400 on mobile breakpoint) distributed in a sphere
 * - Lines drawn between particles within a proximity threshold
 *   (capped at 5 connections per particle to avoid O(n²) overdraw)
 * - Mouse parallax: subtle camera tilt (±4°) via smooth lerp
 * - Pointer attraction: nearby particles drift toward cursor via lerp
 * - Fully respects prefers-reduced-motion (renders one static frame only)
 * - Theme-aware: reads CSS variable --accent for particle/line color
 * - pointer-events: none so text/buttons below remain clickable
 * - Full Three.js dispose() on unmount (no memory leaks)
 */

import { useRef, useEffect } from "react";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT_DESKTOP = 800;
const PARTICLE_COUNT_MOBILE = 380;
const SPHERE_RADIUS = 280;
const LINE_THRESHOLD = 115; // units — max distance to draw a connection line
const MAX_CONNECTIONS_PER_PARTICLE = 5;
const MOUSE_ATTRACT_RADIUS = 100; // units — attraction zone around projected cursor
const MOUSE_ATTRACT_STRENGTH = 0.018; // lerp factor toward cursor
const CAMERA_PARALLAX_STRENGTH = 4; // degrees of tilt per normalized cursor unit
const CAMERA_PARALLAX_LERP = 0.035; // smoothing factor for camera parallax
const BASE_ROTATION_SPEED = 0.00018; // radians per frame for auto-rotation
const PARTICLE_SIZE = 2.2;

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Reduced-motion guard ──
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ── Resolve accent color from CSS variable ──
    const computedStyle = getComputedStyle(document.documentElement);
    const accentHex =
      computedStyle.getPropertyValue("--color-accent-dark").trim() || "#9DB3A7";

    // ── Scene setup ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true, // transparent background — inherits CSS bg
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // fully transparent

    const scene = new THREE.Scene();

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    renderer.setSize(W, H, false);

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.z = 500;

    // ── Particle geometry ─────────────────────────────────────────────────────
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;

    const positions = new Float32Array(count * 3);
    // Store original positions for attraction reset
    const originPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere for uniform distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = SPHERE_RADIUS * (0.5 + Math.random() * 0.5); // varied depth

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originPositions[i * 3] = x;
      originPositions[i * 3 + 1] = y;
      originPositions[i * 3 + 2] = z;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Use PointsMaterial for crisp dots (no custom shader needed)
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(accentHex),
      size: PARTICLE_SIZE,
      sizeAttenuation: true, // perspective scaling
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Connection lines geometry ──────────────────────────────────────────────
    // Pre-allocate max possible line segments (count * MAX_CONNECTIONS_PER_PARTICLE)
    const maxLineVerts = count * MAX_CONNECTIONS_PER_PARTICLE * 2;
    const linePositions = new Float32Array(maxLineVerts * 3);
    const lineGeo = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", linePosAttr);

    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // ── Mouse tracking (raw values, smoothed in RAF) ──────────────────────────
    // Using plain refs — no useState to avoid re-renders
    const mouse = { nx: 0, ny: 0 }; // normalized [-1, 1]
    const cameraTarget = { rotX: 0, rotY: 0 };

    // ── Projected cursor position in 3D space (used for attraction) ──────────
    const cursorWorld = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Normalized -1 to +1
      mouse.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Project cursor to z=0 plane in 3D for particle attraction
      pointerNDC.set(mouse.nx, mouse.ny);
      raycaster.setFromCamera(pointerNDC, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, cursorWorld);
    };

    canvas.parentElement?.addEventListener("mousemove", onMouseMove, {
      passive: true,
    });

    // ── Visibility pause ──────────────────────────────────────────────────────
    let paused = false;
    const onVisibilityChange = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ── Resize handler ────────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(canvas.parentElement ?? canvas);

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId: number;
    let frameCount = 0;

    function buildConnectionLines() {
      const pos = positions;
      let lineIdx = 0;
      const connectionCount = new Int32Array(count);

      for (let i = 0; i < count; i++) {
        if (connectionCount[i] >= MAX_CONNECTIONS_PER_PARTICLE) continue;

        const ax = pos[i * 3];
        const ay = pos[i * 3 + 1];
        const az = pos[i * 3 + 2];

        for (let j = i + 1; j < count; j++) {
          if (
            connectionCount[i] >= MAX_CONNECTIONS_PER_PARTICLE ||
            connectionCount[j] >= MAX_CONNECTIONS_PER_PARTICLE
          )
            continue;

          const bx = pos[j * 3];
          const by = pos[j * 3 + 1];
          const bz = pos[j * 3 + 2];

          const dx = ax - bx;
          const dy = ay - by;
          const dz = az - bz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < LINE_THRESHOLD && lineIdx < maxLineVerts - 2) {
            // Fade opacity by distance
            linePositions[lineIdx * 3] = ax;
            linePositions[lineIdx * 3 + 1] = ay;
            linePositions[lineIdx * 3 + 2] = az;
            lineIdx++;

            linePositions[lineIdx * 3] = bx;
            linePositions[lineIdx * 3 + 1] = by;
            linePositions[lineIdx * 3 + 2] = bz;
            lineIdx++;

            connectionCount[i]++;
            connectionCount[j]++;
          }
        }
      }

      linePosAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIdx);
    }

    function animate() {
      rafId = requestAnimationFrame(animate);

      if (paused) return;
      frameCount++;

      // ── Auto-rotate particle group ──
      particles.rotation.y += BASE_ROTATION_SPEED;
      particles.rotation.x += BASE_ROTATION_SPEED * 0.4;

      // ── Camera parallax (smooth lerp toward target) ──
      cameraTarget.rotX = mouse.ny * (CAMERA_PARALLAX_STRENGTH * (Math.PI / 180));
      cameraTarget.rotY = mouse.nx * (CAMERA_PARALLAX_STRENGTH * (Math.PI / 180));

      camera.rotation.x +=
        (cameraTarget.rotX - camera.rotation.x) * CAMERA_PARALLAX_LERP;
      camera.rotation.y +=
        (cameraTarget.rotY - camera.rotation.y) * CAMERA_PARALLAX_LERP;

      // ── Particle attraction toward cursor ──
      // Only run every 2nd frame to save CPU
      if (frameCount % 2 === 0 && cursorWorld.length() > 0) {
        for (let i = 0; i < count; i++) {
          const ox = originPositions[i * 3];
          const oy = originPositions[i * 3 + 1];

          const cx = positions[i * 3];
          const cy = positions[i * 3 + 1];

          // Distance from particle to cursor projection
          const dx = cursorWorld.x - cx;
          const dy = cursorWorld.y - cy;
          const distSq = dx * dx + dy * dy;

          if (distSq < MOUSE_ATTRACT_RADIUS * MOUSE_ATTRACT_RADIUS) {
            // Pull toward cursor
            positions[i * 3] += dx * MOUSE_ATTRACT_STRENGTH;
            positions[i * 3 + 1] += dy * MOUSE_ATTRACT_STRENGTH;
          } else {
            // Elastically return to origin
            positions[i * 3] += (ox - cx) * 0.04;
            positions[i * 3 + 1] += (oy - cy) * 0.04;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // ── Rebuild connection lines (every 3rd frame) ──
      if (frameCount % 3 === 0) {
        buildConnectionLines();
      }

      renderer.render(scene, camera);
    }

    if (prefersReducedMotion) {
      // Render a single static frame
      buildConnectionLines();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.parentElement?.removeEventListener("mousemove", onMouseMove);

      // Dispose Three.js objects
      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []); // runs once on mount

  return (
    <canvas
      ref={canvasRef}
      // Fill the parent container
      className="absolute inset-0 w-full h-full"
      style={{
        // Do not block pointer events on overlying text/buttons
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
