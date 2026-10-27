/**
 * Public data-access entry point for server components / pages:  import { getCourse } from "@/lib/api"
 * Switch Demo ⇄ Backend with env vars only (see lib/api/config.ts and docs/BACKEND_INTEGRATION.md).
 * Client components should receive data as props, or use lib/api/browser.ts for runtime requests.
 */
export { API_MODE, IS_DEMO } from "./config";
export { ApiError, isApiError } from "./errors";
export {
  getCourse, getCourses, getCourseSummaries, getCoursesByCategory, getCoursesByInstructor, getFeaturedCourses,
  getLesson, getNewCourses, getRelatedCourses, getTrendingCourses, listCourses,
} from "./courses";
export { getCategories, getCategory } from "./categories";
export { getInstructor, getInstructors } from "./instructors";
export { getReviews } from "./reviews";
export {
  getFaqs, getNotifications, getPartners, getPath, getPaths, getPlans, getPost, getPosts, getSearchIndex, getStats, getTestimonials,
} from "./content";
