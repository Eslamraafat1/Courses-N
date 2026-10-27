import type { L, Lesson, Module, VideoProvider } from "@/types";
import { VIDEOS, type VideoKey } from "./videos";

/** Unsplash helper. `w` controls the delivered width (thumbnail 1200, cover 1920). */
export const img = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;
export const l = (ar: string, en: string): L => ({ ar, en });

export const providerOf = (url: string): VideoProvider =>
  url.includes("vimeo.com") ? "vimeo" : url.endsWith(".mp4") ? "mp4" : "youtube";

/** [arTitle, enTitle, minutes, videoKey, preview?] */
export type LessonTuple = [string, string, number, VideoKey, boolean?];
export type ModuleTuple = [string, string, LessonTuple[]];

export function build(slug: string, mods: ModuleTuple[]): Module[] {
  return mods.map(([ar, en, lessons], mi) => ({
    id: `${slug}-m${mi + 1}`,
    title: l(ar, en),
    lessons: lessons.map(([lar, len, minutes, vk, preview], li): Lesson => {
      const videoUrl = VIDEOS[vk];
      return {
        id: `${slug}-m${mi + 1}-l${li + 1}`,
        title: l(lar, len),
        description: l(`في هذا الدرس ستتعلم: ${lar}. تطبيق عملي مع أمثلة واضحة.`, `In this lesson you'll learn: ${len}. Hands-on with clear examples.`),
        duration: minutes,
        videoUrl,
        provider: providerOf(videoUrl),
        preview: preview ?? (mi === 0 && li === 0),
        resources: li === 0 ? [
          { id: `${slug}-m${mi + 1}-r1`, title: l("مراجع إضافية", "Further reading"), kind: "link", href: "https://developer.mozilla.org" },
        ] : [],
      };
    }),
  }));
}

export const outcomes = (a: [string, string][]): L[] => a.map(([ar, en]) => l(ar, en));
