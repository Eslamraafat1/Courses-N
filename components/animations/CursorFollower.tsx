"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useI18n } from "@/components/providers/I18nProvider";

type Mode = "idle" | "link" | "play" | "drag" | "view" | "text";

/**
 * Signature cursor (mouse only): a dot + a springy ring that grows on interactive elements and shows a label on
 * elements opting in with data-cursor="play|drag|view". The native cursor stays visible (nothing is hidden), it is
 * purely decorative (aria-hidden, pointer-events none) and disabled for touch / reduced-motion users.
 */
export function CursorFollower() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = (e.target as Element | null)?.closest?.("[data-cursor], a, button, input, textarea, select, summary, [role=button]") as HTMLElement | null;
      if (!el) return setMode("idle");
      const c = el.dataset.cursor as Mode | undefined;
      if (c) return setMode(c);
      const tag = el.tagName;
      setMode(tag === "INPUT" || tag === "TEXTAREA" ? "text" : "link");
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", dn, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const label = mode === "play" ? t("cursor.play") : mode === "drag" ? t("cursor.drag") : mode === "view" ? t("cursor.view") : "";
  const size = label ? 84 : mode === "link" ? 46 : mode === "text" ? 4 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300] overflow-hidden" style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}>
      <motion.div style={{ x, y }} className="absolute start-0 top-0">
        <span className="absolute -start-[3px] -top-[3px] size-1.5 rounded-full bg-volt mix-blend-difference" />
      </motion.div>
      <motion.div style={{ x: rx, y: ry }} className="absolute start-0 top-0">
        <motion.span
          animate={{ width: size, height: size, scale: down ? 0.86 : 1, opacity: mode === "text" ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-volt/80 bg-volt/10 text-[0.68rem] font-bold uppercase tracking-wider text-volt-ink backdrop-blur-[2px] rtl:translate-x-1/2"
          style={{ backgroundColor: label ? "var(--volt)" : undefined }}
        >
          {label}
        </motion.span>
      </motion.div>
    </div>
  );
}
