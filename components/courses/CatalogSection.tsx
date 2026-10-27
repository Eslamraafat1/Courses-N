import { Suspense } from "react";
import type { CourseSummary } from "@/types";
import type { CatalogCategory, CatalogInstructor, SortKey } from "@/lib/catalog";
import { CourseCatalog } from "./CourseCatalog";
import { CatalogSkeleton } from "./CatalogParts";

interface Props {
  courses: CourseSummary[];
  categories: CatalogCategory[];
  instructors: CatalogInstructor[];
  /** category slug the catalog is locked to */
  lockedCategory?: string;
  defaultSort?: SortKey;
}

/** Server-safe wrapper: CourseCatalog reads useSearchParams, so it must sit inside Suspense. */
export function CatalogSection(props: Props) {
  return (
    <section id="catalog" className="container-x scroll-mt-24 py-10 sm:py-14">
      <Suspense fallback={<CatalogSkeleton />}>
        <CourseCatalog {...props} />
      </Suspense>
    </section>
  );
}
