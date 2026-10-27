"use client";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

/** WAI-ARIA tabs with arrow-key / Home / End navigation and an animated indicator. */
export function Tabs({ items, label, className, initial }: { items: TabItem[]; label: string; className?: string; initial?: string }) {
  const [active, setActive] = useState(initial ?? items[0]?.id);
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent) => {
    const i = items.findIndex((x) => x.id === active);
    const dirRtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let next = i;
    if (e.key === (dirRtl ? "ArrowLeft" : "ArrowRight")) next = (i + 1) % items.length;
    else if (e.key === (dirRtl ? "ArrowRight" : "ArrowLeft")) next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    const id = items[next].id;
    setActive(id);
    refs.current[id]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
        {items.map((it) => {
          const selected = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => {
                refs.current[it.id] = el;
              }}
              role="tab"
              id={`${uid}-tab-${it.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${it.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(it.id)}
              className={cn(
                "relative min-h-11 whitespace-nowrap px-4 text-sm font-semibold transition-colors",
                selected ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {it.label}
              {selected && <motion.span layoutId={`${uid}-ind`} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
      {items.map((it) => (
        <div
          key={it.id}
          role="tabpanel"
          id={`${uid}-panel-${it.id}`}
          aria-labelledby={`${uid}-tab-${it.id}`}
          hidden={it.id !== active}
          tabIndex={0}
          className="pt-6"
        >
          {it.id === active && it.panel}
        </div>
      ))}
    </div>
  );
}
