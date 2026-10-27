"use client";
import { useId, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/* Lightweight SVG/CSS charts. Colours come from theme tokens; every value is also available as text. */

export interface Point {
  label: string;
  value: number;
}

/** Area/line chart with hover + keyboard (arrow keys) value read-out and a screen-reader data table. */
export function AreaChart({ data, ariaLabel, unit }: { data: Point[]; ariaLabel: string; unit: string }) {
  const { n } = useI18n();
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 240;
  const pad = { l: 8, r: 8, t: 16, b: 28 };
  const max = Math.max(...data.map((d) => d.value));
  const top = Math.ceil((max * 1.1) / 100) * 100;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 0.5, 1].map((f) => Math.round(top * f));
  const active = hover ?? data.length - 1;

  return (
    <figure className="m-0">
      <div className="mb-3 flex items-baseline gap-2" aria-live="polite">
        <span className="font-display text-2xl font-bold tabular-nums">{n(data[active].value)}</span>
        <span className="text-sm text-muted">
          {unit} · {data[active].label}
        </span>
      </div>
      <div
        className="relative"
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const dir = (e.key === "ArrowRight" ? 1 : -1) * (document.dir === "rtl" ? -1 : 1);
            setHover((h) => Math.min(data.length - 1, Math.max(0, (h ?? data.length - 1) + dir)));
          } else if (e.key === "Escape") setHover(null);
        }}
        onBlur={() => setHover(null)}
        style={{ direction: "ltr" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={pad.l} x2={W - pad.r} y1={y(tk)} y2={y(tk)} stroke="var(--line)" strokeDasharray={tk === 0 ? undefined : "3 4"} />
              <text x={pad.l + 2} y={y(tk) - 4} fontSize="10" fill="var(--muted)">
                {n(tk)}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#${uid}-g)`} />
          <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {data.map((d, i) => (
            <g key={d.label}>
              {(i % 2 === 0 || data.length < 8) && (
                <text x={x(i)} y={H - 8} fontSize="10" textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fill="var(--muted)">
                  {d.label}
                </text>
              )}
              <rect x={x(i) - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onPointerEnter={() => setHover(i)} onPointerMove={() => setHover(i)} />
            </g>
          ))}
          <line x1={x(active)} x2={x(active)} y1={pad.t} y2={H - pad.b} stroke="var(--accent)" strokeOpacity="0.35" />
          <circle cx={x(active)} cy={y(data[active].value)} r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.5" />
        </svg>
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{n(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export interface Slice {
  label: string;
  value: number;
  color: string;
}

/** Donut + labelled legend (values shown as text, so colour is never the only channel). */
export function DonutChart({ data, ariaLabel, totalLabel }: { data: Slice[]; ariaLabel: string; totalLabel: string }) {
  const { n } = useI18n();
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 52;
  const C = 2 * Math.PI * R;
  const offsets = data.map((_, i) => data.slice(0, i).reduce((s, d) => s + (d.value / total) * C, 0));
  return (
    <figure className="m-0 flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90" role="img" aria-label={ariaLabel}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--bg-2)" strokeWidth="18" />
        {data.map((d, i) => {
          const len = Math.max(0, (d.value / total) * C - 2);
          return (
            <circle key={d.label} cx="70" cy="70" r={R} fill="none" stroke={d.color} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offsets[i]}>
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
        })}
        <g className="rotate-90" style={{ transformOrigin: "70px 70px" }}>
          <text x="70" y="68" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">
            {n(total)}
          </text>
          <text x="70" y="85" textAnchor="middle" fontSize="9" fill="var(--muted)">
            {totalLabel}
          </text>
        </g>
      </svg>
      <ul className="grid min-w-40 flex-1 gap-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate">{d.label}</span>
            <span className="tabular-nums text-muted">
              {n(d.value)} · {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface BarItem {
  id: string;
  label: string;
  value: number;
  sub?: string;
}

/** Ranked horizontal bars (top courses). */
export function BarList({ items, format, className }: { items: BarItem[]; format: (v: number) => string; className?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ol className={cn("grid gap-3", className)}>
      {items.map((it, i) => (
        <li key={it.id}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">
              <span className="me-2 text-muted tabular-nums">{i + 1}.</span>
              {it.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{format(it.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg2" role="presentation">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          {it.sub && <p className="mt-1 text-xs text-muted">{it.sub}</p>}
        </li>
      ))}
    </ol>
  );
}
