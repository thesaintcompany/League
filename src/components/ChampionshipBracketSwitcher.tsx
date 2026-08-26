"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ChampionshipSummary {
  id: string;
  name: string;
  sport: string;
  season?: string | null;
  shareCode?: string | null;
  county?: string | null;
  city?: string | null;
  scope?: string | null;
}

interface ChampionshipBracketSwitcherProps {
  currentChampionshipId?: string;
  currentChampionshipName?: string;
  currentCounty?: string | null;
  championships: ChampionshipSummary[];
}

export function ChampionshipBracketSwitcher({
  currentChampionshipId,
  currentChampionshipName,
  currentCounty,
  championships,
}: ChampionshipBracketSwitcherProps) {
  const router = useRouter();

  if (!championships || championships.length <= 1) return null;

  // Selected championship
  const active = championships.find((c) => c.id === currentChampionshipId) || championships[0];

  // Top 4 quick switch choices (excluding or highlighting current)
  const quickPills = championships.slice(0, 4);

  return (
    <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Active Championship Overview */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
            🏆
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase font-label tracking-widest text-slate-500 dark:text-slate-400">
                Arbore Meciuri &amp; Turneu
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Activ
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-black font-headline text-slate-900 dark:text-white truncate">
              {currentChampionshipName || active?.name}
              {currentCounty && (
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                  📍 {currentCounty}
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Right: Quick Switcher Dropdown & Spotlight Pills */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Quick Spotlight Pills (top 3-4) */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            {quickPills.map((c) => {
              const isSelected = c.id === currentChampionshipId;
              return (
                <Link
                  key={c.id}
                  href={`/harta-campionat?id=${c.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-label font-bold transition-all truncate max-w-[140px] ${
                    isSelected
                      ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  title={`${c.name} (${c.county || "Național"})`}
                >
                  {c.county || c.city || c.name.split(" ")[0]}
                </Link>
              );
            })}
          </div>

          {/* Styled Combobox Dropdown */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <select
              value={currentChampionshipId || ""}
              onChange={(e) => router.push(`/harta-campionat?id=${e.target.value}`)}
              aria-label="Alege alt campionat"
              className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 pl-3.5 pr-9 py-2.5 rounded-2xl text-xs font-headline font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-950 dark:focus:border-lime-400 transition shadow-sm cursor-pointer"
            >
              {championships.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.county ? `• ${c.county}` : ""}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-lg">
              unfold_more
            </span>
          </div>

          {/* National Map Shortcut */}
          <Link
            href="/harta-romaniei"
            className="px-3.5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1 shrink-0 active:scale-95"
            title="Explorează toate campionatele pe harta interactivă"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">Harta RO</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
