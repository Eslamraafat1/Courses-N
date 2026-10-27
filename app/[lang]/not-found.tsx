"use client";
import { Compass } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="container-x grid min-h-[70dvh] place-items-center py-20 text-center">
      <div>
        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-volt text-volt-ink animate__animated animate__pulse animate__infinite" style={{ animationDuration: "3s" }}>
          <Compass className="size-11" aria-hidden />
        </div>
        <p className="font-display text-[clamp(5rem,20vw,11rem)] font-extrabold leading-none text-ink/10">404</p>
        <h1 className="hd-2 -mt-6">{t("err.404.title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">{t("err.404.body")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">{t("act.goHome")}</Button>
          <Button href="/courses" variant="outline">{t("nav.explore")}</Button>
        </div>
        <nav aria-label={t("nav2.notFound.suggest")} className="mt-10">
          <p className="text-sm font-semibold text-muted">{t("nav2.notFound.suggest")}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {[
              { href: "/paths", label: t("nav.paths") },
              { href: "/search", label: t("nav2.notFound.search") },
              { href: "/help", label: t("nav.help") },
              { href: "/contact", label: t("nav.contact") },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold transition hover:border-ink hover:bg-surface">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
