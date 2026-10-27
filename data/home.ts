/**
 * Homepage composition: reorder, disable or add sections here (no component edits needed).
 * Each id maps to a component in components/sections/registry.tsx.
 */
export type HomeSectionId =
  | "Hero" | "TrustPartners" | "LearningCategories" | "FeaturedCourse" | "TrendingCourses" | "StackedShowcase"
  | "LearningPaths" | "HorizontalShowcase" | "ContinueLearning" | "LearningUniverse" | "WhyChooseUs"
  | "InstructorSpotlight" | "SuccessStories" | "StatsSection" | "LearningExperience" | "MembershipPlans"
  | "FaqSection" | "Newsletter" | "FinalCta";

export const homeSections: { id: HomeSectionId; enabled: boolean }[] = [
  { id: "Hero", enabled: true },
  { id: "TrustPartners", enabled: true },
  { id: "LearningCategories", enabled: true },
  { id: "FeaturedCourse", enabled: true },
  { id: "TrendingCourses", enabled: true },
  { id: "StackedShowcase", enabled: true },
  { id: "LearningPaths", enabled: true },
  { id: "HorizontalShowcase", enabled: true },
  { id: "ContinueLearning", enabled: true },
  { id: "LearningUniverse", enabled: true },
  { id: "WhyChooseUs", enabled: true },
  { id: "InstructorSpotlight", enabled: true },
  { id: "SuccessStories", enabled: true },
  { id: "StatsSection", enabled: true },
  { id: "LearningExperience", enabled: true },
  { id: "MembershipPlans", enabled: true },
  { id: "FaqSection", enabled: true },
  { id: "Newsletter", enabled: true },
  { id: "FinalCta", enabled: true },
];
