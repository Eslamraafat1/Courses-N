import { Counter, Reveal, SplitText, Stagger, StaggerItem } from "@/components/animations/Motion";
import { FloatingShapes, ScrollMarquee, TiltCard } from "@/components/animations/Fx";
import { getStats } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Lang } from "@/types";
import { StatAccent } from "./parts/StatAccent";

const REAL = new Set(["courses", "instructors"]);
const SHAPES = [
  "lg:col-span-7 lg:row-span-2 bg-ink text-bg",
  "lg:col-span-5 bg-accent text-accent-ink",
  "lg:col-span-2 bg-volt text-volt-ink",
  "lg:col-span-3 bg-surface",
];

export async function StatsSection({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const stats = await getStats();
  return (
    <section id="StatsSection" data-section="StatsSection" data-section-label={t("home2.stats.label")} aria-labelledby="stats-h" className="relative isolate overflow-x-clip">
      <FloatingShapes />
      <div className="container-x pt-20 sm:pt-28">
        <Reveal>
          <p id="stats-h" className="eyebrow mb-3">{t("home2.stats.eyebrow")}</p>
        </Reveal>
        <SplitText text={t("home2.stats.title")} className="hd-2 max-w-3xl" />
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t("home2.stats.lead")}</p>
        </Reveal>
      </div>

      {/* giant scroll-driven word band */}
      <ScrollMarquee rows={[t("home2.stats.label"), t("home2.stats.label")]} className="mt-10 [&>div]:text-[clamp(3rem,11vw,9rem)] rtl:[&>div]:tracking-normal" />

      <div className="container-x pb-20 sm:pb-28">
        <Stagger className="mt-10 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {stats.map((s, i) => {
            const real = REAL.has(s.id);
            const big = i === 0;
            return (
              <StaggerItem key={s.id} className={cn("flex min-w-0", i === 0 && "sm:col-span-2 lg:col-span-7", i === 0 ? "lg:row-span-2" : "", SHAPES[i % SHAPES.length].split(" ").filter((c) => c.startsWith("lg:col-span")).join(" "))}>
                <TiltCard className="h-full w-full" max={5} glare={false}>
                  <div className={cn("relative flex h-full min-h-44 overflow-hidden rounded-[2rem] border border-line", SHAPES[i % SHAPES.length].split(" ").filter((c) => !c.startsWith("lg:")).join(" "))}>
                    <StatAccent kind={real ? "ring" : "spark"} seed={i} />
                    <dl className="relative flex w-full flex-col justify-between gap-6 p-6 sm:p-8">
                      <dt className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="opacity-80">{s.label[lang]}</span>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", real ? "bg-current/15 ring-1 ring-current/60" : "border border-dashed border-current/50 opacity-80")}>
                          {real ? t("home2.stats.real") : t("home2.stats.demo")}
                        </span>
                      </dt>
                      <dd>
                        <Counter value={s.value} suffix={s.suffix} className={cn("font-display font-black leading-none", big ? "text-7xl sm:text-8xl lg:text-9xl" : "text-5xl sm:text-6xl lg:text-5xl xl:text-6xl")} />
                      </dd>
                    </dl>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        <p className="mt-6 text-sm text-muted">{t("demo.notice")}</p>
      </div>
    </section>
  );
}
