import type { Category, Course, CourseSummary, Instructor } from "@/types";

/** Course -> lightweight list shape (+ denormalised instructor/category). Pure; shared by demo & backend modes. */
export function summarize(c: Course, instructors: Instructor[], categories: Category[]): CourseSummary {
  const { modules, outcomes: _o, requirements: _r, ...rest } = c;
  void _o;
  void _r;
  const all = modules.flatMap((m) => m.lessons);
  const ins = instructors.find((i) => i.id === c.instructorId);
  const cat = categories.find((x) => x.id === c.categoryId);
  return {
    ...rest,
    lessonsCount: all.length,
    firstLessonId: all[0]?.id ?? "",
    instructor: { slug: ins?.slug ?? "", name: ins?.name ?? { ar: "", en: "" }, avatar: ins?.avatar ?? "" },
    category: { slug: cat?.slug ?? "", name: cat?.name ?? { ar: "", en: "" }, color: cat?.color ?? "#5233e8" },
  };
}
