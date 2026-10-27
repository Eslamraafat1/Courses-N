"use client";
import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  meta?: ReactNode;
}

/** Disclosure pattern: real <button aria-expanded>, region labelled by its header, keyboard-operable. */
export function Accordion({ items, multiple = false, defaultOpen = [], className, variant = "card" }: { items: AccordionItem[]; multiple?: boolean; defaultOpen?: string[]; className?: string; variant?: "card" | "plain" }) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const uid = useId();
  const toggle = (id: string) =>
    setOpen((p) => (p.includes(id) ? p.filter((x) => x !== id) : multiple ? [...p, id] : [id]));

  return (
    <div className={cn(variant === "card" ? "space-y-3" : "divide-y divide-line", className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={cn(variant === "card" && "card overflow-hidden")}>
            <h3>
              <button
                type="button"
                id={`${uid}-h-${it.id}`}
                aria-expanded={isOpen}
                aria-controls={`${uid}-p-${it.id}`}
                onClick={() => toggle(it.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-start font-semibold"
              >
                <span className="min-w-0 flex-1">{it.title}</span>
                {it.meta && <span className="shrink-0 text-sm font-normal text-muted">{it.meta}</span>}
                <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform duration-300", isOpen && "rotate-180")} aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${uid}-p-${it.id}`}
                  role="region"
                  aria-labelledby={`${uid}-h-${it.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-muted">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
