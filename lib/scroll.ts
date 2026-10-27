import type Lenis from "lenis";

/** Module-level handle to the (optional) Lenis instance so non-React code can scroll / lock scroll. */
let instance: Lenis | null = null;
let locks = 0;

export function setLenis(l: Lenis | null) {
  instance = l;
}
export function getLenis() {
  return instance;
}

export function lockScroll() {
  locks++;
  if (locks === 1) {
    instance?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    instance?.start();
    document.documentElement.style.overflow = "";
  }
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToTop() {
  if (prefersReducedMotion()) {
    window.scrollTo({ top: 0, behavior: "auto" });
  } else if (instance) {
    instance.scrollTo(0, { duration: 1.1 });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  if (prefersReducedMotion() || !instance) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  } else {
    instance.scrollTo(target, { offset, duration: 1.1 });
  }
}
