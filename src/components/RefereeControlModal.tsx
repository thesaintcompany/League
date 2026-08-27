"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatchData } from "./MatchCard";
import { isIndividualSport, getAjfUrlForCounty } from "@/lib/constants";

interface RefereeControlModalProps {
  match: MatchData;
  championshipId: string;
  sport?: string;
  county?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

interface RefereeOption {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
  refereeBadge?: string | null;
}

export function RefereeControlModal({
  match,
  championshipId,
  sport = "Fotbal",
  county,
  isOpen,
  onClose,
  onUpdated,
}: RefereeControlModalProps) {
  const isIndividual = isIndividualSport(sport);
  const ajfInfo = getAjfUrlForCounty(county);
  const [activeTab, setActiveTab] = useState<"organizer" | "live_score" | "report">("organizer");

  // Match core details
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [status, setStatus] = useState<"scheduled" | "live" | "finished">(
    (match.status as any) || "scheduled"
  );
  const [venue, setVenue] = useState<string>(
    match.venue || (isIndividual ? "Teren Central (Zgură)" : "")
  );
  const [scheduledAt, setScheduledAt] = useState<string>(
    match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : ""
  );

  // Tennis-specific set scores
  const [tennisSet1, setTennisSet1] = useState<string>("6-4");
  const [tennisSet2, setTennisSet2] = useState<string>("3-6");
  const [tennisSet3, setTennisSet3] = useState<string>("7-5");

  // Referee & Organizer settings
  const [refereeName, setRefereeName] = useState<string>(
    match.referee || (isIndividual ? "Adrian Ungur (Arbitru Scaun FRT)" : "Cristian Balaj")
  );
  const [availableReferees, setAvailableReferees] = useState<RefereeOption[]>([]);
  const [refereeDeadlineDays, setRefereeDeadlineDays] = useState<number>(3);
  const [refereeNotes, setRefereeNotes] = useState<string>(
    isIndividual
      ? "Meci de tenis simplu. Sistem cel mai bun din 3 seturi cu tiebreak clasic la 6-6. Pauză de hidratare permisă la fiecare schimbare de teren."
      : "Partida se va desfășura în conformitate cu regulamentul  . Verificați legitimațiile jucătorilor înainte de fluierul de start."
  );

  // Match telemetry (Football: Offsides/Fouls/Corners vs Tennis: Aces/DoubleFaults/BreakPoints)
  const [homeStat1, setHomeStat1] = useState<number>(0); // Offsides or Aces
  const [awayStat1, setAwayStat1] = useState<number>(0);
  const [homeStat2, setHomeStat2] = useState<number>(0); // Fouls or Double Faults
  const [awayStat2, setAwayStat2] = useState<number>(0);
  const [homeStat3, setHomeStat3] = useState<number>(0); // Corners or Break Points
  const [awayStat3, setAwayStat3] = useState<number>(0);

  // Events Log
  const [events, setEvents] = useState<any[]>([]);
  const [newEventMinute, setNewEventMinute] = useState<number>(isIndividual ? 1 : 75);
  const [newEventType, setNewEventType] = useState<string>(isIndividual ? "ace" : "goal");
  const [newEventTeam, setNewEventTeam] = useState<string>(match.homeTeam.name);
  const [newEventPlayer, setNewEventPlayer] = useState<string>("");
  const [newEventNote, setNewEventNote] = useState<string>("");

  // Report observations
  const [pitchCondition, setPitchCondition] = useState(
    isIndividual ? "Suprafață Zgură impecabilă / Linii curate" : "Excelent"
  );
  const [crowdConduct, setCrowdConduct] = useState("Sportivă / Fără incidente");
  const [signedBy, setSignedBy] = useState(
    match.referee || (isIndividual ? "Adrian Ungur" : "Cristian Balaj")
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch registered referees from platform
  useEffect(() => {
    async function loadReferees() {
      try {
        const res = await fetch("/api/referees");
        if (res.ok) {
          const data = await res.json();
          if (data.referees && data.referees.length > 0) {
            setAvailableReferees(data.referees);
          }
        }
      } catch {
        // Fallback silently
      }
    }
    loadReferees();
  }, []);

  if (!isOpen) return null;

  // Calculate days until match date for deadline compliance check
  const matchTimestamp = match.scheduledAt ? new Date(match.scheduledAt).getTime() : Date.now();
  const daysUntilMatch = Math.ceil((matchTimestamp - Date.now()) / (1000 * 60 * 60 * 24));
  const isWithinDeadline = daysUntilMatch >= refereeDeadlineDays;

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

    // Auto increment score if goal or set win
    if (newEventType === "goal" || newEventType === "set_won") {
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
      const tennisNoteSummary = isIndividual
        ? `Seturi: [${tennisSet1}], [${tennisSet2}], [${tennisSet3}] • ${refereeNotes}`
        : refereeNotes;

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
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
            referee: refereeName,
            events: JSON.stringify(events),
            homeOffsides: homeStat1,
            awayOffsides: awayStat1,
            homeFouls: homeStat2,
            awayFouls: awayStat2,
            homeCorners: homeStat3,
            awayCorners: awayStat3,
            pitchCondition,
            crowdConduct,
            refereeNotes: tennisNoteSummary,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                <span className="material-symbols-outlined">{isIndividual ? "sports_tennis" : "settings"}</span>
              </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white">
                  {isIndividual ? "Panou Organizare Meci & Arbitraj Scaun" : "Panou Organizare Meci & Arbitraj"}
                </h3>
                <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-600 dark:text-lime-400 text-[10px] font-black uppercase font-mono">
                  {sport}
                </span>
              </div>
              <p className="text-xs font-label text-slate-400">
                {match.homeTeam.name} vs {match.awayTeam.name} • Etapa {match.round}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("organizer")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition ${activeTab === "organizer"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            {isIndividual ? "📋 Organizare & Arbitru Scaun" : "📋 Organizare & Arbitri"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("live_score")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition ${activeTab === "live_score"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            {isIndividual ? "Scor Seturi & Puncte" : "Scor & Evenimente"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition ${activeTab === "report"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            📄 Raport Tehnic
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-500/30">
            {error}
          </div>
        )}

        {/* ================= TAB 1: ORGANIZARE & ARBITRI ================= */}
        {activeTab === "organizer" && (
          <div className="space-y-6">
            {/* Referee Allocation & Settings Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-headline font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined">{isIndividual ? "sports_tennis" : "work"}</span> {isIndividual ? "Delegare Arbitru de Scaun (Umpire)" : "Delegare Arbitru  "}
                </span>
                <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400">
                  Selectat: {refereeName}
                </span>
              </div>

              {/* Deadline Setting & Live Validation Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Termen Minim Alocare (Zile înainte de meci)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={refereeDeadlineDays}
                      onChange={(e) => setRefereeDeadlineDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                    <span className="text-xs text-slate-500 font-medium">zile înainte de meci</span>
                  </div>
                </div>

                <div>
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-bold border flex items-center gap-2 ${isWithinDeadline
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      }`}
                  >
                    <span className="material-symbols-outlined">{isWithinDeadline ? "check_circle" : "warning"}</span>
                    <div>
                      <p className="leading-tight">
                        {isWithinDeadline
                          ? `În termen regulamentar (${daysUntilMatch} zile rămase până la meci)`
                          : `Atenție: sub termenul de ${refereeDeadlineDays} zile (${daysUntilMatch} zile rămase)`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referee Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    {isIndividual ? "Selectează Arbitru Tenis Certificat" : "Selectează Arbitru Certificat"}
                  </label>
                  <select
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {isIndividual ? (
                      <>
                        <option value="Adrian Ungur (Arbitru Scaun FRT)">Adrian Ungur (Arbitru Scaun FRT)</option>
                        <option value="Raluca Olaru (Arbitru ITF Gold)">Raluca Olaru (Arbitru ITF Gold)</option>
                        <option value="Andrei Pavel (Arbitru Supervizor)">Andrei Pavel (Arbitru Supervizor)</option>
                      </>
                    ) : (
                      <>
                        <option value="Cristian Balaj">Cristian Balaj (Arbitru FIFA / Național)</option>
                        <option value="Ovidiu Hațegan">Ovidiu Hațegan (Arbitru FIFA Elite)</option>
                        <option value="Istvan Kovacs">Istvan Kovacs (Arbitru UEFA)</option>
                        <option value="Radu Petrescu">Radu Petrescu (Arbitru Liga 1)</option>
                      </>
                    )}
                    {availableReferees.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} {r.refereeBadge ? `(${r.refereeBadge})` : "• Arbitru Certificat"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Sau Nume Manual Arbitru
                  </label>
                  <input
                    type="text"
                    value={refereeName}
                    onChange={(e) => setRefereeName(e.target.value)}
                    placeholder="ex: Andrei Popescu"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* AJF County Official Portal Quick Discovery Button */}
              <div className="p-3.5 rounded-xl bg-lime-400/10 border border-lime-400/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl material-symbols-outlined">account_balance</span>
                  <div>
                    <p className="text-xs font-headline font-bold text-slate-900 dark:text-white">
                      Ai nevoie de arbitri delegați  ?
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Te îndrumăm direct pe portalul   al asociației fără a stoca date sensibile.
                    </p>
                  </div>
                </div>

                <a
                  href={ajfInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
                >
                  <span>Găsește arbitri în județul tău ({ajfInfo.label})</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>

              {/* Referee Instructions & Notes */}
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  {isIndividual ? "Notițe & Instrucțiuni Tehnice pentru Arbitrul de Scaun" : "Notițe & Instrucțiuni Tehnice pentru Arbitru"}
                </label>
                <textarea
                  value={refereeNotes}
                  onChange={(e) => setRefereeNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-body text-slate-900 dark:text-white"
                  placeholder="Instrucțiuni speciale, reguli de tiebreak, pauze medicale, telefoane de urgență..."
                />
              </div>
            </div>

            {/* Match Date, Venue & Gate Scanner Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span> Data &amp; Ora Meciului</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {isIndividual ? "Teren / Arenă de Tenis" : "Stadion / Arenă  ă"}</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder={isIndividual ? "ex: Terenul Central - Zgură" : "ex: Arena Națională"}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Gate Scanner Access Box for Organizer */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl material-symbols-outlined">confirmation_number</span>
                <div>
                  <p className="font-headline font-bold text-xs uppercase text-lime-400">
                    Scanner Porți Meci
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Activarea porților și validarea biletelor pentru această partidă.
                  </p>
                </div>
              </div>

              <Link
                href={`/tickets/scanner?matchId=${match.id}`}
                target="_blank"
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-xl shadow transition shrink-0"
              >
                Deschide Scanner ↗
              </Link>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE SCORE & EVENIMENTE ================= */}
        {activeTab === "live_score" && (
          <div className="space-y-6">
            {/* Live Scoreboard Controller */}
            <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800">
              <div className="text-center w-5/12">
                <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
                  {isIndividual ? "Jucător 1 (Serviciu)" : "Gazde"}
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
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {isIndividual ? "Seturi Câștigate" : "Goluri"}
                </span>
              </div>

              <div className="text-center w-2/12">
                <span className="text-2xl font-black text-lime-400 font-headline">:</span>
                <span className="block text-[10px] font-label uppercase font-bold text-slate-400 mt-1">
                  VS
                </span>
              </div>

              <div className="text-center w-5/12">
                <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
                  {isIndividual ? "Jucător 2 (Primitor)" : "Oaspeți"}
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
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {isIndividual ? "Seturi Câștigate" : "Goluri"}
                </span>
              </div>
            </div>

            {/* Tennis Detailed Set Scores */}
            {isIndividual && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300 block">
                  Scor Detaliat pe Seturi (Game-uri)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Set 1</label>
                    <input
                      type="text"
                      value={tennisSet1}
                      onChange={(e) => setTennisSet1(e.target.value)}
                      placeholder="ex: 6-4"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Set 2</label>
                    <input
                      type="text"
                      value={tennisSet2}
                      onChange={(e) => setTennisSet2(e.target.value)}
                      placeholder="ex: 3-6"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Set 3 / Decisiv</label>
                    <input
                      type="text"
                      value={tennisSet3}
                      onChange={(e) => setTennisSet3(e.target.value)}
                      placeholder="ex: 7-5"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Match Status Selector */}
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${status === st.id
                      ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry Counters */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  {isIndividual ? "Asuri (Aces)" : "Offside-uri"}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHomeStat1((o) => Math.max(0, o + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J1 ({homeStat1})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAwayStat1((o) => Math.max(0, o + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J2 ({awayStat1})
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  {isIndividual ? "Duble Greșeli" : "Faulturi"}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHomeStat2((f) => Math.max(0, f + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J1 ({homeStat2})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAwayStat2((f) => Math.max(0, f + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J2 ({awayStat2})
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  {isIndividual ? "Puncte Break" : "Cornere"}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHomeStat3((c) => Math.max(0, c + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J1 ({homeStat3})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAwayStat3((c) => Math.max(0, c + 1))}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-bold shadow-sm"
                  >
                    +J2 ({awayStat3})
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Add Event Form */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                {isIndividual ? "Adaugă Eveniment Tenis (As, Break, Set Câștigat, Avertisment)" : "Adaugă Eveniment (Gol, Cartonaș, Schimbare)"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newEventMinute}
                  onChange={(e) => setNewEventMinute(parseInt(e.target.value) || 1)}
                  placeholder={isIndividual ? "Set / Game" : "Minut"}
                  className="input text-xs"
                />
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="input text-xs"
                >
                  {isIndividual ? (
                    <>
                      <option value="ace"><span className="material-symbols-outlined">sports_tennis</span> As Serviciu (Ace)</option>
                      <option value="break">💥 Break de Serviciu</option>
                      <option value="set_won">  Set Câștigat</option>
                      <option value="double_fault">Dublă Greșeală</option>
                      <option value="warning"><span className="material-symbols-outlined">warning</span> Avertisment Conduită</option>
                    </>
                  ) : (
                    <>
                      <option value="goal"><span className="material-symbols-outlined">sports_tennis</span> Gol</option>
                      <option value="yellow_card"><span className="material-symbols-outlined">warning</span> Cartonaș Galben</option>
                      <option value="red_card"><span className="material-symbols-outlined">cancel</span> Cartonaș Roșu</option>
                      <option value="offside"><span className="material-symbols-outlined">flag</span> Offside</option>
                      <option value="sub"><span className="material-symbols-outlined">sync</span> Schimbare</option>
                    </>
                  )}
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
                  placeholder="Detalii opționale (ex: As la T, Viteză 195 km/h)..."
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
          </div>
        )}

        {/* ================= TAB 3: RAPORT TEHNIC ================= */}
        {activeTab === "report" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  {isIndividual ? "Starea Terenului & Zgurei" : "Starea Terenului de Joc"}
                </label>
                <input
                  type="text"
                  value={pitchCondition}
                  onChange={(e) => setPitchCondition(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Conduita Suporterilor / Tribune
                </label>
                <input
                  type="text"
                  value={crowdConduct}
                  onChange={(e) => setCrowdConduct(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                {isIndividual ? "Semnătură Arbitru de Scaun (Chair Umpire)" : "Semnătură Arbitru Delegat"}
              </label>
              <input
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        )}

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
              {saving ? "Se salvează..." : "Salvează Modificările  "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
