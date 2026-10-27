import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta, SITE_NAME, SITE_URL } from "@/lib/site";
import { getCategories, getCourse, getCourses, getInstructors, getRelatedCourses, getReviews } from "@/lib/api";
import { CourseHero } from "@/components/courses/CourseHero";
import { CourseBuyCard } from "@/components/courses/CourseBuyCard";
import { CourseOverview, InstructorBox } from "@/components/courses/CourseSections";
import { CurriculumList } from "@/components/courses/CurriculumList";
import { RatingDistribution, ReviewList } from "@/components/courses/ReviewParts";
import { CourseViewTracker } from "@/components/courses/CourseViewTracker";
import { CourseCard } from "@/components/courses/CourseCard";
import { ShareButtons } from "@/components/courses/CourseParts";
import { fmtMinutes, isoHours, lessonsOf, totalMinutes } from "@/components/courses/format";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  return pageMeta({ lang, path: `/courses/${slug}`, title: course.title[lang], description: course.subtitle[lang], image: course.thumbnail });
}

export default async function CourseDetailsPage({ params }: PageProps<"/[lang]/courses/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const course = await getCourse(slug);
  if (!course) notFound();

  const [instructors, categories, reviews, related] = await Promise.all([
    getInstructors(),
    getCategories(),
    getReviews(slug),
    getRelatedCourses(slug, 3),
  ]);
  const instructor = instructors.find((i) => i.id === course.instructorId);
  const category = categories.find((c) => c.id === course.categoryId);
  const t = makeT(lang);
  const lessons = lessonsOf(course);
  const minutes = totalMinutes(course.modules);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title[lang],
    description: course.description[lang],
    url: `${SITE_URL}/${lang}/courses/${slug}`,
    image: course.thumbnail,
    inLanguage: lang,
    educationalLevel: course.level,
    timeRequired: isoHours(course.duration),
    provider: { "@type": "Organization", name: SITE_NAME[lang], sameAs: SITE_URL },
    ...(instructor ? { creator: { "@type": "Person", name: instructor.name[lang] } } : {}),
    offers: { "@type": "Offer", price: course.price, priceCurrency: "USD", category: course.price === 0 ? "Free" : "Paid" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: course.rating, reviewCount: course.reviewsCount, bestRating: 5, worstRating: 1 },
  };

  const sections = [
    { id: "overview", label: t("course.tab.overview") },
    { id: "curriculum", label: t("course.tab.curriculum") },
    { id: "instructor", label: t("course.tab.instructor") },
    { id: "reviews", label: t("course.tab.reviews") },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <CourseViewTracker slug={slug} />
      <CourseHero course={course} instructor={instructor} categoryName={category?.name[lang]} categorySlug={category?.slug} />

      <div className="container-x grid gap-10 pb-28 pt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-20 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-14">
        <div className="min-w-0 space-y-14">
          <nav
            aria-label={t("course.sections")}
            className="no-scrollbar sticky top-16 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-bg/90 px-4 backdrop-blur sm:mx-0 sm:px-0"
          >
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:text-ink">
                {s.label}
              </a>
            ))}
          </nav>

          <section id="overview" aria-labelledby="overview-title" className="scroll-mt-32">
            <h2 id="overview-title" className="hd-2 mb-6">
              {t("course.tab.overview")}
            </h2>
            <CourseOverview course={course} />
            <div className="mt-8 lg:hidden">
              <ShareButtons path={`/courses/${slug}`} title={course.title[lang]} />
            </div>
          </section>

          <section id="curriculum" aria-labelledby="curriculum-title" className="scroll-mt-32">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="curriculum-title" className="hd-2">
                  {t("course.tab.curriculum")}
                </h2>
                <p className="mt-2 text-muted">
                  {t("course.curriculumSummary", { modules: course.modules.length, lessons: lessons.length, duration: fmtMinutes(t, minutes) })}
                </p>
              </div>
              <Button href={`/courses/${slug}/curriculum`} variant="outline" size="sm">
                {t("course.fullOutline")}
              </Button>
            </div>
            <CurriculumList courseSlug={slug} modules={course.modules} fallbackPoster={course.thumbnail} />
          </section>

          {instructor && (
            <section id="instructor" aria-labelledby="instructor-title" className="scroll-mt-32">
              <h2 id="instructor-title" className="hd-2 mb-6">
                {t("course.tab.instructor")}
              </h2>
              <InstructorBox instructor={instructor} />
            </section>
          )}

          <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-32">
            <h2 id="reviews-title" className="hd-2 mb-6">
              {t("course.tab.reviews")}
            </h2>
            <div className="card mb-6 p-5 sm:p-7">
              <RatingDistribution reviews={reviews} rating={course.rating} count={course.reviewsCount} />
            </div>
            <ReviewList reviews={reviews.slice(0, 4)} />
            <div className="mt-6">
              <Button href={`/courses/${slug}/reviews`} variant="outline">
                {t("course.allReviews")}
              </Button>
            </div>
          </section>
        </div>

        <div className="min-w-0 max-lg:contents lg:col-start-2 lg:row-start-1">
          <CourseBuyCard course={course} />
          <p className="mt-4 hidden text-center text-sm lg:block">
            <Link href={`/courses/${slug}/certificate`} className="text-muted underline-offset-4 hover:text-ink hover:underline">
              {t("course.cert.link")}
            </Link>
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-bg2/40 py-14">
          <div className="container-x">
            <h2 id="related-title" className="hd-2 mb-8">
              {t("course.related")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c, i) => (
                <CourseCard key={c.id} course={c} variant={i === 0 ? "grid" : "compact"} className={i === 0 ? "sm:col-span-2 lg:col-span-1" : undefined} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
