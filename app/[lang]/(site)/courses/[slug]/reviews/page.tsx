import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourse, getCourses, getReviews } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { RatingDistribution, ReviewForm, ReviewList } from "@/components/courses/ReviewParts";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]/reviews">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: `/courses/${slug}/reviews`, title: `${t("course.tab.reviews")} — ${course.title[lang]}`, description: course.subtitle[lang], image: course.thumbnail });
}

export default async function CourseReviewsPage({ params }: PageProps<"/[lang]/courses/[slug]/reviews">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const [course, reviews] = await Promise.all([getCourse(slug), getReviews(slug)]);
  if (!course) notFound();
  const t = makeT(lang);

  return (
    <>
      <PageHeader
        eyebrow={course.title[lang]}
        title={t("course.tab.reviews")}
        crumbs={[
          { label: t("nav.courses"), href: "/courses" },
          { label: course.title[lang], href: `/courses/${slug}` },
          { label: t("course.tab.reviews") },
        ]}
      />
      <div className="container-x space-y-10 py-10 sm:py-14">
        <div className="card p-5 sm:p-8">
          <RatingDistribution reviews={reviews} rating={course.rating} count={course.reviewsCount} />
        </div>
        <section aria-labelledby="all-reviews">
          <h2 id="all-reviews" className="hd-2 mb-6">
            {t("course.studentReviews")}
          </h2>
          <ReviewList reviews={reviews} />
        </section>
        <div className="mx-auto max-w-2xl">
          <ReviewForm />
        </div>
      </div>
    </>
  );
}
