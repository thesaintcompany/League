"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSportContext } from "@/context/SportContext";

interface SportSubHeaderProps {
  variant?: "default" | "dark";
}

export function SportSubHeader({ variant }: SportSubHeaderProps) {
  const pathname = usePathname();
  const {
    selectedSport,
    selectedCategory,
    currentSportMeta,
    availableSports,
    activeCategories,
    selectSport,
    selectCategory,
  } = useSportContext();

  const sportsScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const isDark = variant === "dark";
  const isMapPage = pathname === "/harta-romaniei";

  return (
    <div
      className={`border-b transition-colors duration-200 shadow-sm relative z-40 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800"
          : "bg-slate-100/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-1.5 sm:py-2 space-y-1.5">
        {/* Row 1: Sport Selection (Smooth Touch Carousel on Mobile / Flex on Desktop) */}
        {isMapPage ? (
          <div className="w-full flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-headline font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 shrink-0">
                Sport:
              </span>
            </div>

            {/* Smooth Horizontal Carousel Container */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <div
                ref={sportsScrollRef}
                className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-0.5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {availableSports.map((sport) => {
                  const isActive = selectedSport === sport.id;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => selectSport(sport.id)}
                      className={`px-2.5 py-1 rounded-xl font-headline text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 ${
                        isActive
                          ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm ring-1 ring-lime-400/50"
                          : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold border border-slate-300 dark:border-slate-700/60"
                      }`}
                    >
                      <span>{sport.icon}</span>
                      <span>{sport.shortName}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 dark:bg-slate-950 ml-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* On inner pages: locked contextual filter with change CTA */
          <div className="w-full flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 text-[10px] font-black uppercase font-label tracking-wider shadow-sm flex items-center gap-1 shrink-0">
                <span>{currentSportMeta.icon}</span>
                <span>{currentSportMeta.shortName}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline font-body">
                Filtrare activă • {currentSportMeta.shortName}
              </span>
            </div>

            <Link
              href="/harta-romaniei"
              className="px-2.5 py-1 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-lime-400 hover:bg-lime-400 hover:text-slate-950 text-[11px] font-headline font-bold uppercase tracking-wider transition border border-slate-300 dark:border-slate-700 flex items-center gap-1 shrink-0 shadow-sm"
              title="Mergi la Harta României pentru a schimba disciplina sportivă"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              <span>Schimbă</span>
            </Link>
          </div>
        )}

        {/* Row 2: Sub-Categories if available (Smooth Touch Carousel) */}
        {activeCategories && activeCategories.length > 1 && (
          <div className="w-full pt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2 min-w-0 animate-in fade-in">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Categorii:
              </span>
            </div>

            {/* Carousel of Categories */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <div
                ref={categoriesScrollRef}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-0.5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {activeCategories.map((cat) => {
                  const isCatActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 ${
                        isCatActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black shadow-sm ring-1 ring-lime-400/50"
                          : "bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
