"use client";

/**
 * ChristmasTreeScene — procedural 3D tree for the hero (holiday mode).
 *
 * Built entirely in code (no model / HDR downloads):
 * - Foliage: one InstancedMesh of needle clusters on 5 cone tiers + dark fill cones
 * - Lights: 120 bulbs on a spiral, one InstancedMesh, HDR instance colors
 *   animated per frame (twinkle / chase / breathe) → picked up by Bloom
 * - Only 3 real point lights travel along the garland + a warm star light;
 *   everything else glows through emissive color + Bloom (cheap, looks rich)
 * - Ornaments use tech brand colors; hover shows the tech name
 * - Drag to rotate (PresentationControls), click the tree to switch light mode
 * - Perf: seeded geometry (built once), frameloop pauses off-screen,
 *   PerformanceMonitor drops DPR + Bloom on weak GPUs, lighter mobile build
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  PresentationControls,
  ContactShadows,
  Environment,
  Lightformer,
  PerformanceMonitor,
  Html,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import type { LightMode } from "./light-modes";

// ─── Constants ────────────────────────────────────────────────────────────────
const TIERS = [
  { y: -1.3, h: 1.55, r: 1.55 },
  { y: -0.62, h: 1.4, r: 1.28 },
  { y: 0.02, h: 1.22, r: 1.02 },
  { y: 0.6, h: 1.05, r: 0.76 },
  { y: 1.12, h: 0.92, r: 0.5 },
] as const;
const TREE_TOP = TIERS[4].y + TIERS[4].h; // ≈ 2.04
const GROUND_Y = -1.75;

const BULB_COLORS = ["#ffd27a", "#ff6b6b", "#9DB3A7", "#7ab8ff", "#fff4e0"];
const ORNAMENTS = [
  { name: "React", color: "#61DAFB" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Next.js", color: "#d4d4d8" },
  { name: "Tailwind CSS", color: "#06B6D4" },
  { name: "React Query", color: "#FF4154" },
  { name: "Zustand", color: "#A0773C" },
  { name: "Ant Design", color: "#0170FE" },
  { name: "Redux Toolkit", color: "#764ABC" },
  { name: "Azure AD", color: "#0078D4" },
  { name: "JavaScript", color: "#E8C900" },
];

// Seeded RNG → identical tree on every load, and no Math.random during render.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Outer silhouette radius of the tree at height y. */
function radiusAt(y: number) {
  let r = 0;
  for (const t of TIERS) {
    if (y >= t.y && y <= t.y + t.h) r = Math.max(r, t.r * (1 - (y - t.y) / t.h));
  }
  return r;
}

