"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";

/** Soft page glow that changes hue as each home section passes (CSS @property animates the colour change). */
const TINTS: Record<string, string> = {
  Hero: "#5233e8",
  TrustPartners: "#2db4ff",
  LearningCategories: "#ff5c3a",
  FeaturedCourse: "#c6f032",
  TrendingCourses: "#d6338a",
  StackedShowcase: "#5233e8",
  LearningPaths: "#18b57b",
  HorizontalShowcase: "#ff5c3a",
  ContinueLearning: "#2db4ff",
  LearningUniverse: "#7a4dff",
  WhyChooseUs: "#c6f032",
  InstructorSpotlight: "#d6338a",
  SuccessStories: "#ff5c3a",
  StatsSection: "#5233e8",
  LearningExperience: "#2db4ff",
  MembershipPlans: "#c6f032",
  FaqSection: "#7a4dff",
  Newsletter: "#18b57b",
  FinalCta: "#5233e8",
};

export function BackgroundTint() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) root.style.setProperty("--tint", TINTS[el.dataset.section ?? ""] ?? "#5233e8");
        },
      }),
    );
    return () => {
      triggers.forEach((t) => t.kill());
      root.style.removeProperty("--tint");
    };
  }, [pathname]);

  return <div aria-hidden className="tint-layer pointer-events-none fixed inset-0 -z-20" />;
}
