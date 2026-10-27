"use client";
import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import Image from "next/image";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useGsap } from "@/hooks/useGsap";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/* ---------- Reveal: viewport entrance (Framer Motion owns opacity/translate of the wrapper) ---------- */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" | "article" }) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </M>
  );
}

/** Stagger container for card grids (children use <StaggerItem>). */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } } }}>
      {children}
    </motion.div>
  );
}

/* ---------- SplitText: scroll-revealed headline (GSAP). Screen readers get the intact string. ---------- */
export function SplitText({ text, as: Tag = "h2", className, stagger = 0.045 }: { text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string; stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !ref.current) return;
      const els = ref.current.querySelectorAll(".split-word");
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power4.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    ref,
    [text],
  );

  const El = Tag as ElementType;
  return (
    <El ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="split-mask">
          <span className="split-word">{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </El>
  );
}

/* ---------- Counter: number morph on enter ---------- */
export function Counter({ value, suffix = "", className, duration = 1.8 }: { value: number; suffix?: string; className?: string; duration?: number }) {
  const { n } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = n(Math.round(v)) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, suffix, duration, n]);

  // Server + reduced motion render the real value, so nothing is ever shown as a fake number.
  return (
    <span ref={ref} className={cn("ltr-run tabular-nums", className)}>
      {n(value)}
      {suffix}
    </span>
  );
}

/* ---------- ParallaxImage: clip-path reveal + inner parallax (GSAP, scrubbed) ---------- */
export function ParallaxImage({ src, alt, sizes, className, priority, strength = 12, ratio = "aspect-[4/5]" }: { src: string; alt: string; sizes: string; className?: string; priority?: boolean; strength?: number; ratio?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !box.current || !img.current) return;
      gsap.fromTo(
        box.current,
        { clipPath: "inset(12% 12% 12% 12% round 2rem)" },
        { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: box.current, start: "top 90%", once: true } },
      );
      gsap.fromTo(
        img.current,
        { yPercent: -strength },
        { yPercent: strength, ease: "none", scrollTrigger: { trigger: box.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    box,
    [strength],
  );

  return (
    <div ref={box} className={cn("relative overflow-hidden rounded-3xl bg-bg2", ratio, className)}>
      <div ref={img} className="absolute inset-x-0 -inset-y-[14%]">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}

/* ---------- SpotlightCard: cursor-following glow (hover-capable devices only) ---------- */
export function SpotlightCard({ children, className, ...rest }: { children: ReactNode; className?: string } & ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} className={cn("spotlight", className)} {...rest}>
      {children}
    </div>
  );
}
