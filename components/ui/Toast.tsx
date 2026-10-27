"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: Kind;
  title: string;
  body?: string;
}
interface ToastApi {
  toast: (t: { kind?: Kind; title: string; body?: string; duration?: number }) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
}
const Ctx = createContext<ToastApi | null>(null);

const icons = { success: CheckCircle2, error: AlertTriangle, info: Info } as const;
const tone = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-coral",
  info: "text-accent",
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setItems((p) => p.filter((x) => x.id !== id)), []);

  const toast = useCallback<ToastApi["toast"]>(
    ({ kind = "info", title, body, duration = 4200 }) => {
      const id = ++idRef.current;
      setItems((p) => [...p.slice(-3), { id, kind, title, body }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (title, body) => toast({ kind: "success", title, body }),
      error: (title, body) => toast({ kind: "error", title, body, duration: 6000 }),
      info: (title, body) => toast({ kind: "info", title, body }),
    }),
    [toast],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label={t("toast.region")}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:ps-6 sm:pe-6"
      >
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const Icon = icons[it.kind];
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                role={it.kind === "error" ? "alert" : "status"}
                className="card pointer-events-auto flex w-full max-w-sm items-start gap-3 p-4"
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", tone[it.kind])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{it.title}</p>
                  {it.body && <p className="mt-0.5 text-sm text-muted">{it.body}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(it.id)}
                  aria-label={t("toast.close")}
                  className="-m-1.5 grid size-9 place-items-center rounded-full text-muted hover:bg-bg2 hover:text-ink"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used inside <ToastProvider>");
  return v;
}
