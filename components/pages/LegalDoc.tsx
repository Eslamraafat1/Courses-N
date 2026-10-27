import { TriangleAlert } from "lucide-react";
import type { Lang } from "@/types";
import { formatDate } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import type { LegalSection } from "@/data/legal";
import { LEGAL_UPDATED } from "@/data/legal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/components/ui/Link";

/** Shared layout for the sample legal documents: warning banner, sticky TOC with anchors, numbered sections. */
export function LegalDoc({ lang, kind, sections }: { lang: Lang; kind: "privacy" | "terms"; sections: LegalSection[] }) {
  const t = makeT(lang);
  const title = t(`legal.${kind}.title`);
  const other = kind === "privacy" ? "terms" : "privacy";
  return (
    <>
      <PageHeader eyebrow={t("legal.eyebrow")} title={title} lead={t("legal.updated", { date: formatDate(LEGAL_UPDATED, lang) })} crumbs={[{ label: title }]} />
      <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-12">
          <div role="note" className="flex items-start gap-3 rounded-2xl border border-coral/40 bg-coral/5 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
            <div>
              <p className="font-semibold">{t("legal.templateTitle")}</p>
              <p className="text-sm text-muted">{t("legal.templateBody")}</p>
            </div>
          </div>
        </div>
        <nav aria-label={t("legal.toc")} className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow mb-3">{t("legal.toc")}</p>
            <ol className="space-y-1 border-s border-line">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ms-px block border-s-2 border-transparent py-2 ps-4 text-sm text-muted hover:border-accent hover:text-ink">
                    <span className="ltr-run">{i + 1}.</span> {s.title[lang]}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm">
              <span className="text-muted">{t("legal.related")}: </span>
              <Link href={`/${other}`} className="font-semibold text-accent underline underline-offset-4">{t(`legal.${other}.title`)}</Link>
            </p>
          </div>
        </nav>
        <div className="space-y-12 lg:col-span-9">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
              <h2 id={`${s.id}-h`} className="font-display text-2xl font-bold">
                <span className="ltr-run text-muted">{i + 1}.</span> {s.title[lang]}
              </h2>
              <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-muted">
                {s.body.map((p, pi) => (
                  <p key={pi}>{p[lang]}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
