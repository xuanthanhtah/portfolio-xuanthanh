/**
 * TechIcon — inline brand icons for tech names (no CDN request).
 *
 * Uses tree-shaken named imports from `simple-icons`. Tech without a
 * brand icon in simple-icons (Azure AD, IIS) falls back to a Lucide glyph.
 */

import {
  siReact,
  siTypescript,
  siJavascript,
  siHtml5,
  siNextdotjs,
  siJquery,
  siWebpack,
  siTailwindcss,
  siAntdesign,
  siMui,
  siReactquery,
  siRedux,
  siGit,
  type SimpleIcon,
} from "simple-icons";
import { Boxes, Server, ShieldCheck, CodeXml, type LucideIcon } from "lucide-react";

type IconEntry =
  | { kind: "brand"; icon: SimpleIcon; color: string }
  | { kind: "lucide"; icon: LucideIcon; color: string };

// Brand colors that are too dark/light to read on one theme use currentColor.
const ICONS: Record<string, IconEntry> = {
  react: { kind: "brand", icon: siReact, color: "#61DAFB" },
  typescript: { kind: "brand", icon: siTypescript, color: "#3178C6" },
  javascript: { kind: "brand", icon: siJavascript, color: "#E8C900" },
  "html / css": { kind: "brand", icon: siHtml5, color: "#E34F26" },
  "next.js": { kind: "brand", icon: siNextdotjs, color: "currentColor" },
  jquery: { kind: "brand", icon: siJquery, color: "#0769AD" },
  "micro front-end": { kind: "brand", icon: siWebpack, color: "#5AAFD6" },
  "tailwind css": { kind: "brand", icon: siTailwindcss, color: "#06B6D4" },
  "ant design": { kind: "brand", icon: siAntdesign, color: "#0170FE" },
  "material ui": { kind: "brand", icon: siMui, color: "#007FFF" },
  "react query": { kind: "brand", icon: siReactquery, color: "#FF4154" },
  "redux toolkit": { kind: "brand", icon: siRedux, color: "#764ABC" },
  zustand: { kind: "lucide", icon: Boxes, color: "#A0773C" },
  gitflow: { kind: "brand", icon: siGit, color: "#F03C2E" },
  "iis server": { kind: "lucide", icon: Server, color: "#5E7AA8" },
  "azure ad": { kind: "lucide", icon: ShieldCheck, color: "#0078D4" },
};

export function getTechColor(name: string) {
  return ICONS[name.toLowerCase()]?.color ?? "currentColor";
}

interface TechIconProps {
  name: string;
  className?: string;
  /** Render in brand color instead of inheriting the text color. */
  colored?: boolean;
}

export function TechIcon({ name, className = "w-4 h-4", colored = false }: TechIconProps) {
  const entry = ICONS[name.toLowerCase()];
  const color = colored && entry ? entry.color : "currentColor";

  if (!entry) {
    return <CodeXml className={className} aria-hidden="true" />;
  }

  if (entry.kind === "lucide") {
    const Icon = entry.icon;
    return <Icon className={className} style={{ color }} aria-hidden="true" />;
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill={color}
      aria-hidden="true"
    >
      <path d={entry.icon.path} />
    </svg>
  );
}
