import type { ReactNode } from "react";
import { SplitText } from "@/components/animations/Motion";
import { Reveal } from "@/components/animations/Motion";
import { cn } from "@/lib/utils";

/**
 * Shared header for the home sections: eyebrow + scroll-revealed (SplitText) heading + lead + optional action.
 * `id` goes on the wrapper so the section's aria-labelledby resolves to the heading text (SplitText sets aria-label).
 */
export function SectionHead({ id, eyebrow, title, lead, action, className }: { id: string; eyebrow: string; title: string; lead?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-6", className)}>
      <div id={id} className="max-w-3xl">
        <Reveal y={14}>
          <p className="eyebrow mb-4 inline-flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {eyebrow}
          </p>
        </Reveal>
        <SplitText text={title} as="h2" className="hd-1" />
        {lead && (
          <Reveal delay={0.1} y={18}>
            <p className="mt-5 max-w-2xl text-lg text-muted">{lead}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.15}>{action}</Reveal>}
    </div>
  );
}
