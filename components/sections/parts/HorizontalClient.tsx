"use client";
import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useGsap } from "@/hooks/useGsap";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";

/**
 * Horizontal story track.
 * Default (mobile / tablet / reduced-motion / no-JS): a native overflow-x snap scroller, no pinning.
 * Desktop with motion: GSAP pins the stage and scrubs the track sideways (direction mirrored in RTL).
 * Pin spacing + invalidateOnRefresh keep the page height right; matchMedia revert restores the scroller on resize.
 */
export function HorizontalClient({ head, courses }: { head: ReactNode; courses: CourseSummary[] }) {
  const { t, l, n, isRtl } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGsap(
    (c, { gsap }) => {
      const el = root.current;
      const pinEl = pin.current;
      const tr = track.current;
      if (!el || !pinEl || !tr || !c.motion || !c.desktop) return;
      el.dataset.pin = "true";
      const dist = () => Math.max(0, tr.scrollWidth - pinEl.clientWidth);
      const dir = isRtl ? 1 : -1;

      const tween = gsap.to(tr, {
        x: () => dir * dist(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) gsap.set(bar.current, { scaleX: self.progress });
          },
        },
      });

      // keyboard focus on an off-screen panel: translate it to scroll progress instead of letting the clipped box scroll natively
      const onFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        const panel = target.closest<HTMLElement>("[data-panel]");
        pinEl.scrollLeft = 0;
        if (scroller.current) scroller.current.scrollLeft = 0;
        const st = tween.scrollTrigger;
        if (!panel || !st) return;
        const pr = panel.getBoundingClientRect();
        const trr = tr.getBoundingClientRect();
        const offset = isRtl ? trr.right - pr.right : pr.left - trr.left;
        const d = dist();
        if (d <= 0) return;
        const p = Math.min(1, Math.max(0, (offset - 32) / d));
        window.scrollTo({ top: st.start + p * (st.end - st.start) });
      };
      tr.addEventListener("focusin", onFocus);
      return () => {
        tr.removeEventListener("focusin", onFocus);
        delete el.dataset.pin;
      };
    },
    root,
    [isRtl, courses.length],
  );

  const shapes = ["tall", "wide", "block"] as const;

  return (
    <div ref={root} className="group/hs">
      <div ref={pin} className="relative py-20 group-data-[pin=true]/hs:flex group-data-[pin=true]/hs:h-svh group-data-[pin=true]/hs:items-center group-data-[pin=true]/hs:overflow-hidden group-data-[pin=true]/hs:py-0 sm:py-28">
        <div
          ref={scroller}
          tabIndex={0}
          role="region"
          aria-label={t("home.hs.region")}
          className="no-scrollbar w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-6 group-data-[pin=true]/hs:snap-none group-data-[pin=true]/hs:overflow-visible group-data-[pin=true]/hs:pb-0"
        >
          <div ref={track} className="flex w-max items-center gap-5 px-4 will-change-transform md:gap-8 md:px-8 xl:gap-12 xl:px-12">
            {/* intro */}
            <div data-panel className="w-[min(88vw,32rem)] shrink-0 snap-start whitespace-normal">
              {head}
              <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted">
                {t("home.hs.hint")}
                <ArrowRight className="size-4 rtl-flip motion-safe:animate-pulse" aria-hidden />
              </p>
            </div>

            {courses.map((c, i) => {
              const shape = shapes[i % shapes.length];
              const num = String(i + 1).padStart(2, "0");
              if (shape === "tall") {
                return (
                  <article key={c.slug} data-panel className="group w-[min(78vw,23rem)] shrink-0 snap-start">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-bg2">
                      <Image src={c.thumbnail} alt="" fill sizes="(min-width:1024px) 23rem, 78vw" className="object-cover transition duration-700 group-hover:scale-105" />
                      <span className="absolute start-5 top-4 font-display text-6xl font-black leading-none text-white/90 ltr-run">{num}</span>
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
                    <h3 className="mt-1 font-display text-2xl font-bold leading-tight">
                      <Link href={`/courses/${c.slug}`} className="hover:text-accent">{l(c.title)}</Link>
                    </h3>
                  </article>
                );
              }
              if (shape === "wide") {
                return (
                  <article key={c.slug} data-panel className="group w-[min(90vw,42rem)] shrink-0 snap-start">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-bg2">
                      <Image src={c.thumbnail} alt="" fill sizes="(min-width:1024px) 42rem, 90vw" className="object-cover transition duration-700 group-hover:scale-105" />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <span className="absolute bottom-4 start-6 font-display text-7xl font-black leading-none text-white/90 ltr-run">{num}</span>
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
                        <h3 className="mt-1 font-display text-3xl font-bold leading-tight">
                          <Link href={`/courses/${c.slug}`} className="hover:text-accent">{l(c.title)}</Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 max-w-md text-muted">{l(c.subtitle)}</p>
                      </div>
                      <Link href={`/courses/${c.slug}`} aria-label={`${t("act.viewCourse")}: ${l(c.title)}`} className="grid size-14 shrink-0 place-items-center rounded-full border border-line transition hover:bg-volt hover:text-volt-ink">
                        <ArrowUpRight className="size-6 rtl-flip" aria-hidden />
                      </Link>
                    </div>
                  </article>
                );
              }
              return (
                <article key={c.slug} data-panel className="relative flex min-h-[26rem] w-[min(80vw,25rem)] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] bg-ink p-7 text-bg">
                  <span aria-hidden className="absolute -end-16 -top-16 size-56 rounded-full opacity-40 blur-3xl" style={{ background: c.accent }} />
                  <div className="relative flex items-start justify-between">
                    <span className="font-display text-6xl font-black leading-none ltr-run opacity-90">{num}</span>
                    <span className="relative size-20 overflow-hidden rounded-full border-2 border-white/30">
                      <Image src={c.thumbnail} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                  </div>
                  <div className="relative">
                    <p className="flex items-center gap-1.5 font-display text-5xl font-bold ltr-run"><Star className="size-8 fill-volt text-volt" aria-hidden />{c.rating.toFixed(1)}</p>
                    <p className="mt-1 text-sm opacity-75">{t("label.students", { n: n(c.students) })}</p>
                    <h3 className="mt-5 font-display text-2xl font-bold leading-tight">
                      <Link href={`/courses/${c.slug}`} className="hover:text-volt">{l(c.title)}</Link>
                    </h3>
                  </div>
                </article>
              );
            })}

            {/* outro */}
            <div data-panel className="flex w-[min(86vw,26rem)] shrink-0 snap-start flex-col items-start gap-5 pe-4 md:pe-8">
              <p className="font-display text-4xl font-bold leading-tight">{t("home.hs.outro")}</p>
              <Button href="/courses" size="lg" magnetic iconEnd={<ArrowRight className="size-5 rtl-flip" aria-hidden />}>{t("home.hs.cta")}</Button>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-4 bottom-8 hidden h-0.5 overflow-hidden rounded-full bg-line group-data-[pin=true]/hs:block md:inset-x-8 xl:inset-x-12">
          <div ref={bar} className="h-full origin-left bg-accent rtl:origin-right" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
