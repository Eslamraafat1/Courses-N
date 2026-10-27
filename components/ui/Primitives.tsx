"use client";
import type { ReactNode } from "react";
import { AlertTriangle, SearchX, Star } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  const { t, n } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", className)} title={t("label.rating", { n: value })}>
      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="ltr-run">{value.toFixed(1)}</span>
      {count !== undefined && <span className="font-normal text-muted">({n(count)})</span>}
      <span className="sr-only">{t("label.rating", { n: value })}</span>
    </span>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "volt" | "accent" | "coral"; className?: string }) {
  const tones = {
    neutral: "bg-ink/8 text-ink",
    volt: "bg-volt text-volt-ink",
    accent: "bg-accent text-accent-ink",
    coral: "bg-coral text-white",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden" role="status" aria-busy="true">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action, icon }: { title?: string; body?: string; action?: ReactNode; icon?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-bg2 text-muted">{icon ?? <SearchX className="size-7" aria-hidden />}</div>
      <h3 className="font-display text-xl font-bold">{title ?? t("state.empty.title")}</h3>
      <p className="mt-2 max-w-sm text-muted">{body ?? t("state.empty.body")}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, title, body }: { onRetry?: () => void; title?: string; body?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="grid place-items-center rounded-3xl border border-coral/40 bg-coral/5 px-6 py-14 text-center">
      <AlertTriangle className="mb-3 size-9 text-coral" aria-hidden />
      <h3 className="font-display text-xl font-bold">{title ?? t("state.error.title")}</h3>
      <p className="mt-2 max-w-sm text-muted">{body ?? t("state.error.body")}</p>
      {onRetry && (
        <Button className="mt-6" variant="dark" onClick={onRetry}>
          {t("act.retry")}
        </Button>
      )}
    </div>
  );
}

/** Small section heading used across pages (eyebrow + title + optional lead). */
export function SectionHeading({ eyebrow, title, lead, align = "start", className, id }: { eyebrow?: string; title: ReactNode; lead?: string; align?: "start" | "center"; className?: string; id?: string }) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 id={id} className="hd-2">{title}</h2>
      {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
    </header>
  );
}
