"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, BookOpen, Clock, Heart, LayoutDashboard, PlayCircle, Settings, SlidersHorizontal, User, type LucideIcon } from "lucide-react";
import { demoStudent } from "@/data/content";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoBadge } from "./parts";

const items: { path: string; key: TKey; icon: LucideIcon }[] = [
  { path: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { path: "/dashboard/my-learning", key: "nav.myLearning", icon: BookOpen },
  { path: "/dashboard/continue", key: "dash.continue.title", icon: PlayCircle },
  { path: "/wishlist", key: "nav.wishlist", icon: Heart },
  { path: "/recently-viewed", key: "nav.recent", icon: Clock },
  { path: "/notifications", key: "nav.notifications", icon: Bell },
  { path: "/profile", key: "nav.profile", icon: User },
  { path: "/settings", key: "nav.settings", icon: Settings },
  { path: "/settings/preferences", key: "nav.preferences", icon: SlidersHorizontal },
];

/** Shared frame for all student pages: sidebar on ≥lg, scrollable tab bar below. */
export function AccountShell({ title, lead, actions, children }: { title: string; lead?: string; actions?: ReactNode; children: ReactNode }) {
  const { t, l, lang } = useI18n();
  const pathname = usePathname();
  const current = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), "") || "/";
  const name = l(demoStudent.name);

  const nav = items.map((it) => {
    const active = current === it.path;
    const Icon = it.icon;
    return (
      <li key={it.path} className="shrink-0 lg:shrink">
        <Link
          href={it.path}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors lg:rounded-2xl",
            active ? "text-accent-ink" : "text-muted hover:bg-ink/6 hover:text-ink",
          )}
        >
          {active && <motion.span layoutId="acct-active" className="absolute inset-0 -z-0 rounded-full bg-accent lg:rounded-2xl" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
          <Icon className="relative size-[1.15rem] shrink-0" aria-hidden />
          <span className="relative whitespace-nowrap">{t(it.key)}</span>
        </Link>
      </li>
    );
  });

  return (
    <div className="container-x py-6 sm:py-10">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
          <div className="mb-4 hidden items-center gap-3 rounded-3xl bg-ink p-4 text-bg lg:flex">
            <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-volt font-display text-lg font-bold text-volt-ink">
              {name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="text-xs text-bg/70">{t("account.card.notSigned")}</p>
            </div>
          </div>
          <nav aria-label={t("account.nav.label")} className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:-mx-0 sm:px-0">
            <ul className="flex gap-1 rounded-full border border-line bg-surface p-1 lg:flex-col lg:rounded-3xl lg:p-2">{nav}</ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="hd-1 !text-3xl sm:!text-5xl">{title}</h1>
              {lead && <p className="mt-3 text-lg text-muted">{lead}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <DemoBadge />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
