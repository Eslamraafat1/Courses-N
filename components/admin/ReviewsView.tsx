"use client";
import { useMemo, useState } from "react";
import { Check, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/Overlays";
import { Rating } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { demoReviewStatus, type ReviewStatus } from "@/data/adminDemo";
import { normalize } from "@/lib/utils";
import type { L, Review } from "@/types";
import { AdminPageHeader, DemoTag, FilterSelect, IconButton, SearchBox, StatusChip, useDateFmt } from "./AdminUI";
import { DataTable, type Column } from "./DataTable";

interface Row { review: Review; status: ReviewStatus }
const tone = { approved: "good", pending: "warn", hidden: "neutral" } as const;

export function ReviewsView({ reviews, courseTitles }: { reviews: Review[]; courseTitles: Record<string, L> }) {
  const { t, l, n } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const fmt = useDateFmt();
  const initial = useMemo<Row[]>(() => reviews.map((r) => ({ review: r, status: demoReviewStatus[r.id] ?? "pending" })), [reviews]);
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");

  const filtered = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (rating === "all" || r.review.rating === Number(rating)) &&
      (!q || normalize(`${r.review.author.ar} ${r.review.author.en} ${r.review.text.ar} ${r.review.text.en}`).includes(normalize(q))),
  );
  const pending = rows.filter((r) => r.status === "pending").length;
  const label = (s: ReviewStatus) => t(`admin.review.${s}`);

  const setSt = (r: Row, s: ReviewStatus) => {
    setRows((p) => p.map((x) => (x.review.id === r.review.id ? { ...x, status: s } : x)));
    toast.info(t("admin.toast.statusLocal", { status: label(s) }), t("admin.toast.notPersisted"));
  };
  const remove = async (r: Row) => {
    const ok = await confirm({ title: t("admin.reviews.deleteTitle"), body: t("admin.reviews.deleteBody", { name: l(r.review.author) }), confirmLabel: t("act.delete"), danger: true });
    if (!ok) return;
    setRows((p) => p.filter((x) => x.review.id !== r.review.id));
    toast.info(t("admin.toast.removedLocal"), t("admin.toast.notPersisted"));
  };

  const columns: Column<Row>[] = [
    { id: "author", header: t("admin.col.author"), primary: true, sortValue: (r) => l(r.review.author), cell: (r) => <span className="block min-w-0"><span className="block truncate">{l(r.review.author)}</span>{r.review.id.startsWith("dr-") && <DemoTag />}</span> },
    { id: "course", header: t("admin.col.course"), className: "hidden 2xl:table-cell", sortValue: (r) => l(courseTitles[r.review.courseSlug] ?? { ar: r.review.courseSlug, en: r.review.courseSlug }), cell: (r) => <span className="font-normal">{l(courseTitles[r.review.courseSlug] ?? { ar: r.review.courseSlug, en: r.review.courseSlug })}</span> },
    { id: "rating", header: t("admin.col.rating"), sortValue: (r) => r.review.rating, cell: (r) => <Rating value={r.review.rating} /> },
    { id: "text", header: t("admin.col.comment"), className: "max-w-sm", cell: (r) => <span className="line-clamp-2 font-normal text-muted">{l(r.review.text)}</span> },
    { id: "date", header: t("admin.col.date"), className: "hidden 2xl:table-cell", sortValue: (r) => r.review.date, cell: (r) => <span className="font-normal">{fmt(r.review.date)}</span> },
    { id: "status", header: t("admin.col.status"), sortValue: (r) => r.status, cell: (r) => <StatusChip tone={tone[r.status]}>{label(r.status)}</StatusChip> },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.reviews.title")} lead={t("admin.reviews.lead")} actions={rows.length !== initial.length || rows.some((r, i) => r.status !== initial[i]?.status) ? <Button variant="outline" size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setRows(initial)}>{t("admin.resetDemo")}</Button> : undefined} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} label={t("admin.reviews.search")} />
        <FilterSelect label={t("admin.col.status")} value={status} onChange={setStatus} options={[{ value: "all", label: t("label.all") }, ...(["pending", "approved", "hidden"] as const).map((s) => ({ value: s, label: label(s) }))]} />
        <FilterSelect label={t("admin.col.rating")} value={rating} onChange={setRating} options={[{ value: "all", label: t("label.all") }, ...[5, 4, 3, 2, 1].map((v) => ({ value: String(v), label: `${v} ★` }))]} />
        <p className="ms-auto text-sm text-muted" aria-live="polite">{t("admin.reviews.pendingCount", { n: n(pending) })} · {t("label.results", { n: n(filtered.length) })}</p>
      </div>
      <DataTable
        rows={filtered} rowKey={(r) => r.review.id} columns={columns} caption={t("admin.reviews.title")}
        emptyTitle={t("state.noResults")} emptyBody={t("state.noResultsBody")}
        actions={(r) => (
          <div className="flex justify-end gap-1.5">
            <IconButton label={`${t("admin.review.approve")}: ${l(r.review.author)}`} disabled={r.status === "approved"} onClick={() => setSt(r, "approved")}><Check className="size-4" aria-hidden /></IconButton>
            <IconButton label={`${t("admin.hide")}: ${l(r.review.author)}`} disabled={r.status === "hidden"} onClick={() => setSt(r, "hidden")}><EyeOff className="size-4" aria-hidden /></IconButton>
            <IconButton label={`${t("act.delete")}: ${l(r.review.author)}`} danger onClick={() => void remove(r)}><Trash2 className="size-4" aria-hidden /></IconButton>
          </div>
        )}
      />
    </>
  );
}
