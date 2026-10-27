import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT, type TKey } from "@/lib/i18n";
import type { Lang } from "@/types";

/** Shared admin page metadata: localized title; `robots: noindex,nofollow` is inherited from the admin layout. */
export async function adminMetadata(params: Promise<{ lang: string }>, key: TKey): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return { title: makeT(lang)(key), robots: { index: false, follow: false } };
}

export async function adminLang(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
}
