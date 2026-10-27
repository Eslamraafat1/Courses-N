import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getPartners } from "@/lib/api";
import { Reveal } from "@/components/animations/Motion";
import { FloatingShapes } from "@/components/animations/Fx";

// Typographic wordmarks: every partner gets its own voice (weight / case / italic / tracking) instead of a logo image.
const voices = [
  "font-black tracking-tight",
  "font-light uppercase tracking-[0.28em]",
  "font-bold italic",
  "font-extrabold lowercase tracking-tighter",
  "font-semibold uppercase tracking-widest",
  "font-medium italic tracking-wide",
  "font-black uppercase tracking-tight",
  "font-light italic",
  "font-bold tracking-[0.14em] uppercase",
  "font-extrabold tracking-tight",
];
const marks = ["◆", "●", "▲", "■", "✦", "◐", "✚", "◉", "⬢", "✺"];

export async function TrustPartners({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const partners = await getPartners();

  const group = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-x-14 pe-14 sm:gap-x-20 sm:pe-20" aria-hidden={hidden || undefined}>
      {partners.map((p, i) => (
        <li key={p.id} className="flex items-center gap-3 text-muted transition duration-300 hover:-translate-y-0.5 hover:scale-105 hover:text-ink">
          <span aria-hidden className="text-accent">{marks[i % marks.length]}</span>
          <span dir="ltr" className={`font-display text-2xl sm:text-3xl ${voices[i % voices.length]}`}>{p.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="TrustPartners" data-section="TrustPartners" data-section-label={t("home.label.partners")} aria-labelledby="trust-title" className="relative isolate overflow-hidden border-y border-line bg-bg2/60 py-10 sm:py-14">
      <FloatingShapes className="opacity-60" />
      <div className="container-x">
        <Reveal y={12}>
          <p className="eyebrow mb-2 text-center">{t("home3.trust.kicker")}</p>
          <h2 id="trust-title" className="mb-8 text-center text-sm font-semibold text-muted">
            {t("home.trust.title")}
          </h2>
        </Reveal>
      </div>
      <div className="marquee overflow-hidden hover:[&_.marquee-track]:[animation-play-state:paused] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track">
          {group(false)}
          <div className="motion-reduce:hidden">{group(true)}</div>
        </div>
      </div>
      <p className="container-x mt-8 text-center text-xs text-muted">{t("demo.notice")}</p>
    </section>
  );
}
