"use client";
import { BookOpen, PlayCircle } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { Stagger, StaggerItem } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { Tabs } from "@/components/ui/Tabs";
import { AccountShell } from "./AccountShell";
import { ProgressCourse, SeedNote } from "./parts";
import { useStudentCourses, type StudentCourse } from "./useStudentCourses";

function Grid({ list }: { list: StudentCourse[] }) {
  const { t } = useI18n();
  if (list.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="size-7" aria-hidden />}
        title={t("dash.learning.empty")}
        body={t("dash.learning.emptyBody")}
        action={<Button href="/courses">{t("dash.explore")}</Button>}
      />
    );
  }
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((it) => (
        <StaggerItem key={it.course.slug}>
          <ProgressCourse item={it} variant="tile" className="h-full" />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function MyLearningView({ courses }: { courses: CourseSummary[] }) {
  const { t, n } = useI18n();
  const { items, active, finished, isSeed } = useStudentCourses(courses);
  return (
    <AccountShell title={t("dash.learning.title")} lead={t("dash.learning.lead")}>
      <div className="space-y-6">
        {isSeed && <SeedNote />}
        <Tabs
          label={t("dash.learning.tabs")}
          items={[
            { id: "all", label: `${t("dash.learning.all")} (${n(items.length)})`, panel: <Grid list={items} /> },
            { id: "active", label: `${t("dash.learning.inProgress")} (${n(active.length)})`, panel: <Grid list={active} /> },
            { id: "done", label: `${t("dash.learning.completed")} (${n(finished.length)})`, panel: <Grid list={finished} /> },
          ]}
        />
      </div>
    </AccountShell>
  );
}

export function ContinueView({ courses }: { courses: CourseSummary[] }) {
  const { t } = useI18n();
  const { active, isSeed } = useStudentCourses(courses);
  const [first, ...others] = active;
  return (
    <AccountShell title={t("dash.continue.title")} lead={t("dash.continue.pageLead")}>
      <div className="space-y-8">
        {isSeed && <SeedNote />}
        {!first ? (
          <EmptyState
            icon={<PlayCircle className="size-7" aria-hidden />}
            title={t("dash.continue.empty")}
            body={t("dash.continue.emptyBody")}
            action={<Button href="/courses">{t("dash.explore")}</Button>}
          />
        ) : (
          <>
            <ProgressCourse item={first} variant="feature" />
            {others.length > 0 && (
              <ul className="space-y-3">
                {others.map((it) => (
                  <li key={it.course.slug}>
                    <ProgressCourse item={it} variant="row" />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </AccountShell>
  );
}
