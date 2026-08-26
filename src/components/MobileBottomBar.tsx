"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export function MobileBottomBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Hide on dashboard or scanner paths where specialized controls exist
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/tickets/scanner")) {
    return null;
  }

  const navItems = [
    { href: "/campionat", label: "Campionat", icon: "emoji_events", match: "/campionat" },
    { href: "/brackets", label: "Zaruri", icon: "casino", match: "/brackets" },
    { href: "/harta-romaniei", label: "Harta RO", icon: "map", match: "/harta-romaniei" },
    { href: "/venues", label: "Arene", icon: "stadium", match: "/venues" },
    { href: "/referees", label: "Arbitri", icon: "sports", match: "/referees" },
    { href: "/players", label: "Jucători", icon: "person", match: "/players" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-colors duration-200 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.match && pathname?.startsWith(item.match));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-slate-950 dark:text-lime-400 font-bold scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-lime-400 text-slate-950 shadow-md font-bold"
                    : "bg-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <span className="text-[10px] font-label font-bold tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Quick Theme Switcher Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Schimbă modul Zi / Noapte"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-amber-500 dark:text-lime-400 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </div>
          <span className="text-[10px] font-label font-bold tracking-tight mt-0.5">
            {theme === "dark" ? "Zi" : "Noapte"}
          </span>
        </button>
      </div>
    </nav>
  );
}
