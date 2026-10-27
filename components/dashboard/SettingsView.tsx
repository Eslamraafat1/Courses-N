"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, SlidersHorizontal, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { NoBackendNotice } from "@/components/ui/Field";
import { Link } from "@/components/ui/Link";
import { useConfirm } from "@/components/ui/Overlays";
import { useToast } from "@/components/ui/Toast";
import { PasswordField } from "@/components/auth/AuthShell";
import { writeStore } from "@/lib/store";
import { AccountShell } from "./AccountShell";
import { DEFAULT_PROFILE, PROFILE_KEY, ProfileForm } from "./ProfileView";

/** Every localStorage key this app owns, with the empty value to reset it to. */
const LOCAL_KEYS: [string, unknown][] = [
  ["nx-wishlist", []],
  ["nx-recent", []],
  ["nx-searches", []],
  ["nx-progress", {}],
  ["nx-last-lesson", {}],
  ["nx-notes", {}],
  ["nx-notif-read", []],
  ["nx-prefs", { dailyMinutes: 30, goal: "career", reminders: true, autoplay: true, topics: ["programming"] }],
  [PROFILE_KEY, DEFAULT_PROFILE],
];

function PasswordForm() {
  const { t } = useI18n();
  const schema = useMemo(
    () =>
      z
        .object({
          current: z.string().min(1, t("form.required")),
          next: z.string().min(8, t("form.passwordMin")),
          confirm: z.string().min(1, t("form.required")),
        })
        .refine((d) => d.next === d.confirm, { path: ["confirm"], message: t("form.passwordMatch") }),
    [t],
  );
  type V = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const f = useForm<V>({ resolver: zodResolver(schema), defaultValues: { current: "", next: "", confirm: "" } });
  const { errors, isSubmitting } = f.formState;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={f.handleSubmit(async () => {
        setDone(false);
        await new Promise((r) => setTimeout(r, 350));
        f.reset();
        setDone(true);
      })}
    >
      <PasswordField label={t("account.settings.current")} autoComplete="current-password" error={errors.current?.message} {...f.register("current")} />
      <PasswordField label={t("auth.newPassword")} autoComplete="new-password" error={errors.next?.message} {...f.register("next")} />
      <PasswordField label={t("form.confirmPassword")} autoComplete="new-password" error={errors.confirm?.message} {...f.register("confirm")} />
      <Button type="submit" variant="dark" loading={isSubmitting}>
        {t("account.settings.passwordSubmit")}
      </Button>
      {done && <NoBackendNotice title={t("form.validated")} body={t("form.noBackend.body")} />}
    </form>
  );
}

export function SettingsView() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();

  const clearLocal = async () => {
    const ok = await confirm({
      title: t("account.danger.confirmTitle"),
      body: t("account.danger.confirmBody"),
      confirmLabel: t("account.danger.confirmLabel"),
      danger: true,
    });
    if (!ok) return;
    for (const [key, empty] of LOCAL_KEYS) writeStore(key, empty);
    toast.success(t("account.danger.done"), t("account.danger.doneBody"));
  };

  return (
    <AccountShell title={t("account.settings.title")} lead={t("account.settings.lead")}>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card p-6 sm:p-8" aria-labelledby="set-profile">
          <h2 id="set-profile" className="font-display text-xl font-bold">{t("account.settings.profileSection")}</h2>
          <p className="mb-5 mt-1 text-sm text-muted">{t("account.settings.profileSub")}</p>
          <ProfileForm idPrefix="settings" />
        </section>

        <div className="space-y-6">
          <section className="card p-6 sm:p-8" aria-labelledby="set-pass">
            <h2 id="set-pass" className="font-display text-xl font-bold">{t("account.settings.passwordSection")}</h2>
            <p className="mb-5 mt-1 text-sm text-muted">{t("account.settings.passwordSub")}</p>
            <PasswordForm />
          </section>

          <Link href="/settings/preferences" className="card group flex items-center gap-4 p-5 hover:border-accent">
            <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
              <SlidersHorizontal className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold">{t("account.settings.prefsLink")}</span>
              <span className="block text-sm text-muted">{t("account.settings.prefsLinkBody")}</span>
            </span>
            <ArrowRight className="size-5 rtl-flip transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <section className="rounded-3xl border border-coral/50 bg-coral/5 p-6 sm:p-8 xl:col-span-2" aria-labelledby="set-danger">
          <h2 id="set-danger" className="font-display text-xl font-bold text-coral">{t("account.danger.title")}</h2>
          <p className="mb-5 mt-2 max-w-3xl text-muted">{t("account.danger.body")}</p>
          <Button variant="outline" className="!border-coral !text-coral hover:!bg-coral/10" icon={<Trash2 className="size-4" aria-hidden />} onClick={clearLocal}>
            {t("account.danger.button")}
          </Button>
        </section>
      </div>
    </AccountShell>
  );
}
