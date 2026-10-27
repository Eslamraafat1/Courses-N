import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getTestimonials } from "@/lib/api";
import { Reveal } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoriesView } from "@/components/pages/StoriesView";

export async function generateMetadata({ params }: PageProps<"/[lang]/success-stories">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/success-stories", title: t("nav2.stories"), description: t("stories.metaDesc") });
}

export default async function SuccessStoriesPage({ params }: PageProps<"/[lang]/success-stories">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const stories = await getTestimonials();

  return (
    <>
      <PageHeader eyebrow={t("stories.eyebrow")} title={t("stories.title")} lead={t("stories.lead")} crumbs={[{ label: t("nav2.stories") }]} />
      <div className="container-x pt-6">
        <p role="note" className="rounded-2xl border border-accent/30 bg-accent/8 px-4 py-3 text-sm">{t("stories.demo")}</p>
      </div>
      <section className="container-x py-12 lg:py-20" aria-label={t("stories.eyebrow")}>
        <StoriesView stories={stories} />
      </section>
      <section className="container-x pb-16 text-center lg:pb-28">
        <Reveal>
          <h2 className="hd-2">{t("stories.cta.title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted">{t("stories.cta.body")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/paths" size="lg" magnetic>{t("stories.cta.paths")}</Button>
            <Button href="/courses" size="lg" variant="outline">{t("stories.cta.courses")}</Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
