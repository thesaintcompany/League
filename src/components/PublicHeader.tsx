"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";
import { SportSubHeader } from "./SportSubHeader";

interface PublicHeaderProps {
  currentTab?: "campionat" | "romania-map" | "brackets" | "venues" | "players" | "referees" | "teams";
  variant?: "default" | "dark";
}

export function PublicHeader({ currentTab, variant }: PublicHeaderProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCampionat = currentTab === "campionat" || pathname === "/campionat" || pathname === "/liga";
  const isRomaniaMap = currentTab === "romania-map" || pathname === "/harta-romaniei";
  const isBrackets = currentTab === "brackets" || pathname === "/brackets";
  const isVenues = currentTab === "venues" || pathname.startsWith("/venues");
  const isPlayers = currentTab === "players" || pathname.startsWith("/players");
  const isTeams = currentTab === "teams" || pathname.startsWith("/teams") || pathname.startsWith("/echipe");
  const isSanctiuni = pathname.startsWith("/sanctiuni");
  const isSignIn = pathname === "/signin" || pathname === "/signup";

  const navLinks = [
    { href: "/harta-romaniei", label: "Campionate", active: isRomaniaMap, icon: "map" },
    { href: "/campionat", label: "Clasament", active: isCampionat, icon: "emoji_events" },
    { href: "/brackets", label: "Meciuri", active: isBrackets, icon: "account_tree" },
    { href: "/teams", label: "Echipe", active: isTeams, icon: "groups" },
    { href: "/sanctiuni", label: "Sancțiuni", active: isSanctiuni, icon: "gavel" },
    { href: "/venues", label: "Arene", active: isVenues, icon: "stadium" },
    { href: "/players", label: "Golgheteri", active: isPlayers, icon: "directions_run" },
  ];

  const mobileBottomNav = [
    { href: "/harta-romaniei", label: "Harta", active: isRomaniaMap, icon: "map" },
    { href: "/campionat", label: "Clasament", active: isCampionat, icon: "emoji_events" },
    { href: "/brackets", label: "Meciuri", active: isBrackets, icon: "account_tree" },
    { href: "/sanctiuni", label: "Sancțiuni", active: isSanctiuni, icon: "gavel" },
    { href: "/signin", label: "Cont", active: isSignIn, icon: "account_circle" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b h-16 sm:h-20 px-3 sm:px-6 lg:px-12 flex justify-between items-center font-body transition-colors duration-200 shadow-sm ${
          isDark
            ? "bg-slate-950/95 text-white border-slate-800/90"
            : "bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800/80"
        }`}
      >
        {/* Left: Brand & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
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
            <span className="tracking-wide uppercase text-[10px]">2026</span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-inner">
          {navLinks.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-xl font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
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

        {/* Right: Theme Toggle & Login Link */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link
            href="/signin"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 text-xs font-headline font-black uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">login</span>
            <span>Login</span>
          </Link>
        </div>
      </header>

      {/* Sub Header for Sport Selection & Context Filter */}
      <SportSubHeader variant={variant} />

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
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
                  ✕
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
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
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
