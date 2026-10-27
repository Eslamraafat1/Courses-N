"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { useGsap } from "@/hooks/useGsap";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget, scrollToTop } from "@/lib/scroll";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/**
 * Thin bar mapped 1:1 to real page scroll progress.
 * A single ScrollTrigger (start 0 → end "max") updates transform; no scroll listeners of our own.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { t } = useI18n();
  const bar = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGsap(
    () => {
      const el = bar.current;
      if (!el) return;
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          el.style.transform = `scaleX(${self.progress})`;
          host.current?.setAttribute("aria-valuenow", String(Math.round(self.progress * 100)));
        },
      });
      el.style.transform = `scaleX(${st.progress})`;
      return () => st.kill();
    },
    host,
    [pathname],
  );

  return (
    <div
      ref={host}
      role="progressbar"
      aria-label={t("scroll.progress")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className={cn("pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-transparent", className)}
    >
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-accent via-coral to-volt will-change-transform rtl:origin-right rtl:bg-gradient-to-l" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Appears after ~12% of the page has been scrolled; hides again at the top. */
export function ScrollToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGsap(
    () => {
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setShow(self.progress > 0.12 && self.scroll() > 400),
      });
      return () => st.kill();
    },
    host,
    [pathname],
  );

  return (
    <div ref={host} className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-40 sm:end-6">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t("act.scrollTop")}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className={cn(
          "group pointer-events-auto grid size-12 place-items-center rounded-full bg-ink text-bg shadow-2xl transition-all duration-300 hover:bg-accent hover:text-accent-ink",
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
      </button>
    </div>
  );
}

/** Dots that highlight the section currently in view. Sections opt-in with data-section + data-section-label. */
export function SectionIndicator() {
  const { t } = useI18n();
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState("");
  const host = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const raf = requestAnimationFrame(() => setItems(els.map((e) => ({ id: e.id || e.dataset.section!, label: e.dataset.sectionLabel ?? e.dataset.section! }))));
    const triggers = els.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(el.id || el.dataset.section!),
      }),
    );
    return () => {
      cancelAnimationFrame(raf);
      triggers.forEach((s) => s.kill());
    };
  }, []);

  if (items.length < 2) return null;
  return (
    <nav ref={host} aria-label={t("scroll.sections")} className="fixed end-3 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <ul className="flex flex-col gap-1">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => scrollToTarget(`#${it.id}`, -72)}
              aria-label={it.label}
              aria-current={active === it.id ? "true" : undefined}
              className="group relative grid size-6 place-items-center"
            >
              <span className={cn("block rounded-full transition-all", active === it.id ? "size-3 bg-accent" : "size-1.5 bg-ink/30 group-hover:bg-ink/60")} />
              <span className="pointer-events-none absolute end-full me-2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-bg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {it.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
