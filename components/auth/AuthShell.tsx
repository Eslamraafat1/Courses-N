"use client";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Info, Play, Sparkles } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/** Decorative animated panel (desktop only). Purely visual: hidden from assistive tech. */
function VisualPanel() {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const float = (d: number, y: number) =>
    reduce ? {} : { animate: { y: [0, y, 0] }, transition: { duration: d, repeat: Infinity, ease: "easeInOut" as const } };
  const points = [t("auth.panel.p1"), t("auth.panel.p2"), t("auth.panel.p3")];
  return (
    <aside className="grain relative hidden overflow-hidden bg-ink text-bg lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div {...float(9, -26)} className="absolute -top-24 start-[-6rem] size-[26rem] rounded-full bg-accent/60 blur-[90px]" />
        <motion.div {...float(11, 30)} className="absolute bottom-[-8rem] end-[-5rem] size-[24rem] rounded-full bg-volt/35 blur-[100px]" />
        <motion.div {...float(7, -18)} className="absolute top-1/3 end-1/4 size-40 rounded-full bg-coral/40 blur-[70px]" />
        <svg className="absolute inset-0 size-full opacity-[0.16]" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          {[60, 120, 180, 240, 300].map((r, i) => (
            <motion.circle
              key={r}
              cx="200"
              cy="300"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 10"
              animate={reduce ? undefined : { rotate: i % 2 ? 360 : -360 }}
              transition={{ duration: 80 + i * 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 300px" }}
            />
          ))}
        </svg>
      </div>

      <p className="eyebrow relative !text-volt">{t("auth.panel.eyebrow")}</p>

      <div className="relative">
        <motion.div
          aria-hidden
          {...float(6, -10)}
          className="mb-8 grid size-20 place-items-center rounded-full bg-volt text-volt-ink shadow-[0_20px_60px_-10px_var(--volt)]"
        >
          <Play className="size-8 translate-x-0.5" fill="currentColor" />
        </motion.div>
        <h2 className="font-display text-4xl font-bold leading-[1.1] xl:text-5xl">{t("auth.panel.title")}</h2>
        <ul className="mt-8 space-y-3">
          {points.map((p, i) => (
            <motion.li
              key={p}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex items-center gap-3 text-bg/85"
            >
              <Sparkles className="size-4 shrink-0 text-volt" aria-hidden />
              {p}
            </motion.li>
          ))}
        </ul>
      </div>

      <p className="relative flex items-start gap-2 text-sm text-bg/70">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t("auth.panel.demo")}
      </p>
    </aside>
  );
}

/** Split-screen frame shared by every auth page. */
export function AuthShell({ title, sub, children, footer }: { title: string; sub: string; children: ReactNode; footer?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[calc(100svh-var(--nav-h))] lg:grid-cols-[1fr_1.05fr]">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-md"
        >
          <h1 className="hd-1 !text-4xl sm:!text-5xl">{title}</h1>
          <p className="mt-3 text-muted">{sub}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}

          <div className="mt-8 border-t border-line pt-6">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted rtl:tracking-normal">{t("auth.or")}</p>
            <Link
              href="/dashboard"
              className="group flex min-h-12 items-center justify-center gap-2 rounded-full border border-dashed border-line px-5 text-sm font-semibold hover:border-accent hover:text-accent"
            >
              {t("auth.demo.link")}
              <ArrowRight className="size-4 rtl-flip transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <p className="mt-2 text-center text-xs text-muted">{t("auth.demo.hint")}</p>
          </div>
        </motion.div>
      </div>
      <VisualPanel />
    </div>
  );
}

/** Password input with a real show/hide toggle. */
export const PasswordField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }>(
  function PasswordField({ label, error, hint, className, ...rest }, ref) {
    const { t } = useI18n();
    const [show, setShow] = useState(false);
    const id = useId();
    return (
      <div className="relative">
        <Input ref={ref} id={id} type={show ? "text" : "password"} label={label} error={error} hint={hint} className={cn("pe-12", className)} {...rest} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? t("auth.hide") : t("auth.show")}
          aria-pressed={show}
          aria-controls={id}
          className={cn("absolute end-1.5 grid size-10 place-items-center rounded-full text-muted hover:bg-bg2 hover:text-ink", "top-[1.85rem]")}
        >
          {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
    );
  },
);
