"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, CheckCheck, Settings2, Timer } from "lucide-react";
import type { NotificationItem } from "@/types";
import { formatDate } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useReadNotifications } from "@/hooks/useLearning";
import { cn } from "@/lib/utils";
import { AccountShell } from "./AccountShell";

const kindIcon = { course: BookOpen, reminder: Timer, system: Settings2 } as const;
const kindTone = {
  course: "bg-accent/15 text-accent",
  reminder: "bg-coral/15 text-coral",
  system: "bg-sky/20 text-ink",
} as const;

type Filter = "all" | NotificationItem["kind"];
const FILTERS: Filter[] = ["all", "course", "reminder", "system"];

export function NotificationRow({ item, isRead, onRead, compact }: { item: NotificationItem; isRead: boolean; onRead: (id: string) => void; compact?: boolean }) {
  const { t, l, lang } = useI18n();
  const Icon = kindIcon[item.kind];
  return (
    <div className={cn("flex items-start gap-4 rounded-2xl border p-4", isRead ? "border-line bg-transparent" : "border-accent/35 bg-accent/6")}>
      <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", kindTone[item.kind])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-semibold">{l(item.title)}</h3>
          {!isRead && <span className="rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-bold text-accent-ink">{t("dash.notifications.unread")}</span>}
        </div>
        {!compact && <p className="mt-1 text-muted">{l(item.body)}</p>}
        <p className="mt-1 text-xs text-muted">
          <time dateTime={item.time}>{formatDate(item.time, lang)}</time>
          {" · "}
          {t(`dash.notifications.kind.${item.kind}`)}
        </p>
      </div>
      {!isRead && (
        <button
          type="button"
          onClick={() => onRead(item.id)}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/8 hover:text-ink"
          aria-label={`${t("dash.notifications.markRead")}: ${l(item.title)}`}
          title={t("dash.notifications.markRead")}
        >
          <CheckCheck className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function NotificationsView({ items }: { items: NotificationItem[] }) {
  const { t, n } = useI18n();
  const toast = useToast();
  const { read, mark, markAll } = useReadNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  /** The data's own `read` flag is the starting state; local ids add to it. */
  const isRead = (i: NotificationItem) => i.read || read.has(i.id);
  const unread = items.filter((i) => !isRead(i)).length;
  const shown = useMemo(() => items.filter((i) => filter === "all" || i.kind === filter), [items, filter]);

  return (
    <AccountShell
      title={t("dash.notifications.title")}
      lead={t("dash.notifications.lead")}
      actions={
        <Button
          variant="outline"
          size="sm"
          disabled={unread === 0}
          icon={<CheckCheck className="size-4" aria-hidden />}
          onClick={() => {
            markAll(items.map((i) => i.id));
            toast.info(t("dash.notifications.allRead"));
          }}
        >
          {t("dash.notifications.markAll")}
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t("dash.notifications.filter")} className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors",
                filter === f ? "border-ink bg-ink text-bg" : "border-line hover:border-ink",
              )}
            >
              {t(`dash.notifications.kind.${f}`)}
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {t("dash.notifications.unreadCount", { n: n(unread) })}
        </p>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={<Bell className="size-7" aria-hidden />} title={t("dash.notifications.empty")} body={t("dash.notifications.emptyBody")} />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((it) => (
              <motion.li key={it.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <NotificationRow item={it} isRead={isRead(it)} onRead={mark} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </AccountShell>
  );
}
