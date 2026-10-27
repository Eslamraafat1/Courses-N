"use client";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVideo, type VideoRequest } from "@/components/video/VideoProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/** Opens the cinematic video modal. `round` = icon-only disc used as an overlay on imagery. */
export function PlayButton({ request, label, variant = "outline", round, className }: { request: VideoRequest; label?: string; variant?: "outline" | "ghost" | "dark" | "primary"; round?: boolean; className?: string }) {
  const { t } = useI18n();
  const video = useVideo();
  const text = label ?? t("act.watchPreview");
  if (round) {
    return (
      <button
        type="button"
        onClick={() => video.open(request)}
        aria-label={text}
        className={cn("group/play relative grid size-20 place-items-center rounded-full bg-volt text-volt-ink shadow-2xl transition duration-300 hover:scale-110 active:scale-95", className)}
      >
        <span aria-hidden className="absolute inset-0 rounded-full border border-volt/70 [animation:ping_2.4s_cubic-bezier(0,0,.2,1)_infinite]" />
        <Play className="size-8 translate-x-0.5" fill="currentColor" aria-hidden />
      </button>
    );
  }
  return (
    <Button variant={variant} size="lg" className={className} onClick={() => video.open(request)} icon={<Play className="size-4" fill="currentColor" aria-hidden />}>
      {text}
    </Button>
  );
}
