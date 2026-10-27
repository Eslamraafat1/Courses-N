import {
  BarChart3, BrainCircuit, ShieldCheck, Camera, Palette, Briefcase, Clapperboard, Code2, Megaphone, PenTool, Sprout,
  BookOpen, Layers, Sparkles, type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

/** Explicit map keeps the bundle small (no `import *` of every icon). Add new data icons here. */
const map: Record<string, ComponentType<LucideProps>> = {
  BarChart3, BrainCircuit, ShieldCheck, Camera, Palette, Briefcase, Clapperboard, Code2, Megaphone, PenTool, Sprout, BookOpen, Layers, Sparkles,
};

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = map[name] ?? BookOpen;
  return <Icon aria-hidden {...props} />;
}
