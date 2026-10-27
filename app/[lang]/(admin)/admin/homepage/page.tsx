import { homeSections } from "@/data/home";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { HomepageView } from "@/components/admin/SiteViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/homepage">) {
  return adminMetadata(params, "admin.homepage.title");
}

export default async function AdminHomepagePage({ params }: PageProps<"/[lang]/admin/homepage">) {
  await adminLang(params);
  return <HomepageView initial={homeSections.map((s) => ({ id: s.id, enabled: s.enabled }))} />;
}
