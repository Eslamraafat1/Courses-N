"use client";
import Image from "next/image";
import { ArrowRight, CalendarClock, Layers } from "lucide-react";
import type { LearningPath } from "@/types";
import { Reveal } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Badge } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { PathProgressLine, type LessonCounts } from "./PathParts";

/** Learning paths as alternating full-width "tickets": image, route chips and personal progress. */
export function PathsIndex({ paths, counts }: { paths: LearningPath[]; counts: LessonCounts }) {
  const { t, l, n } = useI18n();
  return (
    <div className="container-x space-y-10 py-12 sm:space-y-16 sm:py-16">
      {paths.map((p, i) => (
        <Reveal key={p.id}>
          <article
            className={cn("card grid overflow-hidden lg:grid-cols-12", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}
            style={{ borderColor: `color-mix(in srgb, ${p.accent} 35%, var(--line))` }}
          >
            <div className="relative min-h-64 lg:col-span-5 lg:min-h-96">
              <Image src={p.image} alt="" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" priority={i === 0} />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${p.accent}cc, transparent 70%)` }} />
              <span aria-hidden className="ltr-run absolute bottom-4 start-5 font-display text-7xl font-extrabold text-white/90 sm:text-8xl">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col gap-5 p-6 sm:p-8 lg:col-span-7 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="neutral">{t(`level.${p.level}`)}</Badge>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted"><CalendarClock className="size-4" aria-hidden />{t("paths.weeks", { n: n(p.weeks) })}</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Layers className="size-4" aria-hidden />{t("paths.stages", { n: n(p.stages.length) })}</span>
              </div>
              <div>
                <h2 className="hd-2"><Link href={`/paths/${p.slug}`} className="hover:underline">{l(p.title)}</Link></h2>
                <p className="mt-3 text-lg text-muted">{l(p.description)}</p>
              </div>
              <ol className="flex flex-wrap items-center gap-2" aria-label={t("paths.timelineLabel")}>
                {p.stages.map((s, si) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="rounded-full border border-line bg-bg2 px-3 py-1.5 text-sm font-medium">
                      <span className="ltr-run text-muted">{n(si + 1)}.</span> {l(s.title)}
                    </span>
                    {si < p.stages.length - 1 && <ArrowRight className="size-4 text-muted rtl-flip" aria-hidden />}
                  </li>
                ))}
              </ol>
              <PathProgressLine stages={p.stages} counts={counts} />
              <div className="mt-auto pt-2">
                <Button href={`/paths/${p.slug}`} iconEnd={<ArrowRight className="size-4 rtl-flip" aria-hidden />} magnetic>
                  {t("paths.explore")}
                </Button>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
      <p className="text-center text-sm text-muted">{t("paths.progressNote")}</p>
    </div>
  );
}
