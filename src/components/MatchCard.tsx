"use client";

import React from "react";

export interface MatchData {
  id: string;
  round?: number;
  scheduledAt?: string | Date;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  homeTeam: { id: string; name: string; shortName?: string; color?: string };
  awayTeam: { id: string; name: string; shortName?: string; color?: string };
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string;
  referee?: string;
}

interface MatchCardProps {
  match: MatchData;
  onEdit?: (match: MatchData) => void;
  isAdmin?: boolean;
}

export function MatchCard({ match, onEdit, isAdmin = false }: MatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const formattedDate = match.scheduledAt
    ? new Date(match.scheduledAt).toLocaleDateString("ro-RO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Programat";

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm transition-all duration-200 border ${
        isLive
          ? "bg-slate-900 text-white border-lime-500 ring-2 ring-lime-500/20"
          : "bg-surface-container-lowest dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:shadow-md"
      }`}
    >
      {/* Match Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-label font-bold uppercase tracking-widest ${
              isLive ? "text-lime-400" : "text-slate-400"
            }`}
          >
            Etapa {match.round || 1} • {formattedDate}
          </span>
        </div>

        {/* Status Badge */}
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-extrabold font-label uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
            LIVE
          </span>
        ) : isFinished ? (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold font-label uppercase">
            Finalizat
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold font-label uppercase">
            Programat
          </span>
        )}
      </div>

      {/* Teams and Scoreboard */}
      <div className="grid grid-cols-7 items-center gap-2 py-2">
        {/* Home Team */}
        <div className="col-span-3 text-center flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm mb-2 border border-black/10"
            style={{ backgroundColor: match.homeTeam.color || "#1e293b" }}
          >
            {match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase()}
          </div>
          <p
            className={`text-xs font-bold font-headline truncate max-w-full ${
              isLive ? "text-white" : "text-blue-950 dark:text-white"
            }`}
            title={match.homeTeam.name}
          >
            {match.homeTeam.name}
          </p>
        </div>

        {/* Score / VS Center */}
        <div className="col-span-1 text-center">
          {isLive || isFinished ? (
            <div className="flex items-center justify-center gap-1">
              <span
                className={`text-2xl font-black data-font ${
                  isLive ? "text-lime-400" : "text-blue-950 dark:text-white"
                }`}
              >
                {match.homeScore ?? 0}
              </span>
              <span className="text-slate-400 font-bold text-sm">:</span>
              <span
                className={`text-2xl font-black data-font ${
                  isLive ? "text-lime-400" : "text-blue-950 dark:text-white"
                }`}
              >
                {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 text-center flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm mb-2 border border-black/10"
            style={{ backgroundColor: match.awayTeam.color || "#047857" }}
          >
            {match.awayTeam.shortName || match.awayTeam.name.substring(0, 3).toUpperCase()}
          </div>
          <p
            className={`text-xs font-bold font-headline truncate max-w-full ${
              isLive ? "text-white" : "text-blue-950 dark:text-white"
            }`}
            title={match.awayTeam.name}
          >
            {match.awayTeam.name}
          </p>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="material-symbols-outlined text-[15px]">stadium</span>
          <span className="truncate">{match.venue || "Stadion Central"}</span>
        </div>

        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(match)}
            className="flex items-center gap-1 font-label font-bold text-xs text-blue-950 dark:text-lime-400 hover:underline shrink-0 pl-2"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            Arbitraj / Scor
          </button>
        )}
      </div>
    </div>
  );
}
