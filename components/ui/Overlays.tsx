"use client";
import {
  Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
  type KeyboardEvent, type ReactElement, type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Link } from "./Link";

/* ---------------- Tooltip (hover + focus, Esc to dismiss) ---------------- */
export function Tooltip({ label, children, side = "top" }: { label: string; children: ReactElement<{ "aria-describedby"?: string }>; side?: "top" | "bottom" }) {
  const [show, setShow] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!show) return;
    const h = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setShow(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [show]);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {isValidElement(children) ? cloneElement(children, { "aria-describedby": show ? id : undefined }) : children}
      <AnimatePresence>
        {show && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "pointer-events-none absolute start-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-bg rtl:translate-x-1/2",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ---------------- Dropdown menu (arrow keys, Esc, outside click) ---------------- */
export interface MenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

export function DropdownMenu({ trigger, items, label, align = "end", className }: { trigger: (p: { open: boolean; props: Record<string, unknown> }) => ReactNode; items: MenuItem[]; label: string; align?: "start" | "end"; className?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    listRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    const els = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      wrap.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(i + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(i - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") els[0]?.focus();
    else if (e.key === "End") els[els.length - 1]?.focus();
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={wrap} className={cn("relative", className)} onKeyDown={onKey}>
      {trigger({
        open,
        props: {
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": open ? id : undefined,
          onClick: () => setOpen((o) => !o),
        },
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={id}
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={cn("card absolute top-full z-50 mt-2 min-w-52 overflow-hidden p-1.5", align === "end" ? "end-0" : "start-0")}
          >
            {items.map((it) => {
              const cls = cn(
                "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start text-sm font-medium transition-colors hover:bg-bg2 focus-visible:bg-bg2",
                it.danger && "text-coral",
              );
              return (
                <div key={it.id}>
                  {it.separatorBefore && <div className="my-1 h-px bg-line" role="separator" />}
                  {it.href ? (
                    <Link role="menuitem" href={it.href} className={cls} onClick={() => setOpen(false)}>
                      {it.icon}
                      {it.label}
                    </Link>
                  ) : (
                    <button
                      role="menuitem"
                      type="button"
                      className={cls}
                      onClick={() => {
                        setOpen(false);
                        it.onSelect?.();
                      }}
                    >
                      {it.icon}
                      {it.label}
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Confirmation dialog (promise based) ---------------- */
interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
}
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>;
const ConfirmCtx = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => new Promise((resolve) => setState({ ...o, resolve })), []);
  const settle = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      <Modal open={!!state} onClose={() => state && settle(false)} label={state?.title ?? ""} hideClose>
        {state && (
          <div className="p-6 sm:p-8" role="alertdialog" aria-describedby="nx-confirm-body">
            <h2 className="font-display text-xl font-bold">{state.title}</h2>
            {state.body && (
              <p id="nx-confirm-body" className="mt-2 text-muted">
                {state.body}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={() => settle(false)}>
                {t("act.cancel")}
              </Button>
              <Button variant={state.danger ? "dark" : "primary"} className={state.danger ? "!bg-coral !text-white" : ""} onClick={() => settle(true)}>
                {state.confirmLabel ?? t("act.confirm")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const v = useContext(ConfirmCtx);
  if (!v) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return v;
}

/* convenience: count children helper used by a few layouts */
export const countChildren = (c: ReactNode) => Children.count(c);
