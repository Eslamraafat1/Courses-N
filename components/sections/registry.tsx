import type { ComponentType } from "react";
import type { Lang } from "@/types";
import type { HomeSectionId } from "@/data/home";
import { Hero } from "./Hero";
import { TrustPartners } from "./TrustPartners";
import { LearningCategories } from "./LearningCategories";
import { FeaturedCourse } from "./FeaturedCourse";
import { TrendingCourses } from "./TrendingCourses";
import { StackedShowcase } from "./StackedShowcase";
import { LearningPaths } from "./LearningPaths";
import { HorizontalShowcase } from "./HorizontalShowcase";
import { ContinueLearning } from "./ContinueLearning";
import { LearningUniverse } from "./LearningUniverse";
import { WhyChooseUs } from "./WhyChooseUs";
import { InstructorSpotlight } from "./InstructorSpotlight";
import { SuccessStories } from "./SuccessStories";
import { StatsSection } from "./StatsSection";
import { LearningExperience } from "./LearningExperience";
import { MembershipPlans } from "./MembershipPlans";
import { FaqSection } from "./FaqSection";
import { Newsletter } from "./Newsletter";
import { FinalCta } from "./FinalCta";

// Server components (async) or client components — all receive the active language.
export const sectionRegistry: Record<HomeSectionId, ComponentType<{ lang: Lang }>> = {
  Hero, TrustPartners, LearningCategories, FeaturedCourse, TrendingCourses, StackedShowcase, LearningPaths,
  HorizontalShowcase, ContinueLearning, LearningUniverse, WhyChooseUs, InstructorSpotlight, SuccessStories,
  StatsSection, LearningExperience, MembershipPlans, FaqSection, Newsletter, FinalCta,
} as unknown as Record<HomeSectionId, ComponentType<{ lang: Lang }>>;
