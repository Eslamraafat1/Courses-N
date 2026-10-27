import { adminLang, adminMetadata } from "@/components/admin/meta";
import { SettingsView } from "@/components/admin/SiteViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/settings">) {
  return adminMetadata(params, "admin.settings.title");
}

export default async function AdminSettingsPage({ params }: PageProps<"/[lang]/admin/settings">) {
  await adminLang(params);
  return <SettingsView />;
}
