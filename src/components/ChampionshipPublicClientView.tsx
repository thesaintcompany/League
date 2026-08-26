"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BracketVisualizer } from "./BracketVisualizer";
import { MatchData } from "./MatchCard";

interface Standing {
  position: number;
  teamId: string;
  teamName: string;
  shortName: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface MatchItem {
  id: string;
  round: number;
  stage: string;
  scheduledAt: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string;
  venue: string;
  bracketIndex?: number | null;
  diceRoll?: string | null;
  homeTeam: { id: string; name: string; shortName: string; color: string };
  awayTeam: { id: string; name: string; shortName: string; color: string };
}

interface TopScorer {
  id: string;
  name: string;
  goals: number;
  teamName: string;
  image?: string | null;
}

interface ChampionshipInfo {
  id: string;
  name: string;
  sport: string;
  season: string;
  scope: string;
  county?: string | null;
  city?: string | null;
  shareCode: string;
  description?: string | null;
}

interface ChampionshipOption {
  id: string;
  name: string;
  sport: string;
  season: string;
  format: string;
  teamsCount: number;
}

export function ChampionshipPublicClientView({
  championship,
  allChampionships,
  standings,
  allMatches,
  finishedMatches,
  upcomingMatches,
  topScorers,
}: {
  championship: ChampionshipInfo | null;
  allChampionships: ChampionshipOption[];
  standings: Standing[];
  allMatches?: MatchItem[];
  finishedMatches: MatchItem[];
  upcomingMatches: MatchItem[];
  topScorers: TopScorer[];
}) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"bracket" | "standings">("bracket");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Switch championship via dropdown
  function onSelectChampionship(id: string) {
    router.push(`/campionat?id=${id}`);
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://sp.buu.ro/campionat";

  function copyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  // Convert matches to MatchData format for BracketVisualizer
  const rawList = allMatches && allMatches.length > 0 ? allMatches : [...finishedMatches, ...upcomingMatches];
  const bracketMatches: MatchData[] = rawList.map((m) => ({
    id: m.id,
    round: m.round,
    stage: m.stage,
    scheduledAt: m.scheduledAt,
    status: (m.status as any) || (m.homeScore !== null && m.homeScore !== undefined ? "finished" : "scheduled"),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    venue: m.venue,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
  }));

  // Fallback top scorers if empty
  const displayScorers =
    topScorers.length > 0
      ? topScorers
      : [
          { id: "1", name: "Alexandru Mitriță", goals: 12, teamName: "Universitatea Craiova" },
          { id: "2", name: "Florinel Coman", goals: 11, teamName: "FCSB București" },
          { id: "3", name: "Daniel Bîrligea", goals: 9, teamName: "CFR Cluj" },
          { id: "4", name: "Claudiu Petrila", goals: 8, teamName: "Rapid București" },
          { id: "5", name: "Louis Munteanu", goals: 7, teamName: "Farul Constanța" },
        ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* 1. Hero Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-lime-400 text-slate-950 text-[10px] font-black font-label rounded-full uppercase tracking-widest shadow-md">
              {championship?.season ? `Sezon ${championship.season}` : "Sezon 2026"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-label uppercase tracking-widest font-bold">
              {championship?.scope === "national"
                ? "🇷🇴 Divizia Națională de Elită"
                : `📍 Campionat Regional • ${championship?.county || "Timiș"}`}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-lime-600 dark:text-lime-400 font-mono text-xs font-bold">
              #{championship?.shareCode || "LP-2026"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-slate-900 dark:text-white drop-shadow-sm">
            {championship?.name || "Premier Elite Championship"}
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-body max-w-2xl">
            {championship?.description ||
              "Harta interactivă cu zaruri a campionatului, arbore eliminatoriu, clasamente oficiale și telemetria meciurilor."}
          </p>
        </div>

        {/* Dropdown Switcher & Share */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <select
              value={championship?.id || ""}
              onChange={(e) => onSelectChampionship(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 pl-4 pr-10 py-3 rounded-2xl shadow-md text-xs font-bold font-headline text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 cursor-pointer"
            >
              {allChampionships.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.teamsCount} echipe)
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-500 text-lg">
              expand_more
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-md border border-slate-300 dark:border-slate-800 hover:border-lime-500 transition-all flex items-center justify-center shrink-0"
            title="Distribuie Campionatul"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
        </div>
      </section>

      {/* 2. View Switcher Tabs: Harta Campionatului (Zaruri) vs Clasament */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView("bracket")}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === "bracket"
                ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-md scale-100"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
            }`}
          >
            <span>🌳</span> Harta Turneului (Arbore Eliminatoriu)
          </button>
          <button
            type="button"
            onClick={() => setActiveView("standings")}
            className={`px-5 sm:px-6 py-3 rounded-2xl font-headline text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === "standings"
                ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-md scale-100"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
            }`}
          >
            <span>📊</span> Clasament &amp; Telemetrie Meciuri
          </button>
        </div>

        <Link
          href={`/harta-campionat/${championship?.shareCode || "LP-2026"}`}
          target="_blank"
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-lime-400 text-xs font-bold font-label uppercase flex items-center gap-1.5 transition border border-slate-300 dark:border-slate-700 shadow-sm"
        >
          <span>Pagină Separată Hartă</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </Link>
      </div>

      {/* 3. View Render */}
      {activeView === "bracket" ? (
        <div className="space-y-6 animate-in fade-in">
          <BracketVisualizer
            championshipId={championship?.id}
            championshipName={championship?.name}
            shareCode={championship?.shareCode || "LP-2026"}
            matches={bracketMatches}
            isPublished={true}
            isAdmin={false}
          />
        </div>
      ) : (
        /* 4. Main 12-Column Standings Grid Layout */
        <div className="grid grid-cols-12 gap-8 animate-in fade-in">
          {/* LEFT COLUMN: Leaderboard & Latest Results (8 cols) */}
          <div className="col-span-12 xl:col-span-8 space-y-8">
            {/* Card: Current Standings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                  <h2 className="text-lg sm:text-xl font-bold font-headline uppercase text-slate-900 dark:text-white tracking-tight">
                    Clasament General Oficial
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("bracket")}
                  className="text-xs font-bold font-label text-slate-700 dark:text-lime-400 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <span>🌳 Vezi Harta Meciurilor</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-label text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 sm:px-8 py-3.5 font-bold">Poz</th>
                      <th className="px-4 py-3.5 font-bold">Echipă / Club</th>
                      <th className="px-3 py-3.5 font-bold text-center">M</th>
                      <th className="px-3 py-3.5 font-bold text-center">V</th>
                      <th className="px-3 py-3.5 font-bold text-center">E</th>
                      <th className="px-3 py-3.5 font-bold text-center">Î</th>
                      <th className="px-3 py-3.5 font-bold text-center">GD</th>
                      <th className="px-6 sm:px-8 py-3.5 font-bold text-right">Pct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                    {standings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-8 py-10 text-center text-slate-500 italic">
                          Nu există echipe sau meciuri înregistrate încă în acest campionat.
                        </td>
                      </tr>
                    ) : (
                      standings.map((team, idx) => {
                        const isLeader = idx === 0;
                        const isRelegation = idx >= 4 && standings.length > 5;

                        return (
                          <tr
                            key={team.teamId}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                              isRelegation ? "border-l-4 border-red-500" : ""
                            }`}
                          >
                            {/* Rank badge */}
                            <td className="px-6 sm:px-8 py-4 font-mono font-bold">
                              {isLeader ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-400/20 text-xs">
                                  01
                                </span>
                              ) : (
                                <span className="text-slate-400 pl-1">
                                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                </span>
                              )}
                            </td>

                            {/* Team */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md uppercase shrink-0 border border-white/10"
                                  style={{ backgroundColor: team.color || "#84cc16" }}
                                >
                                  {team.shortName.substring(0, 3)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block tracking-tight">
                                    {team.teamName}
                                  </span>
                                  <span className="text-[10px] font-label text-slate-500 dark:text-slate-400 uppercase">
                                    Lot Oficial
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4 text-center font-mono text-slate-700 dark:text-slate-300">{team.played}</td>
                            <td className="px-3 py-4 text-center font-mono text-emerald-700 dark:text-lime-400 font-bold">{team.won}</td>
                            <td className="px-3 py-4 text-center font-mono text-slate-500 dark:text-slate-400">{team.drawn}</td>
                            <td className="px-3 py-4 text-center font-mono text-red-600 dark:text-red-400">{team.lost}</td>
                            <td className="px-3 py-4 text-center font-mono text-slate-600 dark:text-slate-400">
                              {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                            </td>

                            {/* Points */}
                            <td className="px-6 sm:px-8 py-4 text-right">
                              <span className="text-base font-black font-mono text-emerald-700 dark:text-lime-400">
                                {team.points}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scorecard: Finished Matches */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                  <h3 className="text-lg font-bold font-headline uppercase text-slate-900 dark:text-white tracking-tight">
                    Rezultate Recente • Scorul Etapei
                  </h3>
                </div>
                <span className="text-[10px] font-label uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">
                  Oficial Încheiate
                </span>
              </div>

              {finishedMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">
                  Niciun meci finalizat încă în acest campionat.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finishedMatches.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-lime-500 dark:hover:border-lime-400/50 transition-all space-y-3"
                    >
                      <div className="flex justify-between text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <span>{m.stage}</span>
                        <span className="text-emerald-700 dark:text-lime-400 font-bold">Finalizat ✓</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                            style={{ backgroundColor: m.homeTeam.color }}
                          >
                            {m.homeTeam.shortName}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {m.homeTeam.name}
                          </span>
                        </div>

                        <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl font-mono font-black text-sm text-slate-950 dark:text-lime-400 border border-slate-300 dark:border-slate-800 shadow-sm">
                          {m.homeScore ?? 0} : {m.awayScore ?? 0}
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate text-right">
                            {m.awayTeam.name}
                          </span>
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                            style={{ backgroundColor: m.awayTeam.color }}
                          >
                            {m.awayTeam.shortName}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-label truncate text-center pt-1 border-t border-slate-200 dark:border-slate-900">
                        🏟️ {m.venue}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Upcoming Matches, Top Scorers & Stats (4 cols) */}
          <div className="col-span-12 xl:col-span-4 space-y-8">
            {/* Card: Upcoming Matches */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-blue-500 rounded-full"></span>
                  <h3 className="text-base font-bold font-headline uppercase text-slate-900 dark:text-white tracking-tight">
                    Meciuri Următoare
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-label uppercase">
                  Live TV
                </span>
              </div>

              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Nu sunt meciuri programate în viitorul apropiat.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex justify-between text-[10px] font-label text-slate-500 dark:text-slate-400 font-bold uppercase">
                        <span>{m.stage}</span>
                        <span className="text-blue-600 dark:text-blue-400">
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

                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.homeTeam.color }}
                          ></span>
                          <span className="truncate max-w-[100px]">{m.homeTeam.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">VS</span>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[100px]">{m.awayTeam.name}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.awayTeam.color }}
                          ></span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-[10px] font-label">
                        <span className="text-slate-500 truncate max-w-[120px]">📍 {m.venue}</span>
                        <Link
                          href={`/matches/${m.id}/promo`}
                          className="text-lime-600 dark:text-lime-400 font-bold hover:underline"
                        >
                          🎟️ Bilete &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card: Top Goalscorers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                  <h3 className="text-base font-bold font-headline uppercase text-slate-900 dark:text-white tracking-tight">
                    Top Golgheteri
                  </h3>
                </div>
                <Link
                  href="/players"
                  className="text-[10px] font-label font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest hover:underline"
                >
                  Vezi Toți →
                </Link>
              </div>

              <div className="space-y-3">
                {displayScorers.slice(0, 5).map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 hover:border-lime-500 dark:hover:border-lime-400/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                        0{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white shrink-0">
                        {player.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block tracking-tight">
                          {player.name}
                        </span>
                        <span className="text-[10px] font-label text-slate-500 dark:text-slate-400">
                          {player.teamName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-lime-600 dark:text-lime-400 block">
                        {player.goals} ⚽
                      </span>
                      <span className="text-[9px] font-label text-slate-400 uppercase">Goluri</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  Distribuie Campionatul
                </span>
                <h3 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900 dark:text-white mt-2">
                  {championship?.name || "Ligue Pro România"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-body">
              Copiază linkul public sau distribuie direct pe rețelele sociale:
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                Link Public Campionat
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-mono text-lime-600 dark:text-lime-400 select-all"
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold font-label uppercase rounded-xl shadow transition shrink-0"
                >
                  {copiedLink ? "Copiat! ✓" : "Copiază"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Vezi Campionatul Oficial ${championship?.name || "Ligue Pro"}: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
              >
                <span>💬</span> WhatsApp
              </a>

              <Link
                href={`/harta-campionat/${championship?.shareCode || "LP-2026"}`}
                target="_blank"
                className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-headline font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition border border-slate-300 dark:border-slate-700"
              >
                <span>Harta Separată</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
