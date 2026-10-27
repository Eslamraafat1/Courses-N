import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getNotifications } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { NotificationsView } from "@/components/dashboard/NotificationsView";

export async function generateMetadata({ params }: PageProps<"/[lang]/notifications">) {
  return privateMeta(params, "/notifications", "dash.notifications.title", "dash.notifications.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/notifications">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const items = await getNotifications();
  return <NotificationsView items={items} />;
}