// ─── Foliage ──────────────────────────────────────────────────────────────────
function Foliage({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.ConeGeometry(0.055, 0.4, 4);
    g.translate(0, 0.2, 0); // base at origin so clusters grow outward
    return g;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rand = mulberry32(7);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    const dark = new THREE.Color("#173d2b");
    const light = new THREE.Color("#2f6e4b");
    const snow = new THREE.Color("#a9c7bb");

    const weights = TIERS.map((t) => t.r * t.h);
    const total = weights.reduce((a, b) => a + b, 0);
    let i = 0;
    TIERS.forEach((tier, ti) => {
      const n = ti === TIERS.length - 1 ? count - i : Math.round((count * weights[ti]) / total);
      for (let k = 0; k < n && i < count; k++, i++) {
        const t = 1 - Math.sqrt(rand()); // more clusters near the wide base
        const angle = rand() * Math.PI * 2;
        const rad = tier.r * (1 - t) * (0.62 + 0.38 * rand());
        p.set(Math.cos(angle) * rad, tier.y + t * tier.h, Math.sin(angle) * rad);
        dir.set(Math.cos(angle), -0.25 - 0.45 * rand() + 0.35 * t, Math.sin(angle)).normalize();
        q.setFromUnitVectors(up, dir);
        const sc = (0.75 + 0.55 * rand()) * (0.55 + 0.45 * (1 - t)) * (0.7 + 0.3 * (tier.r / 1.55));
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);

        if (rand() < 0.035 && t > 0.2) color.copy(snow);
        else color.copy(dark).lerp(light, rand() * 0.8 + t * 0.2);
        mesh.setColorAt(i, color);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count]);

  return (
    <group>
      {/* Dark inner cones fill the gaps between needle clusters */}
      {TIERS.map((t) => (
        <mesh key={t.y} position={[0, t.y + t.h / 2, 0]}>
          <coneGeometry args={[t.r * 0.82, t.h, 28]} />
          <meshStandardMaterial color="#10291d" roughness={0.95} />
        </mesh>
      ))}
      <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
        <meshStandardMaterial roughness={0.8} metalness={0.05} />
      </instancedMesh>
      {/* Trunk */}
      <mesh position={[0, GROUND_Y + 0.25, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.55, 12]} />
        <meshStandardMaterial color="#4a2f1d" roughness={1} />
      </mesh>
    </group>
  );
}

// ─── Garland lights ───────────────────────────────────────────────────────────
const BULB_COUNT = 120;
const TURNS = 7.5;

function useBulbLayout() {
  return useMemo(() => {
    const rand = mulberry32(42);
    const positions: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const phases: number[] = [];
    const y0 = TIERS[0].y + 0.08;
    const y1 = TREE_TOP - 0.25;
    for (let i = 0; i < BULB_COUNT; i++) {
      const u = i / (BULB_COUNT - 1);
      const y = y0 + u * (y1 - y0);
      const a = u * TURNS * Math.PI * 2;
      const r = radiusAt(y) * 0.93 + 0.04;
      positions.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      colors.push(new THREE.Color(BULB_COLORS[i % BULB_COLORS.length]));
      phases.push(rand() * Math.PI * 2);
    }
    return { positions, colors, phases };
  }, []);
}

function Lights({ mode, boost, animate }: { mode: LightMode; boost: number; animate: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const travelRefs = useRef<(THREE.PointLight | null)[]>([]);
  const { positions, colors, phases } = useBulbLayout();
  const colorArray = useMemo(() => new Float32Array(BULB_COUNT * 3), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [positions]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh?.instanceColor) return;
    const t = animate ? clock.elapsedTime : 1.2;
    const arr = mesh.instanceColor.array as Float32Array;
    for (let i = 0; i < BULB_COUNT; i++) {
      let k: number;
      if (mode === "chase") {
        const w = 0.5 + 0.5 * Math.sin(i * 0.38 - t * 4.2);
        k = 0.12 + 0.88 * w ** 4;
      } else if (mode === "breathe") {
        k = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 1.6));
      } else {
        const w = 0.5 + 0.5 * Math.sin(t * (1.4 + (phases[i] % 1.6)) + phases[i]);
        k = 0.3 + 0.7 * w ** 3;
      }
      const c = colors[i];
      arr[i * 3] = c.r * k * boost;
      arr[i * 3 + 1] = c.g * k * boost;
      arr[i * 3 + 2] = c.b * k * boost;
    }
    mesh.instanceColor.needsUpdate = true;

    // Three real lights travel up the garland so needles/ornaments catch moving light
    travelRefs.current.forEach((light, j) => {
      if (!light) return;
      const u = (t * 0.035 + j / 3) % 1;
      const idx = Math.min(BULB_COUNT - 1, Math.floor(u * BULB_COUNT));
      const p = positions[idx];
      light.position.set(p.x * 1.15, p.y, p.z * 1.15);
    });
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, BULB_COUNT]}>
        <sphereGeometry args={[0.042, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
        <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
      </instancedMesh>
      {[0, 1, 2].map((j) => (
        <pointLight
          key={j}
          ref={(el) => {
            travelRefs.current[j] = el;
          }}
          color={["#ffcf8a", "#ff8a7a", "#9fd0ff"][j]}
          intensity={2.2}
          distance={2.2}
          decay={2}
        />
      ))}
    </group>
  );
}

