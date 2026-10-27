"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/providers/I18nProvider";
import type { TKey } from "@/lib/i18n";

const DAYS: TKey[] = ["dash.day.mon", "dash.day.tue", "dash.day.wed", "dash.day.thu", "dash.day.fri", "dash.day.sat", "dash.day.sun"];

/**
 * Weekly activity: lightweight SVG bar chart. The graphic is `role="img"` with a text summary and the same
 * numbers are available in a visually-hidden table. Colour is never the only carrier (values are printed).
 */
export function WeeklyChart({ data, dailyTarget }: { data: number[]; dailyTarget?: number }) {
  const { t, n, isRtl } = useI18n();
  const reduce = useReducedMotion();
  const W = 420;
  const H = 190;
  const padTop = 24;
  const baseY = H - 28;
  const chartH = baseY - padTop;
  const max = Math.max(...data, dailyTarget ?? 0, 1) * 1.1;
  const slot = W / data.length;
  const barW = Math.min(34, slot * 0.58);
  const bestIdx = data.indexOf(Math.max(...data));
  const total = data.reduce((a, b) => a + b, 0);
  const summary = `${t("dash.activity.total", { n: n(total) })}. ${t("dash.activity.best", { day: t(DAYS[bestIdx]) })} (${n(data[bestIdx])}).`;
  const targetY = dailyTarget ? baseY - (dailyTarget / max) * chartH : null;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("dash.activity.chart", { summary })} className="h-auto w-full overflow-visible text-accent">
        {/* gridlines */}
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={baseY - chartH * f} y2={baseY - chartH * f} stroke="currentColor" className="text-ink" strokeOpacity="0.08" />
        ))}
        <line x1="0" x2={W} y1={baseY} y2={baseY} stroke="currentColor" className="text-ink" strokeOpacity="0.25" />
        {targetY !== null && (
          <g>
            <line x1="0" x2={W} y1={targetY} y2={targetY} stroke="currentColor" className="text-coral" strokeWidth="1.5" strokeDasharray="5 5" />
            <text x={W} y={targetY - 5} textAnchor="end" className="fill-current text-coral" fontSize="10" fontWeight="600">
              {t("label.minutes", { n: n(dailyTarget!) })}
            </text>
          </g>
        )}
        {data.map((v, i) => {
          const h = Math.max(3, (v / max) * chartH);
          const x = (isRtl ? data.length - 1 - i : i) * slot + (slot - barW) / 2;
          const isBest = i === bestIdx;
          return (
            <g key={DAYS[i]}>
              <motion.rect
                x={x}
                width={barW}
                rx={8}
                fill="currentColor"
                fillOpacity={isBest ? 1 : 0.5}
                y={baseY - h}
                height={h}
                style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                initial={{ scaleY: reduce ? 1 : 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <text x={x + barW / 2} y={baseY - h - 7} textAnchor="middle" fontSize="11" fontWeight="700" className="fill-current text-ink">
                {n(v)}
              </text>
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" className="fill-current text-muted">
                {t(DAYS[i])}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
      <table className="sr-only">
        <caption>{t("dash.activity.table")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dash.activity.day")}</th>
            <th scope="col">{t("dash.activity.minutes")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((v, i) => (
            <tr key={DAYS[i]}>
              <th scope="row">{t(DAYS[i])}</th>
              <td>{n(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Circular goal meter. Percent is printed in the centre, so the ring is only decorative reinforcement. */
export function GoalRing({ value, label, caption }: { value: number; label: string; caption: string }) {
  const reduce = useReducedMotion();
  const { n } = useI18n();
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="relative grid size-40 shrink-0 place-items-center" role="img" aria-label={`${label}: ${caption}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="12" className="text-ink" strokeOpacity="0.1" />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-accent"
          initial={{ pathLength: reduce ? pct / 100 : 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-3xl font-bold ltr-run">{n(pct)}%</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
