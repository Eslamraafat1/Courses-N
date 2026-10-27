"use client";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, HardDrive, Mail } from "lucide-react";
import { demoStudent } from "@/data/content";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/hooks/useStore";
import type { CourseSummary } from "@/types";
import { AccountShell } from "./AccountShell";
import { useStudentCourses } from "./useStudentCourses";

export interface LocalProfile {
  name: string;
  email: string;
  bio: string;
}
export const PROFILE_KEY = "nx-profile";
/** Stable reference required by useStore. Sample values only — not a real person. */
export const DEFAULT_PROFILE: LocalProfile = { name: demoStudent.name.en, email: demoStudent.email, bio: "" };

export function useLocalProfile() {
  return useStore<LocalProfile>(PROFILE_KEY, DEFAULT_PROFILE);
}

/** Validates, then saves to localStorage on this device. Says so, instead of pretending it hit a server. */
export function ProfileForm({ idPrefix = "profile" }: { idPrefix?: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const [profile, setProfile] = useLocalProfile();
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("form.nameMin")),
        email: z.string().min(1, t("form.required")).email(t("form.invalidEmail")),
        bio: z.string().max(200, t("account.profile.bioMax")),
      }),
    [t],
  );
  type V = z.infer<typeof schema>;
  const f = useForm<V>({ resolver: zodResolver(schema), values: profile });
  const { errors, isSubmitting, isDirty } = f.formState;

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={f.handleSubmit(async (v) => {
        setProfile({ name: v.name.trim(), email: v.email, bio: v.bio });
        toast.success(t("account.profile.saved"), t("account.profile.savedBody"));
      })}
    >
      <Input id={`${idPrefix}-name`} label={t("form.name")} autoComplete="name" error={errors.name?.message} {...f.register("name")} />
      <Input id={`${idPrefix}-email`} label={t("form.email")} type="email" autoComplete="email" hint={t("account.profile.emailNote")} error={errors.email?.message} {...f.register("email")} />
      <Textarea id={`${idPrefix}-bio`} label={t("account.profile.bio")} rows={3} hint={t("account.profile.bioHint")} error={errors.bio?.message} {...f.register("bio")} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          {t("act.save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setProfile(DEFAULT_PROFILE);
            f.reset(DEFAULT_PROFILE);
          }}
        >
          {t("account.profile.reset")}
        </Button>
      </div>
      <p className="flex items-start gap-2 text-sm text-muted">
        <HardDrive className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t("account.profile.localNote")}
      </p>
    </form>
  );
}

export function ProfileView({ courses }: { courses: CourseSummary[] }) {
  const { t, l, n } = useI18n();
  const [profile] = useLocalProfile();
  const { active, finished } = useStudentCourses(courses);
  const initial = (profile.name.trim() || l(demoStudent.name)).slice(0, 1);

  const facts = [
    { label: t("dash.stat.streak"), value: n(demoStudent.streak) },
    { label: t("dash.stat.active"), value: n(active.length) },
    { label: t("dash.stat.done"), value: n(finished.length) },
  ];

  return (
    <AccountShell title={t("account.profile.title")} lead={t("account.profile.lead")}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section aria-label={t("account.profile.stats")} className="grain relative self-start overflow-hidden rounded-[2rem] bg-ink p-6 text-bg sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -end-12 -top-12 size-52 rounded-full bg-accent/50 blur-[70px]" />
          <div className="relative">
            <span aria-hidden className="grid size-20 place-items-center rounded-3xl bg-volt font-display text-4xl font-bold text-volt-ink">
              {initial}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold">{profile.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-bg/75">
              <Mail className="size-4" aria-hidden />
              <span className="break-all">{profile.email}</span>
            </p>
            {profile.bio && <p className="mt-4 text-bg/85">{profile.bio}</p>}
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-bg/10 px-3 py-1 text-xs font-semibold">
              <Flame className="size-3.5 text-coral" aria-hidden />
              {t("account.card.notSigned")}
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-bg/15 pt-5">
              {facts.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-2xl font-bold">{s.value}</dd>
                  <dt className="text-xs text-bg/70">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="card p-6 sm:p-8" aria-labelledby="profile-edit">
          <h2 id="profile-edit" className="mb-5 font-display text-xl font-bold">
            {t("account.profile.edit")}
          </h2>
          <ProfileForm />
        </section>
      </div>
    </AccountShell>
  );
}

