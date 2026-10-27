import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, LOCALES } from "@/lib/i18n/config";
import { pageMeta } from "@/lib/site";
import { getCoursesByInstructor, getInstructor, getInstructors } from "@/lib/api";
import { InstructorProfile } from "@/components/pages/InstructorProfile";
import { JsonLd } from "@/components/pages/JsonLd";

export async function generateStaticParams() {
  const list = await getInstructors();
  return LOCALES.flatMap((lang) => list.map((i) => ({ lang, slug: i.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/instructors/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const ins = await getInstructor(slug);
  if (!ins) return {};
  return pageMeta({ lang, path: `/instructors/${slug}`, title: `${ins.name[lang]} — ${ins.title[lang]}`, description: ins.bio[lang], image: ins.avatar });
}

export default async function InstructorPage({ params }: PageProps<"/[lang]/instructors/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const ins = await getInstructor(slug);
  if (!ins) notFound();
  const courses = await getCoursesByInstructor(ins.id);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Person", name: ins.name[lang], jobTitle: ins.title[lang], description: ins.bio[lang], image: ins.avatar }} />
      <InstructorProfile instructor={ins} courses={courses} />
    </>
  );
}
