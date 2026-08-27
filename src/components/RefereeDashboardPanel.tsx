"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefereeCalendar } from "./RefereeCalendar";

export interface MatchOfficiatingItem {
  id: string;
  championshipId: string;
  round: number;
  scheduledAt: string | Date;
  venue?: string | null;
  referee?: string | null;
  status: string; // "scheduled" | "live" | "finished"
  homeScore?: number | null;
  awayScore?: number | null;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
  homeOffsides: number;
  awayOffsides: number;
  events?: string | null;
  pitchCondition?: string | null;
  crowdConduct?: string | null;
  refereeNotes?: string | null;
   signedBy?: string | null;
   signedAt?: string | Date | null;
   refereeConfirmed?: boolean | null;
   refereeConfirmedAt?: string | Date | null;
   refereeDeclined?: boolean | null;
  homeTeam: {
    id: string;
    name: string;
    shortName?: string | null;
    color?: string | null;
    logoUrl?: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName?: string | null;
    color?: string | null;
    logoUrl?: string | null;
  };
  championship: {
    id: string;
    name: string;
    sport: string;
  };
}

interface MatchEvent {
  type: "goal" | "yellow_card" | "red_card" | "penalty" | "own_goal";
  minute: number;
  team: "home" | "away";
  playerName: string;
  notes?: string;
}

