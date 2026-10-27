import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCategories } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { PreferencesView } from "@/components/dashboard/PreferencesView";

export async function generateMetadata({ params }: PageProps<"/[lang]/settings/preferences">) {
  return privateMeta(params, "/settings/preferences", "account.prefs.title", "account.prefs.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/settings/preferences">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const cats = await getCategories();
  return <PreferencesView topics={cats.map((c) => ({ slug: c.slug, name: c.name }))} />;
}
