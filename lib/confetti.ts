/**
 * Tiny dependency-free confetti burst (canvas, ~1.5s, auto-cleaned). Used for "lesson completed" moments.
 * No-ops for reduced-motion users and on the server.
 */
const COLORS = ["#c6f032", "#5233e8", "#ff5c3a", "#2db4ff", "#ffffff", "#d6338a"];

interface P { x: number; y: number; vx: number; vy: number; w: number; h: number; r: number; vr: number; c: string; life: number }

export function confettiBurst(originX?: number, originY?: number, count = 90) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "400" });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = window.innerWidth * dpr;
  cv.height = window.innerHeight * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) return cv.remove();
  ctx.scale(dpr, dpr);

  const ox = originX ?? window.innerWidth / 2;
  const oy = originY ?? window.innerHeight * 0.6;
  const ps: P[] = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const s = 6 + Math.random() * 9;
    return { x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: COLORS[(Math.random() * COLORS.length) | 0], life: 1 };
  });

  let frame = 0;
  const tick = () => {
    frame++;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of ps) {
      p.vy += 0.32;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life -= 0.011;
      if (p.life <= 0 || p.y > window.innerHeight + 20) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0 && frame < 140) requestAnimationFrame(tick);
    else cv.remove();
  };
  requestAnimationFrame(tick);
}
