"use client";
import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Mail, Send } from "lucide-react";
import { TiltCard } from "@/components/animations/Fx";
import { Stagger, StaggerItem } from "@/components/animations/Motion";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/ui/Toast";

export interface Channel {
  icon: ReactNode;
  label: string;
  value: string;
  /** sample e-mail address: gets a copy button */
  copy?: boolean;
}

/** Contact-channel cards: staggered entrance, 3D tilt, copy-to-clipboard for the sample address. */
export function ChannelCards({ channels, sample }: { channels: Channel[]; sample: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      toast.success(t("contact2.channel.copied"));
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error(t("act.copyFailed"));
    }
  };

  return (
    <Stagger className="grid gap-4">
      {channels.map((c) => (
        <StaggerItem key={c.label}>
          <TiltCard max={4}>
            <div className="card flex items-start gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-volt text-volt-ink">{c.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                  {c.label}
                  <span className="rounded-full border border-dashed border-ink/40 px-2 py-px text-[0.7rem] font-bold">{sample}</span>
                </p>
                <p className={`mt-0.5 break-words font-display text-lg font-bold ${c.copy ? "ltr-run" : ""}`}>{c.value}</p>
              </div>
              {c.copy && (
                <button
                  type="button"
                  onClick={() => copy(c.value)}
                  aria-label={t("contact2.channel.copy")}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-line transition hover:border-ink hover:bg-surface2"
                >
                  {copied === c.value ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                </button>
              )}
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** Decorative: two nodes trade envelopes along a dashed arc while rings pulse. Purely visual (aria-hidden). */
export function ContactVisual() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden dir="ltr" className="relative mx-auto aspect-[16/9] w-full max-w-md overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-accent/15 via-transparent to-volt/20">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute start-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40 rtl:translate-x-1/2"
          animate={reduce ? { scale: 1.6 + i * 0.5, opacity: 0.3 } : { scale: [0.6, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
        />
      ))}
      <svg viewBox="0 0 320 180" className="absolute inset-0 size-full" fill="none">
        <path d="M50 120 C110 20, 210 20, 270 120" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeDasharray="5 7" className="text-ink" />
      </svg>
      <span className="absolute bottom-[22%] start-[10%] grid size-12 place-items-center rounded-full bg-ink text-bg"><Send className="size-5" /></span>
      <span className="absolute bottom-[22%] end-[10%] grid size-12 place-items-center rounded-full bg-volt text-volt-ink"><Mail className="size-5" /></span>
      <motion.span
        className="absolute start-[14%] top-[58%] grid size-9 place-items-center rounded-xl bg-coral text-white shadow-lg"
        animate={reduce ? undefined : { x: [0, 200, 0], y: [0, -70, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mail className="size-4" />
      </motion.span>
    </div>
  );
}
