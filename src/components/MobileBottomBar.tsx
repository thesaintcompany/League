"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomBar() {
  const pathname = usePathname();

  // Hide on dashboard or scanner paths where specialized controls exist
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/tickets/scanner")) {
    return null;
  }

  const navItems = [
    { href: "/clasamente", label: "Clasament", icon: "emoji_events", match: "/clasamente" },
    { href: "/harta-romaniei", label: "Harta RO", icon: "map", match: "/harta-romaniei" },
    { href: "/brackets", label: "Tablou", icon: "account_tree", match: "/brackets" },
    { href: "/teams", label: "Echipe", icon: "groups", match: "/teams" },
    { href: "/venues", label: "Arene", icon: "stadium", match: "/venues" },
  ];

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] transition-colors duration-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.match && pathname?.startsWith(item.match));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 flex-1 ${
                isActive
                  ? "text-slate-950 dark:text-lime-400 font-black scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-lime-400 text-slate-950 shadow-md ring-2 ring-lime-400/30"
                    : "bg-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              </div>
              <span className="text-[9px] font-label font-bold tracking-tight mt-1 leading-none truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
