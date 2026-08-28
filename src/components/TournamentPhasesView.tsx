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
  championshipName = "Turneu Oficial",
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

  // Derive groups A & B from initialStandings or generate demo group split
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
        { id: "t5", name: "CSC Dumbrăvița", shortName: "DUM", points: 9, goalsFor: 16, goalsAgainst: 2, goalDiff: 14, won: 3, drawn: 0, lost: 0, color: "#16a34a" },
        { id: "t6", name: "CFR Cluj", shortName: "CFR", points: 6, goalsFor: 8, goalsAgainst: 7, goalDiff: 1, won: 2, drawn: 0, lost: 1, color: "#991b1b" },
        { id: "t7", name: "Dinamo București", shortName: "DIN", points: 1, goalsFor: 4, goalsAgainst: 10, goalDiff: -6, won: 0, drawn: 1, lost: 2, color: "#ef4444" },
        { id: "t8", name: "CSS Bega TM", shortName: "BEG", points: 1, goalsFor: 2, goalsAgainst: 11, goalDiff: -9, won: 0, drawn: 1, lost: 2, color: "#f97316" },
      ];

  // Group match fixtures (real or populated)
  const groupAMatches: TournamentPhaseMatch[] = [
    {
      id: "gm1",
      homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626" },
      awayTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a" },
      homeScore: 0,
      awayScore: 8,
      status: "finished",
    },
    {
      id: "gm2",
      homeTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7" },
      awayTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308" },
      homeScore: 3,
      awayScore: 0,
      status: "finished",
    },
    {
      id: "gm3",
      homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626" },
      awayTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308" },
      homeScore: 0,
      awayScore: 7,
      status: "finished",
    },
    {
      id: "gm4",
      homeTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a" },
      awayTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7" },
      homeScore: 6,
      awayScore: 0,
      status: "finished",
    },
    {
      id: "gm5",
      homeTeam: { id: "t4", name: "CSM Lugoj", color: "#dc2626" },
      awayTeam: { id: "t2", name: "CSC Ghiroda", color: "#0284c7" },
      homeScore: 1,
      awayScore: 6,
      status: "finished",
    },
    {
      id: "gm6",
      homeTeam: { id: "t3", name: "Ultimate Eleven", color: "#eab308" },
      awayTeam: { id: "t1", name: "FK Partizan Belgrad", color: "#0f172a" },
      homeScore: 0,
      awayScore: 7,
      status: "finished",
    },
  ];

  const groupBMatches: TournamentPhaseMatch[] = [
    {
      id: "gm7",
      homeTeam: { id: "t5", name: "CSC Dumbrăvița", color: "#16a34a" },
      awayTeam: { id: "t6", name: "CFR Cluj", color: "#991b1b" },
      homeScore: 4,
      awayScore: 1,
      status: "finished",
    },
    {
      id: "gm8",
      homeTeam: { id: "t7", name: "Dinamo București", color: "#ef4444" },
      awayTeam: { id: "t8", name: "CSS Bega TM", color: "#f97316" },
      homeScore: 1,
      awayScore: 1,
      status: "finished",
    },
    {
      id: "gm9",
      homeTeam: { id: "t5", name: "CSC Dumbrăvița", color: "#16a34a" },
      awayTeam: { id: "t8", name: "CSS Bega TM", color: "#f97316" },
      homeScore: 5,
      awayScore: 0,
      status: "finished",
    },
    {
      id: "gm10",
      homeTeam: { id: "t6", name: "CFR Cluj", color: "#991b1b" },
      awayTeam: { id: "t7", name: "Dinamo București", color: "#ef4444" },
      homeScore: 3,
      awayScore: 1,
      status: "finished",
    },
  ];

  function renderGroupCard(groupKey: string, teams: typeof groupATeams, groupMatches: TournamentPhaseMatch[]) {
    const isExpanded = Boolean(expandedGroups[groupKey]);

    return (
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Group Header Badge */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-800 text-lime-400 font-headline font-black text-lg flex items-center justify-center border border-slate-700 shadow-inner">
              {groupKey}
            </span>
            <span className="font-headline font-black text-base uppercase text-white tracking-wider">
              Grupa {groupKey}
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
            {teams.length} Echipe înscrise
          </span>
        </div>

        {/* Group Standings Table with Visual Form Stacked Bar */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px] text-xs">
            <thead>
              <tr className="text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800 bg-slate-950/40">
                <th className="py-3 px-4 w-10 text-center font-bold">#</th>
                <th className="py-3 px-4 font-bold">Nume Echipă</th>
                <th className="py-3 px-3 text-center font-bold">P</th>
                <th className="py-3 px-3 text-center font-bold">GM</th>
                <th className="py-3 px-3 text-center font-bold">GP</th>
                <th className="py-3 px-3 text-center font-bold">G</th>
                <th className="py-3 px-6 text-center font-bold w-52">
                  <div className="flex justify-between px-2">
                    <span className="text-emerald-400">V</span>
                    <span className="text-amber-400">E</span>
                    <span className="text-rose-400">Î</span>
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
                  <tr key={t.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-black text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: t.color || "#84cc16" }}
                        >
                          {t.shortName || t.name.substring(0, 2).toUpperCase()}
                        </div>
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
                      <div className="w-full h-6 rounded-xl overflow-hidden flex bg-slate-950 p-0.5 border border-slate-800 gap-0.5">
                        {/* Wins segment */}
                        {t.won > 0 && (
                          <div
                            style={{ width: `${winPct}%` }}
                            className="h-full bg-emerald-500 rounded-lg flex items-center justify-center text-white font-mono font-black text-[10px] shadow-sm transition-all"
                            title={`${t.won} Victorii`}
                          >
                            {t.won}
                          </div>
                        )}

                        {/* Draws segment */}
                        {t.drawn > 0 && (
                          <div
                            style={{ width: `${drawPct}%` }}
                            className="h-full bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-mono font-black text-[10px] shadow-sm transition-all"
                            title={`${t.drawn} Egaluri`}
                          >
                            {t.drawn}
                          </div>
                        )}

                        {/* Losses segment */}
                        {t.lost > 0 && (
                          <div
                            style={{ width: `${lossPct}%` }}
                            className="h-full bg-rose-500 rounded-lg flex items-center justify-center text-white font-mono font-black text-[10px] shadow-sm transition-all"
                            title={`${t.lost} Înfrângeri`}
                          >
                            {t.lost}
                          </div>
                        )}

                        {/* Empty placeholder if no matches yet */}
                        {t.won === 0 && t.drawn === 0 && t.lost === 0 && (
                          <div className="w-full h-full bg-slate-800/60 rounded-lg flex items-center justify-center text-slate-500 text-[9px] font-mono">
                            Fără meciuri
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
            className="w-full py-3 px-6 flex items-center justify-between text-xs font-headline font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-850 transition"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-lime-400">sports_soccer</span>
              <span>Meciuri {groupKey}</span>
            </span>
            <span className="material-symbols-outlined text-lg transition-transform">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Matches Grid (Expanded View) */}
          {isExpanded && (
            <div className="p-4 sm:p-6 bg-slate-950/70 border-t border-slate-850 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {groupMatches.map((m) => {
                  const homeWon = (m.homeScore ?? 0) > (m.awayScore ?? 0);
                  const awayWon = (m.awayScore ?? 0) > (m.homeScore ?? 0);
                  const isDraw = m.homeScore === m.awayScore && m.homeScore !== null && m.homeScore !== undefined;

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2.5 hover:border-slate-700 transition"
                    >
                      {/* Home Team Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[9px] font-black text-white shrink-0"
                            style={{ backgroundColor: m.homeTeam.color || "#84cc16" }}
                          >
                            {m.homeTeam.shortName || m.homeTeam.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-headline font-bold text-xs text-white truncate">
                            {m.homeTeam.name}
                          </span>
                        </div>

                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm ${
                            homeWon
                              ? "bg-emerald-500 text-white"
                              : awayWon
                              ? "bg-rose-500/80 text-white"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {m.homeScore ?? "-"}
                        </span>
                      </div>

                      {/* Away Team Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[9px] font-black text-white shrink-0"
                            style={{ backgroundColor: m.awayTeam.color || "#38bdf8" }}
                          >
                            {m.awayTeam.shortName || m.awayTeam.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-headline font-bold text-xs text-white truncate">
                            {m.awayTeam.name}
                          </span>
                        </div>

                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm ${
                            awayWon
                              ? "bg-emerald-500 text-white"
                              : homeWon
                              ? "bg-rose-500/80 text-white"
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
      {/* 1. Category Selector Pills (e.g. 2017 U9, 2016 U10) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider transition ${
              selectedCategory === cat.id
                ? "bg-sky-500 text-white shadow-lg scale-105"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2. Tournament Phases Selector (Faza 1, Faza 2, Faza 3, Faza 4) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() => setSelectedPhase(phase.id as any)}
            className={`px-5 py-2.5 rounded-2xl font-headline text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-sm ${
              selectedPhase === phase.id
                ? "bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/20 scale-100"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 font-bold border border-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {selectedPhase === phase.id ? "verified" : "radio_button_unchecked"}
            </span>
            <span>{phase.name}</span>
            <span className="text-[9px] font-mono opacity-80 lowercase hidden sm:inline">({phase.desc})</span>
          </button>
        ))}
      </div>

      {/* 3. Group Standings Cards & Matches */}
      <div className="space-y-6">
        {renderGroupCard("A", groupATeams, groupAMatches)}
        {renderGroupCard("B", groupBTeams, groupBMatches)}
      </div>
    </div>
  );
}
