"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
      className={`sticky top-0 z-30 backdrop-blur-xl border-b flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 sm:h-20 transition-colors duration-200 ${
        isDark
          ? "bg-slate-950/95 text-white border-slate-800/90 shadow-md"
          : "bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-white border-slate-200/60 dark:border-slate-800/60"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile Hamburger Toggle for Dashboard Sidebar */}
        <button
          type="button"
          onClick={handleToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Deschide Meniu Panou"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="truncate">
          <h1
            className={`text-lg sm:text-xl font-black italic tracking-tight uppercase truncate ${
              isDark ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`text-[11px] sm:text-xs font-label font-medium truncate ${
                isDark ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Live status ticker badge */}
        <div
          className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-label ${
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
          className={`hidden sm:inline-flex text-xs font-label font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition ${
            isDark
              ? "text-slate-200 hover:text-white hover:bg-slate-800"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Vezi Campionate ↗
        </Link>

        {session ? (
          <Link
            href="/profile"
            className={`flex items-center gap-2.5 pl-2 sm:pl-3 border-l group ${
              isDark ? "border-slate-800" : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
              {session.user?.name ? session.user.name[0].toUpperCase() : "A"}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className={`text-xs font-label font-bold uppercase px-3 py-2 rounded-xl ${
                isDark
                  ? "text-slate-200 hover:bg-slate-800"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              Autentificare
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
