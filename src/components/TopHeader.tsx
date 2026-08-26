"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { appSignOut } from "@/lib/logout";
import { ThemeToggle } from "./ThemeToggle";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: "default" | "dark";
}

export function TopHeader({ title = "Championship Pro", subtitle, action, variant }: TopHeaderProps) {
  const { data: session } = useSession();
  const isDark = variant === "dark";

  function handleToggleSidebar() {
    window.dispatchEvent(new CustomEvent("toggle-dashboard-sidebar"));
  }

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl border-b flex justify-between items-center px-3 sm:px-6 lg:px-8 py-2 sm:py-3 min-h-16 sm:min-h-20 transition-colors duration-200 ${
        isDark
          ? "bg-slate-950/95 text-white border-slate-800/90 shadow-md"
          : "bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-white border-slate-200/60 dark:border-slate-800/60"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1 pr-2">
        {/* Mobile Hamburger Toggle for Dashboard Sidebar */}
        <button
          type="button"
          onClick={handleToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          aria-label="Deschide Meniu Panou"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="min-w-0 flex-1">
          <h1
            className={`text-sm sm:text-xl font-black italic tracking-tight uppercase leading-tight ${
              isDark ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`text-[10px] sm:text-xs font-label font-medium leading-normal mt-0.5 line-clamp-2 whitespace-normal ${
                isDark ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Live status ticker badge */}
        <div
          className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-label shrink-0 ${
            isDark
              ? "bg-lime-400/10 text-lime-400 border border-lime-400/30"
              : "bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 border border-lime-300/60 dark:border-lime-500/30"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          LIVE HUB
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {action}

        {/* Day / Night Toggle */}
        <ThemeToggle variant="compact" />

        <Link
          href="/harta-romaniei"
          className={`hidden sm:inline-flex text-xs font-label font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition ${isDark
              ? "text-slate-200 hover:text-white hover:bg-slate-800"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          Campionate ↗
        </Link>

        {session?.user ? (
          <div className={`flex items-center gap-2 pl-2 sm:pl-3 border-l ${isDark ? "border-slate-800" : "border-slate-200 dark:border-slate-800"}`}>
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
              title={`${session.user.name || session.user.email} (Profil)`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime-400 text-slate-950 font-black flex items-center justify-center text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
                {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : "U")}
              </div>
              <div className="hidden xl:block text-left pr-1 max-w-[130px]">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {session.user.name || "Utilizator"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  {session.user.email}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => appSignOut("/")}
              title="Deconectare / Logout"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm active:scale-95 border border-slate-200/80 dark:border-slate-700/60 hover:border-red-500"
              aria-label="Deconectare"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className={`text-xs font-headline font-bold uppercase px-3.5 py-2 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 shadow-md transition active:scale-95 flex items-center gap-1`}
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Autentificare</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
