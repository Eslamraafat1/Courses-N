"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, ChevronDown, Heart, LayoutDashboard, LogIn, Menu, Search, Settings, ShieldCheck, UserPlus, UserRound, X } from "lucide-react";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { DropdownMenu } from "@/components/ui/Overlays";
import { Modal } from "@/components/ui/Modal";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ScrollProgress } from "@/components/layout/ScrollUI";
import { useI18n } from "@/components/providers/I18nProvider";
import { useWishlist } from "@/hooks/useLearning";
import { useSearch } from "./CommandPalette";
import { LangSwitcher, ThemeToggle } from "./Controls";
import { cn } from "@/lib/utils";
import type { L } from "@/types";

export interface NavCategory {
  slug: string;
  name: L;
  icon: string;
  color: string;
}

export function Logo({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/" aria-label={`${t("brand.name")} — ${t("nav.home")}`} className={cn("group inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 transition-transform duration-700 group-hover:rotate-[360deg]" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity=".25" />
        <path d="M11 29V11l18 18V11" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="31" cy="9" r="3.4" className="fill-volt" />
      </svg>
      <span className="font-display text-[0.95rem] font-extrabold uppercase leading-none tracking-[0.12em] rtl:tracking-normal">
        Nexora<span className="block text-[0.6rem] font-semibold tracking-[0.34em] text-muted rtl:tracking-normal">ACADEMY</span>
      </span>
    </Link>
  );
}

