"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Decorative, aria-hidden accents for the stats cards: a drawing ring or a drawing sparkline. */
const SPARKS = [
  "M2 38 L18 30 L32 34 L48 18 L64 24 L80 8 L98 14",
  "M2 34 L16 36 L30 22 L46 28 L62 12 L80 18 L98 6",
  "M2 30 L20 36 L34 20 L50 24 L66 10 L82 16 L98 4",
];

export function StatAccent({ kind, seed }: { kind: "ring" | "spark"; seed: number }) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? {}
    : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true, margin: "-10% 0px" }, transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 } };
  if (kind === "ring")
    return (
      <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -end-6 -top-6 size-32 -rotate-90 opacity-30 sm:size-40">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <motion.circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" {...draw} style={reduce ? { pathLength: 0.72 } : undefined} />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" opacity="0.5" />
      </svg>
    );
  return (
    <svg aria-hidden viewBox="0 0 100 44" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-5 bottom-3 h-12 w-[calc(100%-2.5rem)] opacity-35 rtl:-scale-x-100">
      <motion.path d={SPARKS[seed % SPARKS.length]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" {...draw} />
    </svg>
  );
}
