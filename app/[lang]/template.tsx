"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Calm page transition. Opacity only — a transform here would break position:fixed / pinned ScrollTriggers. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
