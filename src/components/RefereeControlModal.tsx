"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  const [status, setStatus] = useState<"scheduled" | "live" | "finished">(
    (match.status as any) || "scheduled"
  );
  const [venue, setVenue] = useState<string>(match.venue || "");
  const [refereeName, setRefereeName] = useState<string>(
    match.referee || "Cristian Balaj - Arbitru FIFA"
  );

  // Match telemetry
  const [homeOffsides, setHomeOffsides] = useState<number>(0);
  const [awayOffsides, setAwayOffsides] = useState<number>(0);
  const [homeFouls, setHomeFouls] = useState<number>(0);
  const [awayFouls, setAwayFouls] = useState<number>(0);
  const [homeCorners, setHomeCorners] = useState<number>(0);
  const [awayCorners, setAwayCorners] = useState<number>(0);

  // Events Log
  const [events, setEvents] = useState<any[]>([]);
  const [newEventMinute, setNewEventMinute] = useState<number>(75);
  const [newEventType, setNewEventType] = useState<string>("goal");
  const [newEventTeam, setNewEventTeam] = useState<string>(match.homeTeam.name);
  const [newEventPlayer, setNewEventPlayer] = useState<string>("");
  const [newEventNote, setNewEventNote] = useState<string>("");

  // Report observations
  const [pitchCondition, setPitchCondition] = useState("Excelent");
  const [crowdConduct, setCrowdConduct] = useState("Sportivă / Fără incidente");
  const [refereeNotes, setRefereeNotes] = useState(
    "Partida s-a desfășurat în condiții regulamentare de fair-play."
  );
  const [signedBy, setSignedBy] = useState(match.referee || "Cristian Balaj");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function addEvent() {
    if (!newEventPlayer) return;
    const ev = {
      minute: newEventMinute,
      type: newEventType,
      team: newEventTeam,
      player: newEventPlayer,
      note: newEventNote,
    };
    setEvents([...events, ev]);
    setNewEventPlayer("");
    setNewEventNote("");

    // Auto increment score if goal
    if (newEventType === "goal") {
      if (newEventTeam === match.homeTeam.name) {
        setHomeScore((s) => s + 1);
      } else {
        setAwayScore((s) => s + 1);
      }
    }
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    try {
      const res = await fetch(
        `/api/championships/${championshipId}/matches/${match.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeScore,
            awayScore,
            status,
            venue,
            referee: refereeName,
            events: JSON.stringify(events),
            homeOffsides,
            awayOffsides,
            homeFouls,
            awayFouls,
            homeCorners,
            awayCorners,
            pitchCondition,
            crowdConduct,
            refereeNotes,
            signedBy,
            signedAt: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Eroare la salvarea meciului");
      }

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              ⚽
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
                Panoul Arbitrului la Meci
              </h3>
              <p className="text-xs font-label text-slate-400">
                Înregistrare scor, evenimente live, telemetrie și raport oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Live Scoreboard Controller */}
        <div className="bg-primary text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="text-center w-5/12">
            <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
              Gazde
            </span>
            <p className="text-base font-bold font-headline truncate mb-3">
              {match.homeTeam.name}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-lg font-black flex items-center justify-center"
              >
                -
              </button>
              <span className="text-4xl font-black data-font w-12">{homeScore}</span>
              <button
                type="button"
                onClick={() => setHomeScore(homeScore + 1)}
                className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-500 text-slate-950 text-lg font-black flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center w-2/12">
            <span className="text-2xl font-black text-lime-400 font-headline">:</span>
            <span className="block text-[10px] font-label uppercase font-bold text-slate-400 mt-1">
              VS
            </span>
          </div>

          <div className="text-center w-5/12">
            <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
              Oaspeți
            </span>
            <p className="text-base font-bold font-headline truncate mb-3">
              {match.awayTeam.name}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-lg font-black flex items-center justify-center"
              >
                -
              </button>
              <span className="text-4xl font-black data-font w-12">{awayScore}</span>
              <button
                type="button"
                onClick={() => setAwayScore(awayScore + 1)}
                className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-500 text-slate-950 text-lg font-black flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Status Switcher */}
        <div>
          <label className="block text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 mb-2">
            Stare Meci
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "scheduled", label: "Programat" },
              { id: "live", label: "🔴 În Desfășurare" },
              { id: "finished", label: "✓ Finalizat" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatus(st.id as any)}
                className={`py-2.5 px-3 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                  status === st.id
                    ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Counters: Offsides, Fouls, Corners */}
        <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
          {/* Offsides */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
              Offside-uri
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setHomeOffsides((o) => Math.max(0, o + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +G ({homeOffsides})
              </button>
              <button
                type="button"
                onClick={() => setAwayOffsides((o) => Math.max(0, o + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +O ({awayOffsides})
              </button>
            </div>
          </div>

          {/* Fouls */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
              Faulturi
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setHomeFouls((f) => Math.max(0, f + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +G ({homeFouls})
              </button>
              <button
                type="button"
                onClick={() => setAwayFouls((f) => Math.max(0, f + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +O ({awayFouls})
              </button>
            </div>
          </div>

          {/* Corners */}
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
              Cornere
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setHomeCorners((c) => Math.max(0, c + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +G ({homeCorners})
              </button>
              <button
                type="button"
                onClick={() => setAwayCorners((c) => Math.max(0, c + 1))}
                className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
              >
                +O ({awayCorners})
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Event Form */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
            Adaugă Eveniment în Cronologie (Gol, Cartonaș, Schimbare)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <input
              type="number"
              min={1}
              max={120}
              value={newEventMinute}
              onChange={(e) => setNewEventMinute(parseInt(e.target.value) || 1)}
              placeholder="Minut (ex: 45)"
              className="input text-xs"
            />
            <select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value)}
              className="input text-xs"
            >
              <option value="goal">⚽ Gol</option>
              <option value="yellow_card">🟨 Cartonaș Galben</option>
              <option value="red_card">🟥 Cartonaș Roșu</option>
              <option value="offside">🚩 Offside</option>
              <option value="sub">🔄 Schimbare</option>
            </select>
            <select
              value={newEventTeam}
              onChange={(e) => setNewEventTeam(e.target.value)}
              className="input text-xs"
            >
              <option value={match.homeTeam.name}>{match.homeTeam.name}</option>
              <option value={match.awayTeam.name}>{match.awayTeam.name}</option>
            </select>
            <input
              type="text"
              value={newEventPlayer}
              onChange={(e) => setNewEventPlayer(e.target.value)}
              placeholder="Nume Jucător"
              className="input text-xs"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEventNote}
              onChange={(e) => setNewEventNote(e.target.value)}
              placeholder="Observație / Detalii opționale..."
              className="input text-xs flex-1"
            />
            <button
              type="button"
              onClick={addEvent}
              className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-xl"
            >
              + Adaugă
            </button>
          </div>
        </div>

        {/* Referee Report & Observations */}
        <div className="space-y-3">
          <label className="block text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Raportul Oficial al Arbitrului Central
          </label>
          <textarea
            value={refereeNotes}
            onChange={(e) => setRefereeNotes(e.target.value)}
            rows={2}
            className="input text-xs font-body"
            placeholder="Observații privind desfășurarea partidei și conduita echipelor..."
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <Link
            href={`/matches/${match.id}/report`}
            target="_blank"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-label uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Vezi Raport PDF ↗
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
            >
              Anulează
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-md transition"
            >
              {saving ? "Se salvează..." : "Salvează &amp; Trimite Raport 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
