"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface PublicHeaderProps {
  currentTab?: "campionat" | "romania-map" | "brackets" | "venues" | "players" | "referees";
  variant?: "default" | "dark";
}

export function PublicHeader({ currentTab, variant }: PublicHeaderProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  const isCampionat = currentTab === "campionat" || pathname === "/campionat" || pathname === "/liga";
  const isRomaniaMap = currentTab === "romania-map" || pathname === "/harta-romaniei";
  const isBrackets = currentTab === "brackets" || pathname === "/brackets" || pathname === "/harta-campionat" || pathname.startsWith("/harta-campionat");
  const isVenues = currentTab === "venues" || pathname.startsWith("/venues");
  const isPlayers = currentTab === "players" || pathname.startsWith("/players");
  const useReferees = currentTab === "referees" || pathname.startsWith("/referees");

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b h-20 px-4 sm:px-6 lg:px-12 flex justify-between items-center font-body transition-colors duration-200 shadow-md ${
      isDark
        ? "bg-slate-950/95 text-white border-slate-800/90"
        : "bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800/80"
    }`}>
      {/* Left: Brand & Badge & Navigation */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Brand Logo */}
        <Link href="/campionat" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className={`text-2xl font-black italic tracking-tight uppercase font-headline block leading-none ${isDark ? "text-white" : "text-slate-950 dark:text-white"}`}>
              Ligue
            </span>
            <span className={`text-[9px] font-label font-bold tracking-widest uppercase ${isDark ? "text-lime-400" : "text-slate-600 dark:text-lime-400"}`}>
              Pro România
            </span>
          </div>
        </Link>

        {/* Live Season Pulsing Pill */}
        <div className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-label ${
          isDark
            ? "bg-slate-900 text-lime-400 border border-lime-400/30"
            : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-lime-400 border border-slate-200 dark:border-lime-400/30"
        }`}>
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          SEZONUL 2025-2026 LIVE
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-label font-bold uppercase tracking-wider ml-4">
          <Link
            href="/campionat"
            className={`transition-all duration-200 py-1.5 border-b-2 ${
              isCampionat
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            Campionat
          </Link>
          <Link
            href="/harta-romaniei"
            className={`transition-all duration-200 py-1.5 flex items-center gap-1.5 border-b-2 ${
              isRomaniaMap
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            <span>🇷🇴</span> Naționale
          </Link>
          <Link
            href="/brackets"
            className={`transition-all duration-200 py-1.5 flex items-center gap-1.5 border-b-2 ${
              isBrackets
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            <span>🎲</span> Harta Zaruri
          </Link>
          <Link
            href="/venues"
            className={`transition-all duration-200 py-1.5 border-b-2 ${
              isVenues
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            Arene &amp; Stadioane
          </Link>
          <Link
            href="/players"
            className={`transition-all duration-200 py-1.5 border-b-2 ${
              isPlayers
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            Golgheteri
          </Link>
          <Link
            href="/referees"
            className={`transition-all duration-200 py-1.5 border-b-2 ${
              useReferees
                ? "text-lime-400 border-lime-400 font-black"
                : isDark
                  ? "text-slate-200 hover:text-white border-transparent"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-transparent"
            }`}
          >
            Corp Arbitri
          </Link>
        </nav>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Day / Night Theme Switcher */}
        <ThemeToggle variant="compact" />

        <Link
          href="/dashboard"
          className={`hidden sm:inline-flex px-3.5 py-2.5 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition border active:scale-95 ${
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border-slate-200 dark:border-white/15"
          }`}
        >
          Panou Organizator ↗
        </Link>
        <Link
          href="/"
          className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 text-xs font-headline font-black uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span className="hidden sm:inline">Portal Autentificare</span>
          <span className="sm:hidden">Cont</span>
        </Link>
      </div>
    </header>
  );
}
