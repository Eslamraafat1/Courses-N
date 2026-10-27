import { getCourses } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { LessonsView, type AdminCourseCurriculum } from "@/components/admin/LessonsView";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/lessons">) {
  return adminMetadata(params, "admin.lessons.title");
}

export default async function AdminLessonsPage({ params }: PageProps<"/[lang]/admin/lessons">) {
  await adminLang(params);
  const courses = await getCourses();
  const data: AdminCourseCurriculum[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    modules: c.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, duration: l.duration, videoUrl: l.videoUrl, preview: !!l.preview })),
    })),
  }));
  return <LessonsView courses={data} />;
}
