import { ArrowUpRight } from "lucide-react";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { FloatingShapes, ScrollMarquee, ScrubText } from "@/components/animations/Fx";
import { Button } from "@/components/ui/Button";
import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";

export async function FinalCta({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  return (
    <section id="FinalCta" data-section="FinalCta" data-section-label={t("home2.cta.label")} aria-labelledby="cta-h" className="container-x pb-24 pt-8 sm:pb-32">
      <style>{`
        @keyframes fcta-orbit { to { transform: rotate(360deg); } }
        @keyframes fcta-drift { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(3%,-6%,0) scale(1.12); } }
        @keyframes fcta-glow { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--volt) 55%, transparent); } 50% { box-shadow: 0 0 0 18px transparent; } }
        .fcta-orbit { animation: fcta-orbit 40s linear infinite; }
        .fcta-drift { animation: fcta-drift 11s ease-in-out infinite; }
        .fcta-glow { border-radius: 9999px; animation: fcta-glow 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .fcta-orbit, .fcta-drift, .fcta-glow { animation: none; } }
      `}</style>
      <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-ink px-6 py-20 text-center text-bg sm:px-12 sm:py-32">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="fcta-drift absolute -start-20 top-0 size-96 rounded-full bg-accent/60 blur-3xl" />
          <div className="fcta-drift absolute -end-16 bottom-0 size-80 rounded-full bg-volt/40 blur-3xl [animation-delay:-5s]" />
          <div className="fcta-orbit absolute start-1/2 top-1/2 size-[44rem] max-w-none -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2">
            <div className="absolute inset-0 rounded-full border border-bg/10" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-bg/15" />
            <span className="absolute start-1/2 top-0 size-3 -translate-x-1/2 rounded-full bg-volt" />
            <span className="absolute bottom-[12%] end-[12%] size-2 rounded-full bg-accent" />
          </div>
        </div>

        {/* cinematic giant words sliding with scroll, tinted for the dark panel */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-center opacity-40">
          <ScrollMarquee
            rows={[t("home2.cta.label"), t("act.getStarted")]}
            className="[&>div]:text-[clamp(4rem,14vw,12rem)] rtl:[&>div]:tracking-normal [&_[data-row]:not(.text-outline)]:text-bg/10 [&_.text-outline]:[-webkit-text-stroke-color:color-mix(in_srgb,var(--bg)_35%,transparent)]"
          />
        </div>
        <FloatingShapes className="!-z-10" />

        <Reveal>
          <p id="cta-h" className="eyebrow !text-volt">{t("home2.cta.eyebrow")}</p>
        </Reveal>
        <SplitText text={t("home2.cta.title")} className="h-display mx-auto mt-5 max-w-4xl" />
        <ScrubText text={t("home2.cta.lead")} className="mx-auto mt-6 max-w-xl text-lg sm:text-xl" />
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="fcta-glow inline-flex">
              <Button href="/register" size="lg" magnetic iconEnd={<ArrowUpRight className="size-5 rtl-flip" aria-hidden />}>
                {t("act.getStarted")}
              </Button>
            </span>
            <Button href="/courses" size="lg" variant="outline" className="border-bg/40 text-bg hover:border-bg hover:bg-bg/10">
              {t("home2.cta.secondary")}
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-60">{t("home2.cta.note")}</p>
        </Reveal>
      </div>
    </section>
  );
}
