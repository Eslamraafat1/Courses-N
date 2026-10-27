"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice } from "@/components/ui/Field";
import { Link } from "@/components/ui/Link";
import { AuthShell, PasswordField } from "./AuthShell";

type Kind = "login" | "register" | "forgot" | "reset";

/** Simulates the brief "checking" phase of a real request; nothing is sent anywhere. */
const settle = () => new Promise<void>((r) => setTimeout(r, 450));

function Result({ kind }: { kind: Kind }) {
  const { t } = useI18n();
  return <NoBackendNotice title={t(`auth.result.${kind}`)} body={t("form.noBackend.body")} />;
}

function Checkbox({ id, label, error, ...rest }: { id: string; label: React.ReactNode; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input id={id} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} className="size-5 shrink-0 accent-[var(--accent)]" {...rest} />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-coral">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ login ------------------------------ */
export function LoginForm() {
  const { t } = useI18n();
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("form.required")).email(t("form.invalidEmail")),
        password: z.string().min(1, t("form.required")),
        remember: z.boolean(),
      }),
    [t],
  );
  type V = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const f = useForm<V>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: false } });
  const { errors, isSubmitting } = f.formState;

  return (
    <AuthShell
      title={t("auth.login.title")}
      sub={t("auth.login.sub")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
            {t("nav.register")}
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={f.handleSubmit(async () => {
          setDone(false);
          await settle();
          setDone(true);
        })}
      >
        <Input label={t("form.email")} type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...f.register("email")} />
        <PasswordField label={t("form.password")} autoComplete="current-password" error={errors.password?.message} {...f.register("password")} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox id="login-remember" label={t("auth.remember")} {...f.register("remember")} />
          <Link href="/forgot-password" className="text-sm font-semibold hover:text-accent">
            {t("auth.forgotLink")}
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t("auth.validating") : t("auth.login.submit")}
        </Button>
        {done && <Result kind="login" />}
      </form>
    </AuthShell>
  );
}

/* ----------------------------- register ----------------------------- */
export function RegisterForm() {
  const { t } = useI18n();
  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(2, t("form.nameMin")),
          email: z.string().min(1, t("form.required")).email(t("form.invalidEmail")),
          password: z.string().min(8, t("form.passwordMin")),
          confirm: z.string().min(1, t("form.required")),
          terms: z.boolean().refine((v) => v, t("auth.agreeRequired")),
        })
        .refine((d) => d.password === d.confirm, { path: ["confirm"], message: t("form.passwordMatch") }),
    [t],
  );
  type V = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const f = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", confirm: "", terms: false } });
  const { errors, isSubmitting } = f.formState;

  return (
    <AuthShell
      title={t("auth.register.title")}
      sub={t("auth.register.sub")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
            {t("nav.login")}
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={f.handleSubmit(async () => {
          setDone(false);
          await settle();
          setDone(true);
        })}
      >
        <Input label={t("form.name")} autoComplete="name" error={errors.name?.message} {...f.register("name")} />
        <Input label={t("form.email")} type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...f.register("email")} />
        <PasswordField label={t("form.password")} autoComplete="new-password" error={errors.password?.message} {...f.register("password")} />
        <PasswordField label={t("form.confirmPassword")} autoComplete="new-password" error={errors.confirm?.message} {...f.register("confirm")} />
        <Checkbox
          id="register-terms"
          error={errors.terms?.message}
          label={
            <>
              {t("auth.agree")} (
              <Link href="/terms" className="underline underline-offset-2 hover:text-accent">{t("footer.terms")}</Link>
              {" · "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-accent">{t("footer.privacy")}</Link>)
            </>
          }
          {...f.register("terms")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t("auth.validating") : t("auth.register.submit")}
        </Button>
        {done && <Result kind="register" />}
      </form>
    </AuthShell>
  );
}

/* ------------------------------ forgot ------------------------------ */
export function ForgotForm() {
  const { t } = useI18n();
  const schema = useMemo(() => z.object({ email: z.string().min(1, t("form.required")).email(t("form.invalidEmail")) }), [t]);
  type V = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const f = useForm<V>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const { errors, isSubmitting } = f.formState;

  return (
    <AuthShell
      title={t("auth.forgot.title")}
      sub={t("auth.forgot.sub")}
      footer={
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={f.handleSubmit(async () => {
          setDone(false);
          await settle();
          setDone(true);
        })}
      >
        <Input label={t("form.email")} type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...f.register("email")} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t("auth.validating") : t("auth.forgot.submit")}
        </Button>
        {done && <Result kind="forgot" />}
      </form>
    </AuthShell>
  );
}

/* ------------------------------ reset ------------------------------- */
export function ResetForm() {
  const { t } = useI18n();
  const schema = useMemo(
    () =>
      z
        .object({ password: z.string().min(8, t("form.passwordMin")), confirm: z.string().min(1, t("form.required")) })
        .refine((d) => d.password === d.confirm, { path: ["confirm"], message: t("form.passwordMatch") }),
    [t],
  );
  type V = z.infer<typeof schema>;
  const [done, setDone] = useState(false);
  const f = useForm<V>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });
  const { errors, isSubmitting } = f.formState;

  return (
    <AuthShell
      title={t("auth.reset.title")}
      sub={t("auth.reset.sub")}
      footer={
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={f.handleSubmit(async () => {
          setDone(false);
          await settle();
          setDone(true);
        })}
      >
        <PasswordField label={t("auth.newPassword")} autoComplete="new-password" error={errors.password?.message} {...f.register("password")} />
        <PasswordField label={t("form.confirmPassword")} autoComplete="new-password" error={errors.confirm?.message} {...f.register("confirm")} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? t("auth.validating") : t("auth.reset.submit")}
        </Button>
        {done && <Result kind="reset" />}
      </form>
    </AuthShell>
  );
}
