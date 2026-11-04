import { ImageResponse } from "next/og";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Default Open Graph / Twitter card for every page that has no image of its own (course pages use the course thumbnail).
 * Text is Latin-only because the built-in OG font has no Arabic glyphs; the brand name is the same in both locales.
 */
export const alt = "NEXORA ACADEMY — cinematic bilingual learning platform (demo)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #07070d 0%, #1a1240 60%, #5233e8 100%)",
          color: "#f4f1e8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, letterSpacing: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: "#d4ff4a" }} />
          NEXORA ACADEMY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Learn like it&apos;s cinema.</div>
          <div style={{ fontSize: 34, color: "#c9c4f5" }}>Programming, design and AI courses · English &amp; Arabic (RTL)</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#d4ff4a" }}>courses-n.vercel.app</div>
      </div>
    ),
    size,
  );
}
