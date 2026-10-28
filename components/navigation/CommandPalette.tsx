"use client";
import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SearchEntry } from "@/types";

interface SearchApi {
  open: () => void;
  close: () => void;
}
const Ctx = createContext<SearchApi | null>(null);
export const useSearch = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSearch must be used inside <SearchProvider>");
  return v;
};

const Palette = lazy(() => import("./CommandPaletteModal"));

export function SearchProvider({ index, children }: { index: SearchEntry[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const api = useMemo(() => ({ open: () => { setEverOpened(true); setOpen(true); }, close: () => setOpen(false) }), []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEverOpened(true);
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={api}>
      {children}
      {everOpened && (
        <Suspense fallback={null}>
          <Palette open={open} onClose={() => setOpen(false)} index={index} />
        </Suspense>
      )}
    </Ctx.Provider>
  );
}
