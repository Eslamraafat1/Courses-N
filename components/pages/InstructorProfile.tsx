"use client";
import Image from "next/image";
import { BriefcaseBusiness, Globe, PlayCircle } from "lucide-react";
import type { CourseSummary, Instructor } from "@/types";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/animations/Motion";
import { CourseCard } from "@/components/courses/CourseCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useI18n } from "@/components/providers/I18nProvider";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.19 8.21L22.75 22h-6.6l-5.17-6.76L5.06 22H1.8l7.69-8.78L1.25 2h6.77l4.67 6.17L18.244 2Zm-1.15 18h1.82L6.99 3.9H5.04L17.094 20Z" />
    </svg>
  );
}

export function InstructorProfile({ instructor: ins, courses }: { instructor: Instructor; courses: CourseSummary[] }) {
  const { t, l } = useI18n();
  const socials = [
    { key: "website", url: ins.social.website, label: t("instructors.social.website"), icon: <Globe className="size-5" aria-hidden /> },
    { key: "x", url: ins.social.x, label: t("instructors.social.x"), icon: <XIcon /> },
    { key: "linkedin", url: ins.social.linkedin, label: t("instructors.social.linkedin"), icon: <BriefcaseBusiness className="size-5" aria-hidden /> },
    { key: "youtube", url: ins.social.youtube, label: t("instructors.social.youtube"), icon: <PlayCircle className="size-5" aria-hidden /> },
  ].filter((s): s is typeof s & { url: string } => Boolean(s.url));

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-bg2/70 to-transparent pt-8">
        <div className="container-x pb-12 sm:pb-16">
          <Breadcrumbs items={[{ label: t("nav.instructors"), href: "/instructors" }, { label: l(ins.name) }]} />
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <p className="eyebrow mb-3">{t("instructors.lead1")}</p>
              <h1 className="h-display">{l(ins.name)}</h1>
              <p className="mt-3 text-xl text-muted sm:text-2xl">{l(ins.title)}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={t("instructors.expertise")}>
                {ins.expertise.map((e) => (
                  <li key={e} className="ltr-run rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold">{e}</li>
                ))}
              </ul>
              {socials.length > 0 && (
                <div className="mt-8">
                  <p className="mb-2 text-sm font-semibold text-muted">{t("instructors.social")}</p>
                  <ul className="flex flex-wrap gap-2">
                    {socials.map((s) => (
                      <li key={s.key}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition hover:border-ink hover:bg-surface">
                          {s.icon}
                          {s.label}
                          <span className="sr-only"> ({t("instructors.socialNote")})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted">{t("instructors.socialNote")}</p>
                </div>
              )}
            </div>
            <div className="order-1 mx-auto w-full max-w-sm lg:order-2 lg:col-span-5 lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-bg2 shadow-2xl sm:aspect-[4/5]">
                <Image src={ins.avatar} alt={l(ins.name)} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-14 lg:grid-cols-12 lg:py-20" aria-labelledby="about-h">
        <Reveal className="lg:col-span-7">
          <h2 id="about-h" className="hd-2">{t("instructors.about")}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{l(ins.bio)}</p>
        </Reveal>
        <Stagger className="grid grid-cols-3 gap-3 lg:col-span-5">
          {[
            { label: t("instructors.students"), node: <Counter value={ins.students} /> },
            { label: t("instructors.rating"), node: <span className="ltr-run">{ins.rating.toFixed(1)}</span> },
            { label: t("instructors.courses"), node: <Counter value={courses.length} /> },
          ].map((s) => (
            <StaggerItem key={s.label} className="card flex flex-col justify-between p-4 sm:p-5">
              <span className="font-display text-2xl font-extrabold sm:text-4xl">{s.node}</span>
              <span className="mt-2 text-xs text-muted sm:text-sm">{s.label}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-line bg-bg2/50 py-14 lg:py-20" aria-labelledby="by-h">
        <div className="container-x">
          <h2 id="by-h" className="hd-2 mb-8">{t("instructors.coursesBy", { name: l(ins.name) })}</h2>
          {courses.length === 0 ? (
            <p className="text-muted">{t("instructors.noCourses")}</p>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <StaggerItem key={c.id}>
                  <CourseCard course={c} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
