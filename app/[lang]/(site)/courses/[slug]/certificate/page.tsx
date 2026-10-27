import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourse, getCourses, getInstructors } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { CertificatePreview } from "@/components/courses/CertificatePreview";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]/certificate">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: `/courses/${slug}/certificate`, title: `${t("course.cert.pageTitle")} — ${course.title[lang]}`, description: t("course.cert.noticeBody"), image: course.thumbnail });
}

export default async function CertificatePage({ params }: PageProps<"/[lang]/courses/[slug]/certificate">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const [course, instructors] = await Promise.all([getCourse(slug), getInstructors()]);
  if (!course) notFound();
  const t = makeT(lang);
  const instructor = instructors.find((i) => i.id === course.instructorId);

  return (
    <>
      <PageHeader
        eyebrow={course.title[lang]}
        title={t("course.cert.pageTitle")}
        lead={t("course.cert.lead")}
        crumbs={[
          { label: t("nav.courses"), href: "/courses" },
          { label: course.title[lang], href: `/courses/${slug}` },
          { label: t("course.cert.pageTitle") },
        ]}
      />
      <div className="container-x py-10 sm:py-14">
        <CertificatePreview course={course} instructor={instructor} />
      </div>
    </>
  );
}
