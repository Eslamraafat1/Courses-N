"use client";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useGsap } from "@/hooks/useGsap";
import { FloatingShapes, ScrollMarquee, ScrubText, TiltCard } from "@/components/animations/Fx";
import { Reveal, SpotlightCard, SplitText, Stagger, StaggerItem } from "@/components/animations/Motion";
import { cn } from "@/lib/utils";

/* ---------- Cinematic hero: split headline, scrubbed manifesto, scroll-driven marquee ---------- */
export function AboutHero({ eyebrow, title, lead, kicker, manifesto, scrollHint, marquee, crumbs }: { eyebrow: string; title: string; lead: string; kicker: string; manifesto: string; scrollHint: string; marquee: string[]; crumbs?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <header className="relative overflow-x-clip border-b border-line">
      <FloatingShapes />
      <div className="container-x relative pb-10 pt-8 sm:pb-16 lg:pt-12">
        {crumbs}
        <p className="eyebrow mb-4">{eyebrow}</p>
        <SplitText as="h1" text={title} className="hd-1 max-w-4xl" />
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{lead}</p>
        </Reveal>
        <motion.a
          href="#manifesto"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold hover:border-ink"
          animate={reduce ? undefined : { y: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" aria-hidden />
          {scrollHint}
        </motion.a>
      </div>
      <ScrollMarquee rows={marquee} className="relative pb-6" />
      <div id="manifesto" className="container-x relative scroll-mt-24 py-14 sm:py-24">
        <p className="eyebrow mb-5">{kicker}</p>
        <ScrubText text={manifesto} className="font-display text-[clamp(1.6rem,4.4vw,3.4rem)] font-bold leading-[1.25] tracking-tight" />
      </div>
    </header>
  );
}

/* ---------- Mission / Vision duo ---------- */
export function MissionVision({ items }: { items: { label: string; title: string; body: string }[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      {items.map((m, i) => (
        <Reveal key={m.label} delay={i * 0.1}>
          <SpotlightCard className={cn("h-full rounded-[2rem] border border-line p-7 sm:p-10", i === 0 ? "bg-ink text-bg" : "bg-surface")}>
            <p className={cn("eyebrow", i === 0 && "!text-volt")}>{m.label}</p>
            <h2 className="hd-2 mt-4 !text-[clamp(1.6rem,3.4vw,2.6rem)]">{m.title}</h2>
            <p className={cn("mt-4 text-lg leading-relaxed", i === 0 ? "text-bg/75" : "text-muted")}>{m.body}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- Values: distinct tilting cards ---------- */
const VALUE_STYLES = [
  "bg-volt text-volt-ink lg:col-span-7",
  "bg-accent text-accent-ink lg:col-span-5",
  "bg-surface lg:col-span-5",
  "bg-ink text-bg lg:col-span-7",
];
export function ValueCards({ items }: { items: { icon: ReactNode; title: string; body: string }[] }) {
  return (
    <Stagger className="grid gap-4 lg:grid-cols-12 lg:gap-5">
      {items.map((v, i) => (
        <StaggerItem key={v.title} className={cn("min-w-0", VALUE_STYLES[i % VALUE_STYLES.length].split(" ").filter((c) => c.startsWith("lg:")).join(" "))}>
          <TiltCard className="h-full" max={6}>
            <div className={cn("relative flex h-full min-h-56 flex-col justify-between gap-8 overflow-hidden rounded-[2rem] border border-line p-7 sm:p-9", VALUE_STYLES[i % VALUE_STYLES.length].split(" ").filter((c) => !c.startsWith("lg:")).join(" "))}>
              <span aria-hidden className="pointer-events-none absolute -end-3 -top-6 select-none font-display text-[9rem] font-black leading-none opacity-[0.12]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-current/10 ring-1 ring-current/30">{v.icon}</span>
              <div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">{v.title}</h3>
                <p className="mt-2 max-w-md opacity-80">{v.body}</p>
              </div>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ---------- Method: four numbered steps with a connecting rail ---------- */
export function MethodSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <Reveal key={s.title} as="li" delay={i * 0.08}>
          <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="card group relative h-full overflow-hidden p-6">
            <span aria-hidden className="font-display text-6xl font-black leading-none text-accent/25">{i + 1}</span>
            <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-muted">{s.body}</p>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
          </motion.div>
        </Reveal>
      ))}
    </ol>
  );
}

/* ---------- Timeline: the rail draws itself while scrolling, dots light up on arrival ---------- */
export function ScrollTimeline({ items, label }: { items: { year: string; title: string; body: string }[]; label: string }) {
  const ref = useRef<HTMLOListElement>(null);
  useGsap(
    (c, { gsap }) => {
      const root = ref.current;
      if (!c.motion || !root) return;
      gsap.fromTo(root.querySelector("[data-rail]"), { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "top", scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: 0.5 } });
      root.querySelectorAll<HTMLElement>("[data-node]").forEach((node) => {
        const dot = node.querySelector("[data-dot]");
        const card = node.querySelector("[data-card]");
        const st = { trigger: node, start: "top 72%", toggleActions: "play none none reverse" };
        gsap.fromTo(dot, { scale: 0.4, backgroundColor: "var(--line)" }, { scale: 1, backgroundColor: "var(--accent)", duration: 0.4, ease: "back.out(2)", scrollTrigger: st });
        gsap.fromTo(card, { opacity: 0.25, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: st });
      });
    },
    ref,
    [items.length],
  );
  return (
    <ol ref={ref} aria-label={label} className="relative grid gap-10 py-2">
      <span aria-hidden className="absolute inset-y-0 start-[0.7rem] w-px bg-line md:start-1/2" />
      <span data-rail aria-hidden className="absolute inset-y-0 start-[0.7rem] w-0.5 origin-top bg-accent md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2" />
      {items.map((s, i) => (
        <li key={s.title} data-node className="relative grid md:grid-cols-2 md:gap-16">
          <span data-dot aria-hidden className="absolute start-0 top-2 z-10 size-[1.4rem] rounded-full bg-accent ring-4 ring-bg md:start-1/2 md:-translate-x-1/2 rtl:md:translate-x-1/2" />
          <div data-card className={cn("ps-10 md:ps-0", i % 2 ? "md:col-start-2" : "md:col-start-1 md:text-end")}>
            <p className="eyebrow">{s.year}</p>
            <h3 className="mt-1 font-display text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 max-w-md text-muted md:inline-block">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
