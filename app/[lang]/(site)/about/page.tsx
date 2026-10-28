import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Compass, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getFaqs, getInstructors, getPartners, getStats } from "@/lib/api";
import { Counter, ParallaxImage, Reveal, Stagger, StaggerItem } from "@/components/animations/Motion";
import { WipeIn } from "@/components/animations/Fx";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { SectionHeading } from "@/components/ui/Primitives";
import { AboutHero, MethodSteps, MissionVision, ScrollTimeline, ValueCards } from "@/components/pages/AboutParts";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/about", title: t("nav.about"), description: t("about.metaDesc") });
}

const STORY_IMG = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=70";
const REAL = new Set(["courses", "instructors"]);

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [team, stats, partners, faqs] = await Promise.all([getInstructors(), getStats(), getPartners(), getFaqs()]);

  const values = [
    { icon: <Compass className="size-6" aria-hidden />, title: t("about.v1.title"), body: t("about.v1.body") },
    { icon: <Languages className="size-6" aria-hidden />, title: t("about.v2.title"), body: t("about.v2.body") },
    { icon: <ShieldCheck className="size-6" aria-hidden />, title: t("about.v3.title"), body: t("about.v3.body") },
    { icon: <Sparkles className="size-6" aria-hidden />, title: t("about.v4.title"), body: t("about.v4.body") },
  ];
  const timeline = ([1, 2, 3, 4] as const).map((n) => ({ year: t(`about.t${n}.year`), title: t(`about.t${n}.title`), body: t(`about.t${n}.body`) }));
  const method = ([1, 2, 3, 4] as const).map((n) => ({ title: t(`about2.m${n}.title`), body: t(`about2.m${n}.body`) }));

  return (
    <>
      <AboutHero
        crumbs={<Breadcrumbs items={[{ label: t("nav.about") }]} />}
        eyebrow={t("about.eyebrow")}
        title={t("about.title")}
        lead={t("about.lead")}
        kicker={t("about2.hero.kicker")}
        manifesto={t("about2.hero.manifesto")}
        scrollHint={t("about2.scroll")}
        marquee={[t("about2.marquee.1"), t("about2.marquee.2"), t("about2.marquee.3")]}
      />

      <div className="container-x pt-8">
        <p role="note" className="rounded-2xl border border-accent/30 bg-accent/8 px-4 py-3 text-sm">{t("about.demo")}</p>
      </div>

      <section className="container-x py-14 lg:py-24" aria-label={`${t("about2.mission.label")} / ${t("about2.vision.label")}`}>
        <MissionVision
          items={[
            { label: t("about2.mission.label"), title: t("about2.mission.title"), body: t("about2.mission.body") },
            { label: t("about2.vision.label"), title: t("about2.vision.title"), body: t("about2.vision.body") },
          ]}
        />
      </section>

      <section className="container-x grid items-center gap-10 pb-14 lg:grid-cols-12 lg:gap-16 lg:pb-24" aria-labelledby="story-h">
        <Reveal className="lg:col-span-6">
          <h2 id="story-h" className="hd-2">{t("about.story.title")}</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
            <p>{t("about.story.p1")}</p>
            <p>{t("about.story.p2")}</p>
            <p>{t("about.story.p3")}</p>
          </div>
        </Reveal>
        <WipeIn className="lg:col-span-6" from="start">
          <ParallaxImage src={STORY_IMG} alt="" sizes="(min-width:1024px) 45vw, 100vw" ratio="aspect-[4/3] sm:aspect-[16/11]" />
        </WipeIn>
      </section>

      <section className="border-y border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="values-h">
        <div className="container-x">
          <SectionHeading id="values-h" title={t("about.values.title")} lead={t("about2.values.lead")} />
          <div className="mt-10">
            <ValueCards items={values} />
          </div>
        </div>
      </section>

      <section className="container-x py-14 lg:py-24" aria-labelledby="nums-h">
        <SectionHeading id="nums-h" title={t("about2.stats.title")} lead={t("about2.stats.lead")} />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.slice(0, 4).map((s) => {
            const real = REAL.has(s.id);
            return (
              <StaggerItem key={s.id} className="min-w-0">
                <dl className="card flex h-full flex-col justify-between gap-6 p-6">
                  <dt className="text-sm font-semibold text-muted">{s.label[lang]}</dt>
                  <dd>
                    <Counter value={s.value} suffix={s.suffix} className="font-display text-5xl font-black leading-none" />
                    <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${real ? "bg-volt text-volt-ink" : "border border-dashed border-ink/40 text-muted"}`}>
                      {real ? t("home2.stats.real") : t("home2.stats.demo")}
                    </span>
                  </dd>
                </dl>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="border-y border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="method-h">
        <div className="container-x">
          <SectionHeading id="method-h" eyebrow={t("about2.method.eyebrow")} title={t("about2.method.title")} lead={t("about2.method.lead")} />
          <div className="mt-10">
            <MethodSteps steps={method} />
          </div>
        </div>
      </section>

      <section className="container-x py-14 lg:py-24" aria-labelledby="tl-h">
        <SectionHeading id="tl-h" title={t("about.timeline.title")} lead={t("about2.timeline.lead")} />
        <div className="mt-12">
          <ScrollTimeline items={timeline} label={t("about.timeline.title")} />
        </div>
      </section>

      <section className="border-y border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="team-h">
        <div className="container-x">
          <SectionHeading id="team-h" title={t("about.team.title")} lead={t("about.team.lead")} />
          <ul className="no-scrollbar mt-10 flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {team.map((m, i) => (
              <li key={m.id} className={`w-44 shrink-0 sm:w-auto ${i % 2 ? "sm:mt-8" : ""}`}>
                <Link href={`/instructors/${m.slug}`} className="group block">
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-3xl bg-bg2">
                    <Image src={m.avatar} alt="" fill sizes="(min-width:1024px) 15vw, 45vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </span>
                  <span className="mt-3 block font-display font-bold group-hover:underline">{m.name[lang]}</span>
                  <span className="block text-sm text-muted">{m.title[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x py-14 lg:py-20" aria-labelledby="partners-h">
        <h2 id="partners-h" className="text-center text-sm font-semibold text-muted">{t("about2.partners.title")}</h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-3">
          {partners.map((p) => (
            <li key={p.id} dir="ltr" className="rounded-full border border-line bg-surface px-5 py-2 font-display font-bold text-muted transition hover:border-ink hover:text-ink">
              {p.name}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-muted">{t("about2.partners.note")}</p>
      </section>

      <section className="border-y border-line bg-bg2/50 py-14 lg:py-24" aria-labelledby="faqt-h">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="faqt-h" className="hd-2">{t("about2.faq.title")}</h2>
            <p className="mt-3 text-lg text-muted">{t("about2.faq.body")}</p>
            <Button href="/faq" variant="outline" className="mt-6" iconEnd={<ArrowRight className="size-4 rtl-flip" aria-hidden />}>{t("about2.faq.cta")}</Button>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={faqs.slice(0, 4).map((f) => ({ id: f.id, title: f.q[lang], content: <p className="text-muted">{f.a[lang]}</p> }))} />
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center lg:py-28">
        <h2 className="hd-2">{t("about.cta.title")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">{t("about.cta.body")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/courses" size="lg" magnetic>{t("nav.courses")}</Button>
          <Button href="/paths" size="lg" variant="outline">{t("nav.paths")}</Button>
          <Button href="/become-instructor" size="lg" variant="outline">{t("about2.cta.teach")}</Button>
        </div>
        <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-semibold">
          <Link href="/success-stories" className="inline-flex min-h-11 items-center px-2 text-accent underline underline-offset-4">{t("about2.cta.stories")}</Link>
          <Link href="/contact" className="inline-flex min-h-11 items-center px-2 text-accent underline underline-offset-4">{t("about2.cta.contact")}</Link>
        </p>
      </section>
    </>
  );
}
