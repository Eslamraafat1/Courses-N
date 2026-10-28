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
  /** `eager`: create triggers immediately (required for pinned scenes whose spacers shift later triggers).
   *  Default is lazy: the scene is only built once its element is within ~1 viewport of the screen, which keeps
   *  load-time layout work and the number of live ScrollTriggers small. */
  opts: { eager?: boolean } = {},
) {
  const fn = useRef(setup);
  useEffect(() => {
    fn.current = setup;
  });
  const eager = !!opts.eager;

  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    const build = () => {
      mm = gsap.matchMedia(el);
      mm.add(MEDIA, (context) => {
        const c = context.conditions as unknown as MediaConditions;
        return fn.current(c, { gsap, ScrollTrigger });
      });
    };
    if (eager || typeof IntersectionObserver === "undefined") {
      build();
      return () => mm?.revert();
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          build();
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mm?.revert();
    };
  }, [...deps, eager]);
}
