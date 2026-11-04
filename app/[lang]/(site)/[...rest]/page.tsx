import { notFound } from "next/navigation";

/**
 * Catch-all for unknown URLs inside a locale (e.g. /en/does-not-exist).
 * Without it Next renders its unstyled default 404 outside the [lang] layout (no lang/dir, no theme);
 * calling notFound() here renders the branded app/[lang]/not-found.tsx inside the localised layout instead.
 */
export default function UnknownPage() {
  notFound();
}
