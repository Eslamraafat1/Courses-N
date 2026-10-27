import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { ExperienceSteps } from "./parts/ExperienceSteps";

export async function LearningExperience({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  return (
    <section id="LearningExperience" data-section="LearningExperience" data-section-label={t("home2.exp.label")} aria-labelledby="exp-h" className="bg-bg2/50">
      <ExperienceSteps />
    </section>
  );
}
