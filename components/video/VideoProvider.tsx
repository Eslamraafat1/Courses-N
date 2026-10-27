"use client";
import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface VideoRequest {
  url: string;
  title: string;
  subtitle?: string;
  poster?: string;
}

interface VideoApi {
  /** Open the cinematic video modal. Focus returns to the element that triggered it on close. */
  open: (req: VideoRequest) => void;
  close: () => void;
}

const Ctx = createContext<VideoApi | null>(null);
// The modal (and therefore every player) is only downloaded the first time a video is opened.
const VideoModal = lazy(() => import("./VideoModal"));

export function VideoProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<VideoRequest | null>(null);
  const [everOpened, setEverOpened] = useState(false);

  const open = useCallback((r: VideoRequest) => {
    setEverOpened(true);
    setReq(r);
  }, []);
  const close = useCallback(() => setReq(null), []);
  const api = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {everOpened && (
        <Suspense fallback={null}>
          <VideoModal request={req} onClose={close} />
        </Suspense>
      )}
    </Ctx.Provider>
  );
}

export function useVideo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVideo must be used inside <VideoProvider>");
  return v;
}
