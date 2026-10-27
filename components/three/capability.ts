"use client";
import { useSyncExternalStore } from "react";

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

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  window.addEventListener("resize", cb);
  return () => {
    mq.removeEventListener("change", cb);
    window.removeEventListener("resize", cb);
  };
}

/** false on the server and during hydration, so the static fallback is always the first paint. */
export function useCapable(minWidth: number): boolean {
  return useSyncExternalStore(subscribe, () => evaluate(minWidth), () => false);
}
