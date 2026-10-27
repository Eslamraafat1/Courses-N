"use client";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight, BookOpen, GraduationCap, LayoutDashboard, ListVideo, Menu, MessageSquareText, PanelsTopLeft,
  Settings, ShieldAlert, Tags, Users,
} from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { Modal } from "@/components/ui/Modal";
import { LangSwitcher, ThemeToggle } from "@/components/navigation/Controls";
import { cn } from "@/lib/utils";
import type { TKey } from "@/lib/i18n";

const NAV: { href: string; key: TKey; icon: typeof BookOpen }[] = [
  { href: "/admin", key: "admin.nav.overview", icon: LayoutDashboard },
  { href: "/admin/courses", key: "admin.nav.courses", icon: BookOpen },
  { href: "/admin/lessons", key: "admin.nav.lessons", icon: ListVideo },
  { href: "/admin/categories", key: "admin.nav.categories", icon: Tags },
  { href: "/admin/instructors", key: "admin.nav.instructors", icon: GraduationCap },
  { href: "/admin/students", key: "admin.nav.students", icon: Users },
  { href: "/admin/reviews", key: "admin.nav.reviews", icon: MessageSquareText },
  { href: "/admin/homepage", key: "admin.nav.homepage", icon: PanelsTopLeft },
  { href: "/admin/settings", key: "admin.nav.settings", icon: Settings },
];

function SidebarNav({ rest, onNavigate }: { rest: string; onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("admin.nav.label")} className="flex-1 overflow-y-auto px-3 py-3" data-lenis-prevent>
      <ul className="grid gap-1">
        {NAV.map(({ href, key, icon: Icon }) => {
          const active = href === "/admin" ? rest === "/admin" : rest.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                  active ? "bg-ink text-bg" : "text-muted hover:bg-bg2 hover:text-ink",
                )}
              >
                <Icon className="size-[1.15rem] shrink-0" aria-hidden />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
      <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-volt font-display text-lg font-black text-volt-ink">N</span>
      <div className="min-w-0 leading-tight">
        <Link href="/admin" onClick={onNavigate} className="block truncate font-display text-sm font-bold">
          {t("brand.name")}
        </Link>
        <p className="text-xs text-muted">{t("admin.title")}</p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";

  const section = NAV.slice(1).find((n) => rest.startsWith(n.href));
  const sub = section ? rest.slice(section.href.length).split("/").filter(Boolean)[0] : undefined;
  const subLabel = sub === "new" ? t("admin.bc.new") : sub ? t("admin.bc.edit") : undefined;
  const current = section ? t(section.key) : t("admin.nav.overview");

  return (
    <div className="min-h-dvh bg-bg2/50 text-ink lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface lg:flex">
        <Brand />
        <SidebarNav rest={rest} />
        <div className="border-t border-line p-4 text-xs text-muted">
          <p className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
            {t("admin.sidebar.note")}
          </p>
        </div>
      </aside>

      {/* mobile drawer */}
      <Modal open={open} onClose={() => setOpen(false)} label={t("admin.nav.label")} variant="start" className="lg:hidden">
        <div className="flex h-dvh flex-col">
          <Brand onNavigate={() => setOpen(false)} />
          <SidebarNav rest={rest} onNavigate={() => setOpen(false)} />
        </div>
      </Modal>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("nav.menu")}
            aria-haspopup="dialog"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line hover:bg-bg2 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <nav aria-label={t("bc.label")} className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm text-muted">
              <li className="hidden sm:block">
                <Link href="/admin" className="rounded px-1 hover:text-ink hover:underline">{t("admin.title")}</Link>
              </li>
              {section && (
                <li className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden className="hidden sm:inline rtl-flip">/</span>
                  {subLabel ? (
                    <Link href={section.href} className="truncate rounded px-1 hover:text-ink hover:underline">{current}</Link>
                  ) : (
                    <span aria-current="page" className="truncate font-semibold text-ink">{current}</span>
                  )}
                </li>
              )}
              {!section && (
                <li className="flex items-center gap-1.5">
                  <span aria-hidden className="hidden sm:inline">/</span>
                  <span aria-current="page" className="font-semibold text-ink">{current}</span>
                </li>
              )}
              {subLabel && (
                <li className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden>/</span>
                  <span aria-current="page" className="truncate font-semibold text-ink">{subLabel}</span>
                </li>
              )}
            </ol>
          </nav>
          <Link href="/" className="hidden min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold hover:bg-bg2 sm:inline-flex">
            {t("admin.backToSite")}
            <ArrowUpRight className="size-4 rtl-flip" aria-hidden />
          </Link>
          <Link href="/" aria-label={t("admin.backToSite")} className="grid size-11 place-items-center rounded-full border border-line hover:bg-bg2 sm:hidden">
            <ArrowUpRight className="size-5 rtl-flip" aria-hidden />
          </Link>
          <LangSwitcher />
          <ThemeToggle />
        </header>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-3 py-5 outline-none sm:px-6 sm:py-8">
          <div role="note" className="mb-6 flex items-start gap-3 rounded-2xl border border-coral/40 bg-coral/8 p-3.5 text-sm sm:p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
            <p>
              <strong className="font-bold">{t("admin.banner.lead")}</strong> {t("admin.banner.body")}
            </p>
          </div>
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
