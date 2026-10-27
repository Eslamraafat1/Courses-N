import Image from "next/image";
import { Check, Clock, Layers, Users } from "lucide-react";
import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCourse, getFeaturedCourses, getInstructor } from "@/lib/api";
import { Counter, ParallaxImage, Reveal, SplitText } from "@/components/animations/Motion";
import { FloatingShapes, Parallax, WipeIn } from "@/components/animations/Fx";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Primitives";
import { PriceTag } from "@/components/courses/CourseParts";
import { PlayButton } from "./parts/PlayButton";

export async function FeaturedCourse({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [first] = await getFeaturedCourses();
  const course = first ? await getCourse(first.slug) : undefined;
  const label = t("home.label.featured");
  if (!first || !course) {
    return <section id="FeaturedCourse" data-section="FeaturedCourse" data-section-label={label} aria-label={label} />;
  }
  const instructor = await getInstructor(course.instructorId);
  const title = course.title[lang];
  const lessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
  const req = { url: course.videoUrl, title, subtitle: instructor ? `${t("label.by")} ${instructor.name[lang]}` : undefined, poster: course.thumbnail };

  return (
    <section id="FeaturedCourse" data-section="FeaturedCourse" data-section-label={label} aria-labelledby="featured-title" className="relative overflow-hidden bg-bg2/50 py-20 sm:py-28">
      <FloatingShapes />
      <Parallax speed={10} className="pointer-events-none absolute -top-6 start-0 rtl:hidden"><span aria-hidden className="block select-none font-display text-[clamp(8rem,26vw,24rem)] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_var(--line)]">
        01
      </span></Parallax>
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* media */}
        <Reveal className="relative lg:col-span-5">
          <div className="relative">
            <WipeIn from="start"><ParallaxImage src={course.thumbnail} alt={title} sizes="(min-width:1024px) 40vw, 92vw" ratio="aspect-[4/5]" className="shadow-[var(--shadow)]" /></WipeIn>
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative">
                <PlayButton round request={req} label={t("home.featured.play", { title })} />
              </div>
            </div>
            {instructor && (
              <div className="float-y card absolute -bottom-6 end-4 flex items-center gap-3 px-4 py-3 backdrop-blur sm:-end-6">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-bg2">
                  <Image src={instructor.avatar} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0 text-sm leading-tight">
                  <span className="block text-xs text-muted">{t("home.featured.instructor")}</span>
                  <span className="block truncate font-bold">{instructor.name[lang]}</span>
                  <span className="block truncate text-xs text-muted">{instructor.title[lang]}</span>
                </span>
              </div>
            )}
          </div>
        </Reveal>

        {/* copy */}
        <div className="lg:col-span-7">
          <Reveal y={12}>
            <p className="eyebrow mb-4 inline-flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-accent" />
              {t("home.featured.eyebrow")}
            </p>
          </Reveal>
          <div id="featured-title">
            <SplitText text={title} as="h2" className="hd-1" />
          </div>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg text-muted">{course.subtitle[lang]}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-6 sm:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted"><Users className="size-4" aria-hidden />{t("home.featured.students")}</dt>
                <dd className="mt-1 font-display text-3xl font-bold"><Counter value={course.students} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t("home.featured.rating")}</dt>
                <dd className="mt-2"><Rating value={course.rating} count={course.reviewsCount} /></dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted"><Clock className="size-4" aria-hidden />{t("home.featured.hours")}</dt>
                <dd className="mt-1 font-display text-3xl font-bold"><Counter value={course.duration} /></dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted"><Layers className="size-4" aria-hidden />{t("home.featured.lessons")}</dt>
                <dd className="mt-1 font-display text-3xl font-bold"><Counter value={lessons} /></dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.2}>
            <h3 className="mt-8 text-sm font-bold uppercase tracking-widest text-muted rtl:tracking-normal">{t("home.featured.outcomes")}</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.outcomes.slice(0, 4).map((o, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-volt text-volt-ink"><Check className="size-4" aria-hidden /></span>
                  <span>{o[lang]}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <PriceTag price={course.price} oldPrice={course.oldPrice} />
              <div className="flex flex-wrap gap-3">
                <Button href={`/courses/${course.slug}`} size="lg" magnetic>{t("act.viewCourse")}</Button>
                <PlayButton request={req} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
