/**
 * Endpoint paths relative to the API base (Demo: /api, Backend: NEXT_PUBLIC_API_BASE_URL).
 * Keep identical for both so switching modes needs no code change.
 * Path params are always encoded here — never concatenate user input into a URL elsewhere.
 */
const e = encodeURIComponent;

export const endpoints = {
  courses: "/courses",
  course: (idOrSlug: string) => `/courses/${e(idOrSlug)}`,
  courseLessons: (idOrSlug: string) => `/courses/${e(idOrSlug)}/lessons`,
  courseReviews: (idOrSlug: string) => `/courses/${e(idOrSlug)}/reviews`,
  categories: "/categories",
  instructors: "/instructors",
  instructor: (idOrSlug: string) => `/instructors/${e(idOrSlug)}`,
  search: "/search",
  contact: "/contact",
  newsletter: "/newsletter",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    session: "/auth/session",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
} as const;
