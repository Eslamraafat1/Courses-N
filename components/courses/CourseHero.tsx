"use client";
import Image from "next/image";
import { BarChart3, CalendarClock, Clock, Play, Users } from "lucide-react";
import type { Course, Instructor } from "@/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/components/ui/Link";
import { Badge, Rating } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { useVideo } from "@/components/video/VideoProvider";
import { formatDate } from "@/lib/i18n/config";

interface Props {
  course: Course;
  instructor: Instructor | undefined;
  categoryName?: string;
  categorySlug?: string;
}

/** Cinematic course hero: blurred artwork backdrop, title block and a thumbnail whose Play button opens the preview. */
export function CourseHero({ course, instructor, categoryName, categorySlug }: Props) {
  const { t, l, n, lang } = useI18n();
  const video = useVideo();
  const title = l(course.title);

  const play = () =>
    video.open({
      url: course.videoUrl,
      title,
      subtitle: instructor ? `${t("label.by")} ${l(instructor.name)}` : undefined,
      poster: course.thumbnail,
    });

  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-bg2/50 pb-10 pt-8 sm:pb-14">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src={course.thumbnail} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-20 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
        <div className="absolute -top-24 end-0 size-96 rounded-full opacity-25 blur-3xl" style={{ background: course.accent }} />
      </div>

      <div className="container-x">
        <Breadcrumbs
          items={[
            { label: t("nav.courses"), href: "/courses" },
            ...(categoryName && categorySlug ? [{ label: categoryName, href: `/categories/${categorySlug}` }] : []),
            { label: title },
          ]}
        />

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              {course.featured && <Badge tone="volt">{t("label.featured")}</Badge>}
              {course.trending && <Badge tone="coral">{t("label.trending")}</Badge>}
              {course.isNew && <Badge tone="accent">{t("label.new")}</Badge>}
            </div>
            <h1 className="hd-1 text-balance">{title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">{l(course.subtitle)}</p>

            {instructor && (
              <p className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <Image src={instructor.avatar} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
                <span className="text-muted">{t("label.by")}</span>
                <Link href={`/instructors/${instructor.slug}`} className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
                  {l(instructor.name)}
                </Link>
              </p>
            )}

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <li>
                <Rating value={course.rating} count={course.reviewsCount} />
              </li>
              <li className="inline-flex items-center gap-1.5 text-muted">
                <Users className="size-4" aria-hidden /> {t("label.students", { n: n(course.students) })}
              </li>
              <li className="inline-flex items-center gap-1.5 text-muted">
                <Clock className="size-4" aria-hidden /> {t("label.hours", { n: course.duration })}
              </li>
              <li className="inline-flex items-center gap-1.5 text-muted">
                <BarChart3 className="size-4" aria-hidden /> {t(`level.${course.level}`)}
              </li>
              <li className="inline-flex items-center gap-1.5 text-muted">
                <CalendarClock className="size-4" aria-hidden /> {t("course.updated", { date: formatDate(course.publishedAt, lang) })}
              </li>
            </ul>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={play}
              aria-label={t("course.playPreview", { title })}
              className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-line bg-black shadow-[var(--shadow)]"
            >
              <Image
                src={course.thumbnail}
                alt=""
                fill
                priority
                sizes="(min-width:1280px) 32rem, (min-width:1024px) 28rem, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-20 place-items-center rounded-full bg-volt text-volt-ink shadow-2xl transition group-hover:scale-110">
                  <Play className="size-8 translate-x-0.5" fill="currentColor" aria-hidden />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 p-4 text-start text-sm font-semibold text-white">{t("act.watchPreview")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
