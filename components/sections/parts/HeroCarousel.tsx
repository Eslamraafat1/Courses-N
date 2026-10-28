"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Layers, Pause, Play, Star } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { useVideo } from "@/components/video/VideoProvider";
import { Button } from "@/components/ui/Button";
import { useGsap } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";

const DURATION = 6800; // ms per slide

interface Props {
  courses: CourseSummary[];
  stats: { students: number; studentsSuffix: string; studentsLabel: string };
}

/**
 * Cinematic course carousel:
 *  - cross-fading, Ken-Burns background of the active course (accent-tinted),
 *  - masked word-rise title, 3D coverflow of course cards (spring physics, drag/swipe, keyboard),
 *  - segmented progress rail that doubles as the autoplay timer (pauses on hover / focus / offscreen / tab hidden),
 *  - pointer parallax (fine pointers only), scroll-away depth (GSAP), floating glass chips, twinkling particles.
 * Framer Motion owns slide/card/pointer transforms, GSAP only transforms the outer scroll wrappers.
 */
export function HeroCarousel({ courses, stats }: Props) {
  const { t, l, n, isRtl } = useI18n();
  const video = useVideo();
  const reduce = useReducedMotion();
  const total = courses.length;
  const dir = isRtl ? -1 : 1;

  const [active, setActive] = useState(0);
  const [userPlaying, setUserPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const bgWrap = useRef<HTMLDivElement>(null);
  const contentWrap = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.25 });

  const autoplay = userPlaying && !reduce;
  const running = autoplay && !hovered && !focused && !tabHidden && inView;

  const go = useCallback((i: number) => setActive(((i % total) + total) % total), [total]);
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const on = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  /* ---- pointer parallax (mouse only) ---- */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -26);
  const bgY = useTransform(sy, (v) => v * -16);
  const stageRY = useTransform(sx, (v) => v * 7);
  const stageRX = useTransform(sy, (v) => v * -5);
  const chipX = useTransform(sx, (v) => v * 34);
  const chipY = useTransform(sy, (v) => v * 24);
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !root.current) return;
    const r = root.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  /* ---- scroll-away depth (GSAP, outer wrappers only) ---- */
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !root.current) return;
      gsap.to(bgWrap.current, { scale: 1.14, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(contentWrap.current, { yPercent: -7, opacity: 0.25, ease: "none", scrollTrigger: { trigger: root.current, start: "30% top", end: "bottom top", scrub: true } });
    },
    root,
    [],
  );

  /* ---- keyboard ---- */
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") (isRtl ? prev : next)();
    else if (e.key === "ArrowLeft") (isRtl ? next : prev)();
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(total - 1);
    else return;
    e.preventDefault();
  };

  const cur = courses[active];
  const title = l(cur.title);
  const words = title.split(/\s+/);
  const accent = cur.accent;

  const offsetOf = (i: number) => {
    let o = (i - active) % total;
    if (o > total / 2) o -= total;
    if (o < -total / 2) o += total;
    return o;
  };

  const openPreview = (c: CourseSummary) =>
    video.open({ url: c.videoUrl, title: l(c.title), subtitle: t("home3.hero.by", { name: l(c.instructor.name) }), poster: c.coverImage ?? c.thumbnail });

  return (
    <section
      ref={root}
      id="Hero"
      data-section="Hero"
      data-section-label={t("home.label.hero")}
      aria-roledescription="carousel"
      aria-label={t("home3.hero.region")}
      onKeyDown={onKey}
      onPointerMove={onMove}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        mx.set(0);
        my.set(0);
      }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      className="relative isolate mx-2 mt-2 overflow-hidden rounded-[1.75rem] bg-[#07070d] text-white sm:mx-4 sm:rounded-[2.25rem]"
    >
      {/* ---------- backgrounds (active + neighbours only) ---------- */}
      <div ref={bgWrap} aria-hidden className="absolute inset-0 -z-10 will-change-transform">
        <motion.div style={reduce ? undefined : { x: bgX, y: bgY }} className="absolute -inset-10">
          {courses.map((c, i) => {
            const o = offsetOf(i);
            if (Math.abs(o) > 1) return null;
            const on = i === active;
            return (
              <motion.div
                key={c.id}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.12 }}
                transition={{ opacity: { duration: 1 }, scale: { duration: on ? 7.5 : 1.2, ease: "easeOut" } }}
              >
                <Image src={c.coverImage ?? c.thumbnail} alt="" fill priority={i === 0} sizes="100vw" quality={62} className="object-cover" />
              </motion.div>
            );
          })}
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,7,13,.94)_8%,rgba(7,7,13,.72)_42%,rgba(7,7,13,.35)_100%)] rtl:bg-[linear-gradient(260deg,rgba(7,7,13,.94)_8%,rgba(7,7,13,.72)_42%,rgba(7,7,13,.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07070d] to-transparent" />
        <motion.div
          className="absolute -start-24 top-[-10%] size-[38rem] rounded-full opacity-25 blur-[130px] mix-blend-screen"
          animate={{ backgroundColor: accent }}
          transition={{ duration: 1.1 }}
        />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000,transparent_72%)]" />
        {/* twinkling particles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="hero-twinkle absolute size-1 rounded-full bg-white"
            style={{ insetInlineStart: `${(i * 37) % 100}%`, top: `${(i * 53) % 92}%`, animationDelay: `${(i % 7) * 0.5}s` }}
          />
        ))}
      </div>

      <div ref={contentWrap} className="container-x relative grid min-h-[min(46rem,calc(100svh-var(--nav-h)-1rem))] items-center gap-6 pb-28 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:pb-32">
        {/* ---------- copy ---------- */}
        <div className="relative z-10 min-w-0">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-volt ring-4 ring-volt/30" />
            <span className="truncate">{t("home.hero.badge")}</span>
          </p>
          <h1 className="mt-5 font-display text-[clamp(1.05rem,0.9rem+0.7vw,1.5rem)] font-bold text-white/85 rtl:font-extrabold">
            {t("home.hero.l1")} {t("home.hero.l2")} {t("home.hero.l3")}
          </h1>

          <div className="mt-3 flex items-center gap-3 text-sm font-semibold">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={cur.id + "cat"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-black rtl:tracking-normal"
                style={{ backgroundColor: accent }}
              >
                {l(cur.category.name)}
              </motion.span>
            </AnimatePresence>
            <span className="text-white/60">{t("home3.hero.featured")}</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={cur.id}
              aria-live={autoplay ? "off" : "polite"}
              className="mt-4 font-display text-[clamp(2.2rem,1rem+4.2vw,4.8rem)] lg:max-w-[92%] font-extrabold leading-[1.02] tracking-tight rtl:leading-[1.28] rtl:tracking-normal"
            >
              {words.map((w, i) => (
                <span key={`${w}-${i}`} className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em]">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "112%", rotate: reduce ? 0 : 4 }}
                    animate={{ y: 0, rotate: 0 }}
                    exit={{ y: "-112%", transition: { duration: 0.35, delay: i * 0.03 } }}
                    transition={{ duration: 0.8, delay: 0.06 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {w}
                    {i < words.length - 1 ? " " : ""}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cur.id + "meta"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="mt-5 max-w-xl"
            >
              <p className="text-base text-white/75 sm:text-lg">{l(cur.subtitle)}</p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden /> <span className="ltr-run font-bold">{cur.rating.toFixed(1)}</span>
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Clock className="size-4" aria-hidden /> {t("label.hours", { n: cur.duration })}
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <Layers className="size-4" aria-hidden /> {t("label.lessons", { n: cur.lessonsCount })}
                </li>
                <li className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">{t(`level.${cur.level}`)}</li>
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href={`/courses/${cur.slug}`} size="lg" magnetic iconEnd={<ArrowRight className="size-5 rtl-flip" aria-hidden />}>
              {t("act.viewCourse")}
            </Button>
            <Button variant="ghost" size="lg" className="!text-white border border-white/25 bg-white/10 backdrop-blur hover:!bg-white/20" onClick={() => openPreview(cur)} icon={<Play className="size-4" fill="currentColor" aria-hidden />}>
              {t("act.watchPreview")}
            </Button>
          </div>

          <p className="mt-7 flex items-center gap-3 text-sm text-white/70">
            <span className="font-display text-2xl font-extrabold text-white">
              {n(stats.students)}
              {stats.studentsSuffix}
            </span>
            {stats.studentsLabel}
          </p>
        </div>

        {/* ---------- 3D coverflow ---------- */}
        <div ref={stage} className="relative z-10 mx-auto h-[22rem] w-full max-w-[34rem] [perspective:1500px] sm:h-[26rem] lg:h-[31rem]">
          <motion.div
            data-cursor="drag"
            className="absolute inset-0 touch-pan-y"
            style={reduce ? undefined : { rotateY: stageRY, rotateX: stageRX, transformStyle: "preserve-3d" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x * dir < -50 || info.velocity.x * dir < -400) next();
              else if (info.offset.x * dir > 50 || info.velocity.x * dir > 400) prev();
            }}
          >
            {courses.map((c, i) => {
              const o = offsetOf(i);
              const a = Math.abs(o);
              const visible = a <= 2;
              const on = o === 0;
              return (
                <motion.div
                  key={c.id}
                  className="absolute start-1/2 top-1/2 w-[min(58%,17.5rem)] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2 sm:w-[min(52%,18.5rem)]"
                  style={{ zIndex: 10 - a, transformStyle: "preserve-3d" }}
                  initial={false}
                  animate={{
                    x: `${o * dir * 62}%`,
                    z: -a * 150,
                    rotateY: -o * dir * 30,
                    scale: 1 - a * 0.1,
                    opacity: visible ? 1 - a * 0.28 : 0,
                  }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
                >
                  <button
                    type="button"
                    tabIndex={visible ? 0 : -1}
                    aria-hidden={!visible}
                    aria-label={on ? t("home3.hero.openCard", { title: l(c.title) }) : t("home3.hero.goto", { n: i + 1, title: l(c.title) })}
                    data-cursor={on ? "play" : undefined}
                    onClick={() => (on ? openPreview(c) : go(i))}
                    className={cn("group/card relative block aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-black text-start shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] transition-shadow", on && "shadow-[0_40px_120px_-20px_var(--hero-glow)]")}
                    style={{ ["--hero-glow" as string]: accent }}
                  >
                    <Image src={c.thumbnail} alt="" fill sizes="(min-width:1024px) 18vw, 50vw" quality={70} className="object-cover transition duration-700 group-hover/card:scale-[1.06]" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    {on && <span aria-hidden className="shine absolute inset-0 overflow-hidden" />}
                    <span className="absolute inset-x-0 bottom-0 p-4">
                      <span className="block text-[0.7rem] font-bold uppercase tracking-widest text-volt rtl:tracking-normal">{l(c.category.name)}</span>
                      <span className="mt-1 line-clamp-2 block font-display text-base font-bold leading-snug">{l(c.title)}</span>
                    </span>
                    {on && (
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid size-16 place-items-center rounded-full bg-volt text-volt-ink shadow-2xl transition group-hover/card:scale-110">
                          <span aria-hidden className="absolute size-16 rounded-full border border-volt/70 [animation:ping_2.4s_cubic-bezier(0,0,.2,1)_infinite]" />
                          <Play className="size-7 translate-x-0.5" fill="currentColor" aria-hidden />
                        </span>
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* floating glass chips (parallax) */}
          <motion.div aria-hidden style={reduce ? undefined : { x: chipX, y: chipY }} className="pointer-events-none absolute inset-0 hidden sm:block">
            <div className="hero-drift absolute -end-2 top-6 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={cur.id + "r"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm font-bold">
                  <Star className="size-4 fill-amber-400 text-amber-400" /> <span className="ltr-run">{cur.rating.toFixed(1)}</span>
                  <span className="font-normal text-white/70">{t("label.reviews", { n: n(cur.reviewsCount) })}</span>
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="hero-drift absolute -start-3 bottom-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-xl [animation-delay:-3s]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={cur.id + "i"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm">
                  <span className="relative size-7 overflow-hidden rounded-full bg-white/20">
                    <Image src={cur.instructor.avatar} alt="" fill sizes="28px" className="object-cover" />
                  </span>
                  <span className="font-semibold">{l(cur.instructor.name)}</span>
                </motion.p>
              </AnimatePresence>
            </div>
            <svg viewBox="0 0 120 120" className="hero-spin absolute -top-4 start-4 size-24 text-white/50">
              <defs>
                <path id="hero-ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text fontSize="10.5" fontWeight="700" letterSpacing="3" fill="currentColor">
                <textPath href="#hero-ring">{t("home.hero.ring")}</textPath>
              </text>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* ---------- control rail ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-x flex items-center gap-3 pb-5 sm:gap-5 sm:pb-6">
          <p dir="ltr" className="hidden min-w-[5.5rem] font-display text-sm font-bold tabular-nums sm:block" aria-label={t("home3.hero.counter", { n: active + 1, total })}>
            <span className="text-3xl text-white">{String(active + 1).padStart(2, "0")}</span>
            <span className="text-white/50"> / {String(total).padStart(2, "0")}</span>
          </p>
          <ol className="flex flex-1 items-center gap-2" aria-label={t("home3.hero.region")}>
            {courses.map((c, i) => (
              <li key={c.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t("home3.hero.goto", { n: i + 1, title: l(c.title) })}
                  aria-current={i === active ? "true" : undefined}
                  className="group/seg relative block h-11 w-full max-sm:pointer-events-none"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all group-hover/seg:h-2.5">
                    <span
                      key={i === active ? `a${active}${autoplay}` : `s${i}`}
                      className="absolute inset-0 origin-left rounded-full rtl:origin-right"
                      style={{
                        backgroundColor: i === active ? accent : "#fff",
                        transform: i < active ? "scaleX(1)" : i === active && !autoplay ? "scaleX(1)" : "scaleX(0)",
                        animation: i === active && autoplay ? `hero-fill ${DURATION}ms linear forwards` : undefined,
                        animationPlayState: running ? "running" : "paused",
                      }}
                      onAnimationEnd={i === active && autoplay ? next : undefined}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} aria-label={t("home3.hero.prev")} className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white hover:text-black">
              {isRtl ? <ChevronRight className="size-5" aria-hidden /> : <ChevronLeft className="size-5" aria-hidden />}
            </button>
            <button type="button" onClick={next} aria-label={t("home3.hero.next")} className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white hover:text-black">
              {isRtl ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setUserPlaying((p) => !p)}
              aria-label={userPlaying ? t("home3.hero.pause") : t("home3.hero.play")}
              aria-pressed={!userPlaying}
              className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:bg-white hover:text-black"
            >
              {userPlaying ? <Pause className="size-4" fill="currentColor" aria-hidden /> : <Play className="size-4" fill="currentColor" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
