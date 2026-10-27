import type { L } from "@/types";

export interface CompareRow {
  id: string;
  label: L;
  /** value per plan id: boolean or short bilingual text */
  values: Record<"free" | "pro" | "team", boolean | L>;
}

export const compareRows: CompareRow[] = [
  { id: "c1", label: { ar: "الكورسات المجانية", en: "Free courses" }, values: { free: true, pro: true, team: true } },
  { id: "c2", label: { ar: "كل الكورسات المدفوعة", en: "All paid courses" }, values: { free: false, pro: true, team: true } },
  { id: "c3", label: { ar: "معاينة الدروس", en: "Lesson previews" }, values: { free: true, pro: true, team: true } },
  { id: "c4", label: { ar: "تتبع التقدم", en: "Progress tracking" }, values: { free: true, pro: true, team: true } },
  { id: "c5", label: { ar: "شهادات إتمام", en: "Completion certificates" }, values: { free: false, pro: true, team: true } },
  { id: "c6", label: { ar: "موارد قابلة للتنزيل", en: "Downloadable resources" }, values: { free: false, pro: true, team: true } },
  { id: "c7", label: { ar: "لوحة متابعة الفريق", en: "Team dashboard" }, values: { free: false, pro: false, team: true } },
  { id: "c8", label: { ar: "مسارات مخصصة", en: "Custom learning paths" }, values: { free: false, pro: false, team: true } },
  { id: "c9", label: { ar: "الدعم", en: "Support" }, values: { free: { ar: "مجتمع", en: "Community" }, pro: { ar: "بريد", en: "Email" }, team: { ar: "أولوية", en: "Priority" } } },
];
