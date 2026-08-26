"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSportContext, SportType } from "@/context/SportContext";

interface SportSubHeaderProps {
  variant?: "default" | "dark";
}

export function SportSubHeader({ variant }: SportSubHeaderProps) {
  const pathname = usePathname();
  const { selectedSport, currentSportMeta, availableSports, isSportLocked, selectSport } = useSportContext();

  const isDark = variant === "dark";
  const isMapPage = pathname === "/harta-romaniei";

  return (
    <div
      className={`border-b transition-colors duration-200 shadow-sm relative z-40 ${
        isDark
          ? "bg-slate-900/90 text-white border-slate-800"
          : "bg-slate-100/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-2 sm:py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* If on primary selection page (/harta-romaniei): full interactive selector */}
        {isMapPage ? (
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-headline font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Alege Disciplina:
              </span>
            </div>

            {/* Sport Pills List */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {availableSports.map((sport) => {
                const isActive = selectedSport === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => selectSport(sport.id)}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                      isActive
                        ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-md scale-105 ring-2 ring-lime-400/50"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold border border-slate-300 dark:border-slate-700/60"
                    }`}
                  >
                    <span>{sport.icon}</span>
                    <span className="truncate">{sport.shortName}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 dark:bg-slate-950 ml-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* If on inner pages (/campionat, /teams, etc.): locked contextual filter with change link */
          <div className="w-full flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 text-[10px] font-black uppercase font-label tracking-wider shadow-sm flex items-center gap-1 shrink-0">
                <span>{currentSportMeta.icon}</span>
                <span>{currentSportMeta.name}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline font-body">
                Filtrare automată activă • Sunt afișate exclusiv datele din {currentSportMeta.shortName}
              </span>
            </div>

            <Link
              href="/harta-romaniei"
              className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-lime-400 hover:bg-lime-400 hover:text-slate-950 text-[11px] font-headline font-bold uppercase tracking-wider transition border border-slate-300 dark:border-slate-700 flex items-center gap-1 shrink-0 shadow-sm"
              title="Mergi la Harta României pentru a schimba disciplina sportivă"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              <span className="hidden sm:inline">Schimbă Disciplina (Harta României)</span>
              <span className="sm:hidden">Schimbă Sport</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
