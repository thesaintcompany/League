"use client";

import React, { useState } from "react";
import { MatchData } from "./MatchCard";

interface RefereeControlModalProps {
  match: MatchData;
  championshipId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function RefereeControlModal({
  match,
  championshipId,
  isOpen,
  onClose,
  onUpdated,
}: RefereeControlModalProps) {
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [status, setStatus] = useState<MatchData["status"]>(match.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/championships/${championshipId}/matches/${match.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore: status === "scheduled" ? null : homeScore,
            awayScore: status === "scheduled" ? null : awayScore,
            status,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Eroare la actualizarea meciului");
      }

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-lime-400"></span>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400">
                Panou Arbitru & Scor Live
              </span>
            </div>
            <h3 className="text-xl font-bold font-headline">Control Meci</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Status selector */}
          <div>
            <label className="label">Statut Meci</label>
            <div className="grid grid-cols-3 gap-2">
              {(["scheduled", "live", "finished"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2.5 px-3 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all ${
                    status === s
                      ? s === "live"
                        ? "bg-lime-400 text-slate-950 shadow-md font-black"
                        : "bg-primary text-white shadow-md font-black"
                      : "bg-surface-container-low text-slate-600 hover:bg-surface-container"
                  }`}
                >
                  {s === "live" ? "🔴 LIVE" : s === "finished" ? "Finalizat" : "Programat"}
                </button>
              ))}
            </div>
          </div>

          {/* Score Controllers */}
          <div className="grid grid-cols-2 gap-4 bg-surface-container-low dark:bg-slate-800/40 p-4 rounded-2xl">
            {/* Home Team */}
            <div className="text-center space-y-3">
              <p className="text-xs font-bold text-blue-950 dark:text-white font-headline truncate">
                {match.homeTeam.name}
              </p>
              <div className="text-4xl font-black data-font text-blue-950 dark:text-lime-400">
                {homeScore}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 shadow-sm"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setHomeScore(homeScore + 1)}
                  className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-lg hover:bg-slate-800 active:scale-95 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Away Team */}
            <div className="text-center space-y-3">
              <p className="text-xs font-bold text-blue-950 dark:text-white font-headline truncate">
                {match.awayTeam.name}
              </p>
              <div className="text-4xl font-black data-font text-blue-950 dark:text-lime-400">
                {awayScore}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 shadow-sm"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setAwayScore(awayScore + 1)}
                  className="w-9 h-9 rounded-xl bg-primary text-white font-bold text-lg hover:bg-slate-800 active:scale-95 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary bg-primary hover:bg-slate-800 text-white"
            disabled={loading}
          >
            {loading ? "Se salvează..." : "Salvează Modificările"}
          </button>
        </div>
      </div>
    </div>
  );
}
