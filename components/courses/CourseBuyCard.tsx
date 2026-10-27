"use client";
import { BarChart3, BookOpen, Clock, HardDrive } from "lucide-react";
import type { Course } from "@/types";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";
import { PriceTag, ShareButtons, WishlistButton } from "./CourseParts";
import { lessonsOf } from "./format";

/**
 * Sticky enrol card (desktop) + fixed bottom bar (mobile). There is no payment flow:
 * the price is informational and the primary action goes straight to the lesson player.
 */
export function CourseBuyCard({ course }: { course: Course }) {
  const { t, l, n } = useI18n();
  const lessons = lessonsOf(course).length;
  const title = l(course.title);
  const discount = course.oldPrice && course.oldPrice > course.price ? Math.round((1 - course.price / course.oldPrice) * 100) : 0;

  return (
    <>
      <aside aria-label={t("course.enrollCard")} className="card sticky top-24 hidden space-y-5 p-6 lg:block">
        <div className="flex items-end justify-between gap-3">
          <PriceTag price={course.price} oldPrice={course.oldPrice} className="[&>span:first-child]:text-3xl" />
          {discount > 0 && <span className="ltr-run rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
        </div>
        <Button href={`/learn/${course.slug}`} size="lg" className="w-full">
          {t("act.startLearning")}
        </Button>
        <p className="text-center text-xs text-muted">{t("course.noPayment")}</p>

        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center gap-2.5">
            <BookOpen className="size-4 text-muted" aria-hidden /> {t("label.lessons", { n: n(lessons) })}
          </li>
          <li className="flex items-center gap-2.5">
            <Clock className="size-4 text-muted" aria-hidden /> {t("label.hours", { n: course.duration })}
          </li>
          <li className="flex items-center gap-2.5">
            <BarChart3 className="size-4 text-muted" aria-hidden /> {t(`level.${course.level}`)}
          </li>
          <li className="flex items-center gap-2.5">
            <HardDrive className="size-4 text-muted" aria-hidden /> {t("course.savedLocally")}
          </li>
        </ul>

        <div className="space-y-3 border-t border-line pt-5">
          <WishlistButton slug={course.slug} variant="button" className="w-full" />
          <ShareButtons path={`/courses/${course.slug}`} title={title} />
        </div>
      </aside>

      <div className="safe-b fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="container-x flex items-center justify-between gap-3 py-3">
          <PriceTag price={course.price} oldPrice={course.oldPrice} />
          <div className="flex items-center gap-2">
            <WishlistButton slug={course.slug} className="!bg-ink/10 !text-ink hover:!bg-ink/20" />
            <Button href={`/learn/${course.slug}`}>{t("act.startLearning")}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
