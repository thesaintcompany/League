"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getContrastTextColor } from "@/lib/utils";

export interface StandingTeam {
  position: number;
  teamId: string;
  teamName: string;
  shortName?: string;
  color?: string;
  logoUrl?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: string[];
}

export interface MatchItem {
  id: string;
  round: number;
  stage: string;
  scheduledAt: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
  venue?: string;
  homeTeam: { id: string; name: string; shortName?: string; color?: string; logoUrl?: string | null };
  awayTeam: { id: string; name: string; shortName?: string; color?: string; logoUrl?: string | null };
}

export interface TopScorerItem {
  id: string;
  name: string;
  number?: number | null;
  teamName: string;
  teamColor?: string;
  teamLogo?: string | null;
  goals: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  photoUrl?: string | null;
}

export interface ChampionshipSummary {
  id: string;
  name: string;
  sport: string;
  season: string;
  format: string;
  teamsCount: number;
  county?: string | null;
}

interface PublicStandingsViewProps {
  currentChampionship: {
    id: string;
    name: string;
    sport: string;
    season: string;
    scope?: string;
    county?: string | null;
    city?: string | null;
    logoUrl?: string | null;
    description?: string | null;
  } | null;
  allChampionships: ChampionshipSummary[];
  standings: StandingTeam[];
  finishedMatches: MatchItem[];
  upcomingMatches: MatchItem[];
  topScorers: TopScorerItem[];
}

