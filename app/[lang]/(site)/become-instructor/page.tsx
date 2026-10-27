import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarChart3, Clapperboard, Languages, Wrench } from "lucide-react";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/components/animations/Motion";
import { FloatingShapes, TiltCard } from "@/components/animations/Fx";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { SectionHeading } from "@/components/ui/Primitives";
import { EarningsExplainer, TeachForm } from "@/components/pages/TeachParts";

export async function generateMetadata({ params }: PageProps<"/[lang]/become-instructor">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/become-instructor", title: t("nav2.teach"), description: t("teach.metaDesc") });
}

export default async function BecomeInstructorPage({ params }: PageProps<"/[lang]/become-instructor">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);

  const benefits = [
    { icon: Clapperboard, title: t("teach.b1.title"), body: t("teach.b1.body") },
    { icon: Languages, title: t("teach.b2.title"), body: t("teach.b2.body") },
    { icon: Wrench, title: t("teach.b3.title"), body: t("teach.b3.body") },
    { icon: BarChart3, title: t("teach.b4.title"), body: t("teach.b4.body") },
  ];
  const steps = ([1, 2, 3, 4] as const).map((n) => ({ title: t(`teach.s${n}.title`), body: t(`teach.s${n}.body`) }));

  return (
    <>
      <header className="relative overflow-x-clip border-b border-line bg-gradient-to-b from-bg2/60 to-transparent pb-12 pt-8 sm:pb-20">
        <FloatingShapes />
        <div className="container-x">
          <Breadcrumbs items={[{ label: t("nav2.teach") }]} />
          <p className="eyebrow mb-3">{t("teach.eyebrow")}</p>
          <SplitText as="h1" text={t("teach.title")} className="hd-1 max-w-4xl" />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{t("teach.lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#apply" size="lg" magnetic>{t("teach.cta.apply")}</Button>
              <Button href="#how" size="lg" variant="outline">{t("teach.cta.how")}</Button>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container-x pt-8">
        <p role="note" className="rounded-2xl border border-accent/30 bg-accent/8 px-4 py-3 text-sm">{t("teach.demo")}</p>
      </div>

      <section className="container-x py-14 lg:py-24" aria-labelledby="ben-h">
        <SectionHeading id="ben-h" title={t("teach.benefits.title")} />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <StaggerItem key={b.title} className="min-w-0">
              <TiltCard className="h-full" max={6}>
                <div className="card flex h-full flex-col gap-4 p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-volt text-volt-ink"><b.icon className="size-6" aria-hidden /></span>
                  <h3 className="font-display text-xl font-bold">{b.title}</h3>
                  <p className="text-muted">{b.body}</p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="how" className="scroll-mt-24 border-y border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="how-h">
        <div className="container-x">
          <SectionHeading id="how-h" title={t("teach.steps.title")} />
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 0.08}>
                <div className="relative h-full rounded-3xl border border-line bg-surface p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-ink font-display font-bold text-bg">{i + 1}</span>
                  <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-14 lg:py-24" aria-labelledby="earn-h">
        <SectionHeading id="earn-h" title={t("teach.earn.title")} lead={t("teach.earn.lead")} />
        <div className="mt-10">
          <EarningsExplainer />
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 border-t border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="apply-h">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl">
            <div className="card p-6 sm:p-10">
              <h2 id="apply-h" className="font-display text-2xl font-bold sm:text-3xl">{t("teach.form.title")}</h2>
              <p className="mt-2 text-muted">{t("teach.form.lead")}</p>
              <div className="mt-8">
                <TeachForm />
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted">
              {t("teach.faq.title")}{" "}
              <Link href="/faq" className="font-semibold text-accent underline underline-offset-4">{t("nav.faq")}</Link>
              {" · "}
              <Link href="/contact" className="font-semibold text-accent underline underline-offset-4">{t("nav.contact")}</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
