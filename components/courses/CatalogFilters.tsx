"use client";
import { useId, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  DURATIONS, LEVELS, RATING_STEPS, type CatalogCategory, type CatalogInstructor, type CatalogState, type PriceMode,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export interface FacetCounts {
  category: Record<string, number>;
  instructor: Record<string, number>;
  level: Record<string, number>;
  duration: Record<string, number>;
}

interface Props {
  state: CatalogState;
  onChange: (patch: Partial<CatalogState>) => void;
  categories: CatalogCategory[];
  instructors: CatalogInstructor[];
  counts: FacetCounts;
  priceBound: number;
  /** hides the category group (category pages) */
  lockedCategory?: boolean;
  className?: string;
}

function toggle<T>(list: readonly T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-3 p-0 font-display text-sm font-bold uppercase tracking-wider rtl:tracking-normal">{legend}</legend>
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}

function Check({ type = "checkbox", name, checked, onChange, label, count, swatch }: {
  type?: "checkbox" | "radio";
  name?: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  swatch?: string;
}) {
  const { n } = useI18n();
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm hover:bg-bg2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-[18px] shrink-0 accent-accent" />
      {swatch && <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: swatch }} />}
      <span className="min-w-0 flex-1">{label}</span>
      {count !== undefined && <span className="ltr-run text-xs text-muted">{n(count)}</span>}
    </label>
  );
}

/** The whole filter form. Used live in the desktop sidebar and on a draft copy inside the mobile bottom sheet. */
export function CatalogFilters({ state, onChange, categories, instructors, counts, priceBound, lockedCategory, className }: Props) {
  const { t, l, n } = useI18n();
  const uid = useId();
  const priceName = `${uid}-price`;
  const ratingName = `${uid}-rating`;
  const maxValue = state.maxPrice ?? priceBound;
  const priceModes: PriceMode[] = ["all", "free", "paid"];

  return (
    <div className={cn("flex flex-col gap-7", className)}>
      {!lockedCategory && categories.length > 1 && (
        <Group legend={t("catalog.filters.category")}>
          {categories.map((c) => (
            <Check
              key={c.slug}
              checked={state.categories.includes(c.slug)}
              onChange={() => onChange({ categories: toggle(state.categories, c.slug) })}
              label={l(c.name)}
              count={counts.category[c.slug] ?? 0}
              swatch={c.color}
            />
          ))}
        </Group>
      )}

      <Group legend={t("catalog.filters.level")}>
        {LEVELS.map((lv) => (
          <Check key={lv} checked={state.levels.includes(lv)} onChange={() => onChange({ levels: toggle(state.levels, lv) })} label={t(`level.${lv}`)} count={counts.level[lv] ?? 0} />
        ))}
      </Group>

      <Group legend={t("catalog.filters.duration")}>
        {DURATIONS.map((d) => (
          <Check key={d} checked={state.durations.includes(d)} onChange={() => onChange({ durations: toggle(state.durations, d) })} label={t(`catalog.duration.${d}`)} count={counts.duration[d] ?? 0} />
        ))}
      </Group>

      <Group legend={t("catalog.filters.price")}>
        {priceModes.map((m) => (
          <Check key={m} type="radio" name={priceName} checked={state.price === m} onChange={() => onChange({ price: m })} label={t(`catalog.price.${m}`)} />
        ))}
        <div className="px-2 pt-2">
          <label htmlFor={`${uid}-max`} className="mb-2 block text-sm text-muted">
            <span className="ltr-run">{state.maxPrice === null ? t("catalog.filters.maxPriceAny") : t("catalog.filters.maxPrice", { n: `$${n(maxValue)}` })}</span>
          </label>
          <input
            id={`${uid}-max`}
            type="range"
            min={0}
            max={priceBound}
            step={5}
            value={maxValue}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange({ maxPrice: v >= priceBound ? null : v });
            }}
            className="h-11 w-full cursor-pointer accent-accent"
          />
        </div>
      </Group>

      <Group legend={t("catalog.filters.rating")}>
        {RATING_STEPS.map((r) => (
          <Check key={r} type="radio" name={ratingName} checked={state.minRating === r} onChange={() => onChange({ minRating: r })} label={r === 0 ? t("catalog.rating.any") : t("catalog.rating.min", { n: r.toFixed(1) })} />
        ))}
      </Group>

      {instructors.length > 1 && (
        <Group legend={t("catalog.filters.instructor")}>
          {instructors.map((i) => (
            <Check key={i.slug} checked={state.instructors.includes(i.slug)} onChange={() => onChange({ instructors: toggle(state.instructors, i.slug) })} label={l(i.name)} count={counts.instructor[i.slug] ?? 0} />
          ))}
        </Group>
      )}
    </div>
  );
}
