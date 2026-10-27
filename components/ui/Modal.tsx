"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scroll";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** accessible name */
  label: string;
  children: ReactNode;
  /** "center" modal, or a sheet docked to a side/bottom */
  variant?: "center" | "bottom" | "start" | "end" | "cinema" | "top";
  className?: string;
  hideClose?: boolean;
}

const variants: Record<NonNullable<ModalProps["variant"]>, string> = {
  center: "m-auto w-[min(92vw,34rem)] max-h-[88dvh] rounded-3xl",
  cinema: "m-auto w-[min(96vw,calc((100dvh-6rem)*1.7778),72rem)] max-h-[96dvh] rounded-2xl sm:rounded-3xl bg-black",
  top: "mx-auto mt-[10dvh] mb-auto w-[min(94vw,40rem)] max-h-[80dvh] rounded-3xl",
  bottom: "mt-auto mb-0 mx-0 w-full max-w-none max-h-[88dvh] rounded-t-3xl rounded-b-none safe-b nx-sheet-bottom",
  start: "ms-0 me-auto my-0 h-dvh max-h-none w-[min(88vw,24rem)] rounded-none nx-sheet-start",
  end: "me-0 ms-auto my-0 h-dvh max-h-none w-[min(88vw,24rem)] rounded-none nx-sheet-end",
};

/**
 * Accessible modal built on the native <dialog>:
 * focus trap, Esc to close, inert background and focus restoration to the opener come from the platform.
 * We add scroll locking, backdrop click and a close button.
 */
export function Modal({ open, onClose, label, children, variant = "center", className, hideClose }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      lockScroll();
      return () => {
        unlockScroll();
        if (d.open) d.close();
      };
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => onCloseRef.current();
    d.addEventListener("close", handleClose);
    return () => d.removeEventListener("close", handleClose);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className={cn(
        "nx-dialog fixed inset-0 overflow-hidden border border-line bg-surface p-0 text-ink shadow-[var(--shadow)] backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        variants[variant],
        className,
      )}
    >
      {open && (
        <div className="relative flex max-h-[inherit] min-h-0 w-full flex-col">
          {!hideClose && (
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label={t("act.close")}
              className="absolute end-3 top-3 z-20 grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
            >
              <X className="size-5" aria-hidden />
            </button>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
