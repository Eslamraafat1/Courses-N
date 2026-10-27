import { AtSign, Play, Rss, Share2 } from "lucide-react";
import type { Category, Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { Link } from "@/components/ui/Link";
import { Logo } from "@/components/navigation/Navbar";

/** Server component — fully static per language. Social links are placeholders (example.com) in this demo. */
export function Footer({ lang, categories }: { lang: Lang; categories: Category[] }) {
  const t = makeT(lang);
  const year = 2026;
  const cols = [
    {
      title: t("footer.platform"),
      links: [
        { href: "/courses", label: t("nav.courses") },
        { href: "/paths", label: t("nav.paths") },
        { href: "/instructors", label: t("nav.instructors") },
        { href: "/pricing", label: t("nav.pricing") },
        { href: "/about", label: t("nav.about") },
        { href: "/become-instructor", label: t("nav2.teach") },
      ],
    },
    {
      title: t("footer.categories"),
      links: categories.slice(0, 6).map((c) => ({ href: `/categories/${c.slug}`, label: c.name[lang] })),
    },
    {
      title: t("footer.resources"),
      links: [
        { href: "/blog", label: t("nav.blog") },
        { href: "/courses/featured", label: t("nav.featured") },
        { href: "/courses/trending", label: t("nav.trending") },
        { href: "/courses/new", label: t("nav.new") },
        { href: "/success-stories", label: t("nav2.stories") },
        { href: "/faq", label: t("nav.faq") },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { href: "/help", label: t("nav.help") },
        { href: "/contact", label: t("nav.contact") },
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/login", label: t("nav.login") },
        { href: "/register", label: t("nav.register") },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-bg">
      <div className="container-x relative z-10 pb-10 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo className="text-bg [&_span]:text-bg [&_span_span]:text-bg/60" />
            <p className="mt-5 max-w-sm text-bg/70">{t("footer.blurb")}</p>
            <ul aria-label={t("footer.social")} className="mt-6 flex gap-2">
              {[
                { label: "X", icon: AtSign },
                { label: "YouTube", icon: Play },
                { label: "Share", icon: Share2 },
                { label: "RSS", icon: Rss },
              ].map(({ label, icon: Icon }) => (
                <li key={label}>
                  <a href="https://example.com" target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border border-bg/20 transition hover:border-volt hover:bg-volt hover:text-volt-ink">
                    <Icon className="size-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-bg/50 rtl:tracking-normal">{c.title}</h2>
                <ul className="space-y-1">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-flex min-h-9 items-center text-bg/85 transition hover:text-volt">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p aria-hidden className="font-display mt-16 select-none text-center text-[clamp(3rem,15vw,13rem)] font-extrabold uppercase leading-[0.85] tracking-tighter text-bg/[0.07]">
          Nexora
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-bg/15 pt-6 text-sm text-bg/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li><Link href="/privacy" className="inline-flex min-h-9 items-center hover:text-volt">{t("footer.privacy")}</Link></li>
            <li><Link href="/terms" className="inline-flex min-h-9 items-center hover:text-volt">{t("footer.terms")}</Link></li>
            <li><Link href="/accessibility" className="inline-flex min-h-9 items-center hover:text-volt">{t("nav2.accessibility")}</Link></li>
            <li className="inline-flex min-h-9 items-center">{t("footer.madeWith")}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
