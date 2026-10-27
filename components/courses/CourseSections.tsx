"use client";
import Image from "next/image";
import { Check, Star, Users } from "lucide-react";
import type { Course, Instructor } from "@/types";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";

export function CourseOverview({ course }: { course: Course }) {
  const { t, l } = useI18n();
  return (
    <div className="space-y-10">
      <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted">{l(course.description)}</p>

      <div>
        <h3 className="font-display text-xl font-bold">{t("course.outcomes")}</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {course.outcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-volt text-volt-ink" aria-hidden>
                <Check className="size-3.5" />
              </span>
              <span>{l(o)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold">{t("course.requirements")}</h3>
        <ul className="mt-4 list-disc space-y-2 ps-6 marker:text-accent">
          {course.requirements.map((r, i) => (
            <li key={i}>{l(r)}</li>
          ))}
        </ul>
      </div>

      {course.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t("course.tags")}>
          {course.tags.map((tag) => (
            <li key={tag} className="ltr-run rounded-full border border-line px-3 py-1 text-sm text-muted">
              #{tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InstructorBox({ instructor }: { instructor: Instructor }) {
  const { t, l, n } = useI18n();
  return (
    <div className="card flex flex-col gap-5 p-5 sm:flex-row sm:p-7">
      <Image src={instructor.avatar} alt="" width={120} height={120} className="size-24 shrink-0 rounded-2xl object-cover sm:size-28" />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-2xl font-bold">
          <Link href={`/instructors/${instructor.slug}`} className="hover:underline">
            {l(instructor.name)}
          </Link>
        </h3>
        <p className="text-muted">{l(instructor.title)}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li className="inline-flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden /> <span className="ltr-run">{instructor.rating.toFixed(1)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5 text-muted">
            <Users className="size-4" aria-hidden /> {t("label.students", { n: n(instructor.students) })}
          </li>
        </ul>
        <p className="mt-4 text-pretty text-muted">{l(instructor.bio)}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("course.expertise")}>
          {instructor.expertise.map((x) => (
            <li key={x} className="ltr-run rounded-full bg-bg2 px-3 py-1 text-xs font-semibold">
              {x}
            </li>
          ))}
        </ul>
        <Button href={`/instructors/${instructor.slug}`} variant="outline" size="sm" className="mt-5">
          {t("act.viewProfile")}
        </Button>
      </div>
    </div>
  );
}
