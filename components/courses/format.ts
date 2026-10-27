import type { Course, Module } from "@/types";
import type { TFn } from "@/lib/i18n";

export const totalMinutes = (modules: Module[]) =>
  modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0), 0);

/** 95 -> "1 h 35 min" (localised through the shared label.* keys). */
export function fmtMinutes(t: TFn, minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return t("label.minutes", { n: m });
  return m === 0 ? t("label.hours", { n: h }) : `${t("label.hours", { n: h })} ${t("label.minutes", { n: m })}`;
}

export const lessonsOf = (course: Pick<Course, "modules">) => course.modules.flatMap((m) => m.lessons);

/** ISO-8601 duration used in JSON-LD (e.g. 14 hours -> PT14H). */
export const isoHours = (hours: number) => `PT${Math.max(1, Math.round(hours))}H`;
