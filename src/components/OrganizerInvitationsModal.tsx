"use client";

import React, { useState, useEffect } from "react";
import { isIndividualSport, getAjfUrlForCounty } from "@/lib/constants";

interface RefereeOption {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  refereeBadge?: string | null;
  experienceYears?: number | null;
}

interface CompetitorOption {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  image?: string | null;
  role?: string;
}

interface OrganizerInvitationsModalProps {
  championshipId: string;
  championshipName: string;
  sport?: string;
  county?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onParticipantAdded?: () => void;
}

export function OrganizerInvitationsModal({
  championshipId,
  championshipName,
  sport = "Fotbal",
  county,
  isOpen,
  onClose,
  onParticipantAdded,
}: OrganizerInvitationsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "referees" | "dice_announcement">("invite");

  // Mode Selection: true = individual (players), false = team leaders
  // Default derived from sport, but organizatorul poate comuta explicit.
  const [isIndividual, setIsIndividualMode] = useState(() => isIndividualSport(sport));

  // Competitor sub-tab: "db" | "email" | "link"
  const [competitorMode, setCompetitorMode] = useState<"db" | "email" | "link">("db");
  const [availableCompetitors, setAvailableCompetitors] = useState<CompetitorOption[]>([]);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>("");
  const [competitorSearch, setCompetitorSearch] = useState("");
  const [competitorCustomName, setCompetitorCustomName] = useState("");
  const [competitorCustomEmail, setCompetitorCustomEmail] = useState("");
  const [competitorCustomPhone, setCompetitorCustomPhone] = useState("");
  const [competitorInviteSent, setCompetitorInviteSent] = useState(false);
  const [competitorEnrolling, setCompetitorEnrolling] = useState(false);
  const [competitorEnrolledSuccess, setCompetitorEnrolledSuccess] = useState<string | null>(null);

  // Referee sub-tab: "db" | "email" | "ajf"
  const [refereeMode, setRefereeMode] = useState<"db" | "email" | "ajf">("db");
  const [availableReferees, setAvailableReferees] = useState<RefereeOption[]>([]);
  const [selectedRefereeId, setSelectedRefereeId] = useState<string>("");
  const [refereeCustomName, setRefereeCustomName] = useState("");
  const [refereeCustomEmail, setRefereeCustomEmail] = useState("");
  const [refereeInviteSent, setRefereeInviteSent] = useState(false);
  const ajfInfo = getAjfUrlForCounty(county);

  // Load referees and competitors from database (excluding already enrolled competitors)
  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      try {
        const [refRes, compRes, champRes] = await Promise.all([
          fetch("/api/referees"),
          fetch("/api/players"),
          fetch(`/api/championships/${championshipId}`),
        ]);
        if (refRes.ok) {
          const data = await refRes.json();
          setAvailableReferees(data.referees || []);
          if (data.referees?.length > 0) {
            setSelectedRefereeId(data.referees[0].id);
          }
        }

        const enrolledNames = new Set<string>();
        if (champRes.ok) {
          const champData = await champRes.json();
          (champData.championship?.teams || []).forEach((t: any) => {
            if (t.name) enrolledNames.add(t.name.toLowerCase().trim());
          });
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          const allComps: CompetitorOption[] = compData.competitors || [];
          // Filtrăm după mod: individual → doar jucători; echipe → doar lideri de echipe
          const roleFiltered = allComps.filter((c): c is CompetitorOption =>
            isIndividual
              ? c.role === "player"
              : c.role === "team_leader"
          );
          const filteredComps = roleFiltered.filter(
            (c) => !enrolledNames.has(c.name.toLowerCase().trim())
          );
          setAvailableCompetitors(filteredComps);
          if (filteredComps.length > 0) {
            setSelectedCompetitorId(filteredComps[0].id);
          } else {
            setSelectedCompetitorId("");
          }
        }
      } catch (err) {
        console.error("Eroare la încărcarea datelor din DB:", err);
      }
    }
    loadData();
  }, [isOpen, championshipId, isIndividual]);

  // Dice Draw Announcement State
  const [drawDate, setDrawDate] = useState("2026-09-01");
  const [drawTime, setDrawTime] = useState("19:00");
  const [customNotes, setCustomNotes] = useState(
    isIndividual
      ? "Tragerea la sorți a tabloului de concurs (Seeds & Bracket Draw) va avea loc live!"
      : "Aruncarea zarurilor pentru dispunerea echipelor în brackets va avea loc live!"
  );
  const [disableAnnouncements, setDisableAnnouncements] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // If tennis / individual sport, invite role is player, otherwise team_leader
  const inviteUrl = isIndividual
    ? `${origin}/signup?role=player&championshipId=${championshipId}`
    : `${origin}/signup?role=team_leader&championshipId=${championshipId}`;

  const refereeSignupUrl = `${origin}/signup?role=referee&championshipId=${championshipId}`;
  const bracketsUrl = `${origin}/brackets`;

  const inviteMessage = isIndividual
    ? `Salut! Te invit să te înscrii ca jucător în turneul de tenis "${championshipName}". Înregistrează-te și confirmă prezența pe tablou aici: ${inviteUrl}`
    : `Salut! Te invit să înscrii echipa pe platforma Ligue Pro pentru campionatul "${championshipName}". Înregistrează-te și creează-ți echipa aici: ${inviteUrl}`;

  const selectedRef = availableReferees.find((r) => r.id === selectedRefereeId);
  const refereeTargetEmail = refereeMode === "db" ? selectedRef?.email : refereeCustomEmail;
  const refereeTargetName = refereeMode === "db" ? selectedRef?.name : refereeCustomName;

  const refereePersonalInviteMsg = `Salut ${refereeTargetName || " "}! Te invităm să arbitrezi partidele din cadrul competiției "${championshipName}" (${sport}${county ? ` • Județul ${county}` : ""}). Creează-ți sau accesează panoul   de arbitru aici: ${refereeSignupUrl}`;

  const refereeEmailHref = `mailto:${refereeTargetEmail || ""}?subject=${encodeURIComponent(`Invitație Oficială Arbitraj - ${championshipName}`)}&body=${encodeURIComponent(refereePersonalInviteMsg)}`;
  const refereeWhatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(refereePersonalInviteMsg)}`;

  const diceAnnouncementMessage = isIndividual
    ? `ANUNȚ   TABLOU: Tragerea la sorți a tabloului de meciuri pentru turneul "${championshipName}" va avea loc pe ${drawDate} la ora ${drawTime}. ${customNotes} Urmărește tabloul live aici: ${bracketsUrl}`
    : `ANUNȚ  : Aruncarea zarurilor și dispunerea meciurilor în brackets pentru "${championshipName}" va avea loc în data de ${drawDate} la ora ${drawTime}. ${customNotes} Urmărește tabloul meciurilor live aici: ${bracketsUrl}`;

  const whatsappInviteUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
  const emailInviteUrl = `mailto:?subject=${encodeURIComponent(
    isIndividual ? `Invitație Înscriere Jucător Tenis - ${championshipName}` : `Invitație Înscriere Echipă - ${championshipName}`
  )}&body=${encodeURIComponent(inviteMessage)}`;

  const whatsappDiceUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(diceAnnouncementMessage)}`;
  const emailDiceUrl = `mailto:?subject=${encodeURIComponent(
    isIndividual ? `Anunț Tragere la Sorți Tablou Tenis - ${championshipName}` : `Anunț Aruncare Zaruri & Brackets - ${championshipName}`
  )}&body=${encodeURIComponent(diceAnnouncementMessage)}`;

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  function handleCopyRefereeLink() {
    navigator.clipboard.writeText(refereeSignupUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                {isIndividual ? "TURNEU INDIVIDUAL TENIS" : "INSTRUMENTE ORGANIZATOR PRO"}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">{sport}</span>
            </div>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
              {isIndividual ? "Invitații Jucători & Anunț Tablou" : "Invitații Lideri Echipă & Anunț Zaruri"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
              {championshipName}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 px-1">
            <button
              type="button"
              onClick={() => setIsIndividualMode(false)}
              className={`px-3 py-1.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 ${isIndividual
                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                  : "bg-lime-400 text-slate-950 shadow-sm"
                }`}
              title="Comută la modul echipe"
            >
              <span className="material-symbols-outlined text-sm">groups_2</span>
              <span>Echipe</span>
            </button>
            <button
              type="button"
              onClick={() => setIsIndividualMode(true)}
              className={`px-3 py-1.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 ${isIndividual
                  ? "bg-lime-400 text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              title="Comută la modul individual"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Individual</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
          >
            <span className="material-symbols-outlined align-middle text-sm">close</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("invite")}
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${activeTab === "invite"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            {isIndividual ? "1. Invită Jucători" : "1. Invită Lideri Echipă"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("referees")}
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${activeTab === "referees"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-base">sports</span>
            <span>2. Invită Arbitri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dice_announcement")}
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${activeTab === "dice_announcement"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-base">casino</span>
            {isIndividual ? "3. Anunț Tragere Tablou" : "3. Anunț Aruncare Zaruri"}
          </button>
        </div>

        {/* TAB 1: INVITE PLAYERS / COMPETITORS / TEAM LEADERS */}
        {activeTab === "invite" && (
          <div className="space-y-5">
            {/* Competitor Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-headline font-bold">
              <button
                type="button"
                onClick={() => setCompetitorMode("db")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${competitorMode === "db"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">badge</span>
                <span>Din Baza de Date ({availableCompetitors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCompetitorMode("email")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${competitorMode === "email"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Invitație Email / Nume</span>
              </button>

              <button
                type="button"
                onClick={() => setCompetitorMode("link")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${competitorMode === "link"
                    ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">link</span>
                <span>Link Public &amp; Social</span>
              </button>
            </div>

            {/* Sub-Mode 1: Competitors from Database */}
            {competitorMode === "db" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300">
                      {isIndividual ? "Selectează Jucător Înscris în Aplicație:" : "Selectează Lider / Echipă din Baza de Date:"}
                    </span>
                    <input
                      type="text"
                      value={competitorSearch}
                      onChange={(e) => setCompetitorSearch(e.target.value)}
                      placeholder="Caută după nume sau email..."
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  {availableCompetitors.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {availableCompetitors
                        .filter((c) => {
                          const q = competitorSearch.toLowerCase();
                          return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
                        })
                        .map((comp) => {
                          const isSelected = selectedCompetitorId === comp.id;
                          return (
                            <div
                              key={comp.id}
                              onClick={() => setSelectedCompetitorId(comp.id)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected
                                  ? "bg-lime-400/15 border-lime-500 dark:border-lime-400 ring-2 ring-lime-400/30"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-full bg-slate-900 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 ${isIndividual ? "" : "bg-blue-400 text-white"}`}>
                                  {isIndividual ? comp.name.substring(0, 2).toUpperCase() : <span className="material-symbols-outlined text-sm">shield</span>}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-headline font-bold text-slate-900 dark:text-white truncate">
                                    {comp.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-label truncate">
                                    {comp.email} {comp.phone ? `• ${comp.phone}` : ""} {isIndividual && comp.position ? `• ${comp.position}` : ""}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={competitorEnrolling}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setCompetitorEnrolling(true);
                                    setCompetitorEnrolledSuccess(null);
                                    try {
                                      const res = await fetch(`/api/championships/${championshipId}/teams`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          name: comp.name,
                                          shortName: comp.name.substring(0, 3).toUpperCase(),
                                          color: isIndividual ? "#0d9488" : "#10b981",
                                        }),
                                      });
                                      if (res.ok) {
                                        setCompetitorEnrolledSuccess(` ${comp.name} a fost adăugat pe tablou!`);
                                        // Elimină instant competitorul din lista disponibilă pentru a nu putea fi adăugat de două ori
                                        setAvailableCompetitors((prev) => prev.filter((c) => c.id !== comp.id && c.name.toLowerCase() !== comp.name.toLowerCase()));
                                        if (selectedCompetitorId === comp.id) {
                                          setSelectedCompetitorId("");
                                        }
                                        onParticipantAdded?.();
                                        setTimeout(() => setCompetitorEnrolledSuccess(null), 4000);
                                      } else {
                                        const err = await res.json().catch(() => ({}));
                                        alert(err.error || "Eroare la adăugarea competitorului.");
                                      }
                                    } catch {
                                      alert("Eroare de rețea.");
                                    } finally {
                                      setCompetitorEnrolling(false);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-[11px] uppercase tracking-wider transition active:scale-95 shadow-sm"
                                >
                                  + Adaugă pe Tablou
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      Nu există încă alți utilizatori înscriși în baza de date. Poți trimite invitații prin Email sau WhatsApp.
                    </p>
                  )}

                  {competitorEnrolledSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs font-label border border-emerald-500/30">
                      {competitorEnrolledSuccess}
                    </div>
                  )}
                </div>

                {/* Direct Action for selected competitor */}
                {selectedCompetitorId && (() => {
                  const selectedComp = availableCompetitors.find((c) => c.id === selectedCompetitorId);
                  if (!selectedComp) return null;
                  const personalMsg = isIndividual
                    ? `Salut ${selectedComp.name}! Te invităm   în turneul de ${sport} "${championshipName}". Înscrie-te și validează-ți prezența pe tablou aici: ${inviteUrl}`
                    : `Salut ${selectedComp.name}! Te invităm să-ți înscrii echipa în campionatul de ${sport} "${championshipName}". Confirmă participarea aici: ${inviteUrl}`;
                  const waHref = `https://api.whatsapp.com/send?${selectedComp.phone ? `phone=${selectedComp.phone.replace(/\D/g, "")}&` : ""}text=${encodeURIComponent(personalMsg)}`;
                  const mailHref = `mailto:${selectedComp.email || ""}?subject=${encodeURIComponent(`Invitație Oficială - ${championshipName}`)}&body=${encodeURIComponent(personalMsg)}`;

                  return (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-headline font-bold text-slate-900 dark:text-white uppercase block">
                        Trimite Notificare Personalizată către: {selectedComp.name}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                        >
                          <span className="text-base"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                          <span>Trimite pe WhatsApp</span>
                        </a>

                        <a
                          href={mailHref}
                          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                        >
                          <span className="material-symbols-outlined text-base">mail</span>
                          <span>Trimite pe Email</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Sub-Mode 2: Invite by Name & Email / Phone */}
            {competitorMode === "email" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300 block">
                    {isIndividual ? "Date Jucător de Invitat:" : "Date Lider de Echipă:"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold font-label uppercase text-slate-500 block mb-1">
                        Nume &amp; Prenume *
                      </label>
                      <input
                        type="text"
                        value={competitorCustomName}
                        onChange={(e) => setCompetitorCustomName(e.target.value)}
                        placeholder="ex: Andrei Popescu"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold font-label uppercase text-slate-500 block mb-1">
                        Adresă Email *
                      </label>
                      <input
                        type="email"
                        value={competitorCustomEmail}
                        onChange={(e) => setCompetitorCustomEmail(e.target.value)}
                        placeholder="ex: andrei@exemplu.ro"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold font-label uppercase text-slate-500 block mb-1">
                      Telefon / WhatsApp (Opțional)
                    </label>
                    <input
                      type="text"
                      value={competitorCustomPhone}
                      onChange={(e) => setCompetitorCustomPhone(e.target.value)}
                      placeholder="ex: 0722123456"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <a
                      href={`mailto:${competitorCustomEmail}?subject=${encodeURIComponent(
                        isIndividual ? `Invitație Oficială Jucător - ${championshipName}` : `Invitație Oficială Echipă - ${championshipName}`
                      )}&body=${encodeURIComponent(
                        `Salut ${competitorCustomName || "Sportiv"}!\n\nTe invităm să participi la "${championshipName}" (${sport}).\nÎnscrie-te și confirmă prezența aici: ${inviteUrl}\n\nCu stimă,\nOrganizatorul competiției`
                      )}`}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">mail</span>
                      <span>Trimite Email Direct</span>
                    </a>

                    <a
                      href={`https://api.whatsapp.com/send?${competitorCustomPhone ? `phone=${competitorCustomPhone.replace(/\D/g, "")}&` : ""}text=${encodeURIComponent(
                        `Salut ${competitorCustomName || "Sportiv"}! Te invităm să participi la "${championshipName}" (${sport}). Confirmă prezența pe tablou aici: ${inviteUrl}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <span className="text-base"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                      <span>Trimite pe WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Mode 3: Public Link & Social Media */}
            {competitorMode === "link" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300 block">
                    {isIndividual ? "Link Direct de Înscriere Jucător pe Tablou:" : "Link Direct de Înregistrare & Aderare Lider:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteUrl}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition active:scale-95"
                    >
                      {copiedLink ? "Copiat " : "Copiază"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={whatsappInviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="text-lg"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                    <span>Distribuie pe WhatsApp</span>
                  </a>

                  <a
                    href={emailInviteUrl}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>Trimite via Email</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVITE REFEREES */}
        {activeTab === "referees" && (
          <div className="space-y-5">
            {/* Referee Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-headline font-bold">
              <button
                type="button"
                onClick={() => setRefereeMode("db")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${refereeMode === "db"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">badge</span>
                <span>Din Baza de Date ({availableReferees.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRefereeMode("email")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${refereeMode === "email"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Invitație Email / Nume</span>
              </button>

              <button
                type="button"
                onClick={() => setRefereeMode("ajf")}
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${refereeMode === "ajf"
                    ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                <span>Site   AJF</span>
              </button>
            </div>

            {/* OPTION 1: Din Baza de Date */}
            {refereeMode === "db" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300 block">
                    Selectează un arbitru înregistrat pe platformă:
                  </label>

                  {availableReferees.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Nu există arbitri înregistrați momentan în baza de date. Poți trimite o invitație personală pe email sau consulta AJF-ul local.
                    </p>
                  ) : (
                    <select
                      value={selectedRefereeId}
                      onChange={(e) => setSelectedRefereeId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {availableReferees.map((ref) => (
                        <option key={ref.id} value={ref.id}>
                          {ref.name} {ref.refereeBadge ? `• ${ref.refereeBadge}` : ""} ({ref.email})
                        </option>
                      ))}
                    </select>
                  )}

                  {selectedRef && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedRef.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{selectedRef.email} {selectedRef.phone ? `• ${selectedRef.phone}` : ""}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-700 dark:text-lime-400 font-bold text-[10px] uppercase">
                        {selectedRef.refereeBadge || " "}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={refereeWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="text-lg"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                    <span>Invită pe WhatsApp</span>
                  </a>

                  <a
                    href={refereeEmailHref}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>Trimite Invitație Email</span>
                  </a>
                </div>
              </div>
            )}

            {/* OPTION 2: Invitație pe bază de Email & Nume */}
            {refereeMode === "email" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300 block">
                    Completează datele arbitrului pe care dorești să îl inviți:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                        Nume &amp; Prenume Arbitru *
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Andrei Popescu"
                        value={refereeCustomName}
                        onChange={(e) => setRefereeCustomName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                        Adresă Email Arbitru *
                      </label>
                      <input
                        type="email"
                        placeholder="arbitru@exemplu.ro"
                        value={refereeCustomEmail}
                        onChange={(e) => setRefereeCustomEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      Link Direct de Înregistrare Arbitru în Competiție:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={refereeSignupUrl}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleCopyRefereeLink}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition active:scale-95"
                      >
                        {copiedLink ? "Copiat " : "Copiază"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={refereeWhatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="text-lg"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                    <span>Invită pe WhatsApp</span>
                  </a>

                  <a
                    href={refereeEmailHref}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>Trimite Invitație Email</span>
                  </a>
                </div>
              </div>
            )}

            {/* OPTION 3: Găsește arbitri în județul tău (Redirecționare site   AJF) */}
            {refereeMode === "ajf" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-lime-500/10 via-slate-50 dark:via-slate-900 to-emerald-500/10 border border-lime-400/40 dark:border-lime-500/30 space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-2xl">groups_2</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400">
                      Găsește  i &amp; Arbitri Certificați
                    </span>
                    <h4 className="text-base font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {county ? `Comisia Județeană de Arbitri (CJA) • ${county}` : "Comisia Centrală a Arbitrilor (CCA / FRF)"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Contactează direct Asociația Județeană de Fotbal sau Comisia Centrală a Arbitrilor pentru delegări oficiale, baremuri și arbitri autorizați.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-emerald-500 shrink-0">verified_user</span>
                  <span className="text-[11px] leading-relaxed">
                    <strong>Protecția Datelor &amp; Siguranță:</strong> Nu este necesară introducerea de date cu caracter sensibil. Te îndrumăm direct către portalul   acreditat al asociației județene.
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={ajfInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span>Găsește arbitri în județul tău ({ajfInfo.label})</span>
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                  </a>

                  <a
                    href="https://www.frf.ro/comunicari/comisii-frf/comisia-centrala-a-arbitrilor/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Portal Național CCA</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DRAW ANNOUNCEMENT */}
        {activeTab === "dice_announcement" && (
          <div className="space-y-5">
            {/* Toggle Disable Announcements for Instant Draw (ON/OFF Switch) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base"><span className="material-symbols-outlined align-middle text-sm">bolt</span></span>
                  <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                    Dezactivează Anunțurile cu Zaruri (Tragere Silent)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-label block mt-0.5">
                  {disableAnnouncements
                    ? " Activ: Tragerea la sorți este executată instant, fără notificări/comunicate către echipe."
                    : " Inactiv: Echipele primesc notificări programate despre evenimentul tragerii la sorți."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDisableAnnouncements((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${disableAnnouncements ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                role="switch"
                aria-checked={disableAnnouncements}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${disableAnnouncements ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {!disableAnnouncements ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Data Tragerii la Sorți:
                    </label>
                    <input
                      type="date"
                      value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Ora Evenimentului:
                    </label>
                    <input
                      type="time"
                      value={drawTime}
                      onChange={(e) => setDrawTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Mesaj Suplimentar Notificare:
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-1">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest block text-amber-600 dark:text-amber-400">
                    Previzualizare Mesaj WhatsApp / Email:
                  </span>
                  <p className="text-xs font-mono leading-relaxed">{diceAnnouncementMessage}</p>
                </div>

                {/* Transmit Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href={whatsappDiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="text-lg"><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span>
                    <span>Anunță pe WhatsApp</span>
                  </a>

                  <a
                    href={emailDiceUrl}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">campaign</span>
                    <span>Anunță pe Email</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold font-headline text-sm uppercase text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-xl">bolt</span>
                  <span>Tragere la Sorți Instantă Activă</span>
                </div>
                <p className="leading-relaxed">
                  Anunțurile automate cu zaruri au fost dezactivate. Tragerea la sorți a echipelor / competitorilor se va executa instant direct în consolă, fără trimiterea de mesaje de notificare pe WhatsApp sau Email.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
