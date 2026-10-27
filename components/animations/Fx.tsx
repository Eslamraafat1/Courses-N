"use client";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useGsap } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";

/**
 * Extra motion primitives for section polish. Roles: Framer = pointer/hover physics, GSAP = scroll scrubbing.
 * All of them are inert for reduced-motion users and on touch devices where noted.
 */

/* ---------- TiltCard: 3D tilt + moving glare (Framer, fine pointers only) ---------- */
export function TiltCard({ children, className, max = 8, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 22 });
  const sy = useSpring(py, { stiffness: 220, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareX = useTransform(sx, (v) => `${v * 100}%`);
  const glareY = useTransform(sy, (v) => `${v * 100}%`);

  const enabled = !reduce;
  const move = (e: React.PointerEvent) => {
    if (!enabled || e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={cn("[perspective:900px]", className)} onPointerMove={move} onPointerLeave={leave}>
      <motion.div ref={ref} style={enabled ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined} className="relative h-full will-change-transform">
        {children}
        {enabled && glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 [@media(hover:hover)]:group-hover/tilt:opacity-100 [@media(hover:hover)]:hover:opacity-100"
            style={{ background: "radial-gradient(260px circle at var(--gx) var(--gy), rgba(255,255,255,.55), transparent 60%)", ["--gx" as string]: glareX, ["--gy" as string]: glareY } as CSSProperties}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ---------- ScrubText: words light up as you scroll (GSAP scrub) ---------- */
export function ScrubText({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: "p" | "h2" | "h3" | "div" }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      gsap.to(ref.current.querySelectorAll(".scrub-word"), {
        opacity: 1,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 45%", scrub: true },
      });
    },
    ref,
    [text],
  );
  const El = Tag as React.ElementType;
  return (
    <El ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="scrub-word">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </El>
  );
}

/* ---------- ScrollMarquee: giant outlined words slide sideways with scroll (GSAP scrub) ---------- */
export function ScrollMarquee({ rows, className }: { rows: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      ref.current.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(row, { xPercent: dir * 8 }, { xPercent: dir * -18, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
    },
    ref,
    [rows.join("|")],
  );
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none select-none overflow-hidden", className)}>
      {rows.map((r, i) => (
        <div key={`${r}-${i}`} data-row className={cn("whitespace-nowrap font-display text-[clamp(3.5rem,13vw,11rem)] font-extrabold uppercase leading-[0.95] tracking-tighter", i % 2 ? "text-outline" : "text-ink/90")}>
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="me-[0.4em]">
              {r}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Parallax: any child drifts at its own speed while scrolling (GSAP scrub) ---------- */
export function Parallax({ children, speed = 12, className, rotate = 0 }: { children: ReactNode; speed?: number; className?: string; rotate?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { yPercent: speed, rotate: -rotate },
        { yPercent: -speed, rotate, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    ref,
    [speed, rotate],
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- ScrollReveal: clip-path wipe for any block (GSAP, once) ---------- */
export function WipeIn({ children, className, from = "bottom" }: { children: ReactNode; className?: string; from?: "bottom" | "start" | "end" }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      const clip = from === "bottom" ? "inset(100% 0% 0% 0%)" : from === "start" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
      gsap.fromTo(ref.current, { clipPath: clip }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } });
    },
    ref,
    [from],
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- FloatingShapes: soft drifting decorative shapes behind a section ---------- */
export function FloatingShapes({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      ref.current.querySelectorAll<HTMLElement>("[data-shape]").forEach((el, i) => {
        gsap.to(el, { yPercent: (i % 2 ? -1 : 1) * 40, xPercent: (i % 2 ? 1 : -1) * 15, rotate: (i % 2 ? 1 : -1) * 40, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    },
    ref,
    [],
  );
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <span data-shape className="absolute -start-10 top-10 size-56 rounded-[40%_60%_55%_45%] bg-accent/15 blur-2xl" />
      <span data-shape className="absolute end-[8%] top-1/3 size-40 rounded-full border-2 border-volt/60" />
      <span data-shape className="absolute -end-10 bottom-10 size-72 rounded-[55%_45%_40%_60%] bg-volt/20 blur-3xl" />
      <span data-shape className="absolute bottom-[12%] start-[18%] size-14 rotate-12 rounded-2xl border-2 border-coral/50" />
    </div>
  );
}
