import { getTestimonials } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { StoryDeck } from "./parts/StoryDeck";

export async function SuccessStories({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const stories = await getTestimonials();
  return (
    <section id="SuccessStories" data-section="SuccessStories" data-section-label={t("home2.stories.label")} aria-labelledby="stories-h" className="overflow-x-clip">
      <StoryDeck stories={stories} />
    </section>
  );
}
