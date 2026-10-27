"use client";
import { useMemo } from "react";
import { ArrowRight, BookCheck, Clock3, Flame, Heart, Library, Target } from "lucide-react";
import type { CourseSummary, NotificationItem } from "@/types";
import { demoStudent } from "@/data/content";
import { useI18n } from "@/components/providers/I18nProvider";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/animations/Motion";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { EmptyState } from "@/components/ui/Primitives";
import { usePrefs, useReadNotifications, useRecent, useWishlist } from "@/hooks/useLearning";
import { AccountShell } from "./AccountShell";
import { GoalRing, WeeklyChart } from "./Charts";
import { NotificationRow } from "./NotificationsView";
import { ProgressCourse, SeedNote } from "./parts";
import { resolveSlugs, useStudentCourses } from "./useStudentCourses";

function SectionTitle({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent hover:underline">
          {cta ?? t("act.viewAll")}
          <ArrowRight className="size-4 rtl-flip" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function DashboardView({ courses, notifications }: { courses: CourseSummary[]; notifications: NotificationItem[] }) {
  const { t, l, n } = useI18n();
  const { items, active, finished, isSeed } = useStudentCourses(courses);
  const wishlist = useWishlist();
  const recent = useRecent();
  const { prefs } = usePrefs();
  const { read, mark } = useReadNotifications();

  const wished = useMemo(() => resolveSlugs(wishlist.list, courses), [wishlist.list, courses]);
  const viewed = useMemo(() => resolveSlugs(recent.list, courses), [recent.list, courses]);
  const unreadNotifs = notifications.filter((i) => !i.read && !read.has(i.id));

  const weekMinutes = demoStudent.weeklyActivity.reduce((a, b) => a + b, 0);
  const weekHours = Math.round((weekMinutes / 60) * 10) / 10;
  const goalPct = Math.min(100, (weekHours / demoStudent.weeklyGoalHours) * 100);
  const avgDaily = Math.round(weekMinutes / 7);
  const featured = active[0];
  const rest = items.filter((i) => i !== featured);

  const stats = [
    { icon: Flame, label: t("dash.stat.streak"), value: demoStudent.streak, tone: "bg-coral/15 text-coral" },
    { icon: Clock3, label: t("dash.stat.week"), value: weekHours, tone: "bg-accent/15 text-accent" },
    { icon: Library, label: t("dash.stat.active"), value: active.length, tone: "bg-sky/25 text-ink" },
    { icon: BookCheck, label: t("dash.stat.done"), value: finished.length, tone: "bg-volt text-volt-ink" },
  ];

  return (
    <AccountShell title={t("dash.title")} lead={t("dash.lead")}>
      <div className="space-y-12">
        {/* welcome + stats bento */}
        <Reveal>
          <section aria-labelledby="dash-welcome" className="grain relative overflow-hidden rounded-[2rem] bg-ink p-6 text-bg sm:p-10">
            <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-accent/50 blur-[80px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 start-1/3 size-56 rounded-full bg-volt/25 blur-[90px]" />
            <div className="relative">
              <h2 id="dash-welcome" className="font-display text-3xl font-bold leading-tight sm:text-5xl">
                {t("dash.welcome", { name: l(demoStudent.name) })}
              </h2>
              <p className="mt-3 max-w-xl text-bg/75">{t("dash.welcomeSub")}</p>
              <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-bg/8 p-4 backdrop-blur-sm">
                    <span aria-hidden className={`mb-3 grid size-9 place-items-center rounded-xl ${s.tone}`}>
                      <s.icon className="size-[1.1rem]" />
                    </span>
                    <dd className="font-display text-3xl font-bold">
                      {Number.isInteger(s.value) ? <Counter value={s.value} /> : <span className="ltr-run tabular-nums">{n(s.value)}</span>}
                    </dd>
                    <dt className="text-xs text-bg/70 sm:text-sm">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </Reveal>

        {isSeed && <SeedNote />}

        {/* continue learning + goals */}
        <section aria-labelledby="dash-continue" className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div>
            <div id="dash-continue">
              <SectionTitle title={t("dash.continue.title")} href="/dashboard/continue" />
            </div>
            {featured ? (
              <ProgressCourse item={featured} variant="feature" />
            ) : (
              <EmptyState title={t("dash.continue.empty")} body={t("dash.continue.emptyBody")} action={<Button href="/courses">{t("dash.explore")}</Button>} />
            )}
          </div>

          <div className="card flex flex-col gap-6 p-6">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-accent" aria-hidden />
              <h2 className="font-display text-xl font-bold">{t("dash.goals.title")}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <GoalRing
                value={goalPct}
                label={t("dash.goals.weekly")}
                caption={t("dash.goals.of", { done: n(weekHours), goal: n(demoStudent.weeklyGoalHours) })}
              />
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <p className="font-semibold">{t("dash.goals.of", { done: n(weekHours), goal: n(demoStudent.weeklyGoalHours) })}</p>
                {goalPct >= 100 && <p className="font-bold text-accent">{t("dash.goals.reached")}</p>}
                <p className="text-muted">{t("dash.goals.avg", { n: n(avgDaily) })}</p>
                <p className="text-muted">{t("dash.goals.daily", { n: n(prefs.dailyMinutes) })}</p>
              </div>
            </div>
            <Button href="/settings/preferences" variant="outline" size="sm" className="mt-auto self-start">
              {t("dash.goals.edit")}
            </Button>
          </div>
        </section>

        {/* weekly activity + notifications */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">{t("dash.activity.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("dash.activity.desc")}</p>
            <div className="mt-6">
              <WeeklyChart data={demoStudent.weeklyActivity} dailyTarget={prefs.dailyMinutes} />
            </div>
          </div>
          <div>
            <SectionTitle title={t("dash.notif.title")} href="/notifications" />
            {unreadNotifs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t("dash.notif.empty")}</p>
            ) : (
              <ul className="space-y-3">
                {unreadNotifs.slice(0, 3).map((it) => (
                  <li key={it.id}>
                    <NotificationRow item={it} isRead={false} onRead={mark} compact />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* my courses */}
        {rest.length > 0 && (
          <section aria-labelledby="dash-courses">
            <div id="dash-courses">
              <SectionTitle title={t("dash.myCourses")} href="/dashboard/my-learning" />
            </div>
            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rest.map((it) => (
                <StaggerItem key={it.course.slug}>
                  <ProgressCourse item={it} variant="tile" className="h-full" />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        {/* recently viewed — horizontal strip */}
        <section aria-labelledby="dash-recent">
          <div id="dash-recent">
            <SectionTitle title={t("dash.recent")} href="/recently-viewed" />
          </div>
          {viewed.length === 0 ? (
            <EmptyState title={t("dash.recent.empty")} body={t("dash.recent.emptyBody")} />
          ) : (
            <ul className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {viewed.slice(0, 6).map((c) => (
                <li key={c.slug} className="w-72 shrink-0 snap-start">
                  <CourseCard course={c} variant="compact" className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* wishlist preview */}
        <section aria-labelledby="dash-wish">
          <div id="dash-wish">
            <SectionTitle title={t("dash.wishlist")} href="/wishlist" />
          </div>
          {wished.length === 0 ? (
            <EmptyState icon={<Heart className="size-7" aria-hidden />} title={t("dash.wishlist.empty")} body={t("dash.wishlist.emptyBody")} action={<Button href="/courses" variant="outline">{t("dash.explore")}</Button>} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {wished.slice(0, 3).map((c) => (
                <CourseCard key={c.slug} course={c} variant="grid" />
              ))}
            </div>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
