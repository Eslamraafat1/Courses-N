"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { readStore } from "@/lib/store";
import { demoStudent } from "@/data/content";

const NONE: Record<string, string[]> = {};
const NONE_LAST: Record<string, string> = {};

/**
 * Picks the lesson to continue with (last opened -> first unfinished -> first) and replaces the URL.
 * Without JavaScript the visible link goes to the first lesson.
 */
export function ResumeRedirect({ slug, lessonIds, title }: { slug: string; lessonIds: string[]; title: string }) {
  const { t, h } = useI18n();
  const router = useRouter();
  const first = lessonIds[0];

  useEffect(() => {
    // Read storage directly: hooks may still hold the server snapshot during the first effect pass.
    const last = readStore<Record<string, string>>("nx-last-lesson", NONE_LAST)[slug];
    const stored = readStore<Record<string, string[]>>("nx-progress", NONE);
    const done = (Object.keys(stored).length === 0 ? demoStudent.seedProgress : stored)[slug] ?? [];
    const id = (last && lessonIds.includes(last) && last) || lessonIds.find((x) => !done.includes(x)) || first;
    if (id) router.replace(h(`/learn/${slug}/${id}`));
  }, [slug, lessonIds, first, h, router]);

  return (
    <div className="container-x grid min-h-[60dvh] place-items-center py-20 text-center">
      <div role="status" aria-live="polite" className="max-w-md">
        <Loader2 className="mx-auto mb-4 size-8 animate-spin text-accent motion-reduce:animate-none" aria-hidden />
        <h1 className="font-display text-2xl font-bold">{t("player.resuming")}</h1>
        <p className="mt-2 text-muted">{title}</p>
        {first && (
          <p className="mt-6 text-sm text-muted">
            {t("player.resumeStuck")}{" "}
            <Link href={`/learn/${slug}/${first}`} className="font-semibold text-ink underline underline-offset-4">
              {t("player.openFirst")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
