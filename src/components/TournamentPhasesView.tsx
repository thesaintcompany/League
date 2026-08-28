"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getContrastTextColor } from "@/lib/utils";

export interface TournamentTeamStanding {
  id: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  color?: string | null;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  won: number;
  drawn: number;
  lost: number;
  group?: string;
}

export interface TournamentPhaseMatch {
  id: string;
  homeTeam: { id: string; name: string; shortName?: string | null; logoUrl?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; logoUrl?: string | null; color?: string | null };
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
  group?: string;
  stage?: string;
  scheduledAt?: string;
}

interface TournamentPhasesViewProps {
  championshipName?: string;
  sport?: string;
  initialStandings?: TournamentTeamStanding[];
  matches?: any[];
}

export function TournamentPhasesView({
  championshipName = "Clasament Platformă",
  sport = "fotbal",
  initialStandings = [],
  matches = [],
}: TournamentPhasesViewProps) {
  const categories = [
    { id: "2026", label: "2026" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <span className="material-symbols-outlined text-2xl">emoji_events</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-headline uppercase text-white tracking-tight">
              {championshipName}
            </h1>
            <p className="text-[11px] font-mono text-slate-400">
              Turneu Oficial • 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-white">
          <span className="bg-sky-600 text-white px-3 py-1 rounded-full shadow-md">Clasament</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="px-4 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-sky-600 text-white shadow-md"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {initialStandings.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">emoji_events</span>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-label">
            Nu sunt date de clasament disponibile momentan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-label text-[11px] uppercase tracking-widest">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Echipă</th>
                <th className="px-3 py-3 text-center">MJ</th>
                <th className="px-3 py-3 text-center">V</th>
                <th className="px-3 py-3 text-center">E</th>
                <th className="px-3 py-3 text-center">Î</th>
                <th className="px-3 py-3 text-center">Pcte</th>
              </tr>
            </thead>
            <tbody>
              {initialStandings.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 font-bold text-sm text-slate-900 dark:text-white">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ backgroundColor: row.color || "#1e293b", color: getContrastTextColor(row.color || "#1e293b") }}
                      >
                        {(row.shortName || row.name || "E").substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm truncate text-slate-900 dark:text-white">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{row.played || 0}</td>
                  <td className="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{row.won || 0}</td>
                  <td className="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{row.drawn || 0}</td>
                  <td className="px-3 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{row.lost || 0}</td>
                  <td className="px-3 py-3 text-center font-black text-sm text-lime-600 dark:text-lime-400">{row.points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
