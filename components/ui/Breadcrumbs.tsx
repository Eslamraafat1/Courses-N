"use client";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "./Link";

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail. Home is added automatically. The last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { t } = useI18n();
  const all: Crumb[] = [{ label: t("bc.home"), href: "/" }, ...items];
  return (
    <nav aria-label={t("bc.label")} className="mb-6 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="inline-flex min-h-10 items-center rounded px-1.5 hover:text-ink hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-semibold text-ink" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 rtl-flip" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
