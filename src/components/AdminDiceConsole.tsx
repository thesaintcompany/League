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
    "Baza Sportivă Sud",
    "Complexul Arcul de Triumf",
  ]);
  const [selectedReferees, setSelectedReferees] = useState<string[]>([
    "Cristian Balaj - Arbitru FIFA",
    "Ovidiu Hațegan - Arbitru Elite",
    "Istvan Kovacs - Arbitru FIFA",
  ]);

  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([6, 5]);
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

    // Animate dice for 1.2 seconds
    let interval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 100);

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
        setResultMessage(data.message || "Tragerea la sorți a fost finalizată cu succes!");
        onDrawCompleted();
      }, 1200);
    } catch (e: any) {
      clearInterval(interval);
      setRolling(false);
      setError(e.message);
    }
  }

  return (
    <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
            🎲
          </div>
          <div>
            <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
              Consolă Administrare &amp; Algoritm Zaruri
            </h3>
            <p className="text-xs font-label text-slate-500">
              Tragere la sorți aleatorie pentru arborele de joc eliminatoriu și alocare arbitri / arene
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-label">
            {selectedTeamIds.length} / {teams.length} Echipe Selectate
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {resultMessage && (
        <div className="p-4 bg-lime-50 text-lime-800 text-xs font-bold rounded-2xl border border-lime-300 flex items-center gap-2">
          <span className="text-lg">🎉</span>
          {resultMessage}
        </div>
      )}

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Echipe Participante */}
        <div className="space-y-3 bg-surface-container-low dark:bg-slate-800/40 p-5 rounded-2xl">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold font-label uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>1.</span> Echipe Înscrise
            </h4>
            <button
              type="button"
              onClick={() => setSelectedTeamIds(teams.map((t) => t.id))}
              className="text-[10px] font-label font-bold text-lime-700 dark:text-lime-400 hover:underline"
            >
              Selectează Toate
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {teams.map((team) => {
              const isChecked = selectedTeamIds.includes(team.id);
              return (
                <div
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border text-xs ${
                    isChecked
                      ? "bg-white dark:bg-slate-800 border-lime-400 font-bold shadow-sm"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                      style={{ backgroundColor: team.color || "#1e293b" }}
                    >
                      {team.shortName || team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate font-headline">{team.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-lime-500 focus:ring-lime-400"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Arbitri & Arene Alocate */}
        <div className="space-y-4 bg-surface-container-low dark:bg-slate-800/40 p-5 rounded-2xl">
          <div>
            <h4 className="text-xs font-bold font-label uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <span>2.</span> Arbitri Disponibili
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {selectedReferees.map((ref, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    sports
                  </span>
                  <span className="truncate font-medium">{ref}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold font-label uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <span>3.</span> Arene / Stadioane
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {selectedVenues.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    stadium
                  </span>
                  <span className="truncate font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Interactive Dice Roll Box */}
        <div className="bg-primary text-white p-6 rounded-2xl flex flex-col justify-between items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest block mb-2">
              Algoritm Zaruri Calificări
            </span>
            <p className="text-xs text-slate-300 font-body">
              Apasă butonul pentru a arunca zarurile și a genera automat perechile din arborele de joc!
            </p>
          </div>

          {/* Animated 3D Dice Display */}
          <div className="my-6 flex items-center justify-center gap-4 relative z-10">
            <div
              className={`w-16 h-16 rounded-2xl bg-white text-slate-950 flex items-center justify-center text-4xl shadow-xl font-bold transition-all duration-150 ${
                rolling ? "animate-bounce rotate-12 scale-110" : ""
              }`}
            >
              {DICE_FACES[diceValues[0] - 1]}
            </div>
            <div
              className={`w-16 h-16 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-4xl shadow-xl font-bold transition-all duration-150 ${
                rolling ? "animate-bounce -rotate-12 scale-110" : ""
              }`}
            >
              {DICE_FACES[diceValues[1] - 1]}
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleDiceRoll}
            disabled={rolling || selectedTeamIds.length < 2}
            className="w-full py-3.5 px-4 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
          >
            <span className="text-lg">🎲</span>
            {rolling ? "Se aruncă zarurile..." : "Aruncă Zarurile &amp; Trage la Sorți"}
          </button>
        </div>
      </div>
    </div>
  );
}
