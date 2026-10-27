"use client";
import { useState } from "react";
import { Check, Heart, Link2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/providers/I18nProvider";
import { useWishlist } from "@/hooks/useLearning";
import { cn } from "@/lib/utils";

/** Heart toggle backed by localStorage (per-browser). Announces the change via toast + aria-pressed. */
export function WishlistButton({ slug, className, variant = "icon" }: { slug: string; className?: string; variant?: "icon" | "button" }) {
  const { t } = useI18n();
  const toast = useToast();
  const { has, toggle } = useWishlist();
  const on = has(slug);
  const click = () => {
    const added = toggle(slug);
    toast.success(added ? t("act.wishlistAdded") : t("act.wishlistRemoved"));
  };
  const label = on ? t("act.removeWishlist") : t("act.addWishlist");
  if (variant === "button") {
    return (
      <Button variant="outline" onClick={click} aria-pressed={on} className={className} icon={<Heart className={cn("size-4", on && "fill-coral text-coral")} aria-hidden />}>
        {label}
      </Button>
    );
  }
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={click}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn("grid size-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70", className)}
    >
      <Heart className={cn("size-5 transition", on && "fill-coral text-coral")} aria-hidden />
    </motion.button>
  );
}

/** Copy link + native share (when available). `path` is a locale-less app path. */
export function ShareButtons({ path, title, className }: { path: string; title: string; className?: string }) {
  const { t, h } = useI18n();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}${h(path)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      toast.success(t("act.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("act.copyFailed"));
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title, url: url() });
    } catch {
      /* user cancelled the share sheet */
    }
  };
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button variant="outline" size="sm" onClick={copy} icon={copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}>
        {copied ? t("act.copied") : t("act.copyLink")}
      </Button>
      {canShare && (
        <Button variant="outline" size="sm" onClick={share} icon={<Share2 className="size-4" aria-hidden />}>
          {t("act.share")}
        </Button>
      )}
    </div>
  );
}

export function PriceTag({ price, oldPrice, className }: { price: number; oldPrice?: number; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="ltr-run text-lg font-extrabold">{price === 0 ? t("label.free") : `$${price}`}</span>
      {oldPrice ? <del className="ltr-run text-sm text-muted">${oldPrice}</del> : null}
    </span>
  );
}
