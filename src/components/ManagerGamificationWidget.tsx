"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getBadgeForXp, getBadgeColor } from "@/lib/managerXp";

export interface GamificationMatch {
  id: string;
  scheduledAt: string | Date;
  venue?: string | null;
  status: string; // "scheduled" | "live" | "finished"
  referee?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}

interface ManagerGamificationWidgetProps {
  managerXp?: number;
  managerBadge?: string | null;
  teamId: string;
  teamName: string;
  playersCount: number;
  checkInVerified?: boolean;
  matches?: GamificationMatch[];
  onXpUpdated?: (newXp: number, newBadge: string) => void;
}

export function ManagerGamificationWidget({
  managerXp = 0,
  managerBadge,
  teamId,
  teamName,
  playersCount,
  checkInVerified = false,
  matches = [],
  onXpUpdated,
}: ManagerGamificationWidgetProps) {
  const [xp, setXp] = useState(managerXp);
  const currentBadge = managerBadge || getBadgeForXp(xp);
  const badgeStyle = getBadgeColor(currentBadge);

  // Sync xp if prop changes
  useEffect(() => {
    setXp(managerXp);
  }, [managerXp]);

  // Target goals
  let nextTargetXp = 30;
  let nextBadgeName = "Manager de Bronz";
  if (xp >= 150) {
    nextTargetXp = 250;
    nextBadgeName = "Manager de Aur Suprem";
  } else if (xp >= 80) {
    nextTargetXp = 150;
    nextBadgeName = "Manager de Aur";
  } else if (xp >= 30) {
    nextTargetXp = 80;
    nextBadgeName = "Manager de Argint";
  }

  const progressPercent = Math.min(100, Math.round((xp / nextTargetXp) * 100));

  // Reported matches tracking via localStorage
  const [reportedMatchIds, setReportedMatchIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`fairplay_reported_${teamId}`);
      if (stored) {
        setReportedMatchIds(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [teamId]);

  // 1. Filter matches that are ELIGIBLE for reporting (Live or Finished, or scheduledAt in the past)
  const eligibleMatches = useMemo(() => {
    const now = Date.now();
    return matches.filter((m) => {
      const matchTime = new Date(m.scheduledAt).getTime();
      return m.status === "live" || m.status === "finished" || matchTime <= now;
    });
  }, [matches]);

  // 2. Filter matches that are eligible AND not yet reported
  const unreportedEligibleMatches = useMemo(() => {
    return eligibleMatches.filter((m) => !reportedMatchIds.includes(m.id));
  }, [eligibleMatches, reportedMatchIds]);

  // 3. Find next upcoming future match
  const nextUpcomingMatch = useMemo(() => {
    const now = Date.now();
    const futureMatches = matches
      .filter((m) => new Date(m.scheduledAt).getTime() > now && m.status === "scheduled")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return futureMatches[0] || null;
  }, [matches]);

  // Modal State
  const [showFairPlayModal, setShowFairPlayModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");

  useEffect(() => {
    if (unreportedEligibleMatches.length > 0) {
      setSelectedMatchId(unreportedEligibleMatches[0].id);
    } else if (eligibleMatches.length > 0) {
      setSelectedMatchId(eligibleMatches[0].id);
    }
  }, [unreportedEligibleMatches, eligibleMatches]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || unreportedEligibleMatches[0] || eligibleMatches[0] || null;
  }, [matches, selectedMatchId, unreportedEligibleMatches, eligibleMatches]);

  // Ratings
  const [fairPlayStars, setFairPlayStars] = useState(5);
  const [parentStars, setParentStars] = useState(5);
  const [refereeStars, setRefereeStars] = useState(5);
  const [assistantStars, setAssistantStars] = useState(5);
  const [refereeNameInput, setRefereeNameInput] = useState("");
  const [comments, setComments] = useState("");
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync referee name when active match changes
  useEffect(() => {
    if (activeMatch?.referee) {
      setRefereeNameInput(activeMatch.referee);
    } else {
      setRefereeNameInput("Arbitru Oficial Delegat");
    }
  }, [activeMatch]);

  const canReport = unreportedEligibleMatches.length > 0;

  async function handleFairPlaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatchId) {
      alert("Selectează un meci valid desfășurat.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/team/fairplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          matchId: selectedMatchId,
          refereeName: refereeNameInput || "Arbitru Oficial Delegat",
          fairPlayRating: fairPlayStars,
          parentConductRating: parentStars,
          refereeRating: refereeStars,
          comments: `Central (${refereeStars}/5 stele), Asistenți (${assistantStars}/5 stele) - ${comments}`,
          homeScore: homeScore !== "" ? Number(homeScore) : undefined,
          awayScore: awayScore !== "" ? Number(awayScore) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const gained = data.xpResult?.xpGained || 50;
        const newTotal = data.xpResult?.totalXp || xp + gained;
        const newBadgeCalculated = data.xpResult?.badge || getBadgeForXp(newTotal);

        setXp(newTotal);
        setSuccessToast(`+${gained} XP Acordate! Raportul a fost înregistrat.`);
        setShowFairPlayModal(false);

        // Mark match as reported in local storage
        const updated = [...reportedMatchIds, selectedMatchId];
        setReportedMatchIds(updated);
        try {
          localStorage.setItem(`fairplay_reported_${teamId}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }

        if (onXpUpdated) {
          onXpUpdated(newTotal, newBadgeCalculated);
        }

        setTimeout(() => setSuccessToast(null), 6000);
      } else {
        alert(data.error || "Eroare la trimiterea raportului");
      }
    } catch {
      alert("Eroare de rețea la transmiterea raportului");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="p-4 rounded-2xl bg-amber-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="font-mono text-sm">
            ×
          </button>
        </div>
      )}

      {/* Main Gamification Banner (Positioned above footer) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 shadow-xl text-white space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400/60 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
              <span className="material-symbols-outlined text-3xl font-black">{badgeStyle.icon}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Sistem Gamification Manager
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {currentBadge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-headline font-black uppercase tracking-tight text-white mt-0.5">
                {xp} XP Acumulate
              </h3>
            </div>
          </div>

          {/* Fair-Play Action Button with Match Timing Restrictions */}
          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            {canReport ? (
              <button
                type="button"
                onClick={() => setShowFairPlayModal(true)}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center gap-2 active:scale-95 animate-pulse"
              >
                <span className="material-symbols-outlined text-base">military_tech</span>
                <span>Raport Arbitraj &amp; Fair-Play (+50 XP)</span>
              </button>
            ) : (
              <div className="space-y-1 text-left sm:text-right">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-400 font-headline font-bold text-xs uppercase tracking-wider border border-slate-700 cursor-not-allowed opacity-80 flex items-center gap-1.5"
                  title="Raportul se activează doar în timpul sau după meciul echipei."
                >
                  <span className="material-symbols-outlined text-base text-slate-500">lock_clock</span>
                  <span>Raport Trimis / În Așteptare Meci</span>
                </button>
                <p className="text-[10px] font-mono text-slate-400">
                  {nextUpcomingMatch ? (
                    <>
                      Se reactivează la meciul din{" "}
                      <strong className="text-amber-400">
                        {new Date(nextUpcomingMatch.scheduledAt).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </>
                  ) : (
                    "Se reactivează în ziua următorului meci oficial."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar towards Gold Manager */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Progres către <strong>{nextBadgeName}</strong></span>
            <span className="text-amber-400 font-bold">{xp} / {nextTargetXp} XP ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-lime-400 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* XP Quests Checklist (4 Quests) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* 1. Completing Roster (+10 XP) */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
            playersCount >= 11
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-slate-900/80 border-slate-800 text-slate-400"
          }`}>
            <div>
              <div className="flex items-center gap-1">
                <strong className="text-white">+10 XP</strong>
                <span className="text-[10px] font-mono uppercase">Lot Complet (11+)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{playersCount}/11 sportivi</p>
            </div>
            <span className={`material-symbols-outlined text-lg ${playersCount >= 11 ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
              {playersCount >= 11 ? "check_circle" : "radio_button_unchecked"}
            </span>
          </div>

          {/* 2. Match GPS Check-in (+5 XP) */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
            checkInVerified
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-slate-900/80 border-slate-800 text-slate-400"
          }`}>
            <div>
              <div className="flex items-center gap-1">
                <strong className="text-white">+5 XP</strong>
                <span className="text-[10px] font-mono uppercase">Check-in Teren</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{checkInVerified ? "Confirmat GPS" : "La stadion"}</p>
            </div>
            <span className={`material-symbols-outlined text-lg ${checkInVerified ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
              {checkInVerified ? "check_circle" : "radio_button_unchecked"}
            </span>
          </div>

          {/* 3. Match Score Upload (+20 XP) */}
          <div className="p-3 rounded-2xl border bg-slate-900/80 border-slate-800 text-slate-300 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1">
                <strong className="text-lime-400">+20 XP</strong>
                <span className="text-[10px] font-mono uppercase">Scor Rapid Meci</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">La fluierul final</p>
            </div>
            <span className="material-symbols-outlined text-lg text-lime-400">sports_soccer</span>
          </div>

          {/* 4. Fair-Play Assessment (+50 XP) */}
          <div
            onClick={() => {
              if (canReport) setShowFairPlayModal(true);
            }}
            className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition ${
              canReport
                ? "bg-amber-500/15 border-amber-500/50 text-amber-300 cursor-pointer hover:bg-amber-500/25"
                : "bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <div>
              <div className="flex items-center gap-1">
                <strong className={canReport ? "text-amber-300" : "text-slate-400"}>+50 XP</strong>
                <span className="text-[10px] font-mono uppercase">Raport Arbitraj</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {canReport ? "Meci disponibil" : "Așteaptă meci"}
              </p>
            </div>
            <span className={`material-symbols-outlined text-lg ${canReport ? "text-amber-400 font-bold" : "text-slate-600"}`}>
              stars
            </span>
          </div>
        </div>
      </div>

      {/* Fair-Play Assessment Modal */}
      {showFairPlayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base uppercase text-slate-900 dark:text-white">
                    Raport Arbitraj &amp; Fair-Play
                  </h3>
                  <span className="text-[10px] text-amber-500 font-mono font-bold uppercase">
                    Câștigă +50 XP la trimitere
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFairPlayModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleFairPlaySubmit} className="space-y-4 text-xs">
              {/* Match Selector (Only Live or Finished Matches) */}
              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Meciul Desfășurat</span>
                  <span className="text-emerald-500 text-[9px] font-mono">În desfășurare / Finalizat</span>
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {unreportedEligibleMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.homeTeam.name} vs {m.awayTeam.name} (
                      {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      ) • {m.status === "live" ? "LIVE" : "Finalizat"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designated Referee Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">sports</span>
                    Brigada de Arbitri Desemnată la Meci
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Oficial</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">Nume Arbitru Principal / Delegat</label>
                  <input
                    type="text"
                    value={refereeNameInput}
                    onChange={(e) => setRefereeNameInput(e.target.value)}
                    placeholder="ex: Andrei Popescu (Arbitru Central)"
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                  />
                </div>
              </div>

              {/* Star Ratings Grid */}
              <div className="space-y-2.5">
                {/* 1. Referee Decision Rating */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Arbitru Central (Decizii &amp; Autoritate)</span>
                    <span className="text-[10px] text-slate-400">Corectitudine și gestionare joc</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRefereeStars(star)}
                        className={`text-lg transition ${
                          star <= refereeStars ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">star</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Assistant Referees Rating */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Arbitri Asistenți (Tușieri)</span>
                    <span className="text-[10px] text-slate-400">Semnalizări ofsaid și aut</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAssistantStars(star)}
                        className={`text-lg transition ${
                          star <= assistantStars ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">star</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Team & Opponent Fair Play */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Conduită &amp; Respect Adversar</span>
                    <span className="text-[10px] text-slate-400">Fair-play pe teren</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFairPlayStars(star)}
                        className={`text-lg transition ${
                          star <= fairPlayStars ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">star</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Parent & Supporter Conduct */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Comportament Părinți &amp; Galerie</span>
                    <span className="text-[10px] text-slate-400">Atitudine în tribune</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setParentStars(star)}
                        className={`text-lg transition ${
                          star <= parentStars ? "text-amber-400" : "text-slate-300 dark:text-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">star</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Quick Match Score Upload (+20 XP) */}
              <div className="p-3 rounded-2xl bg-lime-400/10 border border-lime-400/30 space-y-2">
                <span className="text-[10px] font-bold uppercase text-lime-400 font-mono block">
                  Scor Final Meci (+20 XP opțional)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Goluri Gazde</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Gazde"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Goluri Oaspeți</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Oaspeți"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400">
                  Observații Meci &amp; Incident Arbitraj
                </label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Notează prestația arbitrului sau incidentele din timpul jocului..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFairPlayModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>{submitting ? "Se trimite..." : "Trimite Raport (+50 XP)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
