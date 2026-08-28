"use client";

import React, { useState } from "react";

interface Player {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  isStarter: boolean;
  status: string;
  yellowCards?: number;
  redCards?: number;
  suspensions?: number;
}

interface Match {
  id: string;
  scheduledAt: string;
  venue?: string | null;
  stage?: string | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null; logoUrl?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null; logoUrl?: string | null };
  championship?: { id: string; name: string };
}

interface TeamData {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  logoUrl?: string | null;
  coverPhotoUrl?: string | null;
  formation: string | null;
  homeArena: string | null;
  sport?: string | null;
  headCoach: string | null;
  assistantCoach: string | null;
  medic: string | null;
  fitnessCoach: string | null;
  championship?: { id: string; name: string };
  players: Player[];
  homeMatches: Match[];
  awayMatches: Match[];
}

interface DigitalTeamSheetModalProps {
  team: TeamData;
  onClose: () => void;
}

const LEAGUE_HEADER_PRESETS = [
  "Youth Champions League",
  "Amateur Elite Cup",
  "Cupa Speranțelor U15",
  "Liga Națională Pro",
  "Cupa Prieteniei & Părinților",
  "Junior Super Cup 2026",
];

export function DigitalTeamSheetModal({ team, onClose }: DigitalTeamSheetModalProps) {
  const allUpcoming = [...(team.homeMatches || []), ...(team.awayMatches || [])].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const defaultMatch = allUpcoming.length > 0 ? allUpcoming[0] : null;
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(defaultMatch);

  // League Header text
  const [leagueHeader, setLeagueHeader] = useState<string>(
    team.championship?.name || "Youth Champions League"
  );
  const [customHeader, setCustomHeader] = useState<string>("");

  // Squad Validation State: player id -> { validated: boolean, isStarter: boolean, isCaptain: boolean, number: number | null, position: string }
  const [squadState, setSquadState] = useState<
    Record<
      string,
      {
        validated: boolean;
        isStarter: boolean;
        isCaptain: boolean;
        number: number | null;
        position: string;
      }
    >
  >(() => {
    const map: Record<string, any> = {};
    team.players.forEach((p, idx) => {
      map[p.id] = {
        validated: true, // by default confirmed
        isStarter: p.isStarter,
        isCaptain: idx === 0, // first player default captain
        number: p.number,
        position: p.position || "Mijlocaș",
      };
    });
    return map;
  });

  const [matchNotes, setMatchNotes] = useState("Echipament Oficial: Tricou Albastru / Șort Alb");
  const [kitColor, setKitColor] = useState("Albastru / Galben");
  const [shareToast, setShareToast] = useState(false);
  const [activeView, setActiveView] = useState<"validate" | "preview">("validate");

  // Summary counts
  const validatedList = team.players.filter((p) => squadState[p.id]?.validated);
  const startersList = validatedList.filter((p) => squadState[p.id]?.isStarter);
  const reservesList = validatedList.filter((p) => !squadState[p.id]?.isStarter);
  const captain = validatedList.find((p) => squadState[p.id]?.isCaptain);

  function toggleValidation(playerId: string) {
    setSquadState((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        validated: !prev[playerId]?.validated,
      },
    }));
  }

  function toggleRole(playerId: string) {
    setSquadState((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        isStarter: !prev[playerId]?.isStarter,
      },
    }));
  }

  function setAsCaptain(playerId: string) {
    setSquadState((prev) => {
      const next: Record<string, any> = {};
      Object.keys(prev).forEach((id) => {
        next[id] = {
          ...prev[id],
          isCaptain: id === playerId,
        };
      });
      return next;
    });
  }

  function updatePlayerNumber(playerId: string, val: string) {
    const num = parseInt(val, 10);
    setSquadState((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        number: isNaN(num) ? null : num,
      },
    }));
  }

  function handlePrintSheet() {
    window.print();
  }

  async function handleShareWithParents() {
    const title = `${leagueHeader} — Foaie de Meci: ${team.name}`;
    const text = `Foaia de meci oficială validată pentru ${team.name} în ${leagueHeader}! Vezi primul 11, rezervele și ora meciului.`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/teams/${team.id}` : "";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch {
      // fallback
    }
  }

  const activeHeader = customHeader.trim() || leagueHeader;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Modal Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-400 text-[10px] font-black uppercase font-mono">
                  Team Sheet Digital
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {startersList.length} Titulari • {reservesList.length} Rezerve
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-white mt-0.5">
                Validare &amp; Generare Foaie de Meci
              </h2>
            </div>
          </div>

          {/* Top Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView("validate")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline uppercase transition ${
                  activeView === "validate"
                    ? "bg-lime-400 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                1. Validează Lotul
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline uppercase transition ${
                  activeView === "preview"
                    ? "bg-lime-400 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                2. Previzualizare Foaie A4
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">

          {/* Config Bar: League Header & Match Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            {/* Antetul Ligii (League Header) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-lime-500">verified</span>
                Antet Ligă / Competiție
              </label>
              <select
                value={leagueHeader}
                onChange={(e) => {
                  setLeagueHeader(e.target.value);
                  setCustomHeader("");
                }}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
              >
                {LEAGUE_HEADER_PRESETS.map((hdr) => (
                  <option key={hdr} value={hdr}>
                    {hdr}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Header Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400">
                Sau Denumire Turneu Personalizată
              </label>
              <input
                type="text"
                placeholder="ex: Cupa Juniorilor de Vară..."
                value={customHeader}
                onChange={(e) => setCustomHeader(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Match Selection */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-sky-400">event</span>
                Selectează Meciul
              </label>
              {allUpcoming.length > 0 ? (
                <select
                  value={selectedMatch?.id || ""}
                  onChange={(e) => {
                    const m = allUpcoming.find((x) => x.id === e.target.value);
                    if (m) setSelectedMatch(m);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
                >
                  {allUpcoming.map((m) => {
                    const isHome = m.homeTeam.id === team.id;
                    const opp = isHome ? m.awayTeam.name : m.homeTeam.name;
                    return (
                      <option key={m.id} value={m.id}>
                        {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} vs {opp} ({m.venue || "Teren"})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value="Meci Amical / În Afara Campionatului"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                />
              )}
            </div>
          </div>

          {/* VIEW 1: VALIDATE PLAYERS WITH QUICK TOGGLES */}
          {activeView === "validate" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-lime-500">how_to_reg</span>
                    Validare Lot Sportivi (Bifează Prezența &amp; Rolul)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Apasă pe bife pentru a confirma jucătorii prezenți la meci și comută între Primul 11 și Bancă
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSquadState((prev) => {
                        const next: Record<string, any> = {};
                        Object.keys(prev).forEach((id) => {
                          next[id] = { ...prev[id], validated: true };
                        });
                        return next;
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    Validează Tot Lotul
                  </button>
                </div>
              </div>

              {/* Players Validation List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {team.players.map((p) => {
                  const state = squadState[p.id] || {
                    validated: true,
                    isStarter: p.isStarter,
                    isCaptain: false,
                    number: p.number,
                    position: p.position || "Mijlocaș",
                  };

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        state.validated
                          ? state.isStarter
                            ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/50 shadow-sm"
                            : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50"
                          : "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      {/* Left: Checkbox + Number + Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Validation Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleValidation(p.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition shrink-0 ${
                            state.validated
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                          title={state.validated ? "Jucător Validat (Prezent)" : "Jucător Absent / Neinclus"}
                        >
                          <span className="material-symbols-outlined text-base">
                            {state.validated ? "check" : "close"}
                          </span>
                        </button>

                        {/* Jersey Number Input */}
                        <input
                          type="number"
                          value={state.number ?? ""}
                          onChange={(e) => updatePlayerNumber(p.id, e.target.value)}
                          placeholder="Nr"
                          className="w-10 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-black text-xs text-slate-900 dark:text-white"
                          title="Număr tricou"
                        />

                        {/* Name & Position */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            {state.isCaptain && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] font-mono">
                                (C)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {state.position}
                          </p>
                        </div>
                      </div>

                      {/* Right: Role Switcher & Captain Toggle */}
                      {state.validated && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Role Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleRole(p.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                              state.isStarter
                                ? "bg-emerald-500 text-white"
                                : "bg-amber-500 text-slate-950"
                            }`}
                            title="Comută între Titular (Primul 11) și Rezervă"
                          >
                            {state.isStarter ? "Titular" : "Rezervă"}
                          </button>

                          {/* Captain Button */}
                          <button
                            type="button"
                            onClick={() => setAsCaptain(p.id)}
                            className={`p-1 rounded-lg text-xs transition ${
                              state.isCaptain
                                ? "bg-amber-400 text-slate-950 font-black"
                                : "text-slate-400 hover:text-amber-500 hover:bg-amber-400/10"
                            }`}
                            title="Desemnează Căpitan de Echipă"
                          >
                            <span className="material-symbols-outlined text-sm">stars</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Kit & Match Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400">Culori Echipament Meci</label>
                  <input
                    type="text"
                    value={kitColor}
                    onChange={(e) => setKitColor(e.target.value)}
                    placeholder="ex: Albastru Complet / Portar Negru"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400">Mențiuni / Notă Arbitru &amp; Părinți</label>
                  <input
                    type="text"
                    value={matchNotes}
                    onChange={(e) => setMatchNotes(e.target.value)}
                    placeholder="Observații despre meci..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: STYLIZED A4 MATCH SHEET PREVIEW */}
          {activeView === "preview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3 text-xs text-sky-800 dark:text-sky-300">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-sky-500">print</span>
                  <span>Aceasta este foaia oficială stilizată cu antetul <strong>{activeHeader}</strong> gata de listat sau distribuit părinților.</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintSheet}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-lime-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider transition shadow shrink-0 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Printează A4 (PDF)
                </button>
              </div>

              {/* Printable Match Sheet Box (Centered & Styled with App Logo Header) */}
              <div id="digital-team-sheet-print" className="p-6 rounded-3xl bg-white text-slate-900 border-2 border-slate-300 shadow-xl space-y-4 font-sans max-w-[190mm] mx-auto">
                {/* Official Platform Logo Header */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm border border-lime-300">
                      <span className="material-symbols-outlined text-lg">bolt</span>
                    </div>
                    <div>
                      <span className="text-base font-black italic tracking-tight uppercase font-headline block leading-none text-slate-950">
                        PRO LIGUE ROMÂNIA
                      </span>
                      <span className="text-[7.5px] font-mono font-bold tracking-widest uppercase text-lime-800">
                        PLATFORMĂ OFICIALĂ DE MANAGEMENT SPORTIV • LIGUE.RO
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-lime-400 text-[8px] font-mono font-black uppercase tracking-wider">
                      TEAM SHEET OFICIAL
                    </span>
                    <span className="block text-[7.5px] text-slate-500 font-mono mt-0.5">GENERAT AUTOMAT • {new Date().toLocaleDateString("ro-RO")}</span>
                  </div>
                </div>

                {/* Official League Header Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white flex flex-col sm:flex-row justify-between items-center gap-4 border-2 border-slate-800">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-xl bg-white/10 p-1 border border-white/20" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-lime-400 text-slate-950 font-black flex items-center justify-center text-xl font-mono">
                        {team.shortName || team.name.substring(0, 3)}
                      </div>
                    )}
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[9px] uppercase font-mono tracking-wider">
                        {activeHeader}
                      </span>
                      <h3 className="text-xl font-black font-headline uppercase text-white mt-1">
                        {team.name}
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        Arenă: <strong>{selectedMatch?.venue || team.homeArena || "Stadion Oficial"}</strong> • Formatie: <strong>{team.formation || "4-3-3"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-widest block">
                      FOAIE DE JOC OFICIALĂ
                    </span>
                    <p className="text-xs font-black text-white mt-0.5">
                      {selectedMatch ? new Date(selectedMatch.scheduledAt).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "long" }) : new Date().toLocaleDateString("ro-RO")}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {kitColor ? `Echipament: ${kitColor}` : "Echipament Oficial"}
                    </p>
                  </div>
                </div>

                {/* Match Confrontation Preview */}
                {selectedMatch && (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-around text-center text-xs">
                    <div className="font-bold uppercase text-slate-900">{selectedMatch.homeTeam.name} (Gazdă)</div>
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-lime-400 font-mono font-black text-xs">VS</span>
                    <div className="font-bold uppercase text-slate-900">{selectedMatch.awayTeam.name} (Oaspete)</div>
                  </div>
                )}

                {/* Two Columns: Starters & Reserves + Staff */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Left Column: Starters & Reserves (8 cols) */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Starters Table */}
                    <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-black uppercase flex justify-between items-center">
                        <span>Titulari (Primul 11) — {startersList.length} Jucători</span>
                        <span className="text-lime-400 font-mono text-[10px]">Validat</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                            <th className="py-1 px-2 w-8 text-center">Nr</th>
                            <th className="py-1 px-2">Nume Jucător</th>
                            <th className="py-1 px-2">Poziție</th>
                            <th className="py-1 px-2 text-center w-16">Rol</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {startersList.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 font-mono font-bold text-center text-slate-900">
                                {squadState[p.id]?.number ?? "-"}
                              </td>
                              <td className="py-1.5 px-2 font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {squadState[p.id]?.isCaptain && (
                                  <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                                    (C)
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-slate-600 text-[11px]">
                                {squadState[p.id]?.position || p.position}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase border border-emerald-300">
                                  Titular
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Reserves Table */}
                    <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-800 text-white px-3 py-1.5 text-xs font-black uppercase flex justify-between items-center">
                        <span>Banca de Rezerve — {reservesList.length} Jucători</span>
                        <span className="text-slate-300 font-mono text-[10px]">Validat</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                            <th className="py-1 px-2 w-8 text-center">Nr</th>
                            <th className="py-1 px-2">Nume Jucător</th>
                            <th className="py-1 px-2">Poziție</th>
                            <th className="py-1 px-2 text-center w-16">Rol</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {reservesList.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-1.5 px-2 font-mono font-bold text-center text-slate-900">
                                {squadState[p.id]?.number ?? "-"}
                              </td>
                              <td className="py-1.5 px-2 font-semibold text-slate-900">
                                {p.name}
                              </td>
                              <td className="py-1.5 px-2 text-slate-600 text-[11px]">
                                {squadState[p.id]?.position || p.position}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px] uppercase border border-amber-300">
                                  Rezervă
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Staff Tehnic & Official Stamp (4 cols) */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="border border-slate-300 rounded-2xl p-3 bg-slate-50 space-y-2 text-xs">
                      <div className="font-black font-headline uppercase text-slate-900 text-xs pb-1 border-b border-slate-200 flex items-center justify-between">
                        <span>Staff Tehnic Oficial</span>
                        <span className="material-symbols-outlined text-sm text-lime-600">badge</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Antrenor Principal</span>
                          <strong className="text-slate-900">{team.headCoach || "Nespecificat"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Antrenor Secund</span>
                          <strong className="text-slate-900">{team.assistantCoach || "Nespecificat"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Medic / Kinetoterapeut</span>
                          <strong className="text-slate-900">{team.medic || "Nespecificat"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] font-bold uppercase">Căpitan</span>
                          <strong className="text-slate-900">{captain ? `${captain.name} (#${squadState[captain.id]?.number ?? ""})` : "Nedesemnat"}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Official Digital Validation Seal */}
                    <div className="border-2 border-dashed border-emerald-500/60 rounded-2xl p-3 bg-emerald-50/40 text-center space-y-1">
                      <span className="material-symbols-outlined text-2xl text-emerald-600">verified</span>
                      <p className="font-black text-[10px] uppercase tracking-wider text-emerald-800">
                        Lot Validat Digital de Manager
                      </p>
                      <p className="text-[9px] text-emerald-700 font-mono">
                        Data: {new Date().toLocaleDateString("ro-RO")} • Ora: {new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {shareToast && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs animate-in fade-in">
                Link-ul a fost copiat! Trimite-l părinților pe WhatsApp.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Share to Parents & Friends */}
            <button
              type="button"
              onClick={handleShareWithParents}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 active:scale-95"
              title="Trimite foaia de meci părinților și prietenilor pe WhatsApp / rețele"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>Trimite la Părinți / Prieteni</span>
            </button>

            {/* Print A4 PDF */}
            <button
              type="button"
              onClick={handlePrintSheet}
              className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Printează PDF A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase transition"
            >
              Închide
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
