"use client";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Common {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
}

const control =
  "w-full rounded-2xl border bg-surface px-4 min-h-12 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60 aria-[invalid=true]:border-coral";

function Wrap({ id, label, error, hint, optionalLabel, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        {optionalLabel && <span className="font-normal text-muted">{optionalLabel}</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-coral">
          <span aria-hidden>●</span> {error}
        </p>
      )}
    </div>
  );
}

const ariaFor = (id: string, error?: string, hint?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Common>(function Input(
  { label, error, hint, optionalLabel, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} optionalLabel={optionalLabel}>
      <input ref={ref} id={fid} className={cn(control, error ? "border-coral" : "border-line", className)} {...ariaFor(fid, error, hint)} {...rest} />
    </Wrap>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Common>(function Textarea(
  { label, error, hint, optionalLabel, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} optionalLabel={optionalLabel}>
      <textarea ref={ref} id={fid} rows={5} className={cn(control, "py-3", error ? "border-coral" : "border-line", className)} {...ariaFor(fid, error, hint)} {...rest} />
    </Wrap>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & Common>(function Select(
  { label, error, hint, optionalLabel, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Wrap id={fid} label={label} error={error} hint={hint} optionalLabel={optionalLabel}>
      <select ref={ref} id={fid} className={cn(control, error ? "border-coral" : "border-line", className)} {...ariaFor(fid, error, hint)} {...rest}>
        {children}
      </select>
    </Wrap>
  );
});

/** Inline notice used by every form that has no backend yet (honest about what happened). */
export function NoBackendNotice({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="rounded-2xl border border-accent/30 bg-accent/8 p-4 text-sm">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-muted">{body}</p>
    </div>
  );
}
