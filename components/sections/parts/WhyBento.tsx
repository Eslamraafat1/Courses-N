"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Award, ChevronRight, Flame, Gauge, Languages, PlayCircle, SunMoon, Check, Pause, Play, StickyNote } from "lucide-react";
import { useGsap } from "@/hooks/useGsap";
import { useI18n } from "@/components/providers/I18nProvider";
import { ScrollMarquee, ScrubText } from "@/components/animations/Fx";
import { cn } from "@/lib/utils";
import { SectionHead } from "./SectionHead";

const css = `
@keyframes wt-ring { from { stroke-dashoffset: 264; } to { stroke-dashoffset: 84; } }
@keyframes wt-flame { 0%,100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.1,1.18) rotate(3deg); } }
@keyframes wt-bar { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes wt-scrub { from { inline-size: 8%; } to { inline-size: 78%; } }
@keyframes wt-stamp { 0% { transform: scale(2.4) rotate(-24deg); opacity: 0; } 60% { transform: scale(.94) rotate(-10deg); opacity: 1; } 100% { transform: scale(1) rotate(-12deg); opacity: 1; } }
@keyframes wt-pop { from { transform: scale(0); } to { transform: scale(1); } }
.wt-ring { stroke-dasharray: 264; animation: wt-ring 1.8s cubic-bezier(.2,.8,.2,1) .15s both; }
.wt-flame { transform-origin: 50% 90%; animation: wt-flame 1.5s ease-in-out infinite; }
.wt-bar { transform-origin: 50% 100%; animation: wt-bar 1.1s ease-in-out infinite; }
.wt-scrub { animation: wt-scrub 8s linear infinite alternate; }
.wt-stamp { animation: wt-stamp .7s cubic-bezier(.2,.9,.3,1.2) .35s both; }
.wt-pop { animation: wt-pop .35s cubic-bezier(.2,.9,.3,1.4) both; }
@media (prefers-reduced-motion: reduce) {
  .wt-ring { animation: none; stroke-dashoffset: 84; }
  .wt-flame, .wt-bar, .wt-scrub, .wt-pop { animation: none; }
  .wt-scrub { inline-size: 40%; }
  .wt-stamp { animation: none; transform: rotate(-12deg); }
}
`;

const KEYS = ["progress", "player", "bilingual", "streak", "cert", "theme"] as const;
type Key = (typeof KEYS)[number];
const ICONS: Record<Key, typeof Gauge> = { progress: Gauge, player: PlayCircle, bilingual: Languages, streak: Flame, cert: Award, theme: SunMoon };

/* ------------------------------ stage panels ------------------------------ */

function PanelProgress() {
  const { t, n } = useI18n();
  const chapters = [t("home3.why.chap1"), t("home3.why.chap2"), t("home3.why.chap3"), t("home3.why.chap4")];
  const done = [100, 100, 46, 0];
  return (
    <div className="grid h-full items-center gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
      <div className="relative mx-auto grid size-36 place-items-center sm:size-48">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-line" />
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" className="wt-ring stroke-accent" />
        </svg>
        <span className="absolute font-display text-3xl font-black tabular-nums sm:text-4xl">{n(68)}%</span>
      </div>
      <div className="min-w-0 space-y-3">
        {chapters.map((c, i) => (
          <div key={c} className="rounded-xl border border-line bg-bg/60 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs", done[i] === 100 ? "bg-volt text-volt-ink" : "bg-bg2 text-muted")}>
                {done[i] === 100 ? <Check className="size-3.5" aria-hidden /> : n(i + 1)}
              </span>
              <span className="truncate">{c}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-accent" style={{ width: `${done[i]}%` }} />
            </div>
          </div>
        ))}
        <span className="inline-flex min-h-8 items-center rounded-full bg-volt px-3.5 text-xs font-bold text-volt-ink">{t("home3.why.resume")}</span>
      </div>
    </div>
  );
}

