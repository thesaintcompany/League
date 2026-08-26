"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  variant?: "compact" | "full" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "compact", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 border border-slate-300/40 dark:border-slate-700/50 animate-pulse ${className}`}
      />
    );
  }

  const isDark = theme === "dark";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Comută la Modul Luminos (Zi)" : "Comută la Modul Întunecat (Noapte)"}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold font-label transition-all duration-200 active:scale-95 ${
          isDark
            ? "bg-slate-900 text-amber-300 border border-slate-700 hover:bg-slate-800 shadow-md"
            : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
        } ${className}`}
      >
        <span className="text-base leading-none transition-transform duration-300 hover:rotate-12">{isDark ? "🌙" : "☀️"}</span>
        <span className="uppercase tracking-wider text-[11px]">
          {isDark ? "Mod Noapte" : "Mod Zi"}
        </span>
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isDark ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-lime-500 shadow-[0_0_8px_#84cc16]"
          }`}
        ></span>
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Comută tema"
        className={`relative flex items-center p-1 rounded-full w-14 h-7 transition-colors duration-300 active:scale-95 ${
          isDark ? "bg-slate-900 border border-slate-700" : "bg-slate-200 border border-slate-300"
        } ${className}`}
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] transform transition-all duration-300 ${
            isDark
              ? "translate-x-7 bg-amber-400 text-slate-950 shadow-md"
              : "translate-x-0 bg-white text-slate-800 shadow-sm"
          }`}
        >
          {isDark ? "🌙" : "☀️"}
        </div>
      </button>
    );
  }

  // Minimal gray button (default)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Comută la Modul Luminos" : "Comută la Modul Întunecat"}
      aria-label="Comută mod noapte / zi"
      className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 ${className}`}
    >
      <span className="text-sm leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span className="sr-only">{isDark ? "Mod Noapte" : "Mod Zi"}</span>
    </button>
  );
}
