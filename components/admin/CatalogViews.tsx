"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, EyeOff, Eye, Plus, Star, StarOff, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Tooltip, useConfirm } from "@/components/ui/Overlays";
import { useToast } from "@/components/ui/Toast";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { normalize } from "@/lib/utils";
import { demoStudents, type DemoStudent, type StudentStatus } from "@/data/adminDemo";
import type { Category, Instructor } from "@/types";
import { AdminPageHeader, DemoTag, FilterSelect, RowMenu, SearchBox, StatusChip, useDateFmt } from "./AdminUI";
import { DataTable, type Column } from "./DataTable";

/* ============================ Categories ============================ */
interface CatRow { cat: Category; courses: number; featured: boolean }
interface CatForm { nameEn: string; nameAr: string; slug: string; descEn: string; descAr: string }

export function CategoriesView({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { t, l, n } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const [rows, setRows] = useState<CatRow[]>(() => categories.map((c) => ({ cat: c, courses: counts[c.id] ?? 0, featured: !!c.featured })));
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const schema = useMemo(
    () =>
      z.object({
        nameEn: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
        nameAr: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
        slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: t("admin.form.err.slug") }),
        descEn: z.string().trim().max(200, { message: t("admin.form.err.max", { n: 200 }) }),
        descAr: z.string().trim().max(200, { message: t("admin.form.err.max", { n: 200 }) }),
      }),
    [t],
  );
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CatForm>({ resolver: zodResolver(schema), defaultValues: { nameEn: "", nameAr: "", slug: "", descEn: "", descAr: "" } });

  const add = (v: CatForm) => {
    if (rows.some((r) => r.cat.slug === v.slug)) {
      toast.error(t("admin.categories.dupSlug"));
      return;
    }
    const cat: Category = {
      id: `demo-cat-${v.slug}`, slug: v.slug, name: { en: v.nameEn, ar: v.nameAr }, description: { en: v.descEn, ar: v.descAr },
      icon: "Folder", color: "#5233e8", image: categories[0]?.image ?? "",
    };
    setRows((p) => [...p, { cat, courses: 0, featured: false }]);
    toast.info(t("admin.toast.addedLocal"), t("admin.toast.notPersisted"));
    reset();
    setOpen(false);
  };

  const filtered = rows.filter((r) => !q || normalize(`${r.cat.name.ar} ${r.cat.name.en} ${r.cat.slug}`).includes(normalize(q)));

  const columns: Column<CatRow>[] = [
    {
      id: "name", header: t("admin.col.category"), primary: true, sortValue: (r) => l(r.cat.name),
      cell: (r) => (
        <span className="flex items-center gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: r.cat.color }}><DynamicIcon name={r.cat.icon} className="size-4" /></span>
          <span className="min-w-0"><span className="block truncate">{l(r.cat.name)}</span><span className="block truncate text-xs font-normal text-muted ltr-run">/{r.cat.slug}</span></span>
        </span>
      ),
    },
    { id: "desc", header: t("admin.form.descShort"), className: "hidden 2xl:table-cell max-w-xs", cell: (r) => <span className="line-clamp-2 font-normal text-muted">{l(r.cat.description)}</span> },
    { id: "courses", header: t("admin.col.courses"), numeric: true, sortValue: (r) => r.courses, cell: (r) => <span className="font-normal">{n(r.courses)}</span> },
    { id: "featured", header: t("label.featured"), sortValue: (r) => (r.featured ? 1 : 0), cell: (r) => (r.featured ? <StatusChip tone="info">{t("label.featured")}</StatusChip> : <span className="font-normal text-muted">—</span>) },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.categories.title")} lead={t("admin.categories.lead")} actions={<Button icon={<Plus className="size-4" aria-hidden />} onClick={() => setOpen(true)}>{t("admin.categories.new")}</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} label={t("admin.categories.search")} />
        <p className="ms-auto text-sm text-muted" aria-live="polite">{t("label.results", { n: n(filtered.length) })}</p>
      </div>
      <DataTable
        rows={filtered} rowKey={(r) => r.cat.id} columns={columns} caption={t("admin.categories.title")}
        emptyTitle={t("state.noResults")} emptyBody={t("state.noResultsBody")}
        actions={(r) => (
          <RowMenu
            label={t("admin.table.rowActions", { name: l(r.cat.name) })}
            items={[
              { id: "view", label: t("admin.viewOnSite"), icon: <ExternalLink className="size-4" aria-hidden />, href: `/categories/${r.cat.slug}` },
              { id: "feat", label: r.featured ? t("admin.unfeature") : t("admin.feature"), icon: r.featured ? <StarOff className="size-4" aria-hidden /> : <Star className="size-4" aria-hidden />, onSelect: () => { setRows((p) => p.map((x) => (x.cat.id === r.cat.id ? { ...x, featured: !x.featured } : x))); toast.info(t("admin.toast.changedLocal"), t("admin.toast.notPersisted")); } },
              {
                id: "del", label: t("act.delete"), icon: <Trash2 className="size-4" aria-hidden />, danger: true, separatorBefore: true,
                onSelect: () => void (async () => {
                  if (r.courses > 0) { toast.error(t("admin.categories.inUse", { n: r.courses })); return; }
                  const ok = await confirm({ title: t("admin.categories.deleteTitle"), body: t("admin.categories.deleteBody", { name: l(r.cat.name) }), confirmLabel: t("act.delete"), danger: true });
                  if (ok) { setRows((p) => p.filter((x) => x.cat.id !== r.cat.id)); toast.info(t("admin.toast.removedLocal"), t("admin.toast.notPersisted")); }
                })(),
              },
            ]}
          />
        )}
      />
      <Modal open={open} onClose={() => setOpen(false)} label={t("admin.categories.new")}>
        <form noValidate onSubmit={handleSubmit(add)} className="grid max-h-[88dvh] gap-4 overflow-y-auto p-5 pe-16 sm:p-7 sm:pe-16" data-lenis-prevent>
          <h2 className="font-display text-xl font-bold">{t("admin.categories.new")}</h2>
          <Input label={t("admin.form.titleEn")} dir="ltr" error={errors.nameEn?.message} {...register("nameEn")} />
          <Input label={t("admin.form.titleAr")} dir="rtl" error={errors.nameAr?.message} {...register("nameAr")} />
          <Input label={t("admin.form.slug")} dir="ltr" hint={t("admin.form.slugHint")} error={errors.slug?.message} {...register("slug")} />
          <Textarea rows={2} label={t("admin.form.descEn")} dir="ltr" optionalLabel={t("label.optional")} error={errors.descEn?.message} {...register("descEn")} />
          <Textarea rows={2} label={t("admin.form.descAr")} dir="rtl" optionalLabel={t("label.optional")} error={errors.descAr?.message} {...register("descAr")} />
          <NoBackendNotice title={t("form.noBackend.title")} body={t("admin.toast.notPersisted")} />
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("act.cancel")}</Button><Button type="submit">{t("admin.form.validateApply")}</Button></div>
        </form>
      </Modal>
    </>
  );
}

