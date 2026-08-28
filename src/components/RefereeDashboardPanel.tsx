"use client";

import React, { useState, useEffect } from "react";
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
  type: "goal" | "yellow_card" | "red_card" | "penalty" | "own_goal" | "sub";
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
  initialTab = "overview",
}: {
  refereeUser: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
    primarySport?: string | null;
    refereeBadge?: string | null;
    experienceYears?: number | null;
    image?: string | null;
    coverPhotoUrl?: string | null;
  };
  upcomingMatch: MatchOfficiatingItem | null;
  matchHistory: MatchOfficiatingItem[];
  pendingMatches?: MatchOfficiatingItem[];
  initialTab?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Active Officiating State
  const activeLiveMatch = upcomingMatch || (pendingMatches.length > 0 ? pendingMatches[0] : null);
  const [selectedMatch, setSelectedMatch] = useState<MatchOfficiatingItem | null>(activeLiveMatch);

  const [homeScore, setHomeScore] = useState<number>(selectedMatch?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(selectedMatch?.awayScore ?? 0);
  const [matchStatus, setMatchStatus] = useState<string>(selectedMatch?.status || "scheduled");
  const [homeFouls, setHomeFouls] = useState<number>(selectedMatch?.homeFouls || 0);
  const [awayFouls, setAwayFouls] = useState<number>(selectedMatch?.awayFouls || 0);
  const [homeCorners, setHomeCorners] = useState<number>(selectedMatch?.homeCorners || 0);
  const [awayCorners, setAwayCorners] = useState<number>(selectedMatch?.awayCorners || 0);
  const [homeOffsides, setHomeOffsides] = useState<number>(selectedMatch?.homeOffsides || 0);
  const [awayOffsides, setAwayOffsides] = useState<number>(selectedMatch?.awayOffsides || 0);
  const [pitchCondition, setPitchCondition] = useState<string>(selectedMatch?.pitchCondition || "Excelent");
  const [crowdConduct, setCrowdConduct] = useState<string>(selectedMatch?.crowdConduct || "Sportivă / Fără incidente");
  const [refereeNotes, setRefereeNotes] = useState<string>(selectedMatch?.refereeNotes || "");
  const [signedBy, setSignedBy] = useState<string>(selectedMatch?.signedBy || refereeUser.name || "Arbitru Oficial");

  // Timer state for Live Match
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => {
          if (sec >= 59) {
            setTimerMinutes((min) => min + 1);
            return 0;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Events list for officiating
  const [eventsList, setEventsList] = useState<MatchEvent[]>(() => {
    try {
      if (selectedMatch?.events) {
        return JSON.parse(selectedMatch.events);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // When selectedMatch changes, update form
  const handleSelectMatchForOfficiating = (match: MatchOfficiatingItem) => {
    setSelectedMatch(match);
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
    setActiveTab("live");
  };

  // New Event Form State
  const [newEventType, setNewEventType] = useState<"goal" | "yellow_card" | "red_card" | "penalty" | "sub">("goal");
  const [newEventMinute, setNewEventMinute] = useState<number>(15);
  const [newEventTeam, setNewEventTeam] = useState<"home" | "away">("home");
  const [newEventPlayer, setNewEventPlayer] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Match Confirmation state
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(refereeUser.name || "");
  const [profilePhone, setProfilePhone] = useState(refereeUser.phone || "");
  const [profileBio, setProfileBio] = useState(refereeUser.bio || "");
  const [profileBadge, setProfileBadge] = useState(refereeUser.refereeBadge || "FIFA / RIFA");
  const [profileExperience, setProfileExperience] = useState<number>(refereeUser.experienceYears || 5);
  const [profileSport, setProfileSport] = useState(refereeUser.primarySport || "fotbal");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Save Profile Handler
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          bio: profileBio,
          refereeBadge: profileBadge,
          experienceYears: Number(profileExperience) || 0,
          primarySport: profileSport,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la salvarea profilului.");
      }

      setProfileSuccess("Profilul de arbitru și datele de contact au fost salvate cu succes! Organizatorii autorizați pot acum să te contacteze.");
      router.refresh();
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || "A apărut o problemă la salvare.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Confirm or decline match attendance
  async function handleConfirmMatch(matchId: string, action: "accept" | "decline") {
    const confirmed = window.confirm(
      action === "accept"
        ? "Confirmi prezența ta ca arbitru la acest meci?\n\nOrganizatorul va fi notificat automat de acceptarea delegării."
        : "Ești sigur că refuzi acest meci?\n\nOrganizatorul va fi notificat că nu ești disponibil."
    );
    if (!confirmed) return;

    setConfirmingMatchId(matchId);
    setConfirmError(null);
    setConfirmSuccess(null);

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

      setConfirmSuccess(data.message || "Starea delegării a fost actualizată cu succes.");
      setTimeout(() => setConfirmSuccess(null), 3500);
      router.refresh();
    } catch {
      setConfirmError("Eroare de conexiune. Te rugăm să reîncerci.");
    } finally {
      setConfirmingMatchId(null);
    }
  }

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
    if (!selectedMatch) return;
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
        `/api/championships/${selectedMatch.championshipId}/matches/${selectedMatch.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la salvarea foii de arbitraj");
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      setSaveError(err.message || "A apărut o problemă la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  // Tabs definitions
  const pendingCount = pendingMatches.filter((m) => !m.refereeConfirmed && !m.refereeDeclined).length;
  const tabs = [
    { id: "overview", name: "Panou General", icon: "sports" },
    { id: "live", name: "Foaie Arbitraj Live", icon: "scoreboard" },
    { id: "upcoming", name: "Meciuri Viitoare", icon: "calendar_month", count: pendingMatches.length },
    { id: "invitations", name: "Invitații & Notificări", icon: "mark_email_unread", count: pendingCount, alert: pendingCount > 0 },
    { id: "history", name: "Istoric & Foaie A4", icon: "description", count: matchHistory.length },
    { id: "profile", name: "Profil & Date Contact", icon: "badge" },
  ];

  return (
    <div className="space-y-8 font-body">
      {/* Top Header Summary Card */}
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
                {profileBadge || "FIFA / RIFA"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 text-[10px] font-bold font-label">
                Oficial Omologat
              </span>
              {refereeUser.phone && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">call</span>
                  {refereeUser.phone}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase tracking-tight">
              {profileName || refereeUser.name}
            </h1>
            <p className="text-xs text-slate-400 font-label">
              {profileExperience ? `Experiență: ${profileExperience} ani` : "Arbitru Oficial"} • Disciplină:{" "}
              <span className="text-lime-400 font-bold uppercase">{profileSport}</span>
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedMatch && (
            <Link
              href={`/matches/${selectedMatch.id}/report`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Printează Foaie A4
            </Link>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-label font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            Date de Contact
          </button>
        </div>
      </section>

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? "bg-lime-400 text-slate-950 font-black shadow-md scale-[1.02]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              <span>{t.name}</span>
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-slate-950 text-lime-400"
                      : t.alert
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW (PANOU GENERAL) */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Athletic Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Meciuri Arbitrate</span>
              <span className="text-3xl font-black font-headline text-lime-400">{matchHistory.length}</span>
              <span className="text-[11px] text-slate-500 font-label block">Rapoarte oficiale semnate</span>
            </div>

            <div className="card p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Meciuri Programate</span>
              <span className="text-3xl font-black font-headline text-white">{pendingMatches.length}</span>
              <span className="text-[11px] text-slate-500 font-label block">Delegări viitoare înscrise</span>
            </div>

            <div className="card p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Invitații Noi</span>
              <span className={`text-3xl font-black font-headline ${pendingCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {pendingCount}
              </span>
              <span className="text-[11px] text-slate-500 font-label block">Așteaptă confirmarea ta</span>
            </div>

            <div className="card p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Grad & Ecuson</span>
              <span className="text-lg font-black font-headline text-lime-400 truncate block mt-1">
                {profileBadge || "FIFA / RIFA"}
              </span>
              <span className="text-[11px] text-slate-500 font-label block">{profileExperience} ani experiență</span>
            </div>
          </div>

          {/* Active Highlight Match Card */}
          {activeLiveMatch ? (
            <div className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 border-2 border-lime-400/60 rounded-3xl shadow-2xl space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase font-label">
                    {activeLiveMatch.championship.name}
                  </span>
                  <span className="text-xs text-slate-400 font-label">
                    Etapa {activeLiveMatch.round}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-bold text-xs font-label uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {activeLiveMatch.status === "live" ? "Live în Desfășurare" : "Următorul Tău Meci Delegat"}
                </span>
              </div>

              {/* Matchup Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-4 border-y border-slate-800 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-lime-400 font-bold block">Gazde</span>
                  <h3 className="text-xl sm:text-2xl font-black font-headline text-white uppercase truncate">
                    {activeLiveMatch.homeTeam.name}
                  </h3>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl font-black data-font text-lime-400">
                    {activeLiveMatch.homeScore ?? 0} : {activeLiveMatch.awayScore ?? 0}
                  </span>
                  <span className="text-xs font-mono text-slate-400 mt-1">
                    {new Date(activeLiveMatch.scheduledAt).toLocaleDateString("ro-RO", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-lime-400 font-bold block">Oaspeți</span>
                  <h3 className="text-xl sm:text-2xl font-black font-headline text-white uppercase truncate">
                    {activeLiveMatch.awayTeam.name}
                  </h3>
                </div>
              </div>

              {/* Match Location & Fast Cockpit Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-label">
                  <span className="material-symbols-outlined text-base text-lime-400">location_on</span>
                  <span>{activeLiveMatch.venue || "Teren Central"}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSelectMatchForOfficiating(activeLiveMatch)}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">sports</span>
                    Deschide Foaia de Joc Live
                  </button>

                  <Link
                    href={`/matches/${activeLiveMatch.id}/report`}
                    target="_blank"
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Raport A4 (PDF)
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-500">sports</span>
              <p className="font-bold text-white text-sm">Nu ai niciun meci în desfășurare în acest moment.</p>
              <p className="text-xs text-slate-400">
                Delegările viitoare vor apărea automat aici când ești desemnat de către organizatorul campionatului.
              </p>
            </div>
          )}

          {/* Quick Shortcuts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("invitations")}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-400/60 text-left space-y-2 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-2xl text-lime-400">mark_email_unread</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {pendingCount} Noi
                  </span>
                )}
              </div>
              <h4 className="font-headline font-bold text-sm text-white group-hover:text-lime-400 transition-colors uppercase">
                Invitații la Meciuri
              </h4>
              <p className="text-xs text-slate-400 font-label">
                Verifică și confirmă disponibilitatea pentru delegările trimise de organizatori.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-400/60 text-left space-y-2 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-2xl text-lime-400">print</span>
                <span className="text-xs font-mono text-slate-500">{matchHistory.length} meciuri</span>
              </div>
              <h4 className="font-headline font-bold text-sm text-white group-hover:text-lime-400 transition-colors uppercase">
                Foaia A4 & Istoric
              </h4>
              <p className="text-xs text-slate-400 font-label">
                Accesează rapoartele oficiale trecute și printează foile omologate în format A4.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-400/60 text-left space-y-2 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-2xl text-lime-400">badge</span>
                <span className="text-xs font-mono text-slate-500">Securizat</span>
              </div>
              <h4 className="font-headline font-bold text-sm text-white group-hover:text-lime-400 transition-colors uppercase">
                Date de Contact Arbitru
              </h4>
              <p className="text-xs text-slate-400 font-label">
                Telefonul și disponibilitatea ta sunt vizibile exclusiv organizatorilor oficiali.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MATCH SHEET (FOAIA DE ARBITRAJ LA MECIUL ÎN DESFĂȘURARE) */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {selectedMatch ? (
            <div className="card p-6 sm:p-8 bg-slate-900 border border-lime-400/50 rounded-3xl shadow-2xl space-y-6">
              {/* Match Header with Print CTA */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                      FOAIE DE ARBITRAJ LIVE
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedMatch.championship.name} • Etapa {selectedMatch.round}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black font-headline text-white uppercase mt-1">
                    {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/matches/${selectedMatch.id}/report`}
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Printează Foaia A4 (PDF)
                  </Link>
                </div>
              </div>

              {/* Status & Timer Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap justify-between items-center gap-4">
                {/* Timer Cockpit */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-lime-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">timer</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Cronometru Meci</span>
                    <span className="text-2xl font-black font-mono text-lime-400 tabular-nums">
                      {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-headline uppercase ${
                        isTimerRunning ? "bg-amber-400 text-slate-950" : "bg-lime-400 text-slate-950"
                      }`}
                    >
                      {isTimerRunning ? "Pauză" : "Start"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerMinutes(0);
                        setTimerSeconds(0);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Match Status Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase">Stadiu:</span>
                  <select
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-lime-400 focus:outline-none"
                  >
                    <option value="scheduled">Programat</option>
                    <option value="live">Live În Desfășurare</option>
                    <option value="finished">Meci Finalizat</option>
                  </select>
                </div>
              </div>

              {/* Score Adjuster Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                {/* Home Score */}
                <div className="space-y-2">
                  <p className="text-sm font-black font-headline text-white uppercase truncate">
                    {selectedMatch.homeTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xl flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="text-4xl sm:text-5xl font-black font-headline text-lime-400 w-16 data-font">
                      {homeScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHomeScore(homeScore + 1)}
                      className="w-10 h-10 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xl flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl text-slate-600 font-black font-headline">VS</span>
                  <span className="text-[10px] font-mono uppercase text-slate-500 mt-1">Scor Omologat</span>
                </div>

                {/* Away Score */}
                <div className="space-y-2">
                  <p className="text-sm font-black font-headline text-white uppercase truncate">
                    {selectedMatch.awayTeam.name}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xl flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <span className="text-4xl sm:text-5xl font-black font-headline text-lime-400 w-16 data-font">
                      {awayScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAwayScore(awayScore + 1)}
                      className="w-10 h-10 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xl flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Match Events Logger */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold font-headline uppercase text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-400">history_edu</span>
                  Înregistrare Rapidă Evenimente (Goluri, Cartonașe, Schimbări)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Tip Eveniment</label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="goal">Gol Înscris</option>
                      <option value="yellow_card">Cartonaș Galben</option>
                      <option value="red_card">Cartonaș Roșu</option>
                      <option value="penalty">Penalty (11m)</option>
                      <option value="sub">Schimbare Jucător</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Echipă</label>
                    <select
                      value={newEventTeam}
                      onChange={(e) => setNewEventTeam(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="home">{selectedMatch.homeTeam.name} (Gazdă)</option>
                      <option value="away">{selectedMatch.awayTeam.name} (Oaspete)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Minut ({newEventMinute}&apos;)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={newEventMinute}
                      onChange={(e) => setNewEventMinute(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Jucător / Nr.</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nume jucător..."
                        value={newEventPlayer}
                        onChange={(e) => setNewEventPlayer(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddEvent}
                        className="px-3 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs font-headline uppercase shrink-0"
                      >
                        + Adaugă
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events Chronology Table */}
                {eventsList.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {eventsList.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-lime-400">{ev.minute}&apos;</span>
                          <span className="font-bold text-white">
                            {ev.type === "goal" && "Gol"}
                            {ev.type === "yellow_card" && "Cartonaș Galben"}
                            {ev.type === "red_card" && "Cartonaș Roșu"}
                            {ev.type === "penalty" && "Penalty"}
                            {ev.type === "sub" && "Schimbare"}
                          </span>
                          <span className="text-slate-400 font-mono">({ev.team === "home" ? "Gazde" : "Oaspeți"})</span>
                          <span className="text-slate-200 font-medium">{ev.playerName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvent(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Notes & Pitch Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Starea Terenului</label>
                  <select
                    value={pitchCondition}
                    onChange={(e) => setPitchCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Excelent">Excelent (Gazon impecabil)</option>
                    <option value="Bun">Bun</option>
                    <option value="Umed / Alunecos">Umed / Alunecos</option>
                    <option value="Deteriorat">Deteriorat / Denivelat</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Comportament Spectatori</label>
                  <select
                    value={crowdConduct}
                    onChange={(e) => setCrowdConduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="Sportivă / Fără incidente">Sportivă / Fără incidente</option>
                    <option value="Incidente minore">Incidente minore izolate</option>
                    <option value="Comportament ostil">Comportament nesportiv / Avertizat</option>
                  </select>
                </div>
              </div>

              {/* Referee Official Notes & Signature */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-400 block">
                  Observațiile Arbitrului Central (Raport Oficial)
                </label>
                <textarea
                  rows={3}
                  value={refereeNotes}
                  onChange={(e) => setRefereeNotes(e.target.value)}
                  placeholder="Notează orice incident disciplinar, contestație din partea delegaților sau observații asupra jocului..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Save & Print Feedback */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Foaia de arbitraj a fost salvată și omologată cu succes în baza de date!
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span>
                  {saveError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
                <Link
                  href={`/matches/${selectedMatch.id}/report`}
                  target="_blank"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Deschide & Printează Foaia A4
                </Link>

                <button
                  type="button"
                  onClick={handleSaveMatch}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  {isSaving ? "Se salvează..." : "Salvează Foaia de Arbitraj"}
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-slate-600">sports_soccer</span>
              <h3 className="text-lg font-bold text-white font-headline uppercase">
                Niciun meci selectat pentru arbitraj
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Alege un meci din lista de meciuri viitoare sau din delegațiile primite pentru a deschide foaia de joc digitală.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-bold text-xs uppercase"
              >
                Vezi Meciuri Viitoare
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPCOMING MATCHES & CALENDAR */}
      {activeTab === "upcoming" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-headline uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">calendar_month</span>
              Meciuri Viitoare Asignate ({pendingMatches.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Sincronizare Oficială</span>
          </div>

          {pendingMatches.length === 0 ? (
            <div className="card p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
              Nu ai alte meciuri viitoare delegate în acest moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMatches.map((m) => (
                <div
                  key={m.id}
                  className="card p-5 bg-slate-900 border border-slate-800 hover:border-lime-400/50 rounded-3xl space-y-4 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400">
                      <span>{m.championship.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-lime-400 font-bold">
                        Etapa {m.round}
                      </span>
                    </div>

                    <div className="flex justify-between items-center font-headline font-bold text-white text-base py-1">
                      <span className="truncate">{m.homeTeam.name}</span>
                      <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-400 font-mono text-xs">VS</span>
                      <span className="truncate">{m.awayTeam.name}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-lime-400">location_on</span>
                        {m.venue || "Teren Central"}
                      </span>
                      <span className="font-mono text-slate-300">
                        {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectMatchForOfficiating(m)}
                      className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">scoreboard</span>
                      Foaie Live
                    </button>

                    <Link
                      href={`/matches/${m.id}/report`}
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase border border-slate-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      Foaie A4
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Referee Calendar */}
          <div className="pt-4">
            <RefereeCalendar refereeName={refereeUser.name} />
          </div>
        </div>
      )}

      {/* TAB 4: INVITATIONS & NOTIFICATIONS (NOTIFICĂRI PENTRU INVITATII LA MECIURI) */}
      {activeTab === "invitations" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-headline uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">mark_email_unread</span>
              Notificări & Invitații la Meciuri ({pendingCount} Noi)
            </h3>
            {confirmSuccess && (
              <div className="px-3 py-1 rounded-xl bg-lime-950 border border-lime-400 text-lime-300 text-xs font-bold">
                {confirmSuccess}
              </div>
            )}
            {confirmError && (
              <div className="px-3 py-1 rounded-xl bg-red-950 border border-red-500 text-red-300 text-xs font-bold">
                {confirmError}
              </div>
            )}
          </div>

          {pendingMatches.length === 0 ? (
            <div className="card p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-500">mark_email_read</span>
              <p className="font-bold text-white text-sm">Nu ai nicio invitație în așteptare.</p>
              <p className="text-xs text-slate-400">
                Când un organizator te deleagă la un meci nou, vei primi o notificare cu opțiunea de a accepta sau refuza.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMatches.map((m) => {
                const dateObj = new Date(m.scheduledAt);
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 font-mono text-[10px] font-bold">
                          {m.championship.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Etapa {m.round}
                        </span>
                      </div>

                      <h4 className="text-base font-black font-headline text-white uppercase">
                        {m.homeTeam.name} vs {m.awayTeam.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-label">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-lime-400">schedule</span>
                          {dateObj.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })} •{" "}
                          {dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-lime-400">location_on</span>
                          {m.venue || "Teren Central"}
                        </span>
                      </div>

                      {m.refereeConfirmed && (
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Ai confirmat prezența. Organizatorul a fost notificat.
                        </p>
                      )}
                      {m.refereeDeclined && (
                        <p className="text-xs text-red-400 font-bold flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">block</span>
                          Ai refuzat această delegare.
                        </p>
                      )}
                    </div>

                    {!m.refereeConfirmed && !m.refereeDeclined && (
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleConfirmMatch(m.id, "accept")}
                          disabled={confirmingMatchId === m.id}
                          className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          {confirmingMatchId === m.id ? "Se procesează..." : "Acceptă Meciul"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmMatch(m.id, "decline")}
                          disabled={confirmingMatchId === m.id}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-700 disabled:opacity-50"
                        >
                          Refuză
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HISTORY & PRINT A4 (ISTORIC & FOAIE A4) */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-headline uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">description</span>
              Istoric Meciuri Arbitrate & Rapoarte A4 ({matchHistory.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Format Oficial A4</span>
          </div>

          {matchHistory.length === 0 ? (
            <div className="card p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-400">
              Nu ai meciuri finalizate anterior în istoric.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="card p-5 bg-slate-900 border border-slate-800 hover:border-lime-400/50 rounded-3xl space-y-4 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400">
                      <span className="truncate max-w-[150px]">{m.championship.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-lime-400 font-bold">
                        Etapa {m.round}
                      </span>
                    </div>

                    <div className="flex justify-between items-center font-headline font-bold text-white text-sm">
                      <span className="truncate max-w-[90px]">{m.homeTeam.name}</span>
                      <span className="px-3 py-1 rounded-xl bg-slate-950 font-black data-font text-lime-400 border border-slate-800 text-base">
                        {m.homeScore ?? 0} - {m.awayScore ?? 0}
                      </span>
                      <span className="truncate max-w-[90px] text-right">{m.awayTeam.name}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-label flex items-center justify-between pt-1">
                      <span>{m.venue || "Teren Oficial"}</span>
                      <span className="font-mono">
                        {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { dateStyle: "short" })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectMatchForOfficiating(m)}
                      className="text-xs font-bold text-slate-300 hover:text-white font-label flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Editează
                    </button>

                    <Link
                      href={`/matches/${m.id}/report`}
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">print</span>
                      Printează A4
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROFILE & CONTACT DETAILS (PROFIL ARBITRU & DATE CONTACT EXCLUSIV ORGANIZATORI) */}
      {activeTab === "profile" && (
        <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                CONFIGURARE PROFIL OFICIAL
              </span>
            </div>
            <h2 className="text-2xl font-black font-headline uppercase text-white mt-1">
              Profilul Tău de Arbitru & Date de Contact
            </h2>
            <p className="text-xs text-slate-400 font-label mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-lime-400">verified_user</span>
              Datele tale de contact sunt protejate și vizibile <strong>exclusiv organizatorilor autorizați</strong> de campionate pentru delegări și urgențe.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nume */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Nume Complet</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                />
              </div>

              {/* Telefon (Exclusiv Organizatori) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Număr Telefon</label>
                  <span className="text-[10px] font-mono text-lime-400 font-bold">Vizibil doar organizatorilor</span>
                </div>
                <input
                  type="tel"
                  placeholder="ex: 0722 123 456"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ecuson / Nivel Arbitraj */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Ecuson / Categorie</label>
                <select
                  value={profileBadge}
                  onChange={(e) => setProfileBadge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="FIFA / RIFA">FIFA / RIFA International</option>
                  <option value="Liga 1 / Categoria 1">Liga 1 / Categoria 1</option>
                  <option value="Liga 2-3 / Categoria 2">Liga 2-3 / Categoria 2</option>
                  <option value="Județean / Liga 4-5">Județean / Liga 4-5</option>
                  <option value="Minifotbal / Futsal">Minifotbal / Futsal</option>
                  <option value="Debut / Amatori">Debut / Amatori</option>
                </select>
              </div>

              {/* Ani de Experiență */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Ani de Experiență</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={profileExperience}
                  onChange={(e) => setProfileExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Disciplină Sportivă */}
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Disciplină Principală</label>
                <select
                  value={profileSport}
                  onChange={(e) => setProfileSport(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-lime-400 capitalize"
                >
                  <option value="fotbal">Fotbal 11 la 11</option>
                  <option value="minifotbal">Minifotbal / Teren Redus</option>
                  <option value="baschet">Baschet</option>
                  <option value="tenis">Tenis</option>
                  <option value="volei">Volei</option>
                  <option value="handbal">Handbal</option>
                </select>
              </div>
            </div>

            {/* Disponibilitate & Note de contact */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Disponibilitate, Zone Deplasare & Barem Orientativ
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Max 500 caractere</span>
              </div>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="ex: Disponibil în weekend în județele Timiș și Arad. Barem orientativ 150 RON/meci. Contact rapid pe WhatsApp sau apel telefonic."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">warning</span>
                {profileError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {isSavingProfile ? "Se salvează..." : "Salvează Datele de Contact"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
