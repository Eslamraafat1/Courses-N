import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

/** Standard header for inner pages: breadcrumbs + eyebrow + H1 + lead + optional actions. */
export function PageHeader({ title, eyebrow, lead, crumbs, actions, className, children }: { title: ReactNode; eyebrow?: string; lead?: string; crumbs?: Crumb[]; actions?: ReactNode; className?: string; children?: ReactNode }) {
  return (
    <section className={cn("relative border-b border-line bg-gradient-to-b from-bg2/60 to-transparent pb-10 pt-8 sm:pb-14", className)}>
      <div className="container-x">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            <h1 className="hd-1">{title}</h1>
            {lead && <p className="mt-4 text-lg text-muted sm:text-xl">{lead}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
