import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getPosts } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogIndex } from "@/components/pages/BlogIndex";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/blog", title: t("nav.blog"), description: t("blog.metaDesc") });
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const posts = await getPosts();
  return (
    <>
      <PageHeader eyebrow={t("blog.eyebrow")} title={t("blog.title")} lead={t("blog.lead")} crumbs={[{ label: t("nav.blog") }]} />
      <BlogIndex posts={posts} />
    </>
  );
}