export function Navbar({ categories }: { categories: NavCategory[] }) {
  const { t, l } = useI18n();
  const pathname = usePathname();
  const search = useSearch();
  const { list: wishlist } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const megaWrap = useRef<HTMLDivElement>(null);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMega(false);
    setMobile(false);
  }

  // glass background after 24px; hide while scrolling down (more room to read), reveal on any upward scroll
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const dy = y - last;
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 220);
        last = y;
      }
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!mega) return;
    const away = (e: PointerEvent) => !megaWrap.current?.contains(e.target as Node) && setMega(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [mega]);

  const links = [
    { href: "/paths", label: t("nav.paths") },
    { href: "/instructors", label: t("nav.instructors") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/blog", label: t("nav.blog") },
  ];
  const isActive = (href: string) => pathname.replace(/^\/(ar|en)/, "").startsWith(href);

  const userItems = [
    { id: "dash", label: t("nav.dashboard"), icon: <LayoutDashboard className="size-4" />, href: "/dashboard" },
    { id: "learn", label: t("nav.myLearning"), icon: <BookOpen className="size-4" />, href: "/dashboard/my-learning" },
    { id: "wish", label: t("nav.wishlist"), icon: <Heart className="size-4" />, href: "/wishlist" },
    { id: "notif", label: t("nav.notifications"), icon: <Bell className="size-4" />, href: "/notifications" },
    { id: "prof", label: t("nav.profile"), icon: <UserRound className="size-4" />, href: "/profile" },
    { id: "set", label: t("nav.settings"), icon: <Settings className="size-4" />, href: "/settings" },
    { id: "admin", label: t("nav.admin"), icon: <ShieldCheck className="size-4" />, href: "/admin", separatorBefore: true },
    { id: "login", label: t("nav.login"), icon: <LogIn className="size-4" />, href: "/login", separatorBefore: true },
    { id: "reg", label: t("nav.register"), icon: <UserPlus className="size-4" />, href: "/register" },
  ];

  return (
    <header
      className={cn(
        "theme-t sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter,transform] duration-300",
        hidden && !mega && !mobile && "-translate-y-full focus-within:translate-y-0",
        scrolled ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
      style={{ height: "var(--nav-h)" }}
    >
      <ScrollProgress />
      <div className="container-x flex h-full items-center gap-2 sm:gap-3">
        <Logo />

        <nav aria-label={t("nav.mainNav")} className="ms-6 hidden items-center gap-1 lg:flex">
          <div ref={megaWrap} className="relative" onMouseLeave={() => setMega(false)}>
            <button
              type="button"
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((m) => !m)}
              onMouseEnter={() => setMega(true)}
              className={cn("flex min-h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold hover:bg-ink/6", isActive("/courses") || isActive("/categories") ? "text-accent" : "")}
            >
              {t("nav.courses")} <ChevronDown className={cn("size-4 transition-transform", mega && "rotate-180")} aria-hidden />
            </button>
            <AnimatePresence>
              {mega && (
                <motion.div
                  id="mega-menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="card absolute start-0 top-full z-50 w-[46rem] max-w-[calc(100vw-3rem)] p-3"
                >
                  <div className="grid grid-cols-[1fr_14rem] gap-3">
                    <ul className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/categories/${c.slug}`} className="group flex min-h-14 items-center gap-3 rounded-2xl p-2.5 hover:bg-bg2">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white transition-transform group-hover:scale-110" style={{ background: c.color }}>
                              <DynamicIcon name={c.icon} className="size-5" />
                            </span>
                            <span className="text-sm font-semibold">{l(c.name)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col justify-between rounded-2xl bg-ink p-4 text-bg">
                      <div className="space-y-1 text-sm font-semibold">
                        <Link href="/courses" className="block rounded-lg px-2 py-2 hover:bg-bg/10">{t("nav.explore")}</Link>
                        <Link href="/courses/featured" className="block rounded-lg px-2 py-2 hover:bg-bg/10">{t("nav.featured")}</Link>
                        <Link href="/courses/trending" className="block rounded-lg px-2 py-2 hover:bg-bg/10">{t("nav.trending")}</Link>
                        <Link href="/courses/new" className="block rounded-lg px-2 py-2 hover:bg-bg/10">{t("nav.new")}</Link>
                      </div>
                      <Link href="/categories" className="mt-3 text-sm font-bold text-volt underline-offset-4 hover:underline">{t("nav.browseAll")} →</Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {links.map((x) => (
            <Link key={x.href} href={x.href} aria-current={isActive(x.href) ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-ink/6", isActive(x.href) && "text-accent")}>
              {x.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
          <button type="button" onClick={search.open} aria-label={t("act.search")} className="flex min-h-11 items-center gap-2 rounded-full border border-transparent px-3 text-sm text-muted transition-colors hover:border-line hover:bg-surface lg:border-line lg:bg-surface/60 lg:pe-2">
            <Search className="size-5 text-ink" aria-hidden />
            <span className="hidden lg:inline">{t("act.search")}</span>
            <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.7rem] lg:inline">{t("search.shortcut")}</kbd>
          </button>
          <LangSwitcher className="hidden w-auto gap-1.5 px-3 sm:flex" />
          <ThemeToggle />
          <Link href="/wishlist" aria-label={`${t("nav.wishlist")}${wishlist.length ? ` (${wishlist.length})` : ""}`} className="relative hidden size-11 place-items-center rounded-full hover:bg-surface sm:grid">
            <Heart className="size-5" aria-hidden />
            {wishlist.length > 0 && <span className="absolute end-1 top-1 grid min-w-4 place-items-center rounded-full bg-coral px-1 text-[0.65rem] font-bold leading-4 text-white">{wishlist.length}</span>}
          </Link>
          <div className="hidden lg:block">
            <DropdownMenu
              label={t("nav.account")}
              items={userItems}
              trigger={({ props }) => (
                <button type="button" aria-label={t("nav.account")} {...props} className="grid size-11 place-items-center rounded-full bg-ink text-bg transition hover:bg-accent hover:text-accent-ink">
                  <UserRound className="size-5" aria-hidden />
                </button>
              )}
            />
          </div>
          <Button href="/courses" size="sm" className="ms-2 hidden xl:inline-flex" magnetic>
            {t("nav.explore")}
          </Button>
          <button type="button" onClick={() => setMobile(true)} aria-label={t("nav.menu")} className="grid size-11 place-items-center rounded-full hover:bg-surface lg:hidden">
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      <Modal open={mobile} onClose={() => setMobile(false)} label={t("nav.menu")} variant="end" hideClose>
        <MobileMenu categories={categories} onClose={() => setMobile(false)} userItems={userItems} />
      </Modal>
    </header>
  );
}

function MobileMenu({ categories, onClose, userItems }: { categories: NavCategory[]; onClose: () => void; userItems: { id: string; label: string; icon: React.ReactNode; href: string }[] }) {
  const { t, l } = useI18n();
  const { list: wishlist } = useWishlist();
  const main = [
    { href: "/", label: t("nav.home") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/paths", label: t("nav.paths") },
    { href: "/instructors", label: t("nav.instructors") },
    { href: "/pricing", label: t("nav.pricing") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];
  return (
    <div className="flex h-dvh flex-col overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]" data-lenis-prevent>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3">
        <Logo />
        <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")} className="grid size-11 place-items-center rounded-full hover:bg-bg2">
          <X className="size-6" aria-hidden />
        </button>
      </div>
      <nav aria-label={t("nav.mainNav")} className="px-3 py-3">
        <ul>
          {main.map((x, i) => (
            <motion.li key={x.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
              <Link href={x.href} onClick={onClose} className="flex min-h-12 items-center rounded-xl px-3 font-display text-lg font-bold hover:bg-bg2">
                {x.label}
              </Link>
            </motion.li>
          ))}
        </ul>
        <p className="eyebrow mb-1 mt-5 px-3">{t("nav.categories")}</p>
        <ul className="grid grid-cols-2 gap-1">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`} onClick={onClose} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-bg2">
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {l(c.name)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow mb-1 mt-5 px-3">{t("nav.account")}</p>
        <ul className="grid grid-cols-2 gap-1">
          {userItems.map((u) => (
            <li key={u.id}>
              <Link href={u.href} onClick={onClose} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-bg2">
                {u.icon}
                {u.label}
                {u.id === "wish" && wishlist.length > 0 && <span className="ms-auto rounded-full bg-coral px-1.5 text-xs font-bold text-white">{wishlist.length}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-4 pt-4">
        <LangSwitcher withLabel className="border-line" />
        <ThemeToggle className="border-line" />
        <Button href="/register" onClick={onClose} size="sm">{t("nav.register")}</Button>
      </div>
    </div>
  );
}
