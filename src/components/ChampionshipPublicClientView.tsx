"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  venue: string;
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
  finishedMatches,
  upcomingMatches,
  topScorers,
}: {
  championship: ChampionshipInfo | null;
  allChampionships: ChampionshipOption[];
  standings: Standing[];
  finishedMatches: MatchItem[];
  upcomingMatches: MatchItem[];
  topScorers: TopScorer[];
}) {
  const router = useRouter();
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

  // Fallback top scorers if empty
  const displayScorers =
    topScorers.length > 0
      ? topScorers
      : [
          { id: "1", name: "Cosmin Bîrnoi", goals: 24, teamName: "Politehnica Timișoara" },
          { id: "2", name: "Florinel Coman", goals: 19, teamName: "FCSB București" },
          { id: "3", name: "Alexandru Mitriță", goals: 16, teamName: "Univ. Craiova" },
        ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-body text-white">
      {/* 1. Hero Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-lime-400 text-slate-950 text-[10px] font-black font-label rounded-full uppercase tracking-widest shadow-md">
              {championship?.season ? `Sezon ${championship.season}` : "Sezon 2026"}
            </span>
            <span className="text-slate-400 text-xs font-label uppercase tracking-widest font-bold">
              {championship?.scope === "national"
                ? "🇷🇴 Divizia Națională de Elită"
                : `📍 Campionat Regional • ${championship?.county || "Timiș"}`}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-lime-400 font-mono text-xs font-bold">
              #{championship?.shareCode || "LP-2026"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-md">
            {championship?.name || "Premier Elite Championship"}
          </h1>

          <p className="text-xs text-slate-300 font-body max-w-2xl">
            {championship?.description ||
              "Clasamente în timp real, rezultate de meci cu scoruri live, programul etapelor și telemetria golgheterilor."}
          </p>
        </div>

        {/* Dropdown Switcher & Share */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <select
              value={championship?.id || ""}
              onChange={(e) => onSelectChampionship(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 pl-4 pr-10 py-3 rounded-2xl shadow-md text-xs font-bold font-headline text-white focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              {allChampionships.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.teamsCount} echipe)
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-400 text-lg">
              expand_more
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-md border border-slate-800 hover:border-lime-400 transition-all flex items-center justify-center shrink-0"
            title="Distribuie Campionatul"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
        </div>
      </section>

      {/* 2. Main 12-Column Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN: Leaderboard & Latest Results (8 cols) */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          {/* Card: Current Standings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 sm:px-8 py-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                <h2 className="text-lg sm:text-xl font-bold font-headline uppercase text-white tracking-tight">
                  Clasament General Oficial
                </h2>
              </div>
              <Link
                href={`/harta-campionat?id=${championship?.id || ""}`}
                className="text-xs font-bold font-label text-lime-400 uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <span>Arbore Brackets</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-label text-[10px] uppercase tracking-widest border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/60 text-xs">
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
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isRelegation ? "border-l-4 border-red-500" : ""
                          }`}
                        >
                          {/* Rank badge */}
                          <td className="px-6 sm:px-8 py-4">
                            <span
                              className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs font-mono ${
                                isLeader
                                  ? "bg-lime-400 text-slate-950 font-black shadow-md shadow-lime-400/20"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {team.position < 10 ? `0${team.position}` : team.position}
                            </span>
                          </td>

                          {/* Team info */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-headline font-black text-xs text-white shadow-md border border-white/20"
                                style={{ backgroundColor: team.color || "#1e293b" }}
                              >
                                {team.shortName}
                              </div>
                              <span className="font-bold text-white font-headline text-sm">
                                {team.teamName}
                              </span>
                            </div>
                          </td>

                          {/* Stats */}
                          <td className="px-3 py-4 text-center font-medium font-mono text-slate-300">
                            {team.played}
                          </td>
                          <td className="px-3 py-4 text-center font-medium font-mono text-slate-300">
                            {team.won}
                          </td>
                          <td className="px-3 py-4 text-center font-medium font-mono text-slate-300">
                            {team.drawn}
                          </td>
                          <td className="px-3 py-4 text-center font-medium font-mono text-slate-300">
                            {team.lost}
                          </td>
                          <td className="px-3 py-4 text-center font-bold font-mono text-lime-400">
                            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                          </td>
                          <td className="px-6 sm:px-8 py-4 text-right font-black text-white text-base font-mono">
                            {team.points}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Results Scoreboard Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-blue-400 rounded-full"></span>
                <h3 className="text-lg font-bold font-headline uppercase text-white tracking-tight">
                  Ultimele Rezultate Oficiale
                </h3>
              </div>
              <span className="text-xs font-label text-slate-400 font-bold uppercase">
                {finishedMatches.length} Meciuri Finalizate
              </span>
            </div>

            {finishedMatches.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
                Niciun meci nu a fost încă finalizat în această competiție.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finishedMatches.slice(0, 4).map((m, idx) => (
                  <div
                    key={m.id}
                    className={`bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4 ${
                      idx === 0 ? "border-l-8 border-lime-400" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                      <span>{m.stage} • Rezultat Final</span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded text-lime-400 font-bold border border-slate-800">
                        {m.venue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      {/* Home */}
                      <div className="text-center w-28 space-y-2">
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-headline font-black text-base text-white shadow-lg border-2 border-white/20"
                          style={{ backgroundColor: m.homeTeam.color }}
                        >
                          {m.homeTeam.shortName}
                        </div>
                        <p className="text-xs font-headline font-bold text-white truncate">
                          {m.homeTeam.name}
                        </p>
                      </div>

                      {/* Giant Scoreboard */}
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-black font-mono text-white">
                          {m.homeScore}
                        </span>
                        <span className="text-slate-500 font-black text-xl font-mono">:</span>
                        <span className="text-4xl font-black font-mono text-white">
                          {m.awayScore}
                        </span>
                      </div>

                      {/* Away */}
                      <div className="text-center w-28 space-y-2">
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-headline font-black text-base text-white shadow-lg border-2 border-white/20"
                          style={{ backgroundColor: m.awayTeam.color }}
                        >
                          {m.awayTeam.shortName}
                        </div>
                        <p className="text-xs font-headline font-bold text-white truncate">
                          {m.awayTeam.name}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-label">
                      <Link
                        href={`/matches/${m.id}/promo`}
                        className="text-[11px] font-bold text-lime-400 hover:underline uppercase flex items-center gap-1"
                      >
                        <span>Poster Promovare</span>
                        <span className="material-symbols-outlined text-sm">campaign</span>
                      </Link>
                      <Link
                        href={`/matches/${m.id}/report`}
                        className="text-[11px] font-bold text-slate-300 hover:text-white uppercase flex items-center gap-1"
                      >
                        <span>Fișă Meci PDF</span>
                        <span className="material-symbols-outlined text-sm">description</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Upcoming Fixtures & Top Scorers (4 cols) */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          {/* Card: Upcoming Fixtures (Navy Glass Card) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-bold font-headline uppercase text-white flex items-center gap-2.5">
                <span className="w-2 h-7 bg-lime-400 rounded-full"></span>
                <span>Meciuri Următoare</span>
              </h3>

              <div className="space-y-4">
                {upcomingMatches.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 italic">
                    Toate meciurile au fost disputate sau urmează o nouă tragere la sorți.
                  </div>
                ) : (
                  upcomingMatches.slice(0, 4).map((m) => {
                    const dateObj = m.scheduledAt ? new Date(m.scheduledAt) : null;
                    const dateStr = dateObj
                      ? `${dateObj.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()} • ${dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`
                      : "PROGRAMAT";

                    return (
                      <div
                        key={m.id}
                        className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold font-label text-lime-400 tracking-widest uppercase">
                            {dateStr}
                          </span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-bold font-label uppercase text-slate-300">
                            Live TV
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-headline font-bold text-xs text-white">
                          <span className="truncate pr-1">{m.homeTeam.name}</span>
                          <span className="text-slate-500 font-normal font-mono px-1">vs</span>
                          <span className="truncate pl-1 text-right">{m.awayTeam.name}</span>
                        </div>

                        <div className="text-[10px] font-label text-slate-400 truncate">
                          🏟️ {m.venue}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Link
                href={`/harta-campionat?id=${championship?.id || ""}`}
                className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black rounded-2xl text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
              >
                <span>Arbore Eliminatoriu &amp; Zaruri 🎲</span>
              </Link>
            </div>
          </div>

          {/* Card: Top Performance Scorers (Glassmorphism card) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-white font-bold font-headline uppercase tracking-widest text-xs flex items-center gap-2">
                <span>🥇</span> TOP PERFORMANȚĂ GOLGHETERI
              </h3>
              <Link href="/players" className="text-[11px] font-label text-lime-400 font-bold hover:underline">
                Catalog FIFA →
              </Link>
            </div>

            <div className="space-y-4">
              {displayScorers.map((player, idx) => (
                <div key={player.id || idx} className="flex items-center gap-3.5 group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm border border-slate-700 shadow-md group-hover:border-lime-400 transition overflow-hidden shrink-0">
                    {player.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>#{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-headline text-white truncate group-hover:text-lime-400 transition">
                      {player.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-label truncate">
                      {player.teamName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-lime-400 font-mono leading-none">
                      {player.goals}
                    </p>
                    <p className="text-[8px] font-bold font-label text-slate-400 uppercase">
                      Goluri
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Division Progress Bar */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                <span>Progres Campionat</span>
                <span className="text-lime-400">Etapa 18 din 24</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-lime-400 w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Instant Share */}
      <button
        type="button"
        onClick={() => setShowShareModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        title="Distribuie Campionatul"
      >
        <span className="material-symbols-outlined text-2xl font-bold">share</span>
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-lime-400/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold font-headline uppercase text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">share</span>
                Distribuie Pagina Campionatului
              </h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-label text-slate-300 uppercase block">
                Link Public Campionat
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-lime-400 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-5 py-3 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase"
                >
                  {copiedLink ? "Copiat! ✓" : "Copiază"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 Urmărește clasamentul și meciurile din ${championship?.name || "Ligue Pro"}: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-label font-bold text-xs uppercase flex items-center justify-center gap-2 transition"
              >
                <span>💬</span> WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${shareUrl}" width="100%" height="700" frameborder="0"></iframe>`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">code</span>
                Cod Embed iFrame
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
