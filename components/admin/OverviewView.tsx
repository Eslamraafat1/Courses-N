"use client";
import { useMemo } from "react";
import { BookOpen, GraduationCap, ListVideo, Star, Users, MessageSquareText, UserPlus, Rocket } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { demoActivity, demoEnrollments, demoReviewStatus } from "@/data/adminDemo";
import { Button } from "@/components/ui/Button";
import type { Category, CourseSummary } from "@/types";
import { AdminPageHeader, DemoTag, Panel, StatCard } from "./AdminUI";
import { AreaChart, BarList, DonutChart } from "./Charts";

export interface OverviewProps {
  courses: CourseSummary[];
  categories: Category[];
  lessonsTotal: number;
  instructorsCount: number;
}

const kindIcon = { enroll: Users, review: MessageSquareText, publish: Rocket, signup: UserPlus } as const;

export function OverviewView({ courses, categories, lessonsTotal, instructorsCount }: OverviewProps) {
  const { t, l, n, lang } = useI18n();

  const students = useMemo(() => courses.reduce((s, c) => s + c.students, 0), [courses]);
  const avg = useMemo(() => (courses.length ? courses.reduce((s, c) => s + c.rating, 0) / courses.length : 0), [courses]);
  const pending = Object.values(demoReviewStatus).filter((s) => s === "pending").length;

  const series = useMemo(() => {
    const f = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { month: "short", timeZone: "UTC" });
    return demoEnrollments.map((d) => ({ label: f.format(new Date(`${d.month}-01T00:00:00Z`)), value: d.value }));
  }, [lang]);

  const slices = categories
    .map((c) => ({ label: l(c.name), color: c.color, value: courses.filter((x) => x.categoryId === c.id).length }))
    .filter((s) => s.value > 0);

  const top = [...courses]
    .sort((a, b) => b.students - a.students)
    .slice(0, 6)
    .map((c) => ({ id: c.id, label: l(c.title), value: c.students, sub: l(c.category.name) }));

  return (
    <>
      <AdminPageHeader
        title={t("admin.overview.title")}
        lead={t("admin.overview.lead")}
        actions={
          <Button href="/admin/courses/new" size="sm" variant="primary">
            {t("admin.courses.new")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard label={t("admin.kpi.courses")} value={n(courses.length)} icon={<BookOpen className="size-4" />} accent="volt" hint={t("admin.kpi.fromCatalog")} />
        <StatCard label={t("admin.kpi.lessons")} value={n(lessonsTotal)} icon={<ListVideo className="size-4" />} hint={t("admin.kpi.fromCatalog")} />
        <StatCard label={t("admin.kpi.students")} value={n(students)} icon={<Users className="size-4" />} demo accent="sky" hint={t("admin.kpi.sumEnrollments")} />
        <StatCard label={t("admin.kpi.rating")} value={<span className="ltr-run">{avg.toFixed(2)}</span>} icon={<Star className="size-4" />} demo accent="coral" hint={t("admin.kpi.avgRating")} />
        <div className="col-span-2 xl:col-span-1">
          <StatCard label={t("admin.kpi.instructors")} value={n(instructorsCount)} icon={<GraduationCap className="size-4" />} hint={t("admin.kpi.pendingReviews", { n: pending })} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3 sm:gap-6">
        <Panel className="lg:col-span-2" title={t("admin.chart.enrollments")} description={t("admin.chart.enrollmentsDesc")} demo>
          <AreaChart data={series} ariaLabel={t("admin.chart.enrollments")} unit={t("admin.chart.unit")} />
        </Panel>
        <Panel title={t("admin.chart.categories")} description={t("admin.chart.categoriesDesc")}>
          <DonutChart data={slices} ariaLabel={t("admin.chart.categories")} totalLabel={t("admin.kpi.courses")} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <Panel title={t("admin.chart.topCourses")} description={t("admin.chart.topCoursesDesc")} demo>
          <BarList items={top} format={(v) => t("label.students", { n: n(v) })} />
        </Panel>
        <Panel title={t("admin.activity.title")} description={t("admin.activity.desc")} demo>
          <ul className="grid gap-4">
            {demoActivity.map((a) => {
              const Icon = kindIcon[a.kind];
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-bg2 text-muted">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{l(a.text)}</p>
                    <p className="text-xs text-muted">{l(a.time)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <DemoTag /> {t("admin.activity.note")}
          </p>
        </Panel>
      </div>
    </>
  );
}
