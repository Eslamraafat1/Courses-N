import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Eye, Keyboard, Languages, LayoutList, Sparkles, TriangleAlert } from "lucide-react";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { Reveal } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { PageHeader } from "@/components/ui/PageHeader";

export async function generateMetadata({ params }: PageProps<"/[lang]/accessibility">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/accessibility", title: t("nav2.accessibility"), description: t("a11y.metaDesc") });
}

export default async function AccessibilityPage({ params }: PageProps<"/[lang]/accessibility">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);

  const sections = [
    { id: "kb", icon: Keyboard, title: t("a11y.kb.title"), body: t("a11y.kb.body"), items: [t("a11y.kb.1"), t("a11y.kb.2"), t("a11y.kb.3"), t("a11y.kb.4")] },
    { id: "rtl", icon: Languages, title: t("a11y.rtl.title"), body: t("a11y.rtl.body"), items: [t("a11y.rtl.1"), t("a11y.rtl.2"), t("a11y.rtl.3")] },
    { id: "motion", icon: Sparkles, title: t("a11y.motion.title"), body: t("a11y.motion.body"), items: [t("a11y.motion.1"), t("a11y.motion.2"), t("a11y.motion.3")] },
    { id: "color", icon: Eye, title: t("a11y.color.title"), body: t("a11y.color.body"), items: [t("a11y.color.1"), t("a11y.color.2"), t("a11y.color.3")] },
    { id: "struct", icon: LayoutList, title: t("a11y.struct.title"), body: t("a11y.struct.body"), items: [t("a11y.struct.1"), t("a11y.struct.2"), t("a11y.struct.3"), t("a11y.struct.4")] },
    { id: "limits", icon: TriangleAlert, title: t("a11y.limits.title"), body: t("a11y.limits.body"), items: [t("a11y.limits.1"), t("a11y.limits.2"), t("a11y.limits.3")], warn: true },
  ];
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date("2026-01-15T00:00:00Z"));

  return (
    <>
      <PageHeader eyebrow={t("a11y.eyebrow")} title={t("a11y.title")} lead={t("a11y.lead")} crumbs={[{ label: t("nav2.accessibility") }]} />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-12 lg:gap-14 lg:py-20">
        <nav aria-label={t("a11y.toc")} className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold text-muted">{t("a11y.toc")}</p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium hover:text-accent">
                    <s.icon className="size-4" aria-hidden />
                    {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#feedback" className="inline-flex min-h-10 items-center text-sm font-medium hover:text-accent">{t("a11y.feedback.title")}</a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="space-y-6 lg:col-span-9">
          <p className="rounded-2xl border border-accent/30 bg-accent/8 px-4 py-3 text-sm" role="note">
            <strong>{t("a11y.standard")}</strong>
            <span className="mt-1 block text-muted">{t("a11y.updated", { date })}</span>
          </p>
          {sections.map((s, i) => (
            <Reveal key={s.id} delay={Math.min(i, 3) * 0.04}>
              <section id={s.id} aria-labelledby={`${s.id}-h`} className="card scroll-mt-28 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-2xl ${s.warn ? "bg-coral text-white" : "bg-volt text-volt-ink"}`}>
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <h2 id={`${s.id}-h`} className="font-display text-2xl font-bold">{s.title}</h2>
                </div>
                <p className="mt-4 text-muted">{s.body}</p>
                <ul className="mt-4 space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}

          <section id="feedback" aria-labelledby="feedback-h" className="scroll-mt-28 rounded-[2rem] bg-ink p-7 text-bg sm:p-10">
            <h2 id="feedback-h" className="font-display text-2xl font-bold">{t("a11y.feedback.title")}</h2>
            <p className="mt-3 max-w-2xl text-bg/75">{t("a11y.feedback.body")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/contact" size="lg">{t("a11y.feedback.cta")}</Button>
              <Link href="/help" className="font-semibold underline underline-offset-4 hover:text-volt">{t("a11y.feedback.help")}</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
