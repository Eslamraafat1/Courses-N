"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}
registerGsap();

export { gsap, ScrollTrigger };

/** matchMedia conditions shared by every scroll scene. */
export const MEDIA = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export type MediaConditions = { motion: boolean; reduce: boolean; desktop: boolean; fine: boolean };
