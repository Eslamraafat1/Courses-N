import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { SettingsView } from "@/components/dashboard/SettingsView";

export async function generateMetadata({ params }: PageProps<"/[lang]/settings">) {
  return privateMeta(params, "/settings", "account.settings.title", "account.settings.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/settings">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SettingsView />;
}
