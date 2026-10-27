"use client";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, CornerDownLeft, FolderOpen, Globe, History, Moon, Route, Search, Sparkles, User, X } from "lucide-react";
import type { SearchEntry } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { useI18n } from "@/components/providers/I18nProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useRecentSearches } from "@/hooks/useLearning";
import { switchLangPath } from "@/lib/i18n/config";
import { normalize, cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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

interface Row {
  key: string;
  group: "recent" | "suggest" | "courses" | "instructors" | "pages" | "actions";
  label: string;
  sub?: string;
  image?: string;
  icon?: ReactNode;
  run: () => void;
}

export function SearchProvider({ index, children }: { index: SearchEntry[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const api = useMemo(() => ({ open: () => setOpen(true), close: () => setOpen(false) }), []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={api}>
      {children}
      <Palette open={open} onClose={() => setOpen(false)} index={index} />
    </Ctx.Provider>
  );
}

const SUGGESTIONS = ["React", "Python", "UI/UX", "AI", "SQL"];

function Palette({ open, onClose, index }: { open: boolean; onClose: () => void; index: SearchEntry[] }) {
  const { t, l, h, lang } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { toggle } = useTheme();
  const recent = useRecentSearches();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const go = useCallback(
    (path: string, term?: string) => {
      if (term) recent.push(term);
      onClose();
      router.push(path);
    },
    [recent, onClose, router],
  );

  const pages = useMemo(
    () => [
      { path: "/courses", label: t("nav.courses") },
      { path: "/categories", label: t("nav.categories") },
      { path: "/paths", label: t("nav.paths") },
      { path: "/instructors", label: t("nav.instructors") },
      { path: "/pricing", label: t("nav.pricing") },
      { path: "/blog", label: t("nav.blog") },
      { path: "/dashboard", label: t("nav.dashboard") },
      { path: "/wishlist", label: t("nav.wishlist") },
      { path: "/help", label: t("nav.help") },
      { path: "/about", label: t("nav.about") },
      { path: "/contact", label: t("nav.contact") },
      { path: "/become-instructor", label: t("nav2.teach") },
      { path: "/success-stories", label: t("nav2.stories") },
      { path: "/accessibility", label: t("nav2.accessibility") },
    ],
    [t],
  );

  const rows = useMemo<Row[]>(() => {
    const term = normalize(q);
    const out: Row[] = [];
    if (!term) {
      recent.list.forEach((r) => out.push({ key: `r-${r}`, group: "recent", label: r, icon: <History className="size-4" />, run: () => go(`${h("/search")}?q=${encodeURIComponent(r)}`, r) }));
      SUGGESTIONS.forEach((s) => out.push({ key: `s-${s}`, group: "suggest", label: s, icon: <Sparkles className="size-4" />, run: () => go(`${h("/search")}?q=${encodeURIComponent(s)}`, s) }));
    } else {
      const scored = index
        .map((e) => {
          const hay = normalize(`${e.title.ar} ${e.title.en} ${e.subtitle.ar} ${e.subtitle.en}`);
          const titleHit = normalize(`${e.title.ar} ${e.title.en}`).includes(term);
          return { e, score: titleHit ? 2 : hay.includes(term) ? 1 : 0 };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 9);
      scored.forEach(({ e }) => {
        const path = e.type === "course" ? `/courses/${e.slug}` : e.type === "instructor" ? `/instructors/${e.slug}` : e.type === "category" ? `/categories/${e.slug}` : `/paths/${e.slug}`;
        out.push({
          key: `${e.type}-${e.id}`,
          group: e.type === "course" ? "courses" : e.type === "instructor" ? "instructors" : "pages",
          label: l(e.title),
          sub: l(e.subtitle),
          image: e.type === "category" ? undefined : e.image,
          icon: e.type === "category" ? <FolderOpen className="size-4" /> : e.type === "path" ? <Route className="size-4" /> : <BookOpen className="size-4" />,
          run: () => go(h(path), q),
        });
      });
      pages
        .filter((p) => normalize(p.label).includes(term))
        .forEach((p) => out.push({ key: `p-${p.path}`, group: "pages", label: p.label, icon: <FolderOpen className="size-4" />, run: () => go(h(p.path)) }));
      if (normalize(t("search.toggleTheme")).includes(term) || "theme dark light مظهر".includes(term)) {
        out.push({ key: "a-theme", group: "actions", label: t("search.toggleTheme"), icon: <Moon className="size-4" />, run: () => { toggle(); onClose(); } });
      }
      if ("language لغة عربي english".includes(term)) {
        out.push({ key: "a-lang", group: "actions", label: t("search.switchLang"), icon: <Globe className="size-4" />, run: () => { document.cookie = `nx-lang=${lang === "ar" ? "en" : "ar"};path=/;max-age=31536000`; onClose(); router.push(switchLangPath(pathname, lang === "ar" ? "en" : "ar")); } });
      }
      out.push({ key: "all", group: "actions", label: t("search.seeAll", { q }), icon: <Search className="size-4" />, run: () => go(`${h("/search")}?q=${encodeURIComponent(q)}`, q) });
    }
    return out;
  }, [q, index, recent.list, pages, l, h, t, go, toggle, onClose, lang, pathname, router]);

  // reset on open
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQ("");
      setCursor(0);
    }
  }
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(rows.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + rows.length) % Math.max(rows.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      rows[cursor]?.run();
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${cursor}`)?.scrollIntoView({ block: "nearest" });
  }, [cursor, listId]);

  const groupLabel: Record<Row["group"], string> = {
    recent: t("search.recent"),
    suggest: t("search.suggestions"),
    courses: t("search.courses"),
    instructors: t("search.instructors"),
    pages: t("search.pages"),
    actions: t("search.actions"),
  };

  return (
    <Modal open={open} onClose={onClose} label={t("search.title")} variant="top" hideClose>
      <div onKeyDown={onKey} className="flex max-h-[80dvh] min-h-0 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${listId}-list`}
            aria-activedescendant={rows[cursor] ? `${listId}-${cursor}` : undefined}
            aria-label={t("act.search")}
            placeholder={t("act.searchPlaceholder")}
            className="min-h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button type="button" onClick={onClose} aria-label={t("act.close")} className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-bg2 hover:text-ink">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div id={`${listId}-list`} role="listbox" aria-label={t("search.title")} className="min-h-0 flex-1 overflow-y-auto p-2" data-lenis-prevent>
          {rows.length === 0 && <p className="px-4 py-10 text-center text-muted">{t("search.noMatch")}</p>}
          {rows.map((r, i) => {
            const showHead = i === 0 || rows[i - 1].group !== r.group;
            return (
              <div key={r.key}>
                {showHead && (
                  <div className="flex items-center justify-between px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-muted">
                    <span>{groupLabel[r.group]}</span>
                    {r.group === "recent" && (
                      <button type="button" className="font-medium normal-case underline" onClick={() => recent.clear()}>
                        {t("search.clearRecent")}
                      </button>
                    )}
                  </div>
                )}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseMove={() => setCursor(i)}
                  onClick={r.run}
                  className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2", i === cursor ? "bg-accent/12" : "")}
                >
                  {r.image ? (
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-bg2">
                      <Image src={r.image} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-bg2 text-muted">{r.icon ?? <User className="size-4" />}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.label}</span>
                    {r.sub && <span className="block truncate text-xs text-muted">{r.sub}</span>}
                  </span>
                  {i === cursor && <CornerDownLeft className="size-4 shrink-0 text-muted rtl-flip" aria-hidden />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden items-center justify-between border-t border-line px-4 py-2.5 text-xs text-muted sm:flex">
          <span>{t("search.hint")}</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono">{t("search.shortcut")}</kbd>
        </div>
      </div>
    </Modal>
  );
}
