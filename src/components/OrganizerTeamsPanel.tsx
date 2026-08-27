"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChampionshipLogoBadge } from "./ChampionshipLogoBadge";
import { AdminDiceConsole } from "./AdminDiceConsole";
import { isIndividualSport } from "@/lib/constants";

interface ChampionshipItem {
  id: string;
  name: string;
  sport: string;
  season?: string | null;
  scope: string;
  county?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  isBracketPublished: boolean;
  diceRollCount: number;
}

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  managerEmail?: string | null;
  manager?: { id: string; name: string; email: string; phone?: string | null } | null;
  _count?: { players: number };
}

interface AvailableRegisteredTeam {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  manager?: { id: string; name: string; email: string } | null;
  championship?: { name: string } | null;
}

export function OrganizerTeamsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [championships, setChampionships] = useState<ChampionshipItem[]>([]);
  const [activeChampId, setActiveChampId] = useState<string>("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [availableTeams, setAvailableTeams] = useState<AvailableRegisteredTeam[]>([]);

  // Mode Selection: "invite_new" | "enroll_existing"
  const [inviteMode, setInviteMode] = useState<"invite_new" | "enroll_existing">("invite_new");

  // Form State: New Team Invitation
  const [newTeamName, setNewTeamName] = useState("");
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newShortName, setNewShortName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#84cc16");
  const [submitting, setSubmitting] = useState(false);

  // Form State: Existing Team Search
  const [existingSearch, setExistingSearch] = useState("");

  // Last Generated Invite Link
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Dice Console Modal State
  const [showDiceModal, setShowDiceModal] = useState(false);

  async function loadData(champId?: string) {
    setLoading(true);
    setError(null);
    try {
      const url = champId
        ? `/api/organizer/teams?championshipId=${champId}`
        : "/api/organizer/teams";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Eroare la încărcarea datelor");
      }

      setChampionships(data.championships || []);
      setActiveChampId(data.activeChampionshipId || (data.championships?.[0]?.id ?? ""));
      setTeams(data.teams || []);
      setAvailableTeams(data.availableRegisteredTeams || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleSelectChampionship(champId: string) {
    setActiveChampId(champId);
    loadData(champId);
  }

  const activeChamp = championships.find((c) => c.id === activeChampId);
  const isIndividual = isIndividualSport(activeChamp?.sport);

  // Submit Handler: Invite New Team/Competitor
  async function handleInviteNewTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim() || !activeChampId) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    setLastInviteLink(null);

    try {
      const res = await fetch("/api/organizer/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite_new",
          championshipId: activeChampId,
          name: newTeamName,
          managerEmail: newManagerEmail,
          shortName: newShortName,
          color: newTeamColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la trimiterea invitației");
      }

      setSuccessMsg(data.message || `${isIndividual ? "Competitorul / Jucătorul" : "Echipa"} "${newTeamName}" a fost adăugat cu succes!`);
      if (data.inviteLink) {
        setLastInviteLink(data.inviteLink);
      }
      setNewTeamName("");
      setNewManagerEmail("");
      setNewShortName("");

      loadData(activeChampId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Submit Handler: Enroll Existing Team/Competitor in System
  async function handleEnrollExistingTeam(teamId: string, teamName: string) {
    if (!activeChampId) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/organizer/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enroll_existing",
          championshipId: activeChampId,
          existingTeamId: teamId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la înscrierea competitorului");
      }

      setSuccessMsg(data.message || `${isIndividual ? "Competitorul" : "Echipa"} "${teamName}" a fost înscris în campionat!`);
      loadData(activeChampId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Team / Competitor Handler
  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Ești sigur că vrei să elimini ${isIndividual ? "competitorul" : "echipa"} "${teamName}" din acest campionat?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/organizer/teams?teamId=${teamId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la eliminare");
      }
      setSuccessMsg(data.message || `${isIndividual ? "Competitorul" : "Echipa"} "${teamName}" a fost eliminat.`);
      loadData(activeChampId);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Filter available registered teams
  const filteredAvailableTeams = availableTeams.filter((t) =>
    t.name.toLowerCase().includes(existingSearch.toLowerCase()) ||
    (t.manager?.name && t.manager.name.toLowerCase().includes(existingSearch.toLowerCase())) ||
    (t.manager?.email && t.manager.email.toLowerCase().includes(existingSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-8 font-body max-w-7xl">
      {/* 1. Hero Header */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-wider shadow-sm">
                PANOU EXCLUSIV ORGANIZATOR
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase font-label border border-slate-200 dark:border-slate-700">
                {isIndividual ? "Gestiune Invitații Competitori (Jucători / Echipe)" : "Gestiune Invitații Echipe"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tight font-headline uppercase leading-tight text-slate-900 dark:text-white">
              {isIndividual ? "Centrul de Invitații & Lansare Competitori" : "Centrul de Invitații & Lansare Echipe"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-body">
              {isIndividual
                ? "Înscrie competitori (jucători direct sau perechi/echipe) din catalogul platformei sau trimite invitații direct pe email/WhatsApp. Competitorii vor fi extrasi automat în sistemul de zaruri pentru tablou!"
                : "Adaugă echipe din catalogul platformei sau trimite invitații pe email managerilor noi. Echipele înscrise vor fi extrase automat în sistemul de zaruri pentru perecherea în meciuri!"}
            </p>
          </div>

          {/* Quick Dice Draw CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowDiceModal(true)}
              disabled={teams.length < 2 || !activeChampId}
              className={`px-6 py-4 rounded-2xl font-headline font-black text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2.5 active:scale-95 ${teams.length >= 2
                ? "bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
            >
              <span className="material-symbols-outlined text-lg">casino</span>
              <span>Lansează cu Zaruri ({teams.length} {isIndividual ? "Competitori" : "Echipe"})</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-semibold rounded-2xl border border-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-lime-950/80 text-emerald-900 dark:text-lime-200 text-xs font-bold rounded-2xl border border-emerald-300 dark:border-lime-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🎉</span>
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs font-bold">✕</button>
        </div>
      )}

      {/* 2. Active Championship Selector Strip */}
      <div className="card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-headline font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined">emoji_events</span> Alege Campionatul de Gestionat:
          </span>
          <span className="text-[10px] text-slate-400 font-label font-bold uppercase">
            {championships.length} Competiții Deținute
          </span>
        </div>

        {championships.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-500">Nu ai creat încă niciun campionat.</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-lime-400 text-slate-950 font-black text-xs uppercase rounded-xl"
            >
              + Creează un Campionat Nou
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {championships.map((c) => {
              const isSelected = c.id === activeChampId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectChampionship(c.id)}
                  className={`px-4 py-3 rounded-2xl border text-xs font-headline font-bold text-left transition flex items-center gap-3 shrink-0 ${isSelected
                    ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 border-slate-950 dark:border-lime-400 shadow-md ring-2 ring-lime-400/40"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-lime-500"
                    }`}
                >
                  <ChampionshipLogoBadge name={c.name} logoUrl={c.logoUrl} size="sm" />
                  <div>
                    <div className="font-bold text-xs truncate max-w-[180px]">{c.name}</div>
                    <div className="text-[10px] font-label opacity-75">
                      {c.sport} • {c.diceRollCount}/3 Zaruri Utilizeate
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Main Two-Column Layout: Left (Add/Invite Form) + Right (Enrolled Teams List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Add / Invite Teams Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
            {/* Tab Controller: Invite New vs Enroll Existing */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold font-label">
              <button
                type="button"
                onClick={() => setInviteMode("invite_new")}
                className={`flex-1 py-2.5 px-3 rounded-xl transition text-center ${inviteMode === "invite_new"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                {isIndividual ? "Invitație Competitor (Jucător / Echipă)" : "Invitație Echipă Nouă"}
              </button>
              <button
                type="button"
                onClick={() => setInviteMode("enroll_existing")}
                className={`flex-1 py-2.5 px-3 rounded-xl transition text-center ${inviteMode === "enroll_existing"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                {isIndividual ? `Competitor Existent (${availableTeams.length})` : `Echipă Existentă (${availableTeams.length})`}
              </button>
            </div>

            {/* MODE 1: Invite New Team/Competitor */}
            {inviteMode === "invite_new" && (
              <form onSubmit={handleInviteNewTeam} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-headline uppercase text-slate-900 dark:text-white">
                    {isIndividual ? "Adaugă Competitor Nou (Jucător / Echipă) & Email" : "Adaugă Echipă Nouă & Email Manager"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    {isIndividual
                      ? "Completează numele jucătorului/competitorului și adresa de email pentru a genera invitația."
                      : "Completează numele echipei și adresa de email a liderului pentru a genera invitația."}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1">
                    {isIndividual ? "Nume Competitor / Jucător *" : "Nume Echipă *"}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                    placeholder={isIndividual ? "ex: Andrei Popescu (CS Dinamo)" : "ex: FC Timișoara Pro"}
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1">
                    {isIndividual ? "Email Competitor / Jucător *" : "Email Lider / Manager Echipă *"}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                    placeholder={isIndividual ? "jucator@tenis.ro" : "manager@echipa.ro"}
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1">
                      Cod Scurt (3 litere)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                      placeholder={isIndividual ? "POP" : "FCT"}
                      value={newShortName}
                      onChange={(e) => setNewShortName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1">
                      Culoare Echipament
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                      <input
                        type="color"
                        className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0"
                        value={newTeamColor}
                        onChange={(e) => setNewTeamColor(e.target.value)}
                      />
                      <span className="text-xs font-mono font-bold uppercase">{newTeamColor}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !newTeamName.trim()}
                  className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>{submitting ? "Se trimite..." : isIndividual ? "Adaugă Competitor & Generează Invitație" : "Adaugă Echipă & Generează Invitație"}</span>
                </button>

                {/* Invite Link Generated Card */}
                {lastInviteLink && (
                  <div className="p-4 rounded-2xl bg-slate-950 text-white border border-lime-400/40 space-y-2.5 animate-in fade-in">
                    <div className="flex justify-between items-center text-[10px] font-label font-bold text-lime-400 uppercase">
                      <span>Invitație Pregătită 1-Click</span>
                      <span>Link Unic</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={lastInviteLink}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-lime-400 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lastInviteLink);
                          setCopiedInvite(true);
                          setTimeout(() => setCopiedInvite(false), 2000);
                        }}
                        className="px-3 py-2 bg-lime-400 text-slate-950 text-xs font-bold rounded-xl font-label shrink-0"
                      >
                        {copiedInvite ? "Copiat! ✓" : "Copiază"}
                      </button>
                    </div>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        isIndividual
                          ? `Invitație  ă ca jucător/competitor în Turneul de Tenis ${activeChamp?.name || ""}: ${lastInviteLink}`
                          : `Invitație  ă pentru echipa ta în Campionatul ${activeChamp?.name || ""}: ${lastInviteLink}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase font-headline tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      <span>{isIndividual ? "Trimite pe WhatsApp Jucătorului" : "Trimite pe WhatsApp Managerului"}</span>
                    </a>
                  </div>
                )}
              </form>
            )}

            {/* MODE 2: Enroll Existing Registered Team */}
            {inviteMode === "enroll_existing" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-headline uppercase text-slate-900 dark:text-white">
                    {isIndividual ? "Catalog Competitori Înregistrați" : "Catalog Echipe Înregistrate"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    {isIndividual
                      ? "Selectează un competitor din baza de date pentru a-l adăuga instant pe tablou."
                      : "Selectează o echipă din baza de date pentru a o adăuga instant în acest campionat."}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder={isIndividual ? "Caută după nume competitor sau email..." : "Caută după nume echipă sau email manager..."}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                  value={existingSearch}
                  onChange={(e) => setExistingSearch(e.target.value)}
                />

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredAvailableTeams.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      {isIndividual ? "Nu au fost găsiți competitori disponibili în sistem." : "Nu au fost găsite echipe disponibile în sistem."}
                    </p>
                  ) : (
                    filteredAvailableTeams.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-lime-400 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: t.color || "#1e293b" }}
                          >
                            {t.shortName || t.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                              {isIndividual ? "Competitor / Contact: " : "Manager: "}{t.manager?.name || t.manager?.email || "Fără contact"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEnrollExistingTeam(t.id, t.name)}
                          disabled={submitting}
                          className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-[11px] uppercase shrink-0 transition shadow-sm"
                        >
                          + Înscrie
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Enrolled Teams in Selected Championship (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
            <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                <h3 className="text-base sm:text-lg font-bold font-headline uppercase text-slate-900 dark:text-white tracking-tight">
                  {isIndividual ? `Competitori Înscriși în Campionat (${teams.length})` : `Echipe Înscrise în Campionat (${teams.length})`}
                </h3>
              </div>

              {activeChamp && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                    {activeChamp.diceRollCount}/3 Zaruri Utilizate
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                {isIndividual ? "Se încarcă lista competitorilor..." : "Se încarcă lista echipelor..."}
              </div>
            ) : teams.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl block text-slate-400 dark:text-slate-500">{isIndividual ? "directions_run" : "shield"}</span>

                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                  {isIndividual ? "Niciun Competitor Înscris Încă" : "Nicio Echipă Înscrisă Încă"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-label">
                  {activeChampId
                    ? (isIndividual
                      ? "Utilizează formularul din stânga pentru a adăuga primul competitor prin invitație directă sau din sistem!"
                      : "Utilizează formularul din stânga pentru a adăuga prima echipă prin invitație email sau selectare din sistem!")
                    : "Selectează un campionat în sus pentru a încărca echipele înscrise."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((t, idx) => {
                  const roleParam = isIndividual ? "player" : "team_leader";
                  const inviteUrl = `https://sp.  buu.ro/signup?role=${roleParam}&championshipId=${activeChampId}&teamId=${t.id}&email=${encodeURIComponent(t.managerEmail || "")}`;

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-lime-400 transition shadow-sm group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md uppercase shrink-0 border border-white/10"
                            style={{ backgroundColor: t.color || "#84cc16" }}
                          >
                            {t.shortName || t.name.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                              {t.name}
                            </span>
                            <span className="text-[10px] font-label text-slate-500 dark:text-slate-400">
                              {isIndividual ? `Seed #${idx + 1}` : `Seed #${idx + 1} • ${t._count?.players || 0} Jucători`}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(t.id, t.name)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                          title={isIndividual ? "Elimină din tablou" : "Elimină din campionat"}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      {/* Manager Details */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                        <div className="flex justify-between font-label">
                          <span className="text-slate-400">{isIndividual ? "Competitor / Contact:" : "Manager / Lider:"}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {t.manager?.name || "În așteptare invitație"}
                          </span>
                        </div>
                        {t.managerEmail && (
                          <div className="flex justify-between font-mono text-[10px] text-slate-500 truncate">
                            <span>Email:</span>
                            <span className="truncate ml-2">{t.managerEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: WhatsApp Invite & Copy Link */}
                      <div className="flex gap-2">
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            isIndividual
                              ? `Salut! Te-am înscris ca jucător/competitor în turneul ${activeChamp?.name || ""}. Confirmă înscrierea aici: ${inviteUrl}`
                              : `Salut! Echipa ta "${t.name}" este înscrisă în campionatul ${activeChamp?.name || ""}. Completează lotul aici: ${inviteUrl}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>💬</span> WhatsApp
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteUrl);
                            alert(`Link invitație copiat pentru "${t.name}"!`);
                          }}
                          className="py-1.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-headline font-bold text-[10px] uppercase tracking-wider"
                          title="Copiază Link Invitație"
                        >
                          🔗 Copiază
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Embedded Dice Draw Console Modal */}
      {showDiceModal && activeChampId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-xl font-bold">
                  <span className="material-symbols-outlined text-2xl">casino</span>
                </div>
                <div>
                  <h3 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white">
                    Consola de Extragere &amp; Perechere cu Zaruri
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    Campionatul: <strong>{activeChamp?.name}</strong> • {teams.length} Echipe Extrase
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDiceModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <AdminDiceConsole
              championshipId={activeChampId}
              teams={teams}
              onDrawCompleted={() => {
                loadData(activeChampId);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
