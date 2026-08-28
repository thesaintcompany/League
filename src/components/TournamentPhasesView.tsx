"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  group?: string; // "A" | "B" | "C" | "D"
}

export interface TournamentPhaseMatch {
  id: string;
  homeTeam: { id: string; name: string; shortName?: string | null; logoUrl?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; logoUrl?: string | null; color?: string | null };
  homeScore?: number | null;
  awayScore?: number | null;
  status: string; // "finished" | "scheduled" | "live"
  group?: string; // "A" | "B"
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
  championshipName = "Dumbravița Generation Cup",
  sport = "fotbal",
  initialStandings = [],
  matches = [],
}: TournamentPhasesViewProps) {
  const [selectedPhase, setSelectedPhase] = useState<"faza_1" | "faza_2" | "faza_3" | "faza_4">("faza_1");
  const [selectedCategory, setSelectedCategory] = useState<string>("U10");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    A: true,
    B: true,
  });

  const categories = [
    { id: "U9", label: "2017 (U9)" },
    { id: "U10", label: "2016 (U10)" },
    { id: "U12", label: "2014 (U12)" },
    { id: "Seniori", label: "Seniori / Open" },
  ];

  const phases = [
    { id: "faza_1", name: "Faza 1", desc: "Grupe Calificatorii" },
    { id: "faza_2", name: "Faza 2", desc: "Grupe de Aur & Argint" },
    { id: "faza_3", name: "Faza 3", desc: "Semifinale & Baraj" },
    { id: "faza_4", name: "Faza 4", desc: "Finala Mare & Festivitate" },
  ];

  function toggleGroupAccordion(groupKey: string) {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }

  // Derive groups A & B from initialStandings or generate demo group split matching the user's reference
  const half = Math.ceil(initialStandings.length / 2);
  const groupATeams = initialStandings.length >= 2
    ? initialStandings.filter((t, i) => t.group === "A" || (!t.group && i < half))
    : [
        { id: "t1", name: "FK Partizan Belgrad", shortName: "PAR", points: 9, goalsFor: 21, goalsAgainst: 0, goalDiff: 21, won: 3, drawn: 0, lost: 0, color: "#0f172a" },
        { id: "t2", name: "CSC Ghiroda", shortName: "GHI", points: 6, goalsFor: 9, goalsAgainst: 7, goalDiff: 2, won: 2, drawn: 0, lost: 1, color: "#0284c7" },
        { id: "t3", name: "Ultimate Eleven", shortName: "ULT", points: 3, goalsFor: 7, goalsAgainst: 10, goalDiff: -3, won: 1, drawn: 0, lost: 2, color: "#eab308" },
        { id: "t4", name: "CSM Lugoj", shortName: "LUG", points: 0, goalsFor: 1, goalsAgainst: 21, goalDiff: -20, won: 0, drawn: 0, lost: 3, color: "#dc2626" },
      ];

  const groupBTeams = initialStandings.length >= 4
    ? initialStandings.filter((t, i) => t.group === "B" || (!t.group && i >= half))
    : [
        { id: "t5", name: "CSC Dumbrăvița", shortName: "DUM", points: 9, goalsFor: 26, goalsAgainst: 3, goalDiff: 23, won: 3, drawn: 0, lost: 0, color: "#16a34a" },
        { id: "t6", name: "FC Star Play", shortName: "STA", points: 3, goalsFor: 8, goalsAgainst: 9, goalDiff: -1, won: 1, drawn: 0, lost: 2, color: "#991b1b" },
        { id: "t7", name: "Dinamo București", shortName: "DIN", points: 3, goalsFor: 6, goalsAgainst: 16, goalDiff: -10, won: 1, drawn: 0, lost: 2, color: "#ef4444" },
        { id: "t8", name: "ACS Roma FP", shortName: "ROM", points: 3, goalsFor: 4, goalsAgainst: 16, goalDiff: -12, won: 1, drawn: 0, lost: 2, color: "#f97316" },
      ];

  // Group match fixtures (real or demo populated from model)
  const groupAMatches: TournamentPhaseMatch[] = matches.length > 0 && matches.some((m) => m.group === "A")
    ? matches.filter((m) => m.group === "A")
    : [
        {
          id: "gm1",
          homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626", shortName: "LUG" },
          awayTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a", shortName: "PAR" },
          homeScore: 0,
          awayScore: 8,
          status: "finished",
        },
        {
          id: "gm2",
          homeTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7", shortName: "GHI" },
          awayTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308", shortName: "ULT" },
          homeScore: 3,
          awayScore: 0,
          status: "finished",
        },
        {
          id: "gm3",
          homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626", shortName: "LUG" },
          awayTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308", shortName: "ULT" },
          homeScore: 0,
          awayScore: 7,
          status: "finished",
        },
        {
          id: "gm4",
          homeTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a", shortName: "PAR" },
          awayTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7", shortName: "GHI" },
          homeScore: 6,
          awayScore: 0,
          status: "finished",
        },
        {
          id: "gm5",
          homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626", shortName: "LUG" },
          awayTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7", shortName: "GHI" },
          homeScore: 1,
          awayScore: 6,
          status: "finished",
        },
        {
          id: "gm6",
          homeTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308", shortName: "ULT" },
          awayTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a", shortName: "PAR" },
          homeScore: 0,
          awayScore: 7,
          status: "finished",
        },
      ];

  const groupBMatches: TournamentPhaseMatch[] = matches.length > 0 && matches.some((m) => m.group === "B")
    ? matches.filter((m) => m.group === "B")
    : [
        {
          id: "gm7",
          homeTeam: { id: "t5", name: "CSC Dumbrăvița", color: "#16a34a", shortName: "DUM" },
          awayTeam: { id: "t6", name: "FC Star Play", color: "#991b1b", shortName: "STA" },
          homeScore: 5,
          awayScore: 1,
          status: "finished",
        },
        {
          id: "gm8",
          homeTeam: { id: "t7", name: "Dinamo București", color: "#ef4444", shortName: "DIN" },
          awayTeam: { id: "t8", name: "ACS Roma FP", color: "#f97316", shortName: "ROM" },
          homeScore: 2,
          awayScore: 1,
          status: "finished",
        },
        {
          id: "gm9",
          homeTeam: { id: "t5", name: "CSC Dumbrăvița", color: "#16a34a", shortName: "DUM" },
          awayTeam: { id: "t8", name: "ACS Roma FP", color: "#f97316", shortName: "ROM" },
          homeScore: 8,
          awayScore: 0,
          status: "finished",
        },
        {
          id: "gm10",
          homeTeam: { id: "t6", name: "FC Star Play", color: "#991b1b", shortName: "STA" },
          awayTeam: { id: "t7", name: "Dinamo București", color: "#ef4444", shortName: "DIN" },
          homeScore: 3,
          awayScore: 2,
          status: "finished",
        },
      ];

  // Render circular round crest with fallback styling
  function renderTeamBadge(team: { name: string; shortName?: string | null; logoUrl?: string | null; color?: string | null }, size = "w-7 h-7") {
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center font-mono text-[9px] font-black text-white shrink-0 shadow-md border border-slate-700 bg-slate-800 overflow-hidden ring-1 ring-white/10`}
        style={{ backgroundColor: team.color || "#1e293b" }}
      >
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
        ) : (
          <span>{team.shortName?.substring(0, 3) || team.name.substring(0, 2).toUpperCase()}</span>
        )}
      </div>
    );
  }

  function renderGroupCard(groupKey: string, teams: typeof groupATeams, groupMatches: TournamentPhaseMatch[]) {
    const isExpanded = Boolean(expandedGroups[groupKey]);

    return (
      <div className="rounded-2xl bg-[#1a1f26] border border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Group Header Letter */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="font-headline font-black text-xl text-slate-200 tracking-wider">
            {groupKey}
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
            {teams.length} Echipe înscrise
          </span>
        </div>

        {/* Group Standings Table with Visual Form Stacked Bar */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px] text-xs">
            <thead>
              <tr className="text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/40">
                <th className="py-3 px-4 w-10 text-center font-bold">#</th>
                <th className="py-3 px-4 font-bold">Nume</th>
                <th className="py-3 px-3 text-center font-bold">P</th>
                <th className="py-3 px-3 text-center font-bold">GM</th>
                <th className="py-3 px-3 text-center font-bold">GP</th>
                <th className="py-3 px-3 text-center font-bold">G</th>
                <th className="py-3 px-6 text-center font-bold w-56">
                  <div className="flex justify-between px-3 text-xs">
                    <span className="text-emerald-400 font-black">V</span>
                    <span className="text-amber-400 font-black">E</span>
                    <span className="text-rose-500 font-black">I</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {teams.map((t, idx) => {
                const totalPlayed = (t.won || 0) + (t.drawn || 0) + (t.lost || 0) || 1;
                const winPct = Math.round(((t.won || 0) / totalPlayed) * 100);
                const drawPct = Math.round(((t.drawn || 0) / totalPlayed) * 100);
                const lossPct = Math.round(((t.lost || 0) / totalPlayed) * 100);

                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {renderTeamBadge(t, "w-6 h-6 sm:w-7 sm:h-7")}
                        <span className="font-headline font-bold text-white tracking-wide truncate">
                          {t.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-headline font-black text-white text-sm">
                      {t.points}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {t.goalsFor}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {t.goalsAgainst}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                      {t.goalDiff > 0 ? `+${t.goalDiff}` : t.goalDiff}
                    </td>

                    {/* Visual Segmented Form Bar (V / E / I) */}
                    <td className="py-3 px-6">
                      <div className="w-full h-6 rounded-md overflow-hidden flex bg-transparent gap-1">
                        {/* Wins segment */}
                        {t.won > 0 && (
                          <div
                            style={{ flexGrow: t.won }}
                            className="h-full bg-emerald-500 rounded-sm flex items-center justify-center text-white font-mono font-black text-[11px] shadow-sm transition-all"
                            title={`${t.won} Victorii`}
                          >
                            {t.won}
                          </div>
                        )}

                        {/* Draws segment */}
                        {t.drawn > 0 && (
                          <div
                            style={{ flexGrow: t.drawn }}
                            className="h-full bg-amber-500 rounded-sm flex items-center justify-center text-slate-950 font-mono font-black text-[11px] shadow-sm transition-all"
                            title={`${t.drawn} Egaluri`}
                          >
                            {t.drawn}
                          </div>
                        )}

                        {/* Losses segment */}
                        {t.lost > 0 && (
                          <div
                            style={{ flexGrow: t.lost }}
                            className="h-full bg-rose-600 rounded-sm flex items-center justify-center text-white font-mono font-black text-[11px] shadow-sm transition-all"
                            title={`${t.lost} Înfrângeri`}
                          >
                            {t.lost}
                          </div>
                        )}

                        {/* Empty placeholder if no matches yet */}
                        {t.won === 0 && t.drawn === 0 && t.lost === 0 && (
                          <div className="w-full h-full bg-slate-800/40 rounded-sm flex items-center justify-center text-slate-500 text-[9px] font-mono">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Accordion Toggle: Meciuri ˅ / ˄ */}
        <div className="border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => toggleGroupAccordion(groupKey)}
            className="w-full py-3 px-6 flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900/50 transition cursor-pointer"
          >
            <span>Meciuri</span>
            <span className="material-symbols-outlined text-lg transition-transform">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Matches Grid (Expanded View matching the screenshot) */}
          {isExpanded && (
            <div className="p-4 sm:p-6 bg-[#14181d] border-t border-slate-800/60 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {groupMatches.map((m) => {
                  const homeWon = (m.homeScore ?? 0) > (m.awayScore ?? 0);
                  const awayWon = (m.awayScore ?? 0) > (m.homeScore ?? 0);

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#1e242c] border border-slate-800/90 shadow-md space-y-2 hover:border-slate-700 transition"
                    >
                      {/* Home Team Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderTeamBadge(m.homeTeam, "w-7 h-7")}
                          <span className="font-headline font-bold text-xs text-white truncate">
                            {m.homeTeam.name}
                          </span>
                        </div>

                        <span
                          className={`min-w-[28px] h-6 px-2 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm ${
                            homeWon
                              ? "bg-emerald-600 text-white"
                              : awayWon
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {m.homeScore ?? "-"}
                        </span>
                      </div>

                      {/* Away Team Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderTeamBadge(m.awayTeam, "w-7 h-7")}
                          <span className="font-headline font-bold text-xs text-white truncate">
                            {m.awayTeam.name}
                          </span>
                        </div>

                        <span
                          className={`min-w-[28px] h-6 px-2 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm ${
                            awayWon
                              ? "bg-emerald-600 text-white"
                              : homeWon
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {m.awayScore ?? "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Competition Branding & Secondary Navigation */}
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
              Turneu Oficial • Clasament pe Grupe & Faze
            </p>
          </div>
        </div>

        {/* Secondary Sub-nav links matching reference */}
        <div className="flex items-center gap-5 text-xs font-headline font-bold uppercase tracking-wider text-slate-400 overflow-x-auto no-scrollbar">
          <Link href="/matches" className="hover:text-white transition whitespace-nowrap">
            Meciuri
          </Link>
          <span className="text-white border-b-2 border-white pb-0.5 whitespace-nowrap font-black">
            Clasament
          </span>
          <Link href="/despre" className="hover:text-white transition whitespace-nowrap">
            Informații
          </Link>
          <Link href="/echipe" className="hover:text-white transition whitespace-nowrap">
            Echipe
          </Link>
          <Link href="/contact" className="hover:text-white transition whitespace-nowrap">
            Contact
          </Link>
        </div>
      </div>

      {/* 2. Category Selector Pills (e.g. 2017 U9, 2016 U10) */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1 rounded-full text-xs font-bold font-mono tracking-wider transition ${
              selectedCategory === cat.id
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Tournament Phases Selector (Faza 1, Faza 2, Faza 3, Faza 4) */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3 overflow-x-auto no-scrollbar">
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => setSelectedPhase(phase.id as any)}
            className={`px-3.5 py-1 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 ${
              selectedPhase === phase.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span>{phase.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Group Standings Cards & Matches */}
      <div className="space-y-6">
        {renderGroupCard("A", groupATeams, groupAMatches)}
        {renderGroupCard("B", groupBTeams, groupBMatches)}
      </div>
    </div>
  );
}
