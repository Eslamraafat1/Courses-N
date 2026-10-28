"use client";
import { useEffect, useState } from "react";

interface NavExtra extends Navigator {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

let webglCache: boolean | null = null;
function hasWebgl(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const cv = document.createElement("canvas");
    webglCache = !!(cv.getContext("webgl2") || cv.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/** Can this device comfortably run a 3D scene? (reduced-motion, saveData, low cores/memory, small screens → no) */
function evaluate(minWidth: number): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as NavExtra;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  if ((nav.deviceMemory ?? 8) < 4) return false;
  if (window.innerWidth < minWidth) return false;
  return hasWebgl();
}

/** false on the server and during hydration, so the static fallback is always the first paint.
 *  The (costly) WebGL probe only runs once `enabled` (e.g. the scene is near the viewport) and when the browser is idle. */
export function useCapable(minWidth: number, enabled = true): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const run = () => setOk(evaluate(minWidth));
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle ? window.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 300);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", run);
    window.addEventListener("resize", run);
    return () => {
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      mq.removeEventListener("change", run);
      window.removeEventListener("resize", run);
    };
  }, [minWidth, enabled]);
  return enabled && ok;
}
