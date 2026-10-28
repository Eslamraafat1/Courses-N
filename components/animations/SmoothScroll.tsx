"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger stays perfectly in sync.
 * Disabled for reduced-motion users; touch devices keep native momentum scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  // Lenis is imported lazily after first paint so it never competes with hydration.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let cleanup = () => {};
    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (dead) return;
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: false });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    };
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 800);
    return () => {
      dead = true;
      if (w.requestIdleCallback) w.cancelIdleCallback?.(id);
      else window.clearTimeout(id);
      cleanup();
    };
  }, []);

  // Recalculate trigger positions after every client navigation (content height changes).
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
