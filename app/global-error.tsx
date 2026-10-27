"use client";

/** Last-resort boundary (root layout itself failed). Intentionally dependency-free and bilingual. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#07070d", color: "#f3f0e8", textAlign: "center", padding: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem" }}>Something went wrong · حدث خطأ ما</h1>
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", minHeight: 48, padding: "0 28px", borderRadius: 999, border: 0, background: "#d4ff4a", color: "#0d0d16", fontWeight: 700, cursor: "pointer" }}
          >
            Try again · إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
