"use client";
import { HardDrive } from "lucide-react";
import type { L } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { usePrefs } from "@/hooks/useLearning";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AccountShell } from "./AccountShell";

const GOALS: { id: string; key: TKey }[] = [
  { id: "career", key: "account.prefs.goal.career" },
  { id: "skill", key: "account.prefs.goal.skill" },
  { id: "hobby", key: "account.prefs.goal.hobby" },
  { id: "exam", key: "account.prefs.goal.exam" },
];

function Switch({ checked, onChange, label, body }: { checked: boolean; onChange: (v: boolean) => void; label: string; body: string }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors", checked ? "border-accent bg-accent" : "border-line bg-bg2")}
      >
        <span className={cn("absolute size-6 rounded-full bg-white shadow transition-all", checked ? "start-[calc(100%-1.75rem)]" : "start-1")} />
        <span className="sr-only">{checked ? t("account.prefs.on") : t("account.prefs.off")}</span>
      </button>
    </div>
  );
}

export function PreferencesView({ topics }: { topics: { slug: string; name: L }[] }) {
  const { t, l, n } = useI18n();
  const { prefs, update } = usePrefs();

  return (
    <AccountShell title={t("account.prefs.title")} lead={t("account.prefs.lead")}>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card space-y-8 p-6 sm:p-8">
          <div>
            <label htmlFor="pref-daily" className="flex items-baseline justify-between gap-3 font-semibold">
              <span>{t("account.prefs.daily")}</span>
              <span className="font-display text-xl font-bold text-accent">{t("account.prefs.dailyValue", { n: n(prefs.dailyMinutes) })}</span>
            </label>
            <input
              id="pref-daily"
              type="range"
              min={10}
              max={180}
              step={5}
              value={prefs.dailyMinutes}
              onChange={(e) => update({ dailyMinutes: Number(e.target.value) })}
              className="mt-4 h-11 w-full cursor-pointer accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-muted ltr-run">
              <span>10</span>
              <span>180</span>
            </div>
          </div>

          <fieldset>
            <legend className="mb-3 font-semibold">{t("account.prefs.goal")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS.map((g) => {
                const on = prefs.goal === g.id;
                return (
                  <label
                    key={g.id}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40",
                      on ? "border-accent bg-accent/10" : "border-line hover:border-ink",
                    )}
                  >
                    <input type="radio" name="goal" value={g.id} checked={on} onChange={() => update({ goal: g.id })} className="size-4 accent-[var(--accent)]" />
                    {t(g.key)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="space-y-6">
          <div className="card space-y-3 p-6 sm:p-8">
            <Switch checked={prefs.reminders} onChange={(v) => update({ reminders: v })} label={t("account.prefs.reminders")} body={t("account.prefs.remindersBody")} />
            <Switch checked={prefs.autoplay} onChange={(v) => update({ autoplay: v })} label={t("account.prefs.autoplay")} body={t("account.prefs.autoplayBody")} />
          </div>

          <fieldset className="card p-6 sm:p-8">
            <legend className="sr-only">{t("account.prefs.topics")}</legend>
            <h2 className="font-semibold" aria-hidden>{t("account.prefs.topics")}</h2>
            <p className="mb-4 text-sm text-muted">{t("account.prefs.topicsBody")}</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((c) => {
                const on = prefs.topics.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ topics: on ? prefs.topics.filter((x) => x !== c.slug) : [...prefs.topics, c.slug] })}
                    className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", on ? "border-ink bg-ink text-bg" : "border-line hover:border-ink")}
                  >
                    {l(c.name)}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>
      </div>
      <p className="mt-6 flex items-start gap-2 text-sm text-muted" role="status">
        <HardDrive className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t("account.prefs.saveNote")}
      </p>
    </AccountShell>
  );
}
