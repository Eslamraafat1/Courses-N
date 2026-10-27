import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";

function pickLocale(request: NextRequest): string {
  const saved = request.cookies.get("nx-lang")?.value;
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  if (first && (LOCALES as readonly string[]).includes(first)) return first;
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (assets, sitemap.xml, robots.txt).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
