import { getPlans } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { FloatingShapes } from "@/components/animations/Fx";
import { PlansToggle } from "./parts/PlansToggle";

export async function MembershipPlans({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const plans = await getPlans();
  return (
    <section id="MembershipPlans" data-section="MembershipPlans" data-section-label={t("home2.plans.label")} aria-labelledby="plans-h" className="relative isolate overflow-x-clip">
      <FloatingShapes />
      <PlansToggle plans={plans} />
    </section>
  );
}
