"use client";
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { L } from "@/types";
import type { UniverseNode } from "@/components/three/UniverseScene";
import { useCapable } from "@/components/three/capability";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";

const UniverseScene = dynamic(() => import("@/components/three/UniverseScene"), { ssr: false });

export interface UniverseItem {
  id: string;
  kind: "category" | "path";
  label: L;
  color: string;
  href: string;
  icon?: string;
}

export function UniverseClient({ items }: { items: UniverseItem[] }) {
  const { t, l } = useI18n();
  const stage = useRef<HTMLDivElement>(null);
  const near = useInView(stage, { once: true, margin: "250px" }); // lazy-mount trigger
  const capable = useCapable(768, near);
  const visible = useInView(stage, { margin: "50px" }); // pause trigger
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const focus = pinned ?? active;
  const current = items.find((i) => i.id === focus);

  const nodes = useMemo<UniverseNode[]>(() => {
    const cats = items.filter((i) => i.kind === "category");
    const paths = items.filter((i) => i.kind === "path");
    return [
      ...cats.map((c, index) => ({ id: c.id, color: c.color, ring: 0 as const, index, count: cats.length })),
      ...paths.map((p, index) => ({ id: p.id, color: p.color, ring: 1 as const, index, count: paths.length })),
    ];
  }, [items]);

  const mount3d = capable && near;
  const groups: { kind: UniverseItem["kind"]; title: string }[] = [
    { kind: "category", title: t("home.universe.categories") },
    { kind: "path", title: t("home.universe.paths") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
      <div ref={stage} className="relative isolate aspect-square overflow-hidden rounded-[2rem] bg-[#07070f] text-white sm:aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]">
        {/* static fallback — also the first paint; the canvas fades in on top when the device is capable */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,#2a1b7a_0%,#07070f_62%)]" />
        <div aria-hidden className={cn("absolute inset-0 grid place-items-center", mount3d && "hidden")}>
          <div className="relative size-[min(88%,34rem)]">
            <span className="absolute inset-0 rounded-full border border-white/15" />
            <span className="absolute inset-[18%] rounded-full border border-white/20" />
            <span className="absolute inset-[40%] rounded-full bg-volt shadow-[0_0_60px_10px_rgba(198,240,50,0.45)]" />
            {items.map((it, i) => {
              const ring = it.kind === "category" ? 50 : 32;
              const peers = items.filter((x) => x.kind === it.kind);
              const idx = peers.indexOf(it);
              const a = (idx / peers.length) * Math.PI * 2 + (it.kind === "path" ? 0.6 : 0);
              return (
                <span
                  key={it.id}
                  className={cn("absolute size-3 rounded-full transition-transform duration-300", focus === it.id && "scale-[2.2]")}
                  style={{ background: it.color, left: `${50 + Math.cos(a) * ring}%`, top: `${50 + Math.sin(a) * ring}%`, boxShadow: `0 0 14px ${it.color}`, translate: "-50% -50%", animation: `fade-in .8s ${i * 60}ms both` }}
                />
              );
            })}
          </div>
        </div>

        {mount3d && (
          <div className="absolute inset-0 animate-[fade-in_1s_ease_both]" aria-hidden>
            <UniverseScene nodes={nodes} activeId={focus} visible={visible} onHover={setActive} onSelect={setPinned} />
          </div>
        )}

        {/* readout (real HTML, announced politely) */}
        <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6" aria-live="polite">
          <div className="max-w-sm rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-md">
            {current ? (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-volt rtl:tracking-normal">{current.kind === "category" ? t("home.universe.category") : t("home.universe.path")}</p>
                <p className="mt-1 font-display text-xl font-bold">{l(current.label)}</p>
                <Link href={current.href} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-volt hover:underline">
                  {t("act.open")}
                  <ArrowUpRight className="size-4 rtl-flip" aria-hidden />
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/80">{capable ? t("home.universe.hint") : t("home.universe.hintStatic")}</p>
            )}
          </div>
        </div>
      </div>

      {/* accessible list — the canvas is decorative */}
      <nav aria-label={t("home.universe.nav")} className="space-y-6">
        {groups.map((g) => (
          <div key={g.kind}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted rtl:tracking-normal">{g.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {items
                .filter((i) => i.kind === g.kind)
                .map((i) => (
                  <li key={i.id}>
                    <Link
                      href={i.href}
                      onMouseEnter={() => setActive(i.id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i.id)}
                      onBlur={() => setActive(null)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                        focus === i.id ? "border-transparent bg-ink text-bg" : "border-line bg-surface hover:border-ink",
                      )}
                    >
                      {i.icon ? <DynamicIcon name={i.icon} className="size-4" style={{ color: i.color }} /> : <span aria-hidden className="size-2.5 rounded-full" style={{ background: i.color }} />}
                      {l(i.label)}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {pinned && (
          <button type="button" onClick={() => setPinned(null)} className="min-h-11 text-sm font-semibold text-accent underline-offset-4 hover:underline">
            {t("home.universe.clear")}
          </button>
        )}
      </nav>
    </div>
  );
}
