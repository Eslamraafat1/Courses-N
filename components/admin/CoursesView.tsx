"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, ExternalLink, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { useConfirm } from "@/components/ui/Overlays";
import { useToast } from "@/components/ui/Toast";
import { demoCourseStatus, type CourseStatus } from "@/data/adminDemo";
import type { Category, CourseSummary } from "@/types";
import { AdminPageHeader, FilterSelect, RowMenu, SearchBox, StatusChip, useDateFmt } from "./AdminUI";
import { DataTable, type Column } from "./DataTable";
import { normalize } from "@/lib/utils";

interface Row {
  course: CourseSummary;
  status: CourseStatus;
}

const tone = { published: "good", draft: "warn", archived: "neutral" } as const;

export function CoursesView({ courses, categories }: { courses: CourseSummary[]; categories: Category[] }) {
  const { t, l, n } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const fmt = useDateFmt();
  const initial = useMemo<Row[]>(() => courses.map((c) => ({ course: c, status: demoCourseStatus[c.id] ?? "published" })), [courses]);
  const [rows, setRows] = useState<Row[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (cat === "all" || r.course.categoryId === cat) &&
        (!nq || normalize(`${r.course.title.ar} ${r.course.title.en} ${r.course.slug} ${r.course.instructor.name.en} ${r.course.instructor.name.ar}`).includes(nq)),
    );
  }, [rows, q, status, cat]);

  const statusLabel = (s: CourseStatus) => t(`admin.status.${s}`);

  const remove = async (r: Row) => {
    const ok = await confirm({ title: t("admin.courses.deleteTitle"), body: t("admin.courses.deleteBody", { name: l(r.course.title) }), confirmLabel: t("act.delete"), danger: true });
    if (!ok) return;
    setRows((p) => p.filter((x) => x.course.id !== r.course.id));
    toast.info(t("admin.toast.removedLocal"), t("admin.toast.notPersisted"));
  };
  const setSt = (r: Row, s: CourseStatus) => {
    setRows((p) => p.map((x) => (x.course.id === r.course.id ? { ...x, status: s } : x)));
    toast.info(t("admin.toast.statusLocal", { status: statusLabel(s) }), t("admin.toast.notPersisted"));
  };

  const columns: Column<Row>[] = [
    {
      id: "title",
      header: t("admin.col.course"),
      primary: true,
      sortValue: (r) => l(r.course.title),
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-3">
          <Image src={r.course.thumbnail} alt="" width={64} height={40} sizes="64px" className="h-10 w-16 shrink-0 rounded-lg object-cover" />
          <span className="min-w-0">
            <Link href={`/admin/courses/${r.course.id}`} className="block truncate font-semibold hover:underline">{l(r.course.title)}</Link>
            <span className="block truncate text-xs font-normal text-muted ltr-run">/{r.course.slug}</span>
          </span>
        </span>
      ),
    },
    { id: "category", header: t("admin.col.category"), className: "hidden 2xl:table-cell", sortValue: (r) => l(r.course.category.name), cell: (r) => <span className="font-normal">{l(r.course.category.name)}</span> },
    { id: "instructor", header: t("admin.col.instructor"), className: "hidden 2xl:table-cell", sortValue: (r) => l(r.course.instructor.name), cell: (r) => <span className="font-normal">{l(r.course.instructor.name)}</span> },
    { id: "level", header: t("admin.col.level"), className: "hidden 2xl:table-cell", sortValue: (r) => r.course.level, cell: (r) => <span className="font-normal">{t(`level.${r.course.level}`)}</span> },
    { id: "price", header: t("admin.col.price"), numeric: true, sortValue: (r) => r.course.price, cell: (r) => <span className="ltr-run font-normal">{r.course.price === 0 ? t("label.free") : `$${r.course.price}`}</span> },
    { id: "students", header: t("admin.col.students"), numeric: true, className: "hidden lg:table-cell", sortValue: (r) => r.course.students, cell: (r) => <span className="font-normal">{n(r.course.students)}</span> },
    { id: "rating", header: t("admin.col.rating"), numeric: true, className: "hidden lg:table-cell", sortValue: (r) => r.course.rating, cell: (r) => <span className="ltr-run font-normal">{r.course.rating.toFixed(1)}</span> },
    { id: "date", header: t("admin.col.published"), className: "hidden 2xl:table-cell", sortValue: (r) => r.course.publishedAt, cell: (r) => <span className="font-normal">{fmt(r.course.publishedAt)}</span> },
    { id: "status", header: t("admin.col.status"), sortValue: (r) => r.status, cell: (r) => <StatusChip tone={tone[r.status]}>{statusLabel(r.status)}</StatusChip> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.courses.title")}
        lead={t("admin.courses.lead")}
        actions={
          <Button href="/admin/courses/new" icon={<Plus className="size-4" aria-hidden />}>
            {t("admin.courses.new")}
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} label={t("admin.courses.search")} />
        <FilterSelect label={t("admin.col.status")} value={status} onChange={setStatus} options={[{ value: "all", label: t("label.all") }, ...(["published", "draft", "archived"] as const).map((s) => ({ value: s, label: statusLabel(s) }))]} />
        <FilterSelect label={t("admin.col.category")} value={cat} onChange={setCat} options={[{ value: "all", label: t("label.all") }, ...categories.map((c) => ({ value: c.id, label: l(c.name) }))]} />
        <p className="ms-auto text-sm text-muted" aria-live="polite">{t("label.results", { n: n(filtered.length) })}</p>
        {rows.length !== initial.length && (
          <Button variant="outline" size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setRows(initial)}>
            {t("admin.resetDemo")}
          </Button>
        )}
      </div>
      <DataTable
        rows={filtered}
        rowKey={(r) => r.course.id}
        columns={columns}
        caption={t("admin.courses.title")}
        initialSort={{ id: "title", dir: "asc" }}
        emptyTitle={t("state.noResults")}
        emptyBody={t("state.noResultsBody")}
        actions={(r) => (
          <RowMenu
            label={t("admin.table.rowActions", { name: l(r.course.title) })}
            items={[
              { id: "edit", label: t("act.edit"), icon: <Pencil className="size-4" aria-hidden />, href: `/admin/courses/${r.course.id}` },
              { id: "view", label: t("admin.viewOnSite"), icon: <ExternalLink className="size-4" aria-hidden />, href: `/courses/${r.course.slug}` },
              r.status === "published"
                ? { id: "unpub", label: t("admin.courses.unpublish"), icon: <EyeOff className="size-4" aria-hidden />, onSelect: () => setSt(r, "draft") }
                : { id: "pub", label: t("admin.courses.publish"), icon: <Eye className="size-4" aria-hidden />, onSelect: () => setSt(r, "published") },
              { id: "del", label: t("act.delete"), icon: <Trash2 className="size-4" aria-hidden />, danger: true, separatorBefore: true, onSelect: () => void remove(r) },
            ]}
          />
        )}
      />
    </>
  );
}
