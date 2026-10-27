"use client";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap, MEDIA, ScrollTrigger, type MediaConditions } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Run a GSAP scene scoped to `scope`. All tweens / ScrollTriggers created inside `setup` are reverted
 * and killed on unmount / dependency change (also when Next hides the route with <Activity>), so
 * re-mounting never doubles animations. `cond` tells the scene which media features currently match.
 */
export function useGsap(
  setup: (cond: MediaConditions, ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void | (() => void),
  scope: RefObject<Element | null>,
  deps: unknown[] = [],
) {
  const fn = useRef(setup);
  useEffect(() => {
    fn.current = setup;
  });

  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    mm.add(MEDIA, (context) => {
      const c = context.conditions as unknown as MediaConditions;
      return fn.current(c, { gsap, ScrollTrigger });
    });
    return () => mm.revert();
  }, deps);
}
