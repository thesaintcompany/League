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
  played?: number;
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
  championshipId?: string;
  championshipCode?: string | null;
  championshipName?: string;
  sport?: string;
  season?: string;
  initialStandings?: TournamentTeamStanding[];
  matches?: any[];
}

export function TournamentPhasesView({
  championshipId,
  championshipCode,
  championshipName = "Clasament Platformă",
  sport = "fotbal",
  season = "2026",
  initialStandings = [],
  matches = [],
}: TournamentPhasesViewProps) {
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const bracketsHref = championshipId
    ? `/brackets?id=${encodeURIComponent(championshipId)}`
    : championshipCode
      ? `/brackets/${encodeURIComponent(championshipCode)}`
      : "/brackets";

  const mapHref = championshipId
    ? `/harta-campionat?id=${encodeURIComponent(championshipId)}`
    : "/harta-romaniei";

  // Check if multiple groups exist
  const groups = Array.from(
    new Set(initialStandings.map((s) => s.group).filter(Boolean) as string[])
  ).sort();

  const displayedStandings =
    activeGroup === "all"
      ? initialStandings
      : initialStandings.filter((s) => s.group === activeGroup);

  return (
    <div className="space-y-6 font-body">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <Link
          href="/clasamente"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition font-headline font-bold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Toate Campionatele &amp; Clasamentele</span>
        </Link>

        {championshipId && (
          <div className="flex items-center gap-2">
            <Link
              href={bracketsHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md shadow-lime-400/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">account_tree</span>
              <span>Deschide Tablou Brackets</span>
            </Link>
            <Link
              href={mapHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-800"
            >
              <span className="material-symbols-outlined text-base text-lime-400">map</span>
              <span>Harta</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main Championship Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/40 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                  {sport.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase border border-slate-700">
                  Sezon {season}
                </span>
                {championshipCode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-mono border border-slate-700">
                    Cod: #{championshipCode}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-headline font-black uppercase text-white tracking-tight">
                {championshipName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Clasament oficial omologat, statistici detaliate și tablou competițional în timp real.
              </p>
            </div>

            {/* Navigation Switcher Tabs (Clasament / Brackets / Harta) */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0 shadow-inner">
              <span className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>Clasament</span>
              </span>

              <Link
                href={bracketsHref}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-base">account_tree</span>
                <span>Tablou Brackets</span>
              </Link>

              <Link
                href={mapHref}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-base">map</span>
                <span>Hartă</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Group Selector (if tournament has multiple groups e.g. Grupa A / B) */}
      {groups.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-wider mr-1">
            Grupa:
          </span>
          <button
            type="button"
            onClick={() => setActiveGroup("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
              activeGroup === "all"
                ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Toate Grupele
          </button>
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGroup(g)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                activeGroup === g
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Grupa {g}
            </button>
          ))}
        </div>
      )}

      {/* Standings Table Card */}
      {displayedStandings.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-500">emoji_events</span>
          <p className="text-slate-400 text-sm font-label font-semibold">
            Nu sunt date de clasament disponibile pentru acest campionat.
          </p>
          <div className="pt-2">
            <Link
              href={bracketsHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase"
            >
              <span className="material-symbols-outlined text-sm">account_tree</span>
              <span>Vezi Tablou Meciuri</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-label text-[10px] uppercase tracking-widest border-b border-slate-800">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Echipă</th>
                  <th className="py-3.5 px-3 text-center font-bold" title="Meciuri Jucate">MJ</th>
                  <th className="py-3.5 px-3 text-center" title="Victorii">V</th>
                  <th className="py-3.5 px-3 text-center" title="Egaluri">E</th>
                  <th className="py-3.5 px-3 text-center" title="Înfrângeri">Î</th>
                  <th className="py-3.5 px-3 text-center hidden sm:table-cell" title="Goluri Marcate">GM</th>
                  <th className="py-3.5 px-3 text-center hidden sm:table-cell" title="Goluri Primite">GP</th>
                  <th className="py-3.5 px-3 text-center hidden md:table-cell" title="Golaveraj">G</th>
                  <th className="py-3.5 px-4 text-center font-black text-lime-400" title="Puncte">Pcte</th>
                  <th className="py-3.5 px-4 text-right">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-body">
                {displayedStandings.map((row, idx) => {
                  const played = row.played ?? (row.won + row.drawn + row.lost);
                  const goalDiff = row.goalDiff ?? (row.goalsFor - row.goalsAgainst);

                  return (
                    <tr
                      key={row.id || idx}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        idx === 0 ? "bg-lime-400/5" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                            idx === 0
                              ? "bg-amber-400 text-slate-950 shadow-sm"
                              : idx === 1
                                ? "bg-slate-300 text-slate-950 shadow-sm"
                                : idx === 2
                                  ? "bg-amber-700 text-white shadow-sm"
                                  : "text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      {/* Team Name + Logo */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/teams/${row.id}`}
                          className="flex items-center gap-3 group/team inline-flex"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden shadow-sm border border-slate-700 group-hover/team:border-lime-400 transition"
                            style={{
                              backgroundColor: row.color || "#1e293b",
                              color: getContrastTextColor(row.color || "#1e293b"),
                            }}
                          >
                            {row.logoUrl ? (
                              <img
                                src={row.logoUrl}
                                alt={row.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (row.shortName || row.name || "E").substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-headline font-bold text-xs sm:text-sm text-white group-hover/team:text-lime-400 transition-colors block">
                              {row.name}
                            </span>
                            {row.group && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Grupa {row.group}
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Stats */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-300">
                        {played}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                        {row.won}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                        {row.drawn}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                        {row.lost}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsFor}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsAgainst}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono hidden md:table-cell">
                        <span
                          className={`font-bold ${
                            goalDiff > 0
                              ? "text-emerald-400"
                              : goalDiff < 0
                                ? "text-rose-400"
                                : "text-slate-400"
                          }`}
                        >
                          {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-center font-headline font-black text-sm text-lime-400">
                        {row.points}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/teams/${row.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition inline-flex items-center gap-1"
                        >
                          <span>Echipă</span>
                          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom CTA Banner Linking to Brackets */}
      {championshipId && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-sm uppercase text-white">
                Vrei să vezi schema completă a meciurilor și faza eliminatorie?
              </h4>
              <p className="text-xs text-slate-400">
                Accesează tabloul interactiv Brackets pentru optimi, sferturi, semifinale și marea finală.
              </p>
            </div>
          </div>

          <Link
            href={bracketsHref}
            className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0 flex items-center gap-2 active:scale-95"
          >
            <span>Deschide Tablou Brackets</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      )}
    </div>
  );
}
