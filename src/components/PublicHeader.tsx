"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { appSignOut } from "@/lib/logout";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";
import { SportSubHeader } from "./SportSubHeader";
import { getCurrentSeasonYear } from "@/lib/season";

interface PublicHeaderProps {
  currentTab?: "clasamente" | "campionat" | "romania-map" | "brackets" | "venues" | "players" | "referees" | "teams";
  variant?: "default" | "dark";
  showSportSubHeader?: boolean;
}

export function PublicHeader({ currentTab, variant, showSportSubHeader }: PublicHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "";
  const isSuperAdminRole = role === "super_admin" || role === "superadmin";

  const targetDashboard =
    role === "referee"
      ? "/dashboard/referee"
      : role === "arena_owner"
        ? "/dashboard/arena"
        : role === "team_leader"
          ? "/dashboard/team"
          : isSuperAdminRole
            ? "/dashboard/admin"
            : "/dashboard";

  const isDark = variant === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  const isClasamente = currentTab === "clasamente" || pathname === "/clasamente" || currentTab === "campionat" || pathname === "/campionat" || pathname === "/liga";
  const isRomaniaMap = currentTab === "romania-map" || pathname === "/harta-romaniei";
  const isBrackets = currentTab === "brackets" || pathname === "/matches" || pathname === "/brackets";
  const isVenues = currentTab === "venues" || pathname.startsWith("/venues");
  const isPlayers = currentTab === "players" || pathname.startsWith("/players");
  const isTeams = currentTab === "teams" || pathname.startsWith("/teams") || pathname.startsWith("/echipe");
  const isSanctiuni = pathname.startsWith("/sanctiuni");
  const isSignIn = pathname === "/signin" || pathname === "/signup";
  const isDashboardOrProfile = pathname.startsWith("/dashboard") || pathname === "/profile";

  const isTeamOrManagerPage =
    pathname.startsWith("/teams") ||
    pathname.startsWith("/echipe") ||
    pathname.startsWith("/managers") ||
    currentTab === "teams";

  const shouldRenderSubHeader =
    showSportSubHeader !== undefined
      ? showSportSubHeader
      : !isTeamOrManagerPage &&
        !pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/profile") &&
        !pathname.startsWith("/signin") &&
        !pathname.startsWith("/signup") &&
        !pathname.startsWith("/confidentialitate") &&
        !pathname.startsWith("/termeni") &&
        !pathname.startsWith("/contact") &&
        !pathname.startsWith("/despre");

  const navLinks = [
    { href: "/harta-romaniei", label: "Campionate", active: isRomaniaMap, icon: "map" },
    { href: "/clasamente", label: "Clasament", active: isClasamente, icon: "emoji_events" },
    { href: "/matches", label: "Meciuri", active: isBrackets, icon: "account_tree" },
    { href: "/teams", label: "Echipe", active: isTeams, icon: "groups" },
    { href: "/sanctiuni", label: "Sancțiuni", active: isSanctiuni, icon: "gavel" },
    { href: "/venues", label: "Arene", active: isVenues, icon: "stadium" },
    { href: "/players", label: "Golgheteri", active: isPlayers, icon: "directions_run" },
  ];

  const mobileBottomNav = [
    { href: "/harta-romaniei", label: "Harta", active: isRomaniaMap, icon: "map" },
    { href: "/clasamente", label: "Clasament", active: isClasamente, icon: "emoji_events" },
    { href: "/matches", label: "Meciuri", active: isBrackets, icon: "account_tree" },
    { href: "/sanctiuni", label: "Sancțiuni", active: isSanctiuni, icon: "gavel" },
    {
      href: session?.user ? targetDashboard : "/signin",
      label: session?.user ? "Panou" : "Cont",
      active: session?.user ? isDashboardOrProfile : isSignIn,
      icon: "account_circle",
    },
  ];

  const [seasonYear, setSeasonYear] = useState<number>(getCurrentSeasonYear());

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data?.activeSeasonYear) {
          setSeasonYear(data.activeSeasonYear);
        }
      })
      .catch(() => {});

    function onSeasonUpdated(e: CustomEvent) {
      if (e.detail?.seasonYear) {
        setSeasonYear(e.detail.seasonYear);
      }
    }
    window.addEventListener("app-season-updated" as any, onSeasonUpdated);
    return () => window.removeEventListener("app-season-updated" as any, onSeasonUpdated);
  }, []);

  // Dynamic overlap collision detection: collapses to hamburger when elements would touch
  useEffect(() => {
    function checkOverlap() {
      if (!headerRef.current) return;
      const headerWidth = headerRef.current.offsetWidth;
      const leftWidth = leftRef.current?.offsetWidth || 240;
      const rightWidth = rightRef.current?.offsetWidth || 180;
      const navWidth = navRef.current?.scrollWidth || 620;

      // Safe buffer zone to prevent any overlap, text wrap or element squishing
      const totalNeeded = leftWidth + navWidth + rightWidth + 60;
      if (headerWidth < totalNeeded || window.innerWidth < 1200) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    }

    checkOverlap();
    window.addEventListener("resize", checkOverlap);
    return () => window.removeEventListener("resize", checkOverlap);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b h-16 sm:h-20 px-3 sm:px-6 lg:px-10 flex justify-between items-center font-body transition-colors duration-200 shadow-sm ${
          isDark
            ? "bg-slate-950/95 text-white border-slate-800/90"
            : "bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800/80"
        }`}
      >
        {/* Left: Brand & Hamburger Toggle */}
        <div ref={leftRef} className="flex items-center gap-2 sm:gap-6 min-w-0 shrink-0">
          {/* Automatic Hamburger Button when collapsed or on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 ${
              isCollapsed ? "flex" : "hidden"
            }`}
            aria-label="Deschide Meniu Navigare"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Brand Logo with Dynamic Active Logo from DB */}
          <BrandLogo size="md" href="/harta-romaniei" />

          {/* Live Season Pulsing Pill */}
          <div
            className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-label shrink-0 ${
              isDark
                ? "bg-slate-900 text-lime-400 border border-lime-400/30"
                : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-lime-400 border border-slate-200 dark:border-lime-400/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span className="tracking-wide uppercase text-[10px]">{seasonYear}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar (Auto hides if overlap detected) */}
        <nav
          ref={navRef}
          className={`items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-inner shrink-0 ${
            isCollapsed ? "hidden" : "hidden lg:flex"
          }`}
        >
          {navLinks.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3.5 xl:px-4 py-2 rounded-xl font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                tab.active
                  ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm scale-100"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Theme Toggle & Login / User Profile Controls */}
        <div ref={rightRef} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href={targetDashboard}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-lime-400/20 text-lime-700 dark:text-lime-400 font-headline font-bold text-xs uppercase tracking-wider hover:bg-lime-400/30 transition border border-lime-400/30"
              >
                Panou ↗
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                title={`${session.user.name || session.user.email} (Profil)`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime-400 text-slate-950 font-black flex items-center justify-center text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
                  {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : "U")}
                </div>
                <div className="hidden xl:block text-left pr-1 max-w-[120px]">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {session.user.name || "Utilizator"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => appSignOut("/")}
                title="Deconectare / Logout"
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm active:scale-95 border border-slate-200/80 dark:border-slate-700/60 hover:border-red-500"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">logout</span>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 text-xs font-headline font-black uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">login</span>
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Sub Header for Sport Selection & Context Filter (Hidden on Team & Manager Pages) */}
      {shouldRenderSubHeader && <SportSubHeader variant={variant} />}

      {/* Slide-Out Navigation Drawer (Shown whenever mobileMenuOpen is true) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <BrandLogo size="sm" href="/campionat" onClick={() => setMobileMenuOpen(false)} />

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined align-middle text-sm">close</span>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition ${
                      item.active
                        ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-sm font-black shadow shrink-0">
                      {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : "U")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-headline font-bold text-slate-900 dark:text-white truncate">
                        {session.user.name || "Utilizator"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                        {session.user.email}
                      </p>
                    </div>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={targetDashboard}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      <span>Panou</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        appSignOut("/");
                      }}
                      className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 font-headline font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-label font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                  >
                    <span>Panou</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </Link>
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Modern Mobile Bottom Navigation Bar (1-Thumb Ergonomics) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-bottom">
        {mobileBottomNav.map((btn) => {
          return (
            <Link
              key={btn.href}
              href={btn.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                btn.active
                  ? "text-lime-600 dark:text-lime-400 scale-105 font-black"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{btn.icon}</span>
              <span className="text-[10px] font-headline uppercase tracking-tight mt-0.5">
                {btn.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
