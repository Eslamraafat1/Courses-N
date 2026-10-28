"use client";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import "animate.css/source/_vars.css";
import "animate.css/source/_base.css";
import "animate.css/source/attention_seekers/pulse.css";
import "animate.css/source/attention_seekers/tada.css";
import "animate.css/source/attention_seekers/headShake.css";
import "animate.css/source/attention_seekers/swing.css";
import "animate.css/source/attention_seekers/heartBeat.css";
import type { Lang, SearchEntry } from "@/types";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/Overlays";
import { VideoProvider } from "@/components/video/VideoProvider";
import { SearchProvider } from "@/components/navigation/CommandPalette";
import { ScrollToTop } from "@/components/layout/ScrollUI";

const SmoothScroll = dynamic(() => import("@/components/animations/SmoothScroll").then((m) => m.SmoothScroll), { ssr: false });
const CursorFollower = dynamic(() => import("@/components/animations/CursorFollower").then((m) => m.CursorFollower), { ssr: false });

export function AppProviders({ lang, searchIndex, children }: { lang: Lang; searchIndex: SearchEntry[]; children: ReactNode }) {
  return (
    <I18nProvider lang={lang}>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <VideoProvider>
              <SearchProvider index={searchIndex}>
                <SmoothScroll />
                {children}
                <ScrollToTop />
                <CursorFollower />
              </SearchProvider>
            </VideoProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