export function PublicStandingsView({
  currentChampionship,
  allChampionships,
  standings,
  finishedMatches,
  upcomingMatches,
  topScorers,
}: PublicStandingsViewProps) {
  const router = useRouter();
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>("toate");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique sports from all championships
  const availableSports = useMemo(() => {
    const sports = new Set<string>();
    allChampionships.forEach((c) => {
      if (c.sport) sports.add(c.sport);
    });
    return Array.from(sports);
  }, [allChampionships]);

  // Filter championships for selector
  const filteredChampionships = useMemo(() => {
    return allChampionships.filter((c) => {
      const matchSport =
        selectedSportFilter === "toate" ||
        (c.sport || "").toLowerCase() === selectedSportFilter.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.county && c.county.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSport && matchSearch;
    });
  }, [allChampionships, selectedSportFilter, searchQuery]);

  function handleSelectChampionship(id: string) {
    router.push(`/clasamente?id=${encodeURIComponent(id)}`);
  }

  return (
    <div className="space-y-8 font-body">
      {/* 1. Page Header & Championship Switcher */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-lime-400 rounded-full" />
                <span className="text-xs font-headline font-black uppercase tracking-widest text-lime-400">
                  Ligue Pro România
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase border border-slate-700">
                  {currentChampionship?.season || "Sezon Oficial"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-headline font-black uppercase text-white tracking-tight">
                {currentChampionship?.name || "Clasament General"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Statistici oficiale în timp real, meciuri, golaveraj și clasamente pentru competițiile din platformă
              </p>
            </div>

            {/* Quick Championship Switcher Dropdown */}
            {allChampionships.length > 1 && (
              <div className="shrink-0 flex items-center gap-2">
                <label className="text-xs text-slate-400 font-label font-bold uppercase hidden sm:inline">
                  Comută Liga:
                </label>
                <select
                  value={currentChampionship?.id || ""}
                  onChange={(e) => handleSelectChampionship(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 hover:border-lime-400 text-xs font-headline font-bold uppercase text-white focus:outline-none focus:ring-1 focus:ring-lime-400 transition cursor-pointer shadow-lg"
                >
                  {allChampionships.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.sport})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sport Filter Pills (Internal to Clasamente, No External Redirects!) */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-label font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-lime-400">sports</span>
              Disciplină:
            </span>

            <button
              type="button"
              onClick={() => setSelectedSportFilter("toate")}
              className={`px-3 py-1 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition ${
                selectedSportFilter === "toate"
                  ? "bg-lime-400 text-slate-950 shadow-md font-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              Toate
            </button>

            {availableSports.map((sport) => {
              const isSelected = selectedSportFilter.toLowerCase() === sport.toLowerCase();
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => {
                    setSelectedSportFilter(sport);
                    // If current championship does not match, auto-select first matching
                    const match = allChampionships.find(
                      (c) => (c.sport || "").toLowerCase() === sport.toLowerCase()
                    );
                    if (match && match.id !== currentChampionship?.id) {
                      handleSelectChampionship(match.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-headline font-bold uppercase tracking-wider transition ${
                    isSelected
                      ? "bg-lime-400 text-slate-950 shadow-md font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER COLUMN: Standings Table & Recent Matches (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Clasament General Table Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400 text-xl">leaderboard</span>
                <h2 className="text-lg sm:text-xl font-headline font-black uppercase text-white tracking-tight">
                  Tabel Clasament Oficial
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {standings.length} Echipe Înscrise
              </span>
            </div>

            {/* Mobile Scroll Notice */}
            <div className="md:hidden text-[10px] text-slate-400 font-label flex items-center gap-1">
              <span>⟷</span> Glisează orizontal pentru a vedea toate statisticile
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-label text-[10px] uppercase tracking-widest border-b border-slate-800">
                    <th className="px-4 py-3 font-bold text-center w-12">Poz</th>
                    <th className="px-4 py-3 font-bold">Club / Echipă</th>
                    <th className="px-3 py-3 font-bold text-center">M</th>
                    <th className="px-3 py-3 font-bold text-center text-emerald-400">V</th>
                    <th className="px-3 py-3 font-bold text-center">E</th>
                    <th className="px-3 py-3 font-bold text-center text-rose-400">Î</th>
                    <th className="px-3 py-3 font-bold text-center">GM</th>
                    <th className="px-3 py-3 font-bold text-center">GP</th>
                    <th className="px-3 py-3 font-bold text-center">GD</th>
                    <th className="px-4 py-3 font-bold text-right text-lime-400">Pct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-500 italic">
                        Nu sunt echipe înregistrate încă în acest campionat.
                      </td>
                    </tr>
                  ) : (
                    standings.map((team, idx) => {
                      const isFirst = idx === 0;
                      const isTop3 = idx < 3;
                      const isRelegation = idx >= 8 && standings.length > 9;

                      return (
                        <tr
                          key={team.teamId}
                          className={`hover:bg-slate-800/50 transition-colors ${
                            isFirst ? "bg-lime-950/20" : ""
                          }`}
                        >
                          {/* Poz */}
                          <td className="px-4 py-4 text-center font-mono font-bold">
                            {isFirst ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-lime-400 text-slate-950 font-black shadow-md text-xs">
                                01
                              </span>
                            ) : (
                              <span className={`${isTop3 ? "text-lime-400 font-black" : "text-slate-400"}`}>
                                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                              </span>
                            )}
                          </td>

                          {/* Team Details */}
                          <td className="px-4 py-4">
                            <Link
                              href={`/teams/${team.teamId}`}
                              className="flex items-center gap-3 group"
                            >
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-md uppercase shrink-0 border border-slate-300 dark:border-white/10"
                                style={{ backgroundColor: team.color || "#84cc16", color: getContrastTextColor(team.color || "#84cc16") }}
                              >
                                {team.logoUrl ? (
                                  <img src={team.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  (team.shortName || team.teamName || "ECH").substring(0, 3).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-white group-hover:text-lime-400 transition block tracking-tight">
                                  {team.teamName}
                                </span>
                                {team.shortName && (
                                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                                    {team.shortName}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </td>

                          {/* Stats */}
                          <td className="px-3 py-4 text-center font-mono text-slate-300">{team.played}</td>
                          <td className="px-3 py-4 text-center font-mono text-emerald-400 font-bold">{team.won}</td>
                          <td className="px-3 py-4 text-center font-mono text-slate-400">{team.drawn}</td>
                          <td className="px-3 py-4 text-center font-mono text-rose-400">{team.lost}</td>
                          <td className="px-3 py-4 text-center font-mono text-slate-400">{team.goalsFor}</td>
                          <td className="px-3 py-4 text-center font-mono text-slate-400">{team.goalsAgainst}</td>
                          <td className="px-3 py-4 text-center font-mono text-slate-300 font-bold">
                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                          </td>

                          {/* Points */}
                          <td className="px-4 py-4 text-right font-mono text-base font-black text-lime-400">
                            {team.points}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-[11px] font-label text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400" /> Locul 1 • Campioană
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Locurile 2-3 • Podium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Menținere
              </span>
            </div>
          </div>

          {/* Rezultate Recente / Finished Matches */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">sports_score</span>
                <h3 className="text-base sm:text-lg font-headline font-black uppercase text-white">
                  Rezultate Recente
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Ultimele Meciuri</span>
            </div>

            {finishedMatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                Nu există meciuri finalizate încă în acest campionat.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finishedMatches.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-lime-500/50 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                      <span>{m.stage || "Etapă"}</span>
                      <span className="text-lime-400 font-bold">Finalizat</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-white truncate">{m.homeTeam?.name}</p>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 font-mono font-black text-sm text-lime-400 shrink-0">
                        {m.homeScore ?? 0} : {m.awayScore ?? 0}
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-xs font-bold text-white truncate">{m.awayTeam?.name}</p>
                      </div>
                    </div>

                    {m.venue && (
                      <p className="text-[10px] text-slate-500 font-label text-center pt-1 border-t border-slate-900 truncate">
                        {m.venue}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Upcoming Matches & Top Scorers (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Meciuri Următoare */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400">calendar_month</span>
                <h3 className="text-base font-headline font-black uppercase text-white">
                  Program Următor
                </h3>
              </div>
              <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">Programat</span>
            </div>

            {upcomingMatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                Nu sunt meciuri programate momentan.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-sky-500/50 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{m.stage}</span>
                      <span className="text-sky-400 font-bold">
                        {m.scheduledAt
                          ? new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "În curând"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="truncate flex-1">{m.homeTeam?.name}</span>
                      <span className="text-slate-500 font-mono text-[10px] px-2">VS</span>
                      <span className="truncate flex-1 text-right">{m.awayTeam?.name}</span>
                    </div>

                    {m.venue && (
                      <p className="text-[10px] text-slate-500 font-label truncate pt-1 border-t border-slate-900">
                        {m.venue}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Golgheteri Widget */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">sports_soccer</span>
                <h3 className="text-base font-headline font-black uppercase text-white">
                  Top Golgheteri
                </h3>
              </div>
              <Link
                href="/players"
                className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest hover:underline"
              >
                Vezi Toți →
              </Link>
            </div>

            {topScorers.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                Nu sunt goluri înregistrate încă în acest campionat.
              </p>
            ) : (
              <div className="space-y-3">
                {topScorers.slice(0, 5).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-lime-500/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                        0{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {(player.name || "P")[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block tracking-tight">
                          {player.name}
                        </span>
                        <span className="text-[10px] font-label text-slate-400">
                          {player.teamName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-lime-400">
                        {player.goals}
                      </span>
                      <span className="text-[9px] font-label text-slate-500 block uppercase">Goluri</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