/* ============================ Instructors ============================ */
interface InsRow { ins: Instructor; courses: number; active: boolean }

export function InstructorsView({ instructors, counts }: { instructors: Instructor[]; counts: Record<string, number> }) {
  const { t, l, n } = useI18n();
  const toast = useToast();
  const [rows, setRows] = useState<InsRow[]>(() => instructors.map((ins) => ({ ins, courses: counts[ins.id] ?? 0, active: true })));
  const [q, setQ] = useState("");
  const filtered = rows.filter((r) => !q || normalize(`${r.ins.name.ar} ${r.ins.name.en} ${r.ins.expertise.join(" ")}`).includes(normalize(q)));

  const columns: Column<InsRow>[] = [
    {
      id: "name", header: t("admin.col.instructor"), primary: true, sortValue: (r) => l(r.ins.name),
      cell: (r) => (
        <span className="flex items-center gap-3">
          <Image src={r.ins.avatar} alt="" width={40} height={40} sizes="40px" className="size-10 shrink-0 rounded-full object-cover" />
          <span className="min-w-0"><span className="block truncate">{l(r.ins.name)}</span><span className="block truncate text-xs font-normal text-muted">{l(r.ins.title)}</span></span>
        </span>
      ),
    },
    { id: "exp", header: t("admin.col.expertise"), className: "hidden 2xl:table-cell", cell: (r) => <span className="font-normal text-muted">{r.ins.expertise.slice(0, 3).join(" · ")}</span> },
    { id: "courses", header: t("admin.col.courses"), numeric: true, sortValue: (r) => r.courses, cell: (r) => <span className="font-normal">{n(r.courses)}</span> },
    { id: "students", header: t("admin.col.students"), numeric: true, className: "hidden lg:table-cell", sortValue: (r) => r.ins.students, cell: (r) => <span className="font-normal">{n(r.ins.students)}</span> },
    { id: "rating", header: t("admin.col.rating"), numeric: true, className: "hidden lg:table-cell", sortValue: (r) => r.ins.rating, cell: (r) => <span className="ltr-run font-normal">{r.ins.rating.toFixed(1)}</span> },
    { id: "status", header: t("admin.col.status"), sortValue: (r) => (r.active ? 1 : 0), cell: (r) => <StatusChip tone={r.active ? "good" : "neutral"}>{r.active ? t("admin.status.visible") : t("admin.status.hidden")}</StatusChip> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.instructors.title")}
        lead={t("admin.instructors.lead")}
        actions={
          <Tooltip label={t("admin.needsBackend")}>
            <span><Button disabled icon={<Plus className="size-4" aria-hidden />}>{t("admin.instructors.invite")}</Button></span>
          </Tooltip>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} label={t("admin.instructors.search")} />
        <p className="ms-auto text-sm text-muted" aria-live="polite">{t("label.results", { n: n(filtered.length) })}</p>
      </div>
      <DataTable
        rows={filtered} rowKey={(r) => r.ins.id} columns={columns} caption={t("admin.instructors.title")}
        emptyTitle={t("state.noResults")} emptyBody={t("state.noResultsBody")}
        actions={(r) => (
          <RowMenu
            label={t("admin.table.rowActions", { name: l(r.ins.name) })}
            items={[
              { id: "view", label: t("act.viewProfile"), icon: <ExternalLink className="size-4" aria-hidden />, href: `/instructors/${r.ins.slug}` },
              { id: "vis", label: r.active ? t("admin.hide") : t("admin.show"), icon: r.active ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />, onSelect: () => { setRows((p) => p.map((x) => (x.ins.id === r.ins.id ? { ...x, active: !x.active } : x))); toast.info(t("admin.toast.changedLocal"), t("admin.toast.notPersisted")); } },
            ]}
          />
        )}
      />
    </>
  );
}

/* ============================ Students (DEMO data) ============================ */
const sTone = { active: "good", inactive: "neutral", suspended: "bad" } as const;

export function StudentsView() {
  const { t, l, n } = useI18n();
  const toast = useToast();
  const fmt = useDateFmt();
  const [rows, setRows] = useState<DemoStudent[]>(demoStudents);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = rows.filter((r) => (status === "all" || r.status === status) && (!q || normalize(`${r.name.ar} ${r.name.en} ${r.email}`).includes(normalize(q))));
  const label = (s: StudentStatus) => t(`admin.student.${s}`);

  const columns: Column<DemoStudent>[] = [
    { id: "name", header: t("admin.col.student"), primary: true, sortValue: (r) => l(r.name), cell: (r) => <span className="block min-w-0"><span className="block truncate">{l(r.name)}</span><span className="block truncate text-xs font-normal text-muted ltr-run">{r.email}</span></span> },
    { id: "country", header: t("admin.col.country"), className: "hidden 2xl:table-cell", sortValue: (r) => l(r.country), cell: (r) => <span className="font-normal">{l(r.country)}</span> },
    { id: "enrolled", header: t("admin.col.enrolled"), numeric: true, sortValue: (r) => r.enrolled, cell: (r) => <span className="font-normal">{n(r.enrolled)}</span> },
    { id: "completed", header: t("admin.col.completed"), numeric: true, className: "hidden lg:table-cell", sortValue: (r) => r.completed, cell: (r) => <span className="font-normal">{n(r.completed)}</span> },
    {
      id: "progress", header: t("label.progress"), className: "hidden lg:table-cell w-40", sortValue: (r) => r.progress,
      cell: (r) => (
        <span className="flex items-center gap-2 font-normal">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-bg2" aria-hidden><span className="block h-full rounded-full bg-accent" style={{ width: `${r.progress}%` }} /></span>
          <span className="tabular-nums text-muted">{t("label.percent", { n: r.progress })}</span>
        </span>
      ),
    },
    { id: "joined", header: t("admin.col.joined"), className: "hidden 2xl:table-cell", sortValue: (r) => r.joined, cell: (r) => <span className="font-normal">{fmt(r.joined)}</span> },
    { id: "status", header: t("admin.col.status"), sortValue: (r) => r.status, cell: (r) => <StatusChip tone={sTone[r.status]}>{label(r.status)}</StatusChip> },
  ];

  const setSt = (r: DemoStudent, s: StudentStatus) => {
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, status: s } : x)));
    toast.info(t("admin.toast.changedLocal"), t("admin.toast.notPersisted"));
  };

  return (
    <>
      <AdminPageHeader title={<span className="flex flex-wrap items-center gap-3">{t("admin.students.title")} <DemoTag /></span>} lead={t("admin.students.lead")} />
      <div className="mb-4"><NoBackendNotice title={t("admin.students.noticeTitle")} body={t("admin.students.noticeBody")} /></div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} label={t("admin.students.search")} />
        <FilterSelect label={t("admin.col.status")} value={status} onChange={setStatus} options={[{ value: "all", label: t("label.all") }, ...(["active", "inactive", "suspended"] as const).map((s) => ({ value: s, label: label(s) }))]} />
        <p className="ms-auto text-sm text-muted" aria-live="polite">{t("label.results", { n: n(filtered.length) })}</p>
      </div>
      <DataTable
        rows={filtered} rowKey={(r) => r.id} columns={columns} caption={t("admin.students.title")} pageSize={10}
        emptyTitle={t("state.noResults")} emptyBody={t("state.noResultsBody")}
        actions={(r) => (
          <RowMenu
            label={t("admin.table.rowActions", { name: l(r.name) })}
            items={
              r.status === "suspended"
                ? [{ id: "re", label: t("admin.student.reactivate"), onSelect: () => setSt(r, "active") }]
                : [{ id: "sus", label: t("admin.student.suspend"), danger: true, onSelect: () => setSt(r, "suspended") }]
            }
          />
        )}
      />
    </>
  );
}
