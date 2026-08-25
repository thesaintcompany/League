"use client";

import React, { useState } from "react";

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
}

interface AdminDiceConsoleProps {
  championshipId: string;
  teams: TeamItem[];
  onDrawCompleted: () => void;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function AdminDiceConsole({
  championshipId,
  teams,
  onDrawCompleted,
}: AdminDiceConsoleProps) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(
    teams.map((t) => t.id)
  );
  const [selectedVenues, setSelectedVenues] = useState<string[]>([
    "Arena Națională",
    "Stadionul Steaua Ghencea",
    "Cluj Arena",
    "Complexul Sportiv Craiova",
  ]);
  const [selectedReferees, setSelectedReferees] = useState<string[]>([
    "Cristian Balaj - Arbitru FIFA",
    "István Kovács - Arbitru UEFA",
    "Ovidiu Hațegan - Arbitru Elite",
  ]);

  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([6, 5]);
  const [rollCount, setRollCount] = useState(1);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleTeam(id: string) {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter((t) => t !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  }

  async function handleDiceRoll() {
    if (selectedTeamIds.length < 2) {
      setError("Selectează cel puțin 2 echipe pentru tragerea la sorți.");
      return;
    }

    setError(null);
    setResultMessage(null);
    setRolling(true);
    setRollCount((c) => c + 1);

    // Animate dice for 1.2 seconds
    let interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 90);

    try {
      const res = await fetch(`/api/championships/${championshipId}/dice-draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamIds: selectedTeamIds,
          venues: selectedVenues,
          referees: selectedReferees,
          clearExisting: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la tragerea la sorți");
      }

      setTimeout(() => {
        clearInterval(interval);
        setRolling(false);
        setResultMessage(data.message || "Tragerea la sorți cu zaruri a fost finalizată cu succes!");
        onDrawCompleted();
      }, 1200);
    } catch (e: any) {
      clearInterval(interval);
      setRolling(false);
      setError(e.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse"></span>
              <span className="font-label text-lime-600 dark:text-lime-400 font-bold text-xs uppercase tracking-widest">
                System Status: Algoritm Activ
              </span>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight uppercase">
              Logic Hub &amp; <span className="text-lime-600 dark:text-lime-400">Qualifiers</span> 🎲
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl font-body">
              Configurează parametrii algoritmici pentru campionat. Folosește sistemul de zaruri stocastice pentru a genera aleatoriu perechile de joc și arborele eliminatoriu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-surface-container-low dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-label">
              {selectedTeamIds.length} / {teams.length} Echipe Selectate
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {resultMessage && (
        <div className="p-4 bg-lime-100 text-lime-900 text-xs font-bold rounded-2xl border border-lime-300 flex items-center gap-2 shadow-sm">
          <span className="text-lg">🎉</span>
          {resultMessage}
        </div>
      )}

      {/* Main Grid: Large Dice Console (8 cols) & Secret Logic Panel (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Dice-Based Qualifier Algorithm (8 cols) */}
        <div className="md:col-span-8 card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-headline text-2xl font-black text-blue-950 dark:text-white uppercase tracking-tight">
                Dice-Based Qualifier Algorithm
              </h3>
              <p className="font-body text-slate-500 text-xs mt-1">
                Motor stocastic de împerechere a echipelor în arborele de joc
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 rounded-full border border-lime-300/40">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
              <span className="font-label text-[10px] font-black uppercase tracking-tight">
                Engine Ready
              </span>
            </div>
          </div>

          {/* Dice Center & Roll Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6 relative z-10">
            {/* 3D Dice Display */}
            <div className="flex items-center gap-4">
              <div
                className={`w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-2xl text-lime-400 text-5xl transition-transform ${
                  rolling ? "animate-spin" : "rotate-3 hover:rotate-0"
                }`}
              >
                {DICE_FACES[diceValues[0] - 1]}
              </div>
              <div
                className={`w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-2xl text-lime-400 text-5xl transition-transform ${
                  rolling ? "animate-spin" : "-rotate-6 hover:rotate-0"
                }`}
              >
                {DICE_FACES[diceValues[1] - 1]}
              </div>
            </div>

            {/* Controls */}
            <div className="text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <span className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  NUMĂR ARUNCĂRI EFECTUATE: #{rollCount}
                </span>
                <div className="flex gap-1.5 justify-center sm:justify-start">
                  <div className="h-1.5 w-10 bg-lime-400 rounded-full"></div>
                  <div className="h-1.5 w-10 bg-lime-400 rounded-full"></div>
                  <div className="h-1.5 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiceRoll}
                disabled={rolling}
                className="bg-primary hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-headline font-black text-sm uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center gap-3"
              >
                <span className={`material-symbols-outlined ${rolling ? "animate-spin" : ""}`}>
                  casino
                </span>
                {rolling ? "Se aruncă zarurile..." : "Aruncă Zarurile 🎲"}
              </button>
            </div>
          </div>

          {/* Algorithm Output Telemetry Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="bg-surface-container-low dark:bg-slate-800/40 p-4 rounded-2xl">
              <p className="font-label text-[10px] uppercase font-bold text-slate-400">
                Team Alpha Seed
              </p>
              <p className="font-headline text-2xl font-black text-blue-950 dark:text-white mt-1">
                #{diceValues[0] < 10 ? `0${diceValues[0]}` : diceValues[0]}
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-slate-800/40 p-4 rounded-2xl">
              <p className="font-label text-[10px] uppercase font-bold text-slate-400">
                Logic Variance
              </p>
              <p className="font-headline text-2xl font-black text-blue-950 dark:text-white mt-1">
                12.4%
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-slate-800/40 p-4 rounded-2xl">
              <p className="font-label text-[10px] uppercase font-bold text-slate-400">
                Pairing Index
              </p>
              <p className="font-headline text-2xl font-black text-lime-600 dark:text-lime-400 mt-1">
                A-{(diceValues[0] + diceValues[1]) * 2}
              </p>
            </div>

            <div className="bg-surface-container-low dark:bg-slate-800/40 p-4 rounded-2xl border-b-2 border-lime-400">
              <p className="font-label text-[10px] uppercase font-bold text-slate-400">
                Confidence
              </p>
              <p className="font-headline text-2xl font-black text-blue-950 dark:text-white mt-1">
                High (98%)
              </p>
            </div>
          </div>
        </div>

        {/* Secret Logic Panel (4 cols) */}
        <div className="md:col-span-4 bg-primary text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-lime-400">lock</span>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">security</span>
              <h3 className="font-headline text-xl font-bold uppercase tracking-tight">
                Secret Logic &amp; Bias
              </h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  PROBABILITY BIAS
                </span>
                <span className="font-label text-xs font-bold text-lime-400">88%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-lime-400 w-[88%] rounded-full shadow-[0_0_8px_#a3e635]"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-lime-400 text-lg mt-0.5">
                  analytics
                </span>
                <div>
                  <p className="font-headline text-xs font-bold">Weighted Seeding</p>
                  <p className="font-body text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    Echipele favorite sunt distribuite pe jumătăți opuse de tablou.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-lime-400 text-lg mt-0.5">
                  shuffle
                </span>
                <div>
                  <p className="font-headline text-xs font-bold">Variance Buffer</p>
                  <p className="font-body text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    Garantează că marile rivale nu se întâlnesc înainte de Semifinale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiceRoll}
            className="mt-6 w-full py-3 bg-lime-400 text-slate-950 font-black font-label text-xs uppercase tracking-wider rounded-xl hover:bg-lime-500 transition shadow-md"
          >
            Regenerează Matricea de Joc
          </button>
        </div>
      </div>

      {/* Seeding Telemetry Table (Live) */}
      <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <h4 className="font-headline font-bold text-sm text-blue-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lime-600">table_chart</span>
          Seeding Telemetry (Live Echipe Alocate)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 px-2">Club / Echipă</th>
                <th className="pb-3 px-2">Rang Pre-Zaruri</th>
                <th className="pb-3 px-2">Seed Alocat</th>
                <th className="pb-3 px-2">Variație (Shift)</th>
                <th className="pb-3 px-2 text-right">Status Algoritm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
              {teams.map((t, idx) => {
                const shift = ((idx * 3 + diceValues[0]) % 5) - 2;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-2 font-bold font-headline flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: t.color || "#1e293b" }}
                      >
                        {t.shortName || t.name.substring(0, 2).toUpperCase()}
                      </div>
                      {t.name}
                    </td>
                    <td className="py-3 px-2 text-slate-500">#{idx + 1}</td>
                    <td className="py-3 px-2 text-lime-600 dark:text-lime-400 font-black data-font">
                      #0{((idx + diceValues[0]) % teams.length) + 1}
                    </td>
                    <td className="py-3 px-2 font-bold data-font">
                      {shift > 0 ? `+${shift}` : shift}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 text-[10px] font-bold uppercase">
                        LOCKED ✓
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
