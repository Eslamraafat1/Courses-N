"use client";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { switchLangPath } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const iconBtn =
  "relative grid size-11 shrink-0 place-items-center rounded-full border border-transparent text-ink transition-colors hover:border-line hover:bg-surface";

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" onClick={toggle} aria-label={t("act.toggleTheme")} aria-pressed={dark} title={dark ? t("theme.light") : t("theme.dark")} className={cn(iconBtn, className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={{ duration: 0.22 }} className="grid place-items-center">
          {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LangSwitcher({ className, withLabel }: { className?: string; withLabel?: boolean }) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const next = lang === "ar" ? "en" : "ar";

  const change = () => {
    try {
      document.cookie = `nx-lang=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* cookies blocked: URL still carries the language */
    }
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.push(`${switchLangPath(pathname, next)}${search}${hash}`);
  };

  return (
    <button type="button" onClick={change} lang={next} aria-label={`${t("act.switchTo")}: ${next === "ar" ? "العربية" : "English"}`} className={cn(iconBtn, withLabel && "w-auto gap-2 px-4", className)}>
      <Globe className="size-5" aria-hidden />
      <span className="text-sm font-bold">{next === "ar" ? "ع" : "EN"}</span>
    </button>
  );
}