export function RefereeDashboardPanel({
  refereeUser,
  upcomingMatch,
  matchHistory,
  pendingMatches = [],
}: {
  refereeUser: {
    id: string;
    name: string;
    email: string;
    refereeBadge?: string | null;
    experienceYears?: number | null;
    image?: string | null;
    coverPhotoUrl?: string | null;
  };
   upcomingMatch: MatchOfficiatingItem | null;
  matchHistory: MatchOfficiatingItem[];
  pendingMatches?: MatchOfficiatingItem[];
}) {
  const router = useRouter();

  // Active Officiating Modal State
  const [activeMatchModal, setActiveMatchModal] = useState<MatchOfficiatingItem | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<string>("scheduled");
  const [homeFouls, setHomeFouls] = useState<number>(0);
  const [awayFouls, setAwayFouls] = useState<number>(0);
  const [homeCorners, setHomeCorners] = useState<number>(0);
  const [awayCorners, setAwayCorners] = useState<number>(0);
  const [homeOffsides, setHomeOffsides] = useState<number>(0);
  const [awayOffsides, setAwayOffsides] = useState<number>(0);
  const [pitchCondition, setPitchCondition] = useState<string>("Excelent");

  // Match confirmation state
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"accept" | "decline" | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);
  const [crowdConduct, setCrowdConduct] = useState<string>("Sportivă / Fără incidente");
  const [refereeNotes, setRefereeNotes] = useState<string>("");
  const [signedBy, setSignedBy] = useState<string>(refereeUser.name || "Arbitru Oficial");
  const [eventsList, setEventsList] = useState<MatchEvent[]>([]);

  // New Event Form State
  const [newEventType, setNewEventType] = useState<"goal" | "yellow_card" | "red_card" | "penalty">("goal");
  const [newEventMinute, setNewEventMinute] = useState<number>(15);
  const [newEventTeam, setNewEventTeam] = useState<"home" | "away">("home");
  const [newEventPlayer, setNewEventPlayer] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Confirm or decline match attendance
  async function handleConfirmMatch(matchId: string, action: "accept" | "decline") {
    const confirmed = window.confirm(
      action === "accept"
        ? "Confirmi prezența ta ca arbitru la acest meci?\n\n După confirmare, organizatorul este notificat și nu poți renunța la meci."
        : "Ești sigur că refuzi acest meci?\n\n Organizatorul va fi notificat că nu poți fi la acest meci."
    );
    if (!confirmed) return;

    setConfirmingMatchId(matchId);
    setConfirmError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setConfirmError(data.error || "Eroare la confirmare.");
        return;
      }

      setConfirmSuccess(data.message || "Ai confirmat prezența la meci.");
      setTimeout(() => setConfirmSuccess(null), 3000);

      // Reîncărcăm datele pentru a reflecta starea nouă
      router.refresh();
    } catch {
      setConfirmError("Eroare de rețea. Te rugăm să reîncerci.");
    } finally {
      setConfirmingMatchId(null);
    }
  }

  // Open Officiating Modal for a specific match
  const openOfficiatingModal = (match: MatchOfficiatingItem) => {
    setActiveMatchModal(match);
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setMatchStatus(match.status || "scheduled");
    setHomeFouls(match.homeFouls || 0);
    setAwayFouls(match.awayFouls || 0);
    setHomeCorners(match.homeCorners || 0);
    setAwayCorners(match.awayCorners || 0);
    setHomeOffsides(match.homeOffsides || 0);
    setAwayOffsides(match.awayOffsides || 0);
    setPitchCondition(match.pitchCondition || "Excelent");
    setCrowdConduct(match.crowdConduct || "Sportivă / Fără incidente");
    setRefereeNotes(match.refereeNotes || "");
    setSignedBy(match.signedBy || refereeUser.name || "Arbitru Oficial");

    try {
      if (match.events) {
        setEventsList(JSON.parse(match.events));
      } else {
        setEventsList([]);
      }
    } catch {
      setEventsList([]);
    }

    setSaveSuccess(false);
    setSaveError(null);
  };

  // Add an event
  const handleAddEvent = () => {
    if (!newEventPlayer.trim()) return;
    const newEv: MatchEvent = {
      type: newEventType,
      minute: newEventMinute,
      team: newEventTeam,
      playerName: newEventPlayer.trim(),
    };
    setEventsList([...eventsList, newEv]);
    setNewEventPlayer("");

    // Auto increment score if goal
    if (newEventType === "goal" || newEventType === "penalty") {
      if (newEventTeam === "home") setHomeScore((s) => s + 1);
      else setAwayScore((s) => s + 1);
    }
  };

  // Remove an event
  const handleRemoveEvent = (index: number) => {
    const updated = [...eventsList];
    updated.splice(index, 1);
    setEventsList(updated);
  };

  // Submit Official Match Report & Score
  const handleSaveMatch = async () => {
    if (!activeMatchModal) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        status: matchStatus,
        homeScore,
        awayScore,
        homeFouls,
        awayFouls,
        homeCorners,
        awayCorners,
        homeOffsides,
        awayOffsides,
        pitchCondition,
        crowdConduct,
        refereeNotes,
        signedBy,
        signedAt: new Date().toISOString(),
        events: JSON.stringify(eventsList),
      };

      const res = await fetch(
        `/api/championships/${activeMatchModal.championshipId}/matches/${activeMatchModal.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la salvarea meciului");
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveMatchModal(null);
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || "A apărut o problemă la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 font-body">
      {/* Referee Header Summary */}
      <section className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0 overflow-hidden border-2 border-white dark:border-slate-950">
            {refereeUser.image ? (
              <img
                src={refereeUser.image}
                alt={refereeUser.name || "Arbitru"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-headline font-black text-2xl">
                {refereeUser.name
                  ? refereeUser.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w: string) => w[0])
                      .join("")
                      .toUpperCase()
                  : "AR"}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  {refereeUser.refereeBadge || "RIFA"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 text-[10px] font-bold font-label">
                  Oficial Atestat
                </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase tracking-tight">
              {refereeUser.name}
            </h1>
            <p className="text-xs text-slate-400 font-label">
              {refereeUser.experienceYears
                ? `Experiență: ${refereeUser.experienceYears} ani`
                : "Arbitru de Bază"} • <span className="text-lime-400">Delegat Oficial</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 border border-slate-700"
          >
            <span className="material-symbols-outlined text-base">account_circle</span>
            Profil &amp; Poză (Dublu-Click)
          </Link>
        </div>
      </section>

      {/* SECTION 1: UPCOMING ASSIGNED MATCH (Meciul ce urmează să îl arbitrezi) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
          <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
            ⚡ Meciul Următor Asignat (Delegare Oficială)
          </h2>
        </div>

        {upcomingMatch ? (
          <div className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/40 border-2 border-lime-400/60 rounded-3xl shadow-2xl space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase font-label">
                  {upcomingMatch.championship.name}
                </span>
                <span className="text-xs text-slate-400 font-label">
                  Etapa {upcomingMatch.round}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 font-bold text-xs font-label uppercase">
                {upcomingMatch.status === "live"
                  ? "🔴 LIVE ÎN DESFĂȘURARE"
                  : upcomingMatch.status === "finished"
                    ? "✓ FINALIZAT"
                    : "⏳ PROGRAMAT"}
              </span>
            </div>

            {/* Score & Teams Matchup */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-4 border-y border-slate-800 text-center">
              {/* Home Team */}
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center font-headline font-black text-xl text-white border border-slate-700 shadow-md">
                  {upcomingMatch.homeTeam.shortName || upcomingMatch.homeTeam.name.substring(0, 3)}
                </div>
                <h3 className="font-headline font-black text-lg sm:text-xl text-white">
                  {upcomingMatch.homeTeam.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-label uppercase font-bold">Gazde</span>
              </div>

              {/* Score Display */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-4xl sm:text-5xl font-black font-headline text-lime-400 data-font">
                    {upcomingMatch.homeScore ?? 0}
                  </span>
                  <span className="text-2xl text-slate-600 font-black">:</span>
                  <span className="text-4xl sm:text-5xl font-black font-headline text-lime-400 data-font">
                    {upcomingMatch.awayScore ?? 0}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-label">
                  📍 {upcomingMatch.venue || "Arena Oficială"}
                </p>
                <p className="text-[11px] text-slate-500 font-label">
                  🕒 {new Date(upcomingMatch.scheduledAt).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>

              {/* Away Team */}
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center font-headline font-black text-xl text-white border border-slate-700 shadow-md">
                  {upcomingMatch.awayTeam.shortName || upcomingMatch.awayTeam.name.substring(0, 3)}
                </div>
                <h3 className="font-headline font-black text-lg sm:text-xl text-white">
                  {upcomingMatch.awayTeam.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-label uppercase font-bold">Oaspeți</span>
              </div>
            </div>

            {/* Actions for Upcoming Match */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <div className="text-xs text-slate-400 font-label">
                Arbitru Oficial Delegat: <strong className="text-lime-400">{refereeUser.name}</strong>
              </div>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openOfficiatingModal(upcomingMatch)}
                  className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">sports</span>
                  Deschide Panoul de Arbitraj Live
                </button>

                <Link
                  href={`/matches/${upcomingMatch.id}/report`}
                  target="_blank"
                  className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  Raport PDF
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-500">sports</span>
            <p className="font-bold text-white text-sm">Nu ai niciun meci programat în așteptare.</p>
            <p className="text-xs text-slate-400">
              Delegările viitoare vor apărea automat aici când ești desemnat de către organizator.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: REFEREE CALENDAR & GOOGLE SYNC */}
      <section>
        <RefereeCalendar refereeName={refereeUser.name} />
      </section>

      {/* SECTION 3: OFFICIATED MATCHES HISTORY (Istoric Meciuri Arbitrate) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-primary rounded-full"></span>
            <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
              📋 Istoric Meciuri Arbitrate ({matchHistory.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-label">Rapoarte Oficiale Înregistrate</span>
        </div>

        {matchHistory.length === 0 ? (
          <div className="card p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
            Nu există meciuri finalizate anterior în istoric.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchHistory.map((m) => (
              <div
                key={m.id}
                className="card p-5 bg-slate-900 border border-slate-800 hover:border-lime-400/50 rounded-3xl shadow-sm space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                    <span className="truncate max-w-[160px]">{m.championship.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-lime-400 font-black">
                      Etapa {m.round}
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-headline font-bold text-sm text-white">
                    <span className="truncate">{m.homeTeam.name}</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-950 font-black data-font text-lime-400 border border-slate-800 text-base">
                      {m.homeScore ?? 0} - {m.awayScore ?? 0}
                    </span>
                    <span className="truncate">{m.awayTeam.name}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-label flex items-center justify-between pt-1">
                    <span>📍 {m.venue || "Arena Oficială"}</span>
                    <span>
                      {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { dateStyle: "short" })}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openOfficiatingModal(m)}
                    className="text-xs font-bold text-lime-400 hover:underline font-label flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editează Raport
                  </button>

                  <Link
                    href={`/matches/${m.id}/report`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold font-label transition border border-slate-700"
                  >
                    Raport PDF ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* OFFICIATING MODAL / LIVE MATCH CONTROL PANEL */}
      {activeMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-lime-400/50 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  FOAIE DE ARBITRAJ OFICIALĂ
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-headline uppercase text-white mt-1">
                  {activeMatchModal.homeTeam.name} vs {activeMatchModal.awayTeam.name}
                </h3>
                <p className="text-xs text-slate-400 font-label">
                  {activeMatchModal.championship.name} • Etapa {activeMatchModal.round}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMatchModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score & Status Controls */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-label text-slate-400 uppercase">
                  Scor Meci în Timp Real
                </span>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-lime-400 focus:outline-none"
                >
                  <option value="scheduled">⏳ Programat</option>
                  <option value="live">🔴 Live În Desfășurare</option>
                  <option value="finished">✓ Meci Finalizat</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center text-center gap-4">
                {/* Home Score */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-300 truncate">
                    {activeMatchModal.homeTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-lg"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black font-headline text-lime-400 w-12 data-font">
                      {homeScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHomeScore(homeScore + 1)}
                      className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="text-2xl text-slate-600 font-black">:</span>

                {/* Away Score */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-300 truncate">
                    {activeMatchModal.awayTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-lg"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black font-headline text-lime-400 w-12 data-font">
                      {awayScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAwayScore(awayScore + 1)}
                      className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry (Faulturi, Cornere, Ofsaiduri) */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Faulturi (G / O)
                </span>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                  <input
                    type="number"
                    min={0}
                    value={homeFouls}
                    onChange={(e) => setHomeFouls(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={awayFouls}
                    onChange={(e) => setAwayFouls(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Cornere (G / O)
                </span>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                  <input
                    type="number"
                    min={0}
                    value={homeCorners}
                    onChange={(e) => setHomeCorners(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={awayCorners}
                    onChange={(e) => setAwayCorners(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Ofsaiduri (G / O)
                </span>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                  <input
                    type="number"
                    min={0}
                    value={homeOffsides}
                    onChange={(e) => setHomeOffsides(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={awayOffsides}
                    onChange={(e) => setAwayOffsides(parseInt(e.target.value) || 0)}
                    className="w-10 text-center bg-slate-900 rounded p-1"
                  />
                </div>
              </div>
            </div>

            {/* Events Logger (Cartonase, Goluri, Penalty) */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold font-label text-slate-300 uppercase block">
                Înregistrează Eveniment / Cartonaș / Gol
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="goal">⚽ Gol</option>
                  <option value="yellow_card">🟨 Cartonaș Galben</option>
                  <option value="red_card">🟥 Cartonaș Roșu</option>
                  <option value="penalty">🎯 Penalty</option>
                </select>

                <select
                  value={newEventTeam}
                  onChange={(e) => setNewEventTeam(e.target.value as any)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="home">Gazde ({activeMatchModal.homeTeam.name})</option>
                  <option value="away">Oaspeți ({activeMatchModal.awayTeam.name})</option>
                </select>

                <input
                  type="text"
                  placeholder="Nume jucător..."
                  value={newEventPlayer}
                  onChange={(e) => setNewEventPlayer(e.target.value)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newEventMinute}
                    onChange={(e) => setNewEventMinute(parseInt(e.target.value) || 1)}
                    className="w-16 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-center"
                    placeholder="Min"
                  />
                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="flex-1 px-3 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    Adaugă
                  </button>
                </div>
              </div>

              {/* Events List */}
              {eventsList.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  {eventsList.map((ev, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-xl bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {ev.type === "goal"
                            ? "⚽"
                            : ev.type === "yellow_card"
                              ? "🟨"
                              : ev.type === "red_card"
                                ? "🟥"
                                : "🎯"}
                        </span>
                        <span className="font-bold text-lime-400">Min. {ev.minute}&apos;</span>
                        <span className="text-white font-bold">{ev.playerName}</span>
                        <span className="text-[10px] text-slate-400 font-label">
                          ({ev.team === "home" ? activeMatchModal.homeTeam.name : activeMatchModal.awayTeam.name})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(idx)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Report Notes & Signature */}
            <div className="space-y-3">
              <label className="text-xs font-bold font-label text-slate-300 uppercase block">
                Raportul Oficial al Arbitrului &amp; Incidente
              </label>
              <textarea
                rows={3}
                value={refereeNotes}
                onChange={(e) => setRefereeNotes(e.target.value)}
                placeholder="Notează orice incident, eliminări, contestații sau starea jocului..."
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-label text-slate-400 block mb-1">
                  Stare Suprafață Joc
                </label>
                <select
                  value={pitchCondition}
                  onChange={(e) => setPitchCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Excelent">Excelent (Gazon impecabil)</option>
                  <option value="Bun">Bun (Standard)</option>
                  <option value="Umed / Alunecos">Umed / Ploaie</option>
                  <option value="Denivelat">Denivelat</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-label text-slate-400 block mb-1">
                  Semnătură Arbitru Oficial
                </label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold">
                ⚠️ {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold">
                ✓ Raportul și scorul meciului au fost salvate cu succes!
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveMatchModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase"
              >
                Anulează
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveMatch}
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
              >
                {isSaving ? "Se salvează..." : "Salvează Foaia de Arbitraj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Meciurile mele — Confirmare prezență */}
      <section className="space-y-6 mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400">sports_soccer</span>
            Meciurile Mele — Confirmă prezența
          </h2>
          {confirmError && (
            <div className="p-2 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold">
              {confirmError}
            </div>
          )}
          {confirmSuccess && (
            <div className="p-2 rounded-xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold">
              {confirmSuccess}
            </div>
          )}
        </div>

        {pendingMatches && pendingMatches.length > 0 ? (
          <div className="space-y-3">
            {pendingMatches.map((m) => {
              const isHome = m.homeTeam?.id === refereeUser?.id;
              const dateObj = new Date(m.scheduledAt);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-700 bg-slate-950 flex flex-col sm:flex-row items-start gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 font-bold text-[10px]">
                          {isHome ? "Acasă" : "Deplasare"}
                        </span>
                        <span className="text-sm font-headline font-bold text-white">
                          {m.homeTeam?.name || "Echipa Locală"} vs {m.awayTeam?.name || "Echipa Oaspeților"}
                        </span>
                      </div>
                      <span className="text-[10px] font-label text-slate-400">
                        {dateObj.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })} • {dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {m.venue || "Stadion necunoscut"} • {m.championship?.name || "Campionat"}
                    </p>
                    {m.refereeConfirmed && (
                      <p className="text-xs text-emerald-400 font-bold">✓ Ai confirmat prezența</p>
                    )}
                    {m.refereeDeclined && (
                      <p className="text-xs text-red-400 font-bold">Ai refuzat acest meci</p>
                    )}
                  </div>
                  {!m.refereeConfirmed && !m.refereeDeclined && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleConfirmMatch(m.id, "accept")}
                        disabled={confirmingMatchId === m.id}
                        className="px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase transition disabled:opacity-50"
                      >
                        {confirmingMatchId === m.id ? "Se trimite..." : "Confirmă"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmMatch(m.id, "decline")}
                        disabled={confirmingMatchId === m.id}
                        className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-headline font-bold text-xs uppercase transition disabled:opacity-50"
                      >
                        Refuză
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl italic">
            Nu ai meciuri programate în acest moment.
          </div>
        )}
      </section>
    </div>
  );
}