function PanelPlayer() {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(true);
  const chips = ["Space", "J", "L", "N", "F"];
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-ink text-bg">
        <div className="relative grid h-36 place-items-center bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--accent)_60%,transparent),transparent_60%)] sm:h-44">
          <div className="flex h-10 items-end gap-1" aria-hidden>
            {[0, 0.2, 0.4, 0.1, 0.3, 0.5].map((d, i) => (
              <span key={i} className={cn("h-10 w-1.5 rounded-full bg-volt", playing ? "wt-bar" : "scale-y-[0.35]")} style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
          <span className="absolute start-3 top-3 rounded-full bg-bg/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">{t("home2.why.mock.sample")}</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={t("act.play")} aria-pressed={playing} className="grid size-11 shrink-0 place-items-center rounded-full bg-volt text-volt-ink">
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg/20" aria-hidden>
            <div className={cn("h-full rounded-full bg-volt", playing ? "wt-scrub" : "w-[40%]")} />
          </div>
          <span className="ltr-run rounded-full bg-bg/15 px-2.5 py-1 text-xs font-bold tabular-nums">1.25x</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" aria-hidden>
        {chips.map((k) => (
          <kbd key={k} className="rounded-lg border border-line bg-bg px-2.5 py-1 font-mono text-xs font-bold shadow-[0_2px_0_var(--line)]">{k}</kbd>
        ))}
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-accent/50 bg-accent/5 px-3.5 py-3 text-sm">
        <StickyNote className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <span>{t("home3.why.note")}</span>
      </div>
    </div>
  );
}

function PanelLang() {
  const { lang, t } = useI18n();
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<"ar" | "en">(lang);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (reduce || !auto) return;
    const id = window.setInterval(() => setSel((s) => (s === "ar" ? "en" : "ar")), 2800);
    return () => window.clearInterval(id);
  }, [reduce, auto]);
  const rtl = sel === "ar";
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div role="group" aria-label={t("act.language")} className="mx-auto flex w-fit rounded-full border border-line bg-bg2 p-1">
        {(["ar", "en"] as const).map((k) => (
          <button key={k} type="button" aria-pressed={sel === k} onClick={() => { setAuto(false); setSel(k); }} className="relative min-h-11 min-w-20 rounded-full px-5 text-sm font-bold">
            {sel === k && <motion.span layoutId="wt-lang" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className={cn("relative transition-colors", sel === k ? "text-bg" : "text-muted")}>{k === "ar" ? "عربي" : "EN"}</span>
          </button>
        ))}
      </div>
      <div dir={rtl ? "rtl" : "ltr"} lang={sel} className="flex gap-3 rounded-2xl border border-line bg-bg/70 p-3 transition-all duration-500">
        <div className="hidden w-1/4 shrink-0 space-y-2 rounded-xl bg-bg2 p-3 sm:block" aria-hidden>
          <div className="h-2 w-full rounded-full bg-accent" />
          <div className="h-2 w-2/3 rounded-full bg-line" />
          <div className="h-2 w-3/4 rounded-full bg-line" />
          <div className="h-2 w-1/2 rounded-full bg-line" />
        </div>
        <div className="min-w-0 flex-1 space-y-3 p-2">
          <p className="font-display text-xl font-bold leading-tight sm:text-2xl">{rtl ? t("home3.why.demo.ar") : t("home3.why.demo.en")}</p>
          <p className="text-sm text-muted">{rtl ? t("home3.why.demo.sub.ar") : t("home3.why.demo.sub.en")}</p>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-volt px-5 text-sm font-bold text-volt-ink">
            {rtl ? "ابدأ" : "Start"}
            <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

function PanelStreak() {
  const { t, n } = useI18n();
  const cells = Array.from({ length: 28 }, (_, i) => (i % 7 === 5 ? 0 : i < 23 ? ((i * 5) % 3) + 1 : i < 26 ? 3 : 0));
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="flex items-center gap-5">
        <Flame className="wt-flame size-20 shrink-0 fill-coral text-coral sm:size-24" aria-hidden />
        <div>
          <p className="font-display text-4xl font-black tabular-nums sm:text-5xl">{n(5)}</p>
          <p className="text-sm font-semibold text-muted">{t("home2.why.mock.days", { n: n(5) })}</p>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="img" aria-label={t("home3.why.week")}>
          {cells.map((v, i) => (
            <span
              key={i}
              className={cn("aspect-square rounded-md", v === 0 ? "bg-line" : v === 1 ? "bg-coral/35" : v === 2 ? "bg-coral/65" : "bg-coral")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelCert() {
  const { t } = useI18n();
  return (
    <div className="grid h-full place-items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-double border-accent/60 bg-surface p-6 text-center shadow-[var(--shadow)] sm:p-8">
        <Award className="mx-auto size-10 text-accent" aria-hidden />
        <p className="mt-3 font-display text-xl font-bold sm:text-2xl">{t("home2.why.mock.cert")}</p>
        <p className="mt-4 border-b border-line pb-2 font-display text-lg text-muted">{t("home3.why.holder")}</p>
        <div className="mx-auto mt-4 h-2 w-28 rounded-full bg-line" aria-hidden />
        <div className="mx-auto mt-2 h-2 w-20 rounded-full bg-line" aria-hidden />
        <span className="wt-stamp absolute bottom-5 end-5 grid size-20 -rotate-12 place-items-center rounded-full border-4 border-coral p-1 text-center text-[0.65rem] font-black uppercase leading-tight text-coral">
          {t("home3.why.stamp")}
        </span>
        <span className="mt-6 inline-block rounded-full bg-volt px-3 py-1 text-xs font-bold text-volt-ink">{t("home2.why.mock.sample")}</span>
      </div>
    </div>
  );
}

const THEME: Record<"light" | "dark", CSSProperties> = {
  light: { ["--m-bg" as string]: "#f7f6f2", ["--m-ink" as string]: "#0d0d16", ["--m-soft" as string]: "rgba(13,13,22,.14)", ["--m-acc" as string]: "#5233e8" },
  dark: { ["--m-bg" as string]: "#0d0d16", ["--m-ink" as string]: "#f7f6f2", ["--m-soft" as string]: "rgba(247,246,242,.16)", ["--m-acc" as string]: "#9a85ff" },
};

function MiniUi({ mode, label }: { mode: "light" | "dark"; label: string }) {
  return (
    <div style={THEME[mode]} className="absolute inset-0 flex flex-col gap-3 bg-[var(--m-bg)] p-4 text-[var(--m-ink)] sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold">{label}</span>
        <span className="h-5 w-10 rounded-full bg-[var(--m-acc)]" />
      </div>
      <div className="h-24 rounded-xl bg-[var(--m-soft)] sm:h-32" />
      <div className="h-2 w-3/4 rounded-full bg-[var(--m-ink)] opacity-80" />
      <div className="h-2 w-1/2 rounded-full bg-[var(--m-ink)] opacity-30" />
      <span className="mt-auto h-9 w-28 rounded-full bg-[var(--m-acc)]" />
    </div>
  );
}

function PanelTheme() {
  const { t } = useI18n();
  const [pos, setPos] = useState(50);
  return (
    <div className="flex h-full flex-col justify-center">
      <div dir="ltr" className="relative h-72 overflow-hidden rounded-2xl border border-line sm:h-80">
        <MiniUi mode="light" label={t("home3.why.light")} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <MiniUi mode="dark" label={t("home3.why.dark")} />
        </div>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-volt" style={{ left: `${pos}%` }} />
        <span aria-hidden className="pointer-events-none absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-volt text-volt-ink shadow-lg" style={{ left: `${pos}%` }}>
          <SunMoon className="size-4" />
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={t("home3.why.compare")}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}

const PANELS: Record<Key, () => React.JSX.Element> = { progress: PanelProgress, player: PanelPlayer, bilingual: PanelLang, streak: PanelStreak, cert: PanelCert, theme: PanelTheme };

/* --------------------------------- theatre -------------------------------- */

export function WhyBento() {
  const { t, n } = useI18n();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const st = useRef<{ start: number; end: number } | null>(null);
  const [active, setActive] = useState(0);
  const cur = KEYS[active];
  const Panel = PANELS[cur];

  useGsap(
    (c, { ScrollTrigger }) => {
      if (!c.motion || !c.desktop || !pin.current) return;
      const trigger = ScrollTrigger.create({
        trigger: pin.current,
        start: "top 88",
        end: () => `+=${KEYS.length * window.innerHeight * 0.55}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.min(KEYS.length - 1, Math.floor(self.progress * KEYS.length))),
        onRefresh: (self) => {
          st.current = { start: self.start, end: self.end };
        },
      });
      st.current = { start: trigger.start, end: trigger.end };
      return () => {
        st.current = null;
      };
    },
    root,
    [],
  );

  const choose = useCallback((i: number) => {
    setActive(i);
    const r = st.current;
    if (r) window.scrollTo({ top: r.start + ((i + 0.5) / KEYS.length) * (r.end - r.start), behavior: "smooth" });
  }, []);

  const activeTitle = t(`home2.why.${cur}.title`);
  const activeBody = t(`home2.why.${cur}.body`);

  return (
    <div ref={root} className="relative overflow-x-clip">
      <style>{css}</style>
      <div className="container-x pt-20 sm:pt-28">
        <SectionHead id="why-h" eyebrow={t("home2.why.eyebrow")} title={t("home2.why.title")} lead={t("home2.why.lead")} />
        <ScrubText text={t("home3.why.scrub")} className="mt-12 max-w-4xl font-display text-2xl font-bold leading-snug sm:text-4xl" />
      </div>

      <div ref={pin} className="container-x py-12 sm:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          {/* desktop list */}
          <div className="hidden lg:block">
            <p className="eyebrow mb-4">{t("home3.why.hint")}</p>
            <ol aria-label={t("home3.why.list")} className="space-y-1">
              {KEYS.map((k, i) => {
                const Icon = ICONS[k];
                const on = i === active;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      aria-current={on || undefined}
                      onClick={() => choose(i)}
                      className={cn("group flex w-full min-h-14 items-center gap-4 rounded-2xl border px-4 py-3 text-start transition-colors", on ? "border-line bg-surface shadow-[var(--shadow)]" : "border-transparent hover:bg-bg2")}
                    >
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-volt text-volt-ink" : "bg-bg2 text-muted")}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block font-display text-lg font-bold transition-colors", on ? "text-ink" : "text-muted")}>{t(`home2.why.${k}.title`)}</span>
                        {on && <span className="mt-1 block text-sm leading-relaxed text-muted">{t(`home2.why.${k}.body`)}</span>}
                      </span>
                      <span className="ltr-run font-display text-xs font-bold text-muted">{n(i + 1)}/{n(KEYS.length)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${((active + 1) / KEYS.length) * 100}%` }} />
            </div>
          </div>

          {/* mobile pills */}
          <div className="lg:hidden">
            <div role="group" aria-label={t("home3.why.list")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
              {KEYS.map((k, i) => {
                const Icon = ICONS[k];
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                    className={cn("inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors", i === active ? "border-transparent bg-volt text-volt-ink" : "border-line bg-surface")}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t(`home2.why.${k}.title`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* stage */}
          <div role="group" aria-label={t("home3.why.stage")} className="relative">
            <div aria-hidden className="absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_70%_20%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_65%)]" />
            <div className="card relative min-h-[27rem] overflow-hidden p-5 sm:min-h-[30rem] sm:p-8 lg:h-[30rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={cur}
                  initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="h-full"
                >
                  <Panel />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-5 lg:hidden" aria-live="polite">
              <h3 className="font-display text-xl font-bold">{activeTitle}</h3>
              <p className="mt-1.5 text-muted">{activeBody}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollMarquee rows={[t("home3.why.marq1"), t("home3.why.marq2")]} className="pb-16 sm:pb-24" />
    </div>
  );
}
