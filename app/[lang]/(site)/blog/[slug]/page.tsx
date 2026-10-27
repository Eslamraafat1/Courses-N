import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { formatDate, isLang, LOCALES } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPost, getPosts } from "@/lib/api";
import { ShareButtons } from "@/components/courses/CourseParts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/components/ui/Link";
import { JsonLd } from "@/components/pages/JsonLd";

export async function generateStaticParams() {
  const posts = await getPosts();
  return LOCALES.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const post = await getPost(slug);
  if (!post) return {};
  return pageMeta({ lang, path: `/blog/${slug}`, title: post.title[lang], description: post.excerpt[lang], image: post.image, type: "article" });
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const t = makeT(lang);
  const related = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.tag.en === post.tag.en) - Number(a.tag.en === post.tag.en) || b.date.localeCompare(a.date))
    .slice(0, 3);
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US");

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title[lang],
          description: post.excerpt[lang],
          image: post.image,
          datePublished: post.date,
          inLanguage: lang,
          author: { "@type": "Person", name: post.author[lang] },
          publisher: { "@type": "Organization", name: SITE_NAME[lang] },
          mainEntityOfPage: `${SITE_URL}/${lang}/blog/${slug}`,
        }}
      />
      <header className="border-b border-line bg-gradient-to-b from-bg2/60 to-transparent pb-10 pt-8 sm:pb-14">
        <div className="container-x">
          <Breadcrumbs items={[{ label: t("nav.blog"), href: "/blog" }, { label: post.title[lang] }]} />
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow mb-3">{post.tag[lang]}</p>
            <h1 className="hd-1">{post.title[lang]}</h1>
            <p className="mt-4 text-xl text-muted">{post.excerpt[lang]}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="font-semibold text-ink">{t("blog.by", { name: post.author[lang] })}</span>
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("blog.minRead", { n: nf.format(post.readMinutes) })}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="container-x">
        <div className="relative mx-auto -mt-2 aspect-[16/8] max-w-5xl overflow-hidden rounded-3xl bg-bg2 sm:mt-8">
          <Image src={post.image} alt="" fill priority sizes="(min-width:1024px) 64rem, 100vw" className="object-cover" />
        </div>
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          <div className="space-y-6 text-lg leading-[1.85]">
            {post.body.map((p, i) => (
              <p key={i} className={i === 0 ? "text-xl first-letter:float-start first-letter:me-3 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.9] first-letter:text-accent" : undefined}>
                {p[lang]}
              </p>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">{t("blog.demo")}</p>
          <div className="mt-10 border-t border-line pt-6">
            <p className="mb-3 text-sm font-semibold">{t("blog.share")}</p>
            <ShareButtons path={`/blog/${slug}`} title={post.title[lang]} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-bg2/50 py-14" aria-labelledby="rel-h">
          <div className="container-x">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="rel-h" className="hd-2">{t("blog.related")}</h2>
              <Link href="/blog" className="font-semibold text-accent underline underline-offset-4">{t("blog.back")}</Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <article className="card group relative flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[16/10] bg-bg2">
                      <Image src={p.image} alt="" fill sizes="(min-width:768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-semibold text-accent">{p.tag[lang]}</p>
                      <h3 className="mt-1 font-display text-lg font-bold leading-snug">
                        <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">{p.title[lang]}</Link>
                      </h3>
                      <p className="mt-2 text-sm text-muted">{t("blog.minRead", { n: nf.format(p.readMinutes) })}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
