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

interface OrganizerInvitationsModalProps {
  championshipId: string;
  championshipName: string;
  sport?: string;
  county?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizerInvitationsModal({
  championshipId,
  championshipName,
  sport = "Fotbal",
  county,
  isOpen,
  onClose,
}: OrganizerInvitationsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "referees" | "dice_announcement">("invite");

  // Referee sub-tab: "db" | "email" | "ajf"
  const [refereeMode, setRefereeMode] = useState<"db" | "email" | "ajf">("db");
  const [availableReferees, setAvailableReferees] = useState<RefereeOption[]>([]);
  const [selectedRefereeId, setSelectedRefereeId] = useState<string>("");
  const [refereeCustomName, setRefereeCustomName] = useState("");
  const [refereeCustomEmail, setRefereeCustomEmail] = useState("");
  const [refereeInviteSent, setRefereeInviteSent] = useState(false);

  const isIndividual = isIndividualSport(sport);
  const ajfInfo = getAjfUrlForCounty(county);

  // Load referees from database
  useEffect(() => {
    if (!isOpen) return;
    async function fetchReferees() {
      try {
        const res = await fetch("/api/referees");
        if (res.ok) {
          const data = await res.json();
          setAvailableReferees(data.referees || []);
          if (data.referees?.length > 0) {
            setSelectedRefereeId(data.referees[0].id);
          }
        }
      } catch (err) {
        console.error("Eroare la încărcarea arbitrilor:", err);
      }
    }
    fetchReferees();
  }, [isOpen]);

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
    ? `🎾 Salut! Te invit să te înscrii ca jucător în turneul de tenis "${championshipName}". Înregistrează-te și confirmă prezența pe tablou aici: ${inviteUrl}`
    : `🏆 Salut! Te invit să înscrii echipa pe platforma Ligue Pro pentru campionatul "${championshipName}". Înregistrează-te și creează-ți echipa aici: ${inviteUrl}`;

  const selectedRef = availableReferees.find((r) => r.id === selectedRefereeId);
  const refereeTargetEmail = refereeMode === "db" ? selectedRef?.email : refereeCustomEmail;
  const refereeTargetName = refereeMode === "db" ? selectedRef?.name : refereeCustomName;

  const refereePersonalInviteMsg = `⚖️ Salut ${refereeTargetName || "Oficial"}! Te invităm să arbitrezi partidele din cadrul competiției "${championshipName}" (${sport}${county ? ` • Județul ${county}` : ""}). Creează-ți sau accesează panoul oficial de arbitru aici: ${refereeSignupUrl}`;
  
  const refereeEmailHref = `mailto:${refereeTargetEmail || ""}?subject=${encodeURIComponent(`Invitație Oficială Arbitraj - ${championshipName}`)}&body=${encodeURIComponent(refereePersonalInviteMsg)}`;
  const refereeWhatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(refereePersonalInviteMsg)}`;

  const diceAnnouncementMessage = isIndividual
    ? `🎲🎾 ANUNȚ OFICIAL TABLOU: Tragerea la sorți a tabloului de meciuri pentru turneul "${championshipName}" va avea loc pe ${drawDate} la ora ${drawTime}. ${customNotes} Urmărește tabloul live aici: ${bracketsUrl}`
    : `🎲 ANUNȚ OFICIAL: Aruncarea zarurilor și dispunerea meciurilor în brackets pentru "${championshipName}" va avea loc în data de ${drawDate} la ora ${drawTime}. ${customNotes} Urmărește tabloul meciurilor live aici: ${bracketsUrl}`;

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
                {isIndividual ? "🎾 TURNEU INDIVIDUAL TENIS" : "INSTRUMENTE ORGANIZATOR PRO"}
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

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("invite")}
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "invite"
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
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "referees"
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
            className={`px-3.5 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 ${
              activeTab === "dice_announcement"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">casino</span>
            {isIndividual ? "3. Anunț Tragere Tablou" : "3. Anunț Aruncare Zaruri"}
          </button>
        </div>

        {/* TAB 1: INVITE PLAYERS / TEAM LEADERS */}
        {activeTab === "invite" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-headline font-bold uppercase text-slate-700 dark:text-slate-300 block">
                {isIndividual ? "Link Direct de Înscriere Jucător Tenis pe Tablou:" : "Link Direct de Înregistrare & Aderare Lider Echipă:"}
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
                  {copiedLink ? "Copiat ✓" : "Copiază"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest block">
                Trimite Invitația pe Canalele Sociale:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={whatsappInviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <span className="text-lg">💬</span>
                  <span>Trimite pe WhatsApp</span>
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

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-body leading-relaxed">
              {isIndividual ? (
                <span>
                  <strong>Cum funcționează?</strong> Când jucătorul accesează linkul, își creează profilul individual de jucător (club, mână de joc, punctaj) și va apărea instant pe tabloul tău de concurs pentru tragerea la sorți.
                </span>
              ) : (
                <span>
                  <strong>Cum funcționează?</strong> Când liderul de echipă accesează linkul, își creează cont pe platformă, își configurează lotul de jucători și va apărea automat în panoul tău de echipe pentru a fi asociat la campionat.
                </span>
              )}
            </div>
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
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  refereeMode === "db"
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
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  refereeMode === "email"
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
                className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  refereeMode === "ajf"
                    ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                <span>Site Oficial AJF</span>
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
                        {selectedRef.refereeBadge || "Oficial"}
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
                    <span className="text-lg">💬</span>
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
                        {copiedLink ? "Copiat ✓" : "Copiază"}
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
                    <span className="text-lg">💬</span>
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

            {/* OPTION 3: Găsește arbitri în județul tău (Redirecționare site oficial AJF) */}
            {refereeMode === "ajf" && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-lime-500/10 via-slate-50 dark:via-slate-900 to-emerald-500/10 border border-lime-400/40 dark:border-lime-500/30 space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    🏛️
                  </div>
                  <div>
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400">
                      Găsește Oficiali &amp; Arbitri Certificați
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
                    <strong>Protecția Datelor &amp; Siguranță:</strong> Nu este necesară introducerea de date cu caracter sensibil. Te îndrumăm direct către portalul oficial acreditat al asociației județene.
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
            {/* Toggle Disable Announcements for Instant Draw */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white block">
                  ⚡ Dezactivează Anunțurile cu Zaruri (Tragere Silent)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-label block">
                  Activează dacă dorești ca tragerea la sorți să fie executată instant, fără notificări/comunicate către echipe.
                </span>
              </div>
              <input
                type="checkbox"
                checked={disableAnnouncements}
                onChange={(e) => setDisableAnnouncements(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-lime-500 focus:ring-lime-400 shrink-0 cursor-pointer"
              />
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
                    <span className="text-lg">💬</span>
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
