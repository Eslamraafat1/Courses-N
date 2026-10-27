import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AtSign, ArrowUpRight, Clock, HelpCircle, Mail, Play, Rss, Share2, Timer, Accessibility, MessageCircleQuestion } from "lucide-react";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { FloatingShapes } from "@/components/animations/Fx";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/components/ui/Link";
import { ContactForm } from "@/components/pages/ContactForm";
import { ChannelCards, ContactVisual } from "@/components/pages/ContactParts";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/contact", title: t("nav.contact"), description: t("contact.metaDesc") });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);

  const channels = [
    { icon: <Mail className="size-5" aria-hidden />, label: t("contact2.channel.email"), value: t("contact2.channel.emailValue"), copy: true },
    { icon: <Clock className="size-5" aria-hidden />, label: t("contact2.channel.hours"), value: t("contact2.channel.hoursValue") },
    { icon: <Timer className="size-5" aria-hidden />, label: t("contact2.channel.response"), value: t("contact2.channel.responseValue") },
  ];
  const help = [
    { href: "/help", icon: HelpCircle, title: t("contact2.help.center"), body: t("contact2.help.centerBody") },
    { href: "/faq", icon: MessageCircleQuestion, title: t("contact2.help.faq"), body: t("contact2.help.faqBody") },
    { href: "/accessibility", icon: Accessibility, title: t("contact2.help.a11y"), body: t("contact2.help.a11yBody") },
  ];
  const social = [
    { label: "X", icon: AtSign },
    { label: "YouTube", icon: Play },
    { label: "Share", icon: Share2 },
    { label: "RSS", icon: Rss },
  ];

  return (
    <>
      <header className="relative overflow-x-clip border-b border-line bg-gradient-to-b from-bg2/60 to-transparent pb-10 pt-8 sm:pb-14">
        <FloatingShapes />
        <div className="container-x grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ label: t("nav.contact") }]} />
            <p className="eyebrow mb-3">{t("contact.eyebrow")}</p>
            <SplitText as="h1" text={t("contact.title")} className="hd-1" />
            <Reveal delay={0.15}>
              <p className="mt-4 max-w-xl text-lg text-muted sm:text-xl">{t("contact.lead")}</p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm">
                <span aria-hidden className="size-2 rounded-full bg-volt" />
                {t("contact2.hero.badge")}
              </p>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-5" delay={0.2}>
            <ContactVisual />
            <p className="sr-only">{t("contact2.visual.label")}</p>
          </Reveal>
        </div>
      </header>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <Reveal className="lg:col-span-7">
          <div className="card p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("contact.form.title")}</h2>
            <p className="mt-2 text-muted">{t("contact2.form.lead")}</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </Reveal>

        <aside className="space-y-8 lg:col-span-5" aria-label={t("nav.contact")}>
          <ChannelCards channels={channels} sample={t("contact2.channel.sample")} />
          <p className="px-1 text-sm text-muted">{t("contact.info.note")}</p>

          <Reveal>
            <section aria-labelledby="qh" className="rounded-[2rem] bg-ink p-6 text-bg sm:p-8">
              <h2 id="qh" className="font-display text-xl font-bold">{t("contact2.help.title")}</h2>
              <p className="mt-1 text-bg/70">{t("contact2.help.body")}</p>
              <ul className="mt-5 space-y-2">
                {help.map((h) => (
                  <li key={h.href}>
                    <Link href={h.href} className="group flex min-h-14 items-center gap-3 rounded-2xl border border-bg/15 px-4 py-2 transition hover:border-volt hover:bg-bg/5">
                      <h.icon className="size-5 shrink-0 text-volt" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{h.title}</span>
                        <span className="block text-sm text-bg/60">{h.body}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:text-volt rtl-flip" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="sh">
              <h2 id="sh" className="text-sm font-semibold text-muted">{t("contact2.social.title")}</h2>
              <ul className="mt-3 flex gap-2">
                {social.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <a href="https://example.test" target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border border-line transition hover:border-volt hover:bg-volt hover:text-volt-ink">
                      <Icon className="size-5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">{t("contact2.social.note")}</p>
            </section>
          </Reveal>
        </aside>
      </div>
    </>
  );
}
