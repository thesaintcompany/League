"use client";

import React, { useState, useEffect } from "react";
import { isIndividualSport } from "@/lib/constants";

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
}

interface AdminDiceConsoleProps {
  championshipId: string;
  sport?: string;
  teams: TeamItem[];
  onDrawCompleted: () => void;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function AdminDiceConsole({
  championshipId,
  sport = "Fotbal",
  teams,
  onDrawCompleted,
}: AdminDiceConsoleProps) {
  const isIndividual = isIndividualSport(sport);
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
    "Cristian Balaj - Arbitru  ",
    "István Kovács - Arbitru UEFA",
    "Ovidiu Hațegan - Arbitru Elite",
  ]);

  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([6, 5]);
  const [diceRollCount, setDiceRollCount] = useState<number>(0);
  const [isBracketPublished, setIsBracketPublished] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch live dice telemetry on mount
  useEffect(() => {
    fetch(`/api/championships/${championshipId}/dice-draw`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setDiceRollCount(data.diceRollCount || 0);
          setIsBracketPublished(Boolean(data.isBracketPublished));
          setIsLocked(Boolean(data.isLocked));
          setLockReason(data.lockReason || null);
        }
      })
      .catch((err) => console.error("Error fetching dice telemetry:", err));
  }, [championshipId]);

  function toggleTeam(id: string) {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter((t) => t !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  }

  async function handleDiceRoll() {
    if (isLocked || isBracketPublished || diceRollCount >= 3) {
      setError("Aruncarea zarurilor este blocată pentru acest campionat!");
      return;
    }

    if (selectedTeamIds.length < 2) {
      setError("Selectează cel puțin 2 echipe pentru tragerea la sorți.");
      return;
    }

    setError(null);
    setResultMessage(null);
    setRolling(true);

    // Animate dice for 1.2 seconds
    const interval = setInterval(() => {
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
        const newCount = data.diceRollCount ?? (diceRollCount + 1);
        setDiceRollCount(newCount);
        if (newCount >= 3 || data.isLocked) {
          setIsLocked(true);
          setLockReason("A fost atinsă limita maximă de 3 aruncări");
        }
        setResultMessage(data.message || "Tragerea la sorți cu zaruri a fost finalizată cu succes!");
        onDrawCompleted();
      }, 1200);
    } catch (e: any) {
      clearInterval(interval);
      setRolling(false);
      setError(e.message);
    }
  }

  const rollsLeft = Math.max(0, 3 - diceRollCount);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLocked ? "bg-red-500" : "bg-lime-500 animate-pulse"}`}></span>
              <span className="font-label text-slate-700 dark:text-lime-400 font-bold text-xs uppercase tracking-widest">
                {isLocked ? "System Status: Zaruri Blocate" : "System Status: Algoritm Activ"}
              </span>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
              Logic Hub &amp; <span className="text-emerald-700 dark:text-lime-400">Tragere Zaruri</span> 🎲
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-body leading-relaxed">
              Zarurile se pot arunca de <strong>maxim 3 ori</strong> înainte de a publica harta mindmap a meciurilor. Odată ce harta meciurilor este făcută publică, aruncarea zarurilor este blocată definitiv pentru a garanta integritatea competiției.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold font-label border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span>{isIndividual ? "🎾" : "🛡️"}</span>
              <span>{selectedTeamIds.length} / {teams.length} {isIndividual ? "Competitori Selectați" : "Echipe Selectate"}</span>
            </div>

            <div
              className={`px-4 py-2.5 rounded-2xl text-xs font-black font-label uppercase tracking-wider flex items-center gap-2 shadow-sm ${
                isBracketPublished
                  ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700"
                  : diceRollCount >= 3
                  ? "bg-red-100 text-red-900 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-lime-950/60 dark:text-lime-300 dark:border-lime-700"
              }`}
            >
              <span>{isLocked ? "🔒" : "🎲"}</span>
              <span>
                {isBracketPublished
                  ? "HARTĂ PUBLICATĂ (BLOCAT)"
                  : diceRollCount >= 3
                  ? "LIMITĂ 3/3 ATINSĂ (BLOCAT)"
                  : `ARUNCĂRI: ${diceRollCount}/3 (${rollsLeft} RĂMASE)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Notice Banner if Published or 3 Rolls reached */}
      {isBracketPublished && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-950 dark:text-amber-200 flex items-center gap-3 shadow-md">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-headline font-bold text-sm uppercase">
              Harta Meciurilor este Publicată Oficial
            </h4>
            <p className="text-xs font-body opacity-90 mt-0.5">
              Conform regulamentului, nu se mai pot arunca zaruri sau regenera meciurile odată ce harta a fost făcută publică pentru spectatori și echipe.
            </p>
          </div>
        </div>
      )}

      {!isBracketPublished && diceRollCount >= 3 && (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-400 text-red-950 dark:text-red-200 flex items-center gap-3 shadow-md">
          <span className="text-2xl">🔒</span>
          <div>
            <h4 className="font-headline font-bold text-sm uppercase">
              Limita Maximă de 3 Aruncări a Fost Atinsă
            </h4>
            <p className="text-xs font-body opacity-90 mt-0.5">
              Ai utilizat toate cele 3 trageri la sorți permise cu zarurile. Tabloul de meciuri a fost blocat definitiv.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-200">
          ❌ {error}
        </div>
      )}

      {resultMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-950 dark:bg-lime-950/60 dark:text-lime-200 text-xs font-bold rounded-2xl border border-emerald-300 dark:border-lime-700 flex items-center gap-2 shadow-sm">
          <span className="text-lg">🎉</span>
          {resultMessage}
        </div>
      )}

      {/* Main Grid: Large Dice Console (8 cols) & Secret Logic Panel (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Dice-Based Qualifier Algorithm (8 cols) */}
        <div className="md:col-span-8 card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="space-y-1">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
                {isIndividual ? "🎲 TRAGERE LA SORȚI TABLOU TENIS" : "🎲 TRAGERE LA SORȚI CU ZARURI"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tight">
                {isIndividual ? "Consola Oficială de Tragere Tablou & Capi de Serie" : "Consola Oficială de Aruncare a Zarurilor"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                {isIndividual
                  ? "Aruncarea zarurilor distribuie aleatoriu și imparțial jucătorii de tenis pe tablou (sferturi, semifinale și finală)."
                  : "Aruncarea zarurilor stabilește împerecherile de meciuri și ordinea pe arbore pentru turneele eliminatorii."}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700">
              <span className={`w-2 h-2 rounded-full ${isLocked ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`}></span>
              <span className="font-label text-[10px] font-black uppercase tracking-tight">
                {isLocked ? "Engine Locked" : "Engine Ready"}
              </span>
            </div>
          </div>

          {/* Dice Center & Roll Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6 relative z-10">
            {/* 3D Dice Display */}
            <div className="flex items-center gap-4">
              <div
                className={`w-24 h-24 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl text-lime-400 text-5xl transition-transform ${
                  rolling ? "animate-spin" : "rotate-3 hover:rotate-0"
                }`}
              >
                {DICE_FACES[diceValues[0] - 1]}
              </div>
              <div
                className={`w-24 h-24 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl text-lime-400 text-5xl transition-transform ${
                  rolling ? "animate-spin" : "-rotate-6 hover:rotate-0"
                }`}
              >
                {DICE_FACES[diceValues[1] - 1]}
              </div>
            </div>

            {/* Controls */}
            <div className="text-center sm:text-left space-y-4">
              <div className="space-y-1.5">
                <span className="font-label text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  ARUNCĂRI EFECTUATE: {diceRollCount} / 3
                </span>
                <div className="flex gap-1.5 justify-center sm:justify-start">
                  <div className={`h-2 w-10 rounded-full transition-colors ${diceRollCount >= 1 ? "bg-lime-400" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  <div className={`h-2 w-10 rounded-full transition-colors ${diceRollCount >= 2 ? "bg-lime-400" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                  <div className={`h-2 w-10 rounded-full transition-colors ${diceRollCount >= 3 ? "bg-lime-400" : "bg-slate-200 dark:bg-slate-700"}`}></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiceRoll}
                disabled={rolling || isLocked || isBracketPublished || diceRollCount >= 3}
                className={`px-8 py-4 rounded-2xl font-headline font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center gap-3 active:scale-95 ${
                  isLocked || isBracketPublished || diceRollCount >= 3
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                    : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300"
                }`}
              >
                <span className={`material-symbols-outlined ${rolling ? "animate-spin" : ""}`}>
                  {isLocked ? "lock" : "casino"}
                </span>
                {rolling
                  ? "Se aruncă zarurile..."
                  : isBracketPublished
                  ? "🔒 Zaruri Blocate (Harta Publică)"
                  : diceRollCount >= 3
                  ? "🔒 Limită 3/3 Atinsă"
                  : `Aruncă Zarurile (${rollsLeft} Rămase) 🎲`}
              </button>
            </div>
          </div>

          {/* Algorithm Output Telemetry Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="font-label text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Team Alpha Seed
              </p>
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white mt-1">
                #{diceValues[0] < 10 ? `0${diceValues[0]}` : diceValues[0]}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="font-label text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Aruncări Rămase
              </p>
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {rollsLeft} / 3
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="font-label text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Pairing Index
              </p>
              <p className="font-headline text-2xl font-black text-emerald-700 dark:text-lime-400 mt-1">
                A-{(diceValues[0] + diceValues[1]) * 2}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border-b-2 border-lime-400 border border-slate-200 dark:border-slate-700">
              <p className="font-label text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Status Tablou
              </p>
              <p className="font-headline text-sm font-black text-slate-900 dark:text-white mt-2">
                {isBracketPublished ? "PUBLICAT ✓" : "CIORNĂ"}
              </p>
            </div>
          </div>
        </div>

        {/* Secret Logic Panel (4 cols) */}
        <div className="md:col-span-4 bg-slate-950 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-lime-400">lock</span>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">security</span>
              <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-white">
                Reguli &amp; Integritate
              </h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  PROGRES ARUNCĂRI (MAX 3)
                </span>
                <span className="font-label text-xs font-bold text-lime-400">{diceRollCount} / 3</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full shadow-[0_0_8px_#a3e635] transition-all duration-500"
                  style={{ width: `${(diceRollCount / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-lime-400 text-lg mt-0.5">
                  history_edu
                </span>
                <div>
                  <p className="font-headline text-xs font-bold">Limită de 3 Aruncări</p>
                  <p className="font-body text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    Poți re-arunca zarurile de maximum 3 ori pentru a găsi tragerea optimă.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <span className="material-symbols-outlined text-lime-400 text-lg mt-0.5">
                  publish
                </span>
                <div>
                  <p className="font-headline text-xs font-bold">Blocare Automată la Publicare</p>
                  <p className="font-body text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                    După publicarea hărții meciurilor, aruncarea zarurilor devine imposibilă.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiceRoll}
            disabled={rolling || isLocked || isBracketPublished || diceRollCount >= 3}
            className={`mt-6 w-full py-3.5 rounded-xl font-black font-label text-xs uppercase tracking-wider transition shadow-md ${
              isLocked || isBracketPublished || diceRollCount >= 3
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-lime-400 text-slate-950 hover:bg-lime-300"
            }`}
          >
            {isLocked ? "Aruncare Blocată 🔒" : `Re-aruncă Zarurile (${rollsLeft} Rămase)`}
          </button>
        </div>
      </div>

      {/* Seeding Telemetry Table */}
      <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-lime-600 dark:text-lime-400">table_chart</span>
          Seeding Telemetry ({isIndividual ? "Live Competitori Alocați" : "Live Echipe Alocate"})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="font-label text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3">
                <th className="pb-3 px-2">{isIndividual ? "Competitor / Jucător" : "Club / Echipă"}</th>
                <th className="pb-3 px-2">Rang Pre-Zaruri</th>
                <th className="pb-3 px-2">Seed Alocat</th>
                <th className="pb-3 px-2">Variație (Shift)</th>
                <th className="pb-3 px-2 text-right">Status Algoritm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body text-slate-700 dark:text-slate-300">
              {teams.map((t, idx) => {
                const shift = ((idx * 3 + diceValues[0]) % 5) - 2;
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-2 font-bold font-headline flex items-center gap-2 text-slate-900 dark:text-white">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: t.color || "#1e293b" }}
                      >
                        {t.shortName || t.name.substring(0, 2).toUpperCase()}
                      </div>
                      {t.name}
                    </td>
                    <td className="py-3 px-2 text-slate-500">#{idx + 1}</td>
                    <td className="py-3 px-2 text-emerald-700 dark:text-lime-400 font-black data-font">
                      #0{((idx + diceValues[0]) % teams.length) + 1}
                    </td>
                    <td className="py-3 px-2 font-bold data-font">
                      {shift > 0 ? `+${shift}` : shift}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                        {isLocked ? "LOCKED 🔒" : "ASSIGNED ✓"}
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
