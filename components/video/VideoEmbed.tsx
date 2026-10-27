"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ExternalLink, Loader2, Maximize2, Play } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { parseVideoUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

interface VideoEmbedProps {
  url: string;
  title: string;
  poster?: string;
  /** start playing immediately (modal) — otherwise a click-to-load poster is shown first */
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

/**
 * 16:9 player for YouTube, Vimeo and direct MP4.
 * The heavy iframe / <video> is only mounted once playback is requested, and it is unmounted with the
 * component, which also stops playback (e.g. when the modal closes or the lesson changes).
 */
export function VideoEmbed({ url, title, poster, autoPlay = false, onEnded, className }: VideoEmbedProps) {
  const { t } = useI18n();
  const parsed = useMemo(() => parseVideoUrl(url), [url]);
  const [started, setStarted] = useState(autoPlay);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterSrc = poster ?? parsed?.poster;

  // reset when the source changes (render-phase adjustment instead of an effect)
  const [prevUrl, setPrevUrl] = useState(url);
  if (prevUrl !== url) {
    setPrevUrl(url);
    setStarted(autoPlay);
    setLoaded(false);
    setFailed(false);
  }

  useEffect(() => {
    const v = videoRef.current;
    return () => {
      v?.pause();
    };
  }, [url]);

  const goFullscreen = () => {
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <div
      ref={boxRef}
      className={cn("relative aspect-video w-full overflow-hidden bg-black text-white", className)}
    >
      {!parsed || failed ? (
        <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="max-w-sm">
            <AlertTriangle className="mx-auto mb-3 size-8 text-coral" aria-hidden />
            <p className="font-semibold">{failed ? t("video.blocked") : t("video.invalid")}</p>
            <p className="mt-1 text-sm text-white/70">{t("video.invalidHint")}</p>
            {parsed && (
              <a
                href={parsed.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black"
              >
                {t("video.openExternal")} <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      ) : !started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={t("video.poster", { title })}
          className="group absolute inset-0 grid place-items-center"
        >
          {posterSrc && (
            <Image src={posterSrc} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <span className="relative grid size-20 place-items-center rounded-full bg-volt text-volt-ink shadow-2xl transition group-hover:scale-110">
            <Play className="size-8 translate-x-0.5" fill="currentColor" aria-hidden />
          </span>
        </button>
      ) : (
        <>
          {parsed.provider === "mp4" ? (
            <video
              ref={videoRef}
              src={parsed.src}
              poster={posterSrc}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full bg-black"
              onLoadedData={() => setLoaded(true)}
              onEnded={onEnded}
              onError={() => setFailed(true)}
            />
          ) : (
            <iframe
              src={parsed.src}
              title={title}
              className="absolute inset-0 size-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoaded(true)}
            />
          )}
          {!loaded && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70" role="status">
              <span className="flex items-center gap-2 text-sm">
                <Loader2 className="size-5 animate-spin" aria-hidden /> {t("video.loading")}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={goFullscreen}
            aria-label={t("video.fullscreen")}
            className="absolute start-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition hover:bg-black/80 focus-visible:opacity-100 [@media(hover:hover)]:hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <Maximize2 className="size-4" aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
