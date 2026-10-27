import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Category, Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { nf } from "@/lib/i18n/config";
import { Link } from "@/components/ui/Link";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";

export interface CategoryStats {
  courses: number;
  hours: number;
}

/** Bento spans (12-col grid on lg) — deliberately uneven so the index never reads as a uniform grid. */
export const BENTO_SPANS = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-7",
  "lg:col-span-5",
] as const;
const SM_SPANS = ["sm:col-span-6", "sm:col-span-3", "sm:col-span-3"] as const;

export function bentoClass(i: number) {
  return cn(SM_SPANS[i % 3], BENTO_SPANS[i % BENTO_SPANS.length]);
}

/** Image card tinted with the category color. `big` cards get a larger title and the description. */
export function CategoryCard({ category: c, stats, lang, index = 0, big = false, className }: { category: Category; stats: CategoryStats; lang: Lang; index?: number; big?: boolean; className?: string }) {
  const t = makeT(lang);
  const f = nf(lang);
  const name = c.name[lang];
  return (
    <Link
      href={`/categories/${c.slug}`}
      aria-label={t("categories.explore", { name })}
      className={cn("group relative isolate flex min-h-60 flex-col justify-end overflow-hidden rounded-[2rem] text-white outline-offset-4", className)}
    >
      <Image
        src={c.image}
        alt=""
        fill
        priority={index < 2}
        sizes={big ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 40vw, (min-width:640px) 50vw, 100vw"}
        className="-z-20 object-cover transition duration-700 ease-out group-hover:scale-105"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <span aria-hidden className="absolute inset-0 -z-10 opacity-45 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-70" style={{ background: `linear-gradient(135deg, ${c.color}, transparent 70%)` }} />
      <span className="absolute start-5 top-5 grid size-12 place-items-center rounded-2xl backdrop-blur" style={{ background: `color-mix(in srgb, ${c.color} 70%, black)` }}>
        <DynamicIcon name={c.icon} className="size-6" />
      </span>
      <span className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-volt group-hover:text-volt-ink">
        <ArrowUpRight className="size-5 rtl-flip" aria-hidden />
      </span>
      <span className="flex flex-col gap-2 p-6 sm:p-7">
        <span className={cn("font-display font-bold leading-tight", big ? "text-3xl sm:text-4xl" : "text-2xl")}>{name}</span>
        {(big || index % 2 === 0) && <span className="line-clamp-2 max-w-md text-white/80">{c.description[lang]}</span>}
        <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-white/90">
          <span>{stats.courses === 1 ? t("categories.courses.one") : t("categories.courses", { n: f.format(stats.courses) })}</span>
          <span className="text-white/70">{t("categories.hoursTotal", { n: f.format(stats.hours) })}</span>
        </span>
      </span>
    </Link>
  );
}
