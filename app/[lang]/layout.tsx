import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque, Geist_Mono, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "../globals.css";
import { LOCALES, dirOf, isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/site";
import { getSearchIndex } from "@/lib/api";
import { themeInitScript } from "@/components/providers/ThemeProvider";
import { AppProviders } from "@/components/providers/AppProviders";

const display = Bricolage_Grotesque({ variable: "--f-display", subsets: ["latin"], display: "swap" });
const body = Manrope({ variable: "--f-body", subsets: ["latin"], display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ variable: "--f-arabic", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${SITE_NAME[lang]} — ${makeT(lang)("brand.tagline")}`, template: `%s · ${SITE_NAME[lang]}` },
    description: SITE_DESC[lang],
    applicationName: SITE_NAME[lang],
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#07070d" },
  ],
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const searchIndex = await getSearchIndex();
  const t = makeT(lang);

  return (
    <html lang={lang} dir={dirOf(lang)} suppressHydrationWarning className={`${display.variable} ${body.variable} ${arabic.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <AppProviders lang={lang} searchIndex={searchIndex}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-volt focus:px-5 focus:py-3 focus:font-bold focus:text-volt-ink">
            {t("nav.skip")}
          </a>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
