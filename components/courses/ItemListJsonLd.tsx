import type { Lang } from "@/types";
import { SITE_URL } from "@/lib/site";

interface Item {
  slug: string;
  name: string;
}

/** schema.org ItemList of course URLs (server component; no client JS). */
export function ItemListJsonLd({ lang, name, items, base = "/courses" }: { lang: Lang; name: string; items: Item[]; base?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}/${lang}${base}/${it.slug}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
