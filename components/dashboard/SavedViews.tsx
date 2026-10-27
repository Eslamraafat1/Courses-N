"use client";
import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Heart, Trash2 } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { EmptyState } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useRecent, useWishlist } from "@/hooks/useLearning";
import { AccountShell } from "./AccountShell";
import { resolveSlugs } from "./useStudentCourses";

export function WishlistView({ courses }: { courses: CourseSummary[] }) {
  const { t, l, n } = useI18n();
  const toast = useToast();
  const wishlist = useWishlist();
  const list = useMemo(() => resolveSlugs(wishlist.list, courses), [wishlist.list, courses]);

  return (
    <AccountShell title={t("dash.wishlist.title")} lead={t("dash.wishlist.lead")}>
      {list.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-7" aria-hidden />}
          title={t("dash.wishlist.empty")}
          body={t("dash.wishlist.emptyBody")}
          action={<Button href="/courses">{t("dash.explore")}</Button>}
        />
      ) : (
        <>
          <p className="mb-5 text-sm font-semibold text-muted" aria-live="polite">
            {t("dash.wishlist.count", { n: n(list.length) })}
          </p>
          <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {list.map((c) => (
                <motion.li key={c.slug} layout exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.25 }} className="flex flex-col gap-3">
                  <CourseCard course={c} variant="grid" className="flex-1" />
                  <div className="flex gap-2">
                    <Button href={c.firstLessonId ? `/learn/${c.slug}/${c.firstLessonId}` : `/courses/${c.slug}`} size="sm" className="flex-1" iconEnd={<ArrowRight className="size-4 rtl-flip" aria-hidden />}>
                      {t("dash.wishlist.start")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={t("dash.wishlist.remove", { title: l(c.title) })}
                      icon={<Trash2 className="size-4" aria-hidden />}
                      onClick={() => {
                        wishlist.toggle(c.slug);
                        toast.info(t("act.wishlistRemoved"));
                      }}
                    >
                      {t("act.removeWishlist")}
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </AccountShell>
  );
}

export function RecentView({ courses }: { courses: CourseSummary[] }) {
  const { t, l } = useI18n();
  const toast = useToast();
  const recent = useRecent();
  const list = useMemo(() => resolveSlugs(recent.list, courses), [recent.list, courses]);

  return (
    <AccountShell
      title={t("dash.recent.title")}
      lead={t("dash.recent.lead")}
      actions={
        list.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="size-4" aria-hidden />}
            onClick={() => {
              recent.clear();
              toast.info(t("dash.recent.cleared"));
            }}
          >
            {t("dash.recent.clear")}
          </Button>
        ) : undefined
      }
    >
      {list.length === 0 ? (
        <EmptyState
          icon={<Clock className="size-7" aria-hidden />}
          title={t("dash.recent.empty")}
          body={t("dash.recent.emptyBody")}
          action={<Button href="/courses">{t("dash.explore")}</Button>}
        />
      ) : (
        <ol className="space-y-3">
          {list.map((c, i) => (
            <li key={c.slug} className="card group flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
              <span aria-hidden className="hidden w-8 text-center font-display text-2xl font-bold text-muted sm:block ltr-run">
                {i + 1}
              </span>
              <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl sm:w-40">
                <Image src={c.thumbnail} alt="" fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
                <h2 className="line-clamp-2 font-display text-base font-bold leading-snug sm:text-lg">
                  <Link href={`/courses/${c.slug}`} className="hover:text-accent">{l(c.title)}</Link>
                </h2>
                <p className="mt-0.5 hidden text-sm text-muted sm:block">{l(c.instructor.name)}</p>
              </div>
              <Link href={`/courses/${c.slug}`} aria-label={`${t("act.viewCourse")}: ${l(c.title)}`} className="grid size-11 shrink-0 place-items-center rounded-full border border-line hover:bg-ink hover:text-bg">
                <ArrowRight className="size-4 rtl-flip" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </AccountShell>
  );
}