// ─── Star ─────────────────────────────────────────────────────────────────────
function Star({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outer = 0.24;
    const inner = 0.1;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    g.center();
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    ref.current.rotation.y = clock.elapsedTime * 0.6;
    const pulse = 2.6 + Math.sin(clock.elapsedTime * 2.2) * 0.5;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
  });

  return (
    <group position={[0, TREE_TOP + 0.16, 0]}>
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial
          color="#ffcf5a"
          emissive="#ffb733"
          emissiveIntensity={2.6}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#ffc56b" intensity={6} distance={3.2} decay={2} />
    </group>
  );
}

// ─── Ornaments ────────────────────────────────────────────────────────────────
function Ornaments() {
  const [hovered, setHovered] = useState<number | null>(null);
  const items = useMemo(() => {
    const rand = mulberry32(99);
    return ORNAMENTS.map((o, i) => {
      // Spread evenly in height, golden-angle around the tree
      const y = TIERS[0].y + 0.25 + (i / ORNAMENTS.length) * (TREE_TOP - TIERS[0].y - 0.75);
      const a = i * 2.39996 + rand() * 0.4;
      const r = radiusAt(y) * 0.86 + 0.06;
      return { ...o, pos: [Math.cos(a) * r, y - 0.05, Math.sin(a) * r] as [number, number, number] };
    });
  }, []);

  return (
    <group>
      {items.map((o, i) => (
        <group key={o.name} position={o.pos}>
          <mesh
            scale={hovered === i ? 1.35 : 1}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "";
            }}
          >
            <sphereGeometry args={[0.1, 24, 24]} />
            <meshStandardMaterial color={o.color} metalness={0.85} roughness={0.16} envMapIntensity={1.4} />
          </mesh>
          {/* Cap */}
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 8]} />
            <meshStandardMaterial color="#c9b37a" metalness={0.9} roughness={0.3} />
          </mesh>
          {hovered === i && (
            <Html position={[0, 0.2, 0]} center distanceFactor={7} zIndexRange={[20, 0]}>
              <div className="pointer-events-none whitespace-nowrap rounded-md border border-white/10 bg-black/80 px-2 py-1 font-mono text-[11px] text-white shadow-lg backdrop-blur">
                <span style={{ color: o.color }}>●</span> {o.name}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

// ─── Gifts + ground ───────────────────────────────────────────────────────────
function Gift({ position, size, color, ribbon }: { position: [number, number, number]; size: number; color: string; ribbon: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh>
        <boxGeometry args={[size * 1.02, size * 1.02, size * 0.18]} />
        <meshStandardMaterial color={ribbon} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh>
        <boxGeometry args={[size * 0.18, size * 1.02, size * 1.02]} />
        <meshStandardMaterial color={ribbon} metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Ground({ isDark }: { isDark: boolean }) {
  const alphaMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.55, "#bbb");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group position={[0, GROUND_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial
          color={isDark ? "#d9e6e1" : "#f4f8f6"}
          roughness={1}
          transparent
          alphaMap={alphaMap}
          depthWrite={false}
        />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={isDark ? 0.6 : 0.35} scale={5} blur={2.6} far={3.5} frames={1} />
      <Gift position={[0.62, 0.14, 0.55]} size={0.28} color="#b93a3a" ribbon="#e9c46a" />
      <Gift position={[-0.55, 0.11, 0.62]} size={0.22} color="#2b5d8a" ribbon="#e5e7eb" />
      <Gift position={[0.08, 0.09, 0.85]} size={0.18} color="#5e7a6c" ribbon="#ffd27a" />
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Tree({
  mode,
  onCycleMode,
  isDark,
  animate,
  lite,
}: {
  mode: LightMode;
  onCycleMode: () => void;
  isDark: boolean;
  animate: boolean;
  lite: boolean;
}) {
  const spinRef = useRef<THREE.Group>(null);
  const { size, camera } = useThree();

  // Fit the whole scene (tree + gifts, ≈3.9 wide × 4.6 tall) in any aspect ratio
  const fitZ = useMemo(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const tan = Math.tan(THREE.MathUtils.degToRad(persp.fov / 2));
    const aspect = size.width / Math.max(size.height, 1);
    return Math.max(4.5 / (2 * tan), 3.6 / (2 * tan * aspect));
  }, [size, camera]);

  useFrame((state, delta) => {
    const cam = state.camera;
    if (!animate) {
      cam.position.set(0, 0.35, fitZ);
      cam.lookAt(0, 0.2, 0);
      return;
    }
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.12;
    // Gentle parallax toward the pointer
    cam.position.x += (state.pointer.x * 0.45 - cam.position.x) * 0.04;
    cam.position.y += (0.35 + state.pointer.y * 0.25 - cam.position.y) * 0.04;
    cam.position.z += (fitZ - cam.position.z) * 0.08;
    cam.lookAt(0, 0.2, 0);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore the click that ends a drag-rotate
    if (e.delta > 4) return;
    e.stopPropagation();
    onCycleMode();
  };

  return (
    <PresentationControls
      global={false}
      cursor
      snap={false}
      speed={1.4}
      polar={[-0.05, 0.12]}
      azimuth={[-Infinity, Infinity]}
    >
      <group ref={spinRef} onClick={handleClick}>
        <Foliage count={lite ? 1600 : 3800} />
        <Lights mode={mode} boost={isDark ? 3.2 : 2} animate={animate} />
        <Star animate={animate} />
        <Ornaments />
      </group>
      <Ground isDark={isDark} />
    </PresentationControls>
  );
}

interface ChristmasTreeSceneProps {
  isDark: boolean;
  mode: LightMode;
  onCycleMode: () => void;
}

export default function ChristmasTreeScene({ isDark, mode, onCycleMode }: ChristmasTreeSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [env] = useState(() => ({
    reduce: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    lite: window.innerWidth < 768,
  }));

  // Stop rendering while the hero is scrolled out of view
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !env.reduce;
  const bloom = !env.lite && !degraded;

  // The Bloom pass drops canvas alpha, so paint the page background colour
  // instead and feather the edges with a CSS mask to blend into the page.
  const bg = isDark ? "#090A0C" : "#FAFAFA";
  const feather =
    "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)";

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      style={{ maskImage: feather, WebkitMaskImage: feather }}
    >
      <Canvas
        frameloop={visible && animate ? "always" : "demand"}
        dpr={degraded ? 1 : [1, env.lite ? 1.5 : 1.75]}
        camera={{ position: [0, 0.35, 7.6], fov: 34 }}
        gl={{ antialias: !bloom, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isDark ? 1.05 : 1.2;
        }}
        style={{ background: "transparent" }}
      >
        {bloom && <color attach="background" args={[bg]} />}
        <PerformanceMonitor onDecline={() => setDegraded(true)} />

        <ambientLight intensity={isDark ? 0.18 : 0.55} />
        <hemisphereLight args={["#bcd6ff", "#1b2a22", isDark ? 0.5 : 0.9]} />
        <directionalLight position={[-3, 5, 4]} intensity={isDark ? 0.9 : 1.6} color="#dfe9ff" />

        {/* Local light rig for ornament reflections — no HDR download */}
        <Environment resolution={64} frames={1}>
          <Lightformer form="ring" intensity={2} color="#ffd9a0" position={[0, 3, -4]} scale={3} />
          <Lightformer form="rect" intensity={1.5} color="#cfe0ff" position={[-4, 1, 2]} scale={[2, 4, 1]} />
          <Lightformer form="rect" intensity={1} color="#9DB3A7" position={[4, 0, 2]} scale={[2, 3, 1]} />
        </Environment>

        <Tree mode={mode} onCycleMode={onCycleMode} isDark={isDark} animate={animate} lite={env.lite} />

        {bloom && (
          <EffectComposer multisampling={0}>
            <Bloom
              mipmapBlur
              luminanceThreshold={1}
              luminanceSmoothing={0.2}
              intensity={isDark ? 1.25 : 0.7}
              radius={0.7}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
