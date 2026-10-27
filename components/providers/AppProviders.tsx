"use client";
import type { ReactNode } from "react";
import "animate.css/animate.min.css";
import type { Lang, SearchEntry } from "@/types";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/Overlays";
import { VideoProvider } from "@/components/video/VideoProvider";
import { SearchProvider } from "@/components/navigation/CommandPalette";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { ScrollToTop } from "@/components/layout/ScrollUI";

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
              </SearchProvider>
            </VideoProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
