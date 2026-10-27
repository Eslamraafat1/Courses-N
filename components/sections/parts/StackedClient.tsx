"use client";
import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, Clock, Layers } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useGsap } from "@/hooks/useGsap";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { Rating } from "@/components/ui/Primitives";

const STEP = 26; // px each card sits lower than the one above
const SCALE = 0.055;
const rot = (k: number) => (k === 0 ? 0 : (k % 2 ? 1.6 : -1.6) * k);

/**
 * Experience #3 — Stacked Course Cards.
 * Default markup is a plain vertical list. On desktop with motion allowed, GSAP flips `data-stack` on the root,
 * the group-data variants turn the list into an overlapping deck, and a scrubbed pinned timeline peels cards away
 * while the rest move forward in depth. matchMedia revert restores the list on resize / reduced-motion change.
 */
export function StackedClient({ head, courses }: { head: ReactNode; courses: CourseSummary[] }) {
  const { t, l, n } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGsap(
    (c, { gsap }) => {
      const el = root.current;
      const pinEl = pin.current;
      if (!el || !pinEl || !c.motion || !c.desktop) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
      const rail = gsap.utils.toArray<HTMLElement>("[data-rail]", el);
      const count = cards.length;
      if (count < 2) return;

      el.dataset.stack = "true";
      cards.forEach((card, i) => gsap.set(card, { zIndex: count - i, y: i * STEP, scale: 1 - i * SCALE, rotate: rot(i), transformOrigin: "50% 100%" }));
      rail.forEach((r, k) => (r.dataset.active = String(k === 0)));

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinEl,
          start: "top 72",
          end: () => `+=${(count - 1) * window.innerHeight * 0.75}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(count - 1, Math.round(self.progress * (count - 1)));
            rail.forEach((r, k) => (r.dataset.active = String(k === idx)));
          },
        },
      });
      for (let i = 0; i < count - 1; i++) {
        tl.to(cards[i], { yPercent: -112, rotate: i % 2 ? 7 : -7, opacity: 0, duration: 1 }, i);
        for (let j = i + 1; j < count; j++) {
          const k = j - i - 1;
          tl.to(cards[j], { y: k * STEP, scale: 1 - k * SCALE, rotate: rot(k), duration: 1 }, i);
        }
      }
      return () => {
        delete el.dataset.stack;
      };
    },
    root,
    [courses.length],
  );

  return (
    <div ref={root} className="group/stk">
      <div ref={pin} className="py-20 sm:py-28 group-data-[stack=true]/stk:py-6">
        <div className="container-x">
          <div className="relative z-20 bg-bg pb-3 group-data-[stack=true]/stk:[&_.hd-1]:text-[clamp(1.75rem,3vw,2.75rem)] group-data-[stack=true]/stk:[&_p]:mt-3 group-data-[stack=true]/stk:[&_p]:text-base">{head}</div>

          <div className="mt-12 grid gap-8 group-data-[stack=true]/stk:mt-8 lg:group-data-[stack=true]/stk:grid-cols-[13rem_1fr]">
            <ol className="hidden flex-col justify-center gap-1 group-data-[stack=true]/stk:flex" aria-hidden>
              {courses.map((c, i) => (
                <li
                  key={c.slug}
                  data-rail
                  className="flex items-center gap-3 border-s-2 border-line py-2 ps-4 text-sm text-muted transition-all duration-300 data-[active=true]:border-accent data-[active=true]:font-bold data-[active=true]:text-ink"
                >
                  <span className="font-display text-xs ltr-run">{String(i + 1).padStart(2, "0")}</span>
                  <span className="line-clamp-1">{l(c.title)}</span>
                </li>
              ))}
            </ol>

            <ul className="relative z-0 isolate flex flex-col gap-6 group-data-[stack=true]/stk:block group-data-[stack=true]/stk:[clip-path:inset(0_-1.5rem_-3rem_-1.5rem)] group-data-[stack=true]/stk:h-[clamp(26rem,66vh,35rem)]">
              {courses.map((c, i) => (
                <li
                  key={c.slug}
                  data-card
                  className="card grid overflow-hidden bg-surface will-change-transform md:grid-cols-[1.05fr_1fr] group-data-[stack=true]/stk:absolute group-data-[stack=true]/stk:inset-x-0 group-data-[stack=true]/stk:top-0 group-data-[stack=true]/stk:h-[calc(100%-5rem)]"
                >
                  <div className="relative min-h-56 md:min-h-full">
                    <Image src={c.thumbnail} alt="" fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute start-5 top-5 font-display text-5xl font-black leading-none text-white/90 ltr-run">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: c.accent }} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-4 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
                    <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                      <Link href={`/courses/${c.slug}`} className="hover:text-accent">{l(c.title)}</Link>
                    </h3>
                    <p className="line-clamp-3 text-muted">{l(c.subtitle)}</p>
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <Rating value={c.rating} />
                      <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("label.hours", { n: c.duration })}</span>
                      <span className="inline-flex items-center gap-1"><Layers className="size-4" aria-hidden />{t("label.lessons", { n: c.lessonsCount })}</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span className="text-sm text-muted">{t("label.students", { n: n(c.students) })}</span>
                      <Link href={`/courses/${c.slug}`} aria-label={`${t("act.viewCourse")}: ${l(c.title)}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-bg transition hover:bg-accent hover:text-accent-ink">
                        {t("act.viewCourse")}
                        <ArrowUpRight className="size-4 rtl-flip" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
