"use client";

import React from "react";
import { getContrastTextColor } from "@/lib/utils";

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  shortName: string;
  color?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: ("W" | "D" | "L")[];
}

interface StandingsTableProps {
  standings: StandingRow[];
  title?: string;
}

export function StandingsTable({ standings, title = "Clasament General" }: StandingsTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800/60">
      <div className="px-6 py-5 border-b border-surface-container flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-6 bg-lime-500 rounded-full"></span>
          <h2 className="text-lg font-bold text-blue-950 dark:text-white font-headline">
            {title}
          </h2>
        </div>
        <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
          {standings.length} Echipe
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-label text-[11px] uppercase tracking-widest border-b border-slate-200/50 dark:border-slate-800/50">
              <th className="px-6 py-3.5 font-bold">Poz</th>
              <th className="px-4 py-3.5 font-bold">Echipă</th>
              <th className="px-3 py-3.5 font-bold text-center">MJ</th>
              <th className="px-3 py-3.5 font-bold text-center">V</th>
              <th className="px-3 py-3.5 font-bold text-center">E</th>
              <th className="px-3 py-3.5 font-bold text-center">Î</th>
              <th className="px-3 py-3.5 font-bold text-center hidden sm:table-cell">GM</th>
              <th className="px-3 py-3.5 font-bold text-center hidden sm:table-cell">GP</th>
              <th className="px-3 py-3.5 font-bold text-center">GD</th>
              <th className="px-6 py-3.5 font-bold text-right">Pcte</th>
              <th className="px-4 py-3.5 font-bold text-center hidden md:table-cell">Formă</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/60 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {standings.map((row, idx) => {
              const isTop3 = idx < 3;
              const isRelegation = idx >= standings.length - 2 && standings.length > 4;

              return (
                <tr
                  key={row.teamId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs data-font ${
                        idx === 0
                          ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                          : isTop3
                          ? "bg-slate-200 dark:bg-slate-800 text-blue-950 dark:text-lime-300"
                          : isRelegation
                          ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {String(row.position || idx + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: row.color || "#1e293b", color: getContrastTextColor(row.color || "#1e293b") }}
                      >
                        {row.shortName || row.teamName.substring(0, 3).toUpperCase()}
                      </div>
                      <span className="font-bold text-blue-950 dark:text-white text-sm font-headline truncate">
                        {row.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-700 dark:text-slate-300">
                    {row.played}
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-700 dark:text-slate-300">
                    {row.won}
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-700 dark:text-slate-300">
                    {row.drawn}
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-700 dark:text-slate-300">
                    {row.lost}
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-500 hidden sm:table-cell">
                    {row.goalsFor}
                  </td>
                  <td className="px-3 py-4 text-center font-medium data-font text-sm text-slate-500 hidden sm:table-cell">
                    {row.goalsAgainst}
                  </td>
                  <td
                    className={`px-3 py-4 text-center font-bold data-font text-sm ${
                      row.goalDiff > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : row.goalDiff < 0
                        ? "text-rose-500"
                        : "text-slate-400"
                    }`}
                  >
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-blue-950 dark:text-lime-400 text-base data-font">
                    {row.points}
                  </td>
                  <td className="px-4 py-4 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      {(row.form || ["W", "W", "D", "W", "L"]).slice(-5).map((res, i) => (
                        <span
                          key={i}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                            res === "W"
                              ? "bg-emerald-500"
                              : res === "D"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          title={res === "W" ? "Victorie" : res === "D" ? "Egal" : "Înfrângere"}
                        >
                          {res === "W" ? "V" : res === "D" ? "E" : "Î"}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
