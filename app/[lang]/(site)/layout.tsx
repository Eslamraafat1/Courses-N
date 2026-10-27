import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCategories } from "@/lib/api";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Public site shell: navbar + footer. Admin lives in the sibling (admin) group with its own shell. */
export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const categories = await getCategories();
  return (
    <>
      <Navbar categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, color: c.color }))} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer lang={lang} categories={categories} />
    </>
  );
}
