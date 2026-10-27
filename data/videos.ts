/**
 * Single source of truth for every video link in the app.
 * Change a URL here and every card, modal and lesson list updates.
 * All links are public demo videos (YouTube / Vimeo / direct MP4) — they illustrate the player only.
 */
export const VIDEOS = {
  jsFull: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  jsIn100: "https://youtu.be/DHjqpvDnNGE",
  reactBeginners: "https://www.youtube.com/watch?v=SqcY0GlETPk",
  reactCrash: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
  pythonFull: "https://www.youtube.com/watch?v=rfscVS0vtbw",
  pythonHour: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
  pythonData: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
  tsBasics: "https://www.youtube.com/watch?v=ahCwqrYpIuM",
  sqlFull: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
  htmlCrash: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
  webBuild: "https://www.youtube.com/watch?v=3JluqTojuME",
  htmlFull: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
  vimeoBunny: "https://vimeo.com/1084537",
  vimeoMountain: "https://vimeo.com/22439234",
  mp4Flower: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
} as const;

export type VideoKey = keyof typeof VIDEOS;
