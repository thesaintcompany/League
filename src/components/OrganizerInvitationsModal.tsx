"use client";

import React, { useState } from "react";
import { isIndividualSport } from "@/lib/constants";

interface OrganizerInvitationsModalProps {
  championshipId: string;
  championshipName: string;
  sport?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizerInvitationsModal({
  championshipId,
  championshipName,
  sport = "Fotbal",
  isOpen,
  onClose,
}: OrganizerInvitationsModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "dice_announcement">("invite");

  const isIndividual = isIndividualSport(sport);

  // Dice Draw Announcement State
  const [drawDate, setDrawDate] = useState("2026-09-01");
  const [drawTime, setDrawTime] = useState("19:00");
  const [customNotes, setCustomNotes] = useState(
    isIndividual
      ? "Tragerea la sorți a tabloului de concurs (Seeds & Bracket Draw) va avea loc live!"
      : "Aruncarea zarurilor pentru dispunerea echipelor în brackets va avea loc live!"
  );

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // If tennis / individual sport, invite role is player, otherwise team_leader
  const inviteUrl = isIndividual
    ? `${origin}/signup?role=player&championshipId=${championshipId}`
    : `${origin}/signup?role=team_leader&championshipId=${championshipId}`;
  const bracketsUrl = `${origin}/brackets`;

  const inviteMessage = isIndividual
    ? `🎾 Salut! Te invit să te înscrii ca jucător în turneul de tenis "${championshipName}". Înregistrează-te și confirmă prezența pe tablou aici: ${inviteUrl}`
    : `🏆 Salut! Te invit să înscrii echipa pe platforma Ligue Pro pentru campionatul "${championshipName}". Înregistrează-te și creează-ți echipa aici: ${inviteUrl}`;

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
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("invite")}
            className={`px-4 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition ${
              activeTab === "invite"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            {isIndividual ? "1. Invită Jucători Tenis (WhatsApp/Email)" : "1. Invită Lideri de Echipă (WhatsApp/Email)"}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dice_announcement")}
            className={`px-4 py-2.5 rounded-t-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition ${
              activeTab === "dice_announcement"
                ? "bg-lime-400 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">casino</span>
            {isIndividual ? "2. Anunț Tragere Tablou & Meciuri" : "2. Anunț Aruncare Zaruri & Brackets"}
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

        {/* TAB 2: DRAW ANNOUNCEMENT */}
        {activeTab === "dice_announcement" && (
          <div className="space-y-5">
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
          </div>
        )}
      </div>
    </div>
  );
}
