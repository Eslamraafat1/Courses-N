import type { ParsedVideo } from "@/types";

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{5,12}$/;

/**
 * Turn any normal video link into something embeddable.
 * Supports YouTube (watch / youtu.be / shorts / embed), Vimeo (page / player) and direct MP4/WebM.
 * Returns null for anything else — callers must show an "invalid link" state.
 */
export function parseVideoUrl(raw: string | undefined | null): ParsedVideo | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  // YouTube
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be") {
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(embed|shorts|live|v)\/([^/?]+)/);
      if (m) id = m[2];
    }
    if (!id || !YT_ID.test(id)) return null;
    const start = Number(url.searchParams.get("t")?.replace(/s$/, "") ?? url.searchParams.get("start") ?? 0);
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", autoplay: "1" });
    if (start > 0 && Number.isFinite(start)) params.set("start", String(Math.floor(start)));
    return {
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).find((s) => VIMEO_ID.test(s));
    if (!id) return null;
    return {
      provider: "vimeo",
      src: `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`,
      watchUrl: `https://vimeo.com/${id}`,
    };
  }

  // Direct files
  if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname)) {
    return { provider: "mp4", src: url.toString(), watchUrl: url.toString() };
  }
  return null;
}

/** Poster image for a course/lesson card: explicit thumbnail wins, then provider thumbnail. */
export function posterFor(thumbnail: string | undefined, videoUrl: string): string | undefined {
  return thumbnail ?? parseVideoUrl(videoUrl)?.poster;
}
