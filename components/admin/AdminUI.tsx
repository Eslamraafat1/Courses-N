"use client";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { DropdownMenu, type MenuItem } from "@/components/ui/Overlays";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/* ---------- Page header ---------- */
export function AdminPageHeader({ title, lead, actions }: { title: ReactNode; lead?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- Demo marker ---------- */
export function DemoTag({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center rounded-md border border-dashed border-line bg-bg2 px-1.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-muted", className)}>
      {t("admin.demo")}
    </span>
  );
}

/* ---------- Status chip (text + dot, never colour-only) ---------- */
type Tone = "good" | "warn" | "bad" | "neutral" | "info";
const toneCls: Record<Tone, string> = {
  good: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  bad: "bg-coral/15 text-coral",
  neutral: "bg-ink/8 text-muted",
  info: "bg-accent/12 text-accent",
};
const dotCls: Record<Tone, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-coral",
  neutral: "bg-muted",
  info: "bg-accent",
};
export function StatusChip({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", toneCls[tone])}>
      <span aria-hidden className={cn("size-1.5 rounded-full", dotCls[tone])} />
      {children}
    </span>
  );
}

/* ---------- Panel ---------- */
export function Panel({ title, description, actions, demo, children, className, bodyClassName }: { title?: ReactNode; description?: string; actions?: ReactNode; demo?: boolean; children: ReactNode; className?: string; bodyClassName?: string }) {
  const id = useId();
  return (
    <section aria-labelledby={title ? id : undefined} className={cn("rounded-2xl border border-line bg-surface", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={id} className="flex flex-wrap items-center gap-2 text-base font-bold">
              {title}
              {demo && <DemoTag />}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- KPI card ---------- */
export function StatCard({ label, value, hint, icon, demo, accent }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode; demo?: boolean; accent?: "volt" | "accent" | "coral" | "sky" }) {
  const tint = accent === "volt" ? "bg-volt text-volt-ink" : accent === "coral" ? "bg-coral/15 text-coral" : accent === "sky" ? "bg-sky/20 text-ink" : "bg-accent/12 text-accent";
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon && <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tint)} aria-hidden>{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
        {hint && <span>{hint}</span>}
        {demo && <DemoTag />}
      </div>
    </div>
  );
}

/* ---------- Form section: label column + fields ---------- */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-0 p-0 lg:grid-cols-[14rem_1fr] lg:gap-8">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden className="lg:pt-1">
        <p className="text-sm font-bold">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:[&>.span-2]:col-span-2">{children}</div>
    </fieldset>
  );
}

/* ---------- Toolbar controls ---------- */
export function SearchBox({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <label className="relative block min-w-0 flex-1 sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="min-h-11 w-full rounded-xl border border-line bg-surface ps-10 pe-3 text-sm placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 min-w-0 rounded-xl border border-line bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Icon-only button with accessible name ---------- */
export function IconButton({ label, onClick, disabled, children, danger, title }: { label: string; onClick?: () => void; disabled?: boolean; children: ReactNode; danger?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-bg2 disabled:pointer-events-none disabled:opacity-40",
        danger && "text-coral hover:bg-coral/10",
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Tabs that keep every panel mounted (so RHF fields in hidden tabs still validate/submit) ---------- */
export function AdminTabs({ items, active, onChange, label }: { items: { id: string; label: ReactNode; badge?: number; panel: ReactNode }[]; active: string; onChange: (id: string) => void; label: string }) {
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { isRtl } = useI18n();
  const onKey = (e: KeyboardEvent) => {
    const i = items.findIndex((x) => x.id === active);
    let next = i;
    if (e.key === (isRtl ? "ArrowLeft" : "ArrowRight")) next = (i + 1) % items.length;
    else if (e.key === (isRtl ? "ArrowRight" : "ArrowLeft")) next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    onChange(items[next].id);
    refs.current[items[next].id]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
        {items.map((it) => {
          const sel = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => {
                refs.current[it.id] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-t-${it.id}`}
              aria-selected={sel}
              aria-controls={`${uid}-p-${it.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => onChange(it.id)}
              className={cn(
                "relative flex min-h-11 items-center gap-2 whitespace-nowrap px-4 text-sm font-semibold transition-colors",
                sel ? "text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent" : "text-muted hover:text-ink",
              )}
            >
              {it.label}
              {!!it.badge && <span className="grid min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[0.7rem] font-bold text-white">{it.badge}</span>}
            </button>
          );
        })}
      </div>
      {items.map((it) => (
        <div key={it.id} role="tabpanel" id={`${uid}-p-${it.id}`} aria-labelledby={`${uid}-t-${it.id}`} hidden={it.id !== active} className="pt-6">
          {it.panel}
        </div>
      ))}
    </div>
  );
}

/** Tiny helper hook-free formatter for ISO dates (UTC, latin digits). */
export function useDateFmt() {
  const { lang } = useI18n();
  return (iso: string) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

/* ---------- Row actions menu ---------- */
export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  return (
    <DropdownMenu
      label={label}
      items={items}
      trigger={({ open, props }) => (
        <button
          type="button"
          {...props}
          aria-label={label}
          className={cn("grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-bg2 hover:text-ink", open && "bg-bg2 text-ink")}
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
      )}
    />
  );
}
