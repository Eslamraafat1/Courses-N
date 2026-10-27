"use client";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** provide to make the column sortable */
  sortValue?: (row: T) => string | number;
  /** the column used as the card title on small screens (exactly one) */
  primary?: boolean;
  className?: string;
  /** align numbers to the end */
  numeric?: boolean;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  caption: string;
  /** row actions (rendered in the last column / card footer) */
  actions?: (row: T) => ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  initialSort?: { id: string; dir: "asc" | "desc" };
}

/**
 * Accessible data table. Desktop: real <table> with aria-sort buttons, scrolling inside its own container.
 * Mobile: each row becomes a labelled card (no horizontal page overflow).
 */
export function DataTable<T>({ rows, columns, rowKey, caption, actions, pageSize = 8, emptyTitle, emptyBody, initialSort }: Props<T>) {
  const { t, n } = useI18n();
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sort?.id);
    if (!col?.sortValue || !sort) return rows;
    const get = col.sortValue;
    const mul = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * mul;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const cur = Math.min(page, pages);
  const slice = sorted.slice((cur - 1) * pageSize, cur * pageSize);
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary);

  const toggleSort = (id: string) => {
    setPage(1);
    setSort((s) => (s?.id === id ? (s.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" }));
  };

  if (rows.length === 0) return <EmptyState title={emptyTitle} body={emptyBody} />;

  return (
    <div>
      {/* table ≥ md */}
      <div className="hidden rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line text-start">
              {columns.map((c) => {
                const active = sort?.id === c.id;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={c.sortValue ? (active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                    className={cn("px-4 py-2.5 text-start text-xs font-bold uppercase tracking-wide text-muted", c.numeric && "text-end", c.className)}
                  >
                    {c.sortValue ? (
                      <button type="button" onClick={() => toggleSort(c.id)} className={cn("-mx-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 uppercase hover:bg-ink/6 hover:text-ink", active && "text-ink")}>
                        {c.header}
                        {active ? sort?.dir === "asc" ? <ArrowUp className="size-3.5" aria-hidden /> : <ArrowDown className="size-3.5" aria-hidden /> : <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {actions && (
                <th scope="col" className="w-14 px-4 py-2.5">
                  <span className="sr-only">{t("admin.table.actions")}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-bg2/40">
                {columns.map((c, i) =>
                  i === 0 ? (
                    <th key={c.id} scope="row" className={cn("px-4 py-3 text-start font-semibold", c.className)}>
                      {c.cell(row)}
                    </th>
                  ) : (
                    <td key={c.id} className={cn("px-4 py-3 align-middle", c.numeric && "text-end tabular-nums", c.className)}>
                      {c.cell(row)}
                    </td>
                  ),
                )}
                {actions && <td className="px-3 py-2 text-end">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards < md */}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 xl:hidden" aria-label={caption}>
        {slice.map((row) => (
          <li key={rowKey(row)} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-semibold">{primary.cell(row)}</div>
              {actions && <div className="-m-1 shrink-0">{actions(row)}</div>}
            </div>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {rest.map((c) => (
                <div key={c.id} className="contents">
                  <dt className="text-muted">{c.header}</dt>
                  <dd className="min-w-0 text-end">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav aria-label={t("admin.table.pagination")} className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="text-muted" aria-live="polite">
            {t("admin.table.pageOf", { page: n(cur), pages: n(pages), total: n(sorted.length) })}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label={t("act.prev")} className="grid size-11 place-items-center rounded-xl border border-line bg-surface hover:bg-bg2 disabled:opacity-40">
              <ChevronLeft className="size-4 rtl-flip" aria-hidden />
            </button>
            <button type="button" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label={t("act.next")} className="grid size-11 place-items-center rounded-xl border border-line bg-surface hover:bg-bg2 disabled:opacity-40">
              <ChevronRight className="size-4 rtl-flip" aria-hidden />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
