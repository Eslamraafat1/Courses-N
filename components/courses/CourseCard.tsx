"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Layers, Play } from "lucide-react";
import type { CourseSummary } from "@/types";
import { Link } from "@/components/ui/Link";
import { Badge, Rating } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { useVideo } from "@/components/video/VideoProvider";
import { cn } from "@/lib/utils";
import { PriceTag, WishlistButton } from "./CourseParts";

export type CourseCardVariant = "grid" | "wide" | "horizontal" | "compact" | "editorial";

interface Props {
  course: CourseSummary;
  variant?: CourseCardVariant;
  className?: string;
  /** shared-layout id for the thumbnail (used by the quick-view transition) */
  layoutId?: string;
  /** when set, clicking the thumbnail calls this instead of opening the preview video */
  onThumbClick?: (c: CourseSummary) => void;
  priority?: boolean;
}

/**
 * One course, five shapes. The thumbnail is a real <button> that opens the cinematic video modal
 * (Play preview) — the title is the link to the course page. Wishlist heart is always reachable.
 */
export function CourseCard({ course: c, variant = "grid", className, layoutId, onThumbClick, priority }: Props) {
  const { t, l, n } = useI18n();
  const video = useVideo();
  const title = l(c.title);
  const open = () =>
    onThumbClick
      ? onThumbClick(c)
      : video.open({ url: c.videoUrl, title, subtitle: `${t("label.by")} ${l(c.instructor.name)}`, poster: c.thumbnail });

  const levelLabel = t(`level.${c.level}`);
  const badges = (
    <span className="flex flex-wrap gap-1.5">
      {c.isNew && <Badge tone="volt">{t("label.new")}</Badge>}
      {c.trending && <Badge tone="coral">{t("label.trending")}</Badge>}
      {c.price === 0 && <Badge tone="accent">{t("label.free")}</Badge>}
    </span>
  );

  const thumb = (sizes: string, ratio: string, withOverlayTitle = false) => {
    const inner = (
      <>
        <Image src={c.thumbnail} alt="" fill sizes={sizes} priority={priority} className="object-cover transition duration-700 ease-out group-hover/thumb:scale-[1.06]" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-volt text-volt-ink opacity-90 shadow-xl transition duration-300 group-hover/thumb:scale-110 group-hover/thumb:opacity-100 sm:opacity-0 sm:group-hover/thumb:opacity-100 [@media(hover:none)]:opacity-90">
            <Play className="size-6 translate-x-0.5" fill="currentColor" aria-hidden />
          </span>
        </span>
        {withOverlayTitle && (
          <span className="absolute inset-x-0 bottom-0 p-5 text-start text-white">
            <span className="block text-xs font-bold uppercase tracking-widest text-volt rtl:tracking-normal">{l(c.category.name)}</span>
            <span className="mt-1 block font-display text-xl font-bold leading-tight">{title}</span>
          </span>
        )}
      </>
    );
    return (
      <div className={cn("relative overflow-hidden", ratio)}>
        {layoutId ? (
          <motion.div layoutId={layoutId} className="absolute inset-0">
            <button type="button" data-cursor={onThumbClick ? "view" : "play"} onClick={open} aria-label={onThumbClick ? title : t("video.poster", { title })} className="group/thumb absolute inset-0 block">
              {inner}
            </button>
          </motion.div>
        ) : (
          <button type="button" data-cursor={onThumbClick ? "view" : "play"} onClick={open} aria-label={onThumbClick ? title : t("video.poster", { title })} className="group/thumb absolute inset-0 block">
            {inner}
          </button>
        )}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="pointer-events-auto">{badges}</span>
          <span className="pointer-events-auto">
            <WishlistButton slug={c.slug} />
          </span>
        </div>
      </div>
    );
  };

  const meta = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("label.hours", { n: c.duration })}</span>
      <span className="inline-flex items-center gap-1"><Layers className="size-4" aria-hidden />{t("label.lessons", { n: c.lessonsCount })}</span>
      <span>{levelLabel}</span>
    </p>
  );

  if (variant === "editorial") {
    return (
      <article className={cn("group relative overflow-hidden rounded-[2rem] bg-ink", className)}>
        {thumb("(min-width:1024px) 28vw, (min-width:640px) 45vw, 90vw", "aspect-[4/5]", true)}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
          <span className="sr-only">{title}</span>
        </div>
        <Link href={`/courses/${c.slug}`} className="absolute bottom-3 end-3 z-10 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-black backdrop-blur hover:bg-volt">
          {t("act.viewCourse")}
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("card group flex items-center gap-4 p-3", className)}>
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
          <Image src={c.thumbnail} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">
            <Link href={`/courses/${c.slug}`} className="hover:text-accent">{title}</Link>
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted"><Rating value={c.rating} /> · {t("label.hours", { n: c.duration })}</p>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className={cn("card group grid overflow-hidden sm:grid-cols-[minmax(0,15rem)_1fr] md:grid-cols-[minmax(0,19rem)_1fr]", className)}>
        {thumb("(min-width:768px) 19rem, 100vw", "aspect-video sm:aspect-auto sm:min-h-full")}
        <div className="flex flex-col gap-3 p-5">
          <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
          <h3 className="font-display text-xl font-bold leading-snug">
            <Link href={`/courses/${c.slug}`} className="hover:text-accent">{title}</Link>
          </h3>
          <p className="line-clamp-2 text-muted">{l(c.subtitle)}</p>
          {meta}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="flex items-center gap-2 text-sm">
              <span className="relative size-7 overflow-hidden rounded-full bg-bg2"><Image src={c.instructor.avatar} alt="" fill sizes="28px" className="object-cover" /></span>
              {l(c.instructor.name)}
            </span>
            <span className="flex items-center gap-4"><Rating value={c.rating} count={c.reviewsCount} /><PriceTag price={c.price} oldPrice={c.oldPrice} /></span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "wide") {
    return (
      <article className={cn("card group grid overflow-hidden lg:grid-cols-2", className)}>
        {thumb("(min-width:1024px) 40vw, 100vw", "aspect-video lg:aspect-auto lg:min-h-[22rem]")}
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
          <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
            <Link href={`/courses/${c.slug}`} className="hover:text-accent">{title}</Link>
          </h3>
          <p className="text-muted">{l(c.subtitle)}</p>
          {meta}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <Rating value={c.rating} count={c.reviewsCount} />
            <span className="text-sm text-muted">{t("label.students", { n: n(c.students) })}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <PriceTag price={c.price} oldPrice={c.oldPrice} />
            <Link href={`/courses/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-bg hover:bg-accent hover:text-accent-ink">{t("act.viewCourse")}</Link>
          </div>
        </div>
      </article>
    );
  }

  // grid (default)
  return (
    <article className={cn("card group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1", className)}>
      {thumb("(min-width:1280px) 22vw, (min-width:768px) 33vw, 92vw", "aspect-[16/10]")}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug">
          <Link href={`/courses/${c.slug}`} className="after:absolute-none hover:text-accent">{title}</Link>
        </h3>
        <p className="text-sm text-muted">{l(c.instructor.name)}</p>
        {meta}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <Rating value={c.rating} count={c.reviewsCount} />
          <PriceTag price={c.price} oldPrice={c.oldPrice} />
        </div>
      </div>
    </article>
  );
}
