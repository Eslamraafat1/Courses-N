"use client";
import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Link } from "./Link";

type Variant = "primary" | "dark" | "outline" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]";
const variants: Record<Variant, string> = {
  primary: "bg-volt text-volt-ink hover:brightness-95 shadow-[0_6px_24px_-8px_color-mix(in_srgb,var(--volt)_80%,transparent)]",
  dark: "bg-ink text-bg hover:opacity-90",
  accent: "bg-accent text-accent-ink hover:brightness-110",
  outline: "border border-line bg-transparent text-ink hover:border-ink hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-ink/8",
};
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-6 text-[0.95rem]",
  lg: "min-h-14 px-8 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** render as a locale-aware link */
  href?: string;
  /** cursor-follow micro-interaction (desktop with fine pointer only) */
  magnetic?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, href, magnetic, icon, iconEnd, className, children, disabled, ...rest },
  _ref,
) {
  void _ref;
  const wrap = useRef<HTMLSpanElement>(null);
  const cls = cn(base, variants[variant], sizes[size], className);

  useEffect(() => {
    const el = wrap.current;
    if (!magnetic || !el) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.28);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [magnetic]);

  const inner = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconEnd}
    </>
  );

  const node = href ? (
    <Link href={href} className={cls} aria-disabled={disabled || undefined} onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement> | undefined}>
      {inner}
    </Link>
  ) : (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={cls}>
      {inner}
    </button>
  );

  return magnetic ? (
    <span ref={wrap} className="inline-block will-change-transform">
      {node}
    </span>
  ) : (
    node
  );
});
