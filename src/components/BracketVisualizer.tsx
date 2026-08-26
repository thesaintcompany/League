"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MatchData } from "./MatchCard";

interface BracketVisualizerProps {
  matches: MatchData[];
  championshipId?: string;
  championshipName?: string;
  shareCode?: string;
  isPublished?: boolean;
  onEditMatch?: (match: MatchData) => void;
  isAdmin?: boolean;
  onVisibilityChanged?: () => void;
}

export function BracketVisualizer({
  matches,
  championshipId,
  championshipName,
  shareCode = "LP-OFFICIAL",
  isPublished = true,
  onEditMatch,
  isAdmin = false,
  onVisibilityChanged,
}: BracketVisualizerProps) {
  const [published, setPublished] = useState(isPublished);
  const [currentShareCode, setCurrentShareCode] = useState(shareCode);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeMobileStage, setActiveMobileStage] = useState<"quarters" | "semis" | "final">("quarters");

  // Filter matches by stage or round
  const quarterFinals = matches.filter(
    (m) => m.round === 1 || (m as any).stage === "quarter_final"
  );
  const semiFinals = matches.filter(
    (m) => m.round === 2 || (m as any).stage === "semi_final"
  );
  const finals = matches.filter(
    (m) => m.round === 3 || (m as any).stage === "final"
  );

  const displayQuarters = quarterFinals.length > 0 ? quarterFinals : [];
  const displaySemis = semiFinals.length > 0 ? semiFinals : [];
  const displayFinal = finals.length > 0 ? finals[0] : null;

  async function togglePublish() {
    if (!championshipId) return;
    setLoadingPublish(true);
    try {
      const res = await fetch(`/api/championships/${championshipId}/publish-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBracketPublished: !published }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublished(data.isBracketPublished);
        if (data.shareCode) setCurrentShareCode(data.shareCode);
        if (onVisibilityChanged) onVisibilityChanged();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPublish(false);
    }
  }

  // Get clean standalone public URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "https://sp.buu.ro";
  const publicShareUrl = `${origin}/harta-campionat/${currentShareCode}`;

  function copyToClipboard(text: string, type: "link" | "code") {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative border border-slate-200 dark:border-slate-800 font-body transition-colors duration-200">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      {/* Header & Controls Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-lime-400/20 shrink-0">
            🎲
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black italic font-headline text-slate-900 dark:text-white tracking-tight uppercase">
                Harta Oficială a Turneului (Arbore Eliminatoriu)
              </h2>
              {published ? (
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 text-[10px] font-black font-label uppercase border border-lime-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 dark:bg-lime-400 animate-pulse"></span>
                  Public ✓
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-black font-label uppercase border border-amber-400/30">
                  🔒 Ciornă Privată
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-lime-600 dark:text-lime-400 text-[10px] font-black font-mono border border-slate-300 dark:border-slate-700">
                #{currentShareCode}
              </span>
            </div>
            <p className="text-xs font-label text-slate-500 dark:text-slate-400 mt-0.5">
              Fiecare campionat are o pagină web unică fără iframe-uri • Vizualizare completă în timp real
            </p>
          </div>
        </div>

        {/* Share & Admin Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">share</span>
            Distribuie Harta
          </button>

          <Link
            href={`/harta-campionat/${currentShareCode}`}
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-lime-400 border border-slate-200 dark:border-slate-700 font-label font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <span>Pagină Separată</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>

          {isAdmin && championshipId && (
            <button
              type="button"
              onClick={togglePublish}
              disabled={loadingPublish}
              title={published ? "Treci campionatul pe privat (permite re-aruncarea dacă nu au fost consumate cele 3 aruncări)" : "Publică harta meciurilor (va bloca definitiv aruncarea zarurilor)"}
              className={`px-4 py-2.5 rounded-2xl text-xs font-label font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md border ${
                published
                  ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border-amber-400"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {published ? "visibility_off" : "public"}
              </span>
              {loadingPublish
                ? "Se actualizează..."
                : published
                ? "Treci pe Privat"
                : "Fă Harta Publică 🚀 (Blochează Zarurile)"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (Hidden on desktop) */}
      <div className="flex md:hidden items-center justify-between gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveMobileStage("quarters")}
          className={`flex-1 py-2 rounded-xl text-[10px] font-headline font-black uppercase transition ${
            activeMobileStage === "quarters"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          Sferturi ({displayQuarters.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileStage("semis")}
          className={`flex-1 py-2 rounded-xl text-[10px] font-headline font-black uppercase transition ${
            activeMobileStage === "semis"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          Semifinale ({displaySemis.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileStage("final")}
          className={`flex-1 py-2 rounded-xl text-[10px] font-headline font-black uppercase transition ${
            activeMobileStage === "final"
              ? "bg-lime-400 text-slate-950 shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          }`}
        >
          Finala 🏆
        </button>
      </div>

      {/* Responsive Bracket Grid */}
      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* COLUMN 1: QUARTER FINALS */}
          <div className={`space-y-4 ${activeMobileStage === "quarters" ? "block" : "hidden md:block"}`}>
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
                  Sferturi de Finală
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                {displayQuarters.length} Meciuri
              </span>
            </div>

            <div className="space-y-4">
              {displayQuarters.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs font-label">
                  Niciun meci în sferturi.
                </div>
              ) : (
                displayQuarters.map((match, idx) => (
                  <BracketMatchNode
                    key={match.id || `q-${idx}`}
                    match={match}
                    onEdit={onEditMatch}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: SEMI FINALS */}
          <div className={`space-y-4 ${activeMobileStage === "semis" ? "block" : "hidden md:block"}`}>
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <h3 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
                  Semifinale
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                {displaySemis.length} Meciuri
              </span>
            </div>

            <div className="space-y-4 md:pt-8">
              {displaySemis.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs font-label">
                  Se stabilesc după sferturi.
                </div>
              ) : (
                displaySemis.map((match, idx) => (
                  <BracketMatchNode
                    key={match.id || `s-${idx}`}
                    match={match}
                    onEdit={onEditMatch}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: GRAND FINAL */}
          <div className={`space-y-4 ${activeMobileStage === "final" ? "block" : "hidden md:block"}`}>
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-400/30">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏆</span>
                <h3 className="text-xs font-black uppercase tracking-wider font-headline text-amber-800 dark:text-amber-300">
                  Marea Finală
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-amber-700 dark:text-amber-400 uppercase">
                Trofeul Ligii
              </span>
            </div>

            <div className="space-y-4 md:pt-16">
              {displayFinal ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-lime-400 rounded-3xl blur opacity-30"></div>
                  <div className="relative">
                    <BracketMatchNode
                      match={displayFinal}
                      onEdit={onEditMatch}
                      isAdmin={isAdmin}
                      isFinal={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-amber-300 dark:border-amber-500/30 text-center text-amber-600 dark:text-amber-300/60 text-xs font-label">
                  🏆 Finala se joacă între câștigătoarele semifinalelor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  Distribuire Harta Campionat
                </span>
                <h3 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900 dark:text-white mt-2">
                  Link Unic de Campionat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-body">
              Fiecare campionat are o pagină web dedicată cu link securizat și cod hash unic:
            </p>

            {/* Direct Web URL */}
            <div className="space-y-2">
              <label className="text-[11px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                1. Link Web Direct (Pagină Separată)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicShareUrl}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-mono text-lime-600 dark:text-lime-400 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(publicShareUrl, "link")}
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold font-label uppercase rounded-xl shadow transition shrink-0"
                >
                  {copiedLink ? "Copiat! ✓" : "Copiază"}
                </button>
              </div>
            </div>

            {/* Unique Share Code */}
            <div className="space-y-2">
              <label className="text-[11px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                2. Cod Unic de Turneu
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentShareCode}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-white font-bold select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentShareCode, "code")}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold font-label uppercase rounded-xl transition border border-slate-300 dark:border-slate-700 shrink-0"
                >
                  {copiedCode ? "Copiat! ✓" : "Copiază Cod"}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Urmărește Harta Campionatului ${championshipName || "Ligue Pro"}: ${publicShareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
              >
                <span>💬</span> WhatsApp
              </a>

              <Link
                href={`/harta-campionat/${currentShareCode}`}
                target="_blank"
                className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-xs font-headline font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition border border-slate-300 dark:border-slate-700"
              >
                <span>Deschide Pagina</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatchNode({
  match,
  onEdit,
  isAdmin,
  isFinal = false,
}: {
  match: MatchData;
  onEdit?: (m: MatchData) => void;
  isAdmin?: boolean;
  isFinal?: boolean;
}) {
  const isFinished =
    match.status === "finished" ||
    (match.homeScore !== null && match.homeScore !== undefined);
  const homeWin = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWin = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 border relative group ${
        isFinal
          ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-400/40 shadow-xl"
          : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/80 hover:border-lime-500 dark:hover:border-lime-400/80 shadow-md"
      }`}
    >
      {/* Top Meta Info */}
      <div className="flex justify-between items-center text-[10px] font-label text-slate-500 dark:text-slate-400 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800/80">
        <span className="truncate max-w-[140px] flex items-center gap-1 font-medium">
          <span>📍</span> {match.venue || "Teren Oficial"}
        </span>
        <div className="flex items-center gap-1.5">
          {match.status === "live" ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black animate-pulse uppercase">
              LIVE
            </span>
          ) : isFinished ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
              Finalizat
            </span>
          ) : (
            <span className="text-slate-400">
              {match.scheduledAt
                ? new Date(match.scheduledAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Programat"}
            </span>
          )}

          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(match)}
              title="Editează Scorul"
              className="p-1 rounded-lg text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Teams and Scores */}
      <div className="space-y-2 font-headline">
        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition ${
            homeWin
              ? "bg-lime-500/10 text-slate-900 dark:text-white font-bold"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.homeTeam.color || "#84cc16" }}
            ></span>
            <span className="text-xs truncate">{match.homeTeam.name}</span>
          </div>
          <span
            className={`text-sm font-mono font-black ml-2 ${
              homeWin ? "text-lime-600 dark:text-lime-400 text-base" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {match.homeScore !== null && match.homeScore !== undefined
              ? match.homeScore
              : "-"}
          </span>
        </div>

        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition ${
            awayWin
              ? "bg-lime-500/10 text-slate-900 dark:text-white font-bold"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.awayTeam.color || "#38bdf8" }}
            ></span>
            <span className="text-xs truncate">{match.awayTeam.name}</span>
          </div>
          <span
            className={`text-sm font-mono font-black ml-2 ${
              awayWin ? "text-lime-600 dark:text-lime-400 text-base" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {match.awayScore !== null && match.awayScore !== undefined
              ? match.awayScore
              : "-"}
          </span>
        </div>
      </div>

      {/* Match Promo & Tickets Link */}
      <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
        <Link
          href={`/matches/${match.id}/promo`}
          className="text-[11px] font-label font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1"
        >
          <span>🎟️ Promo &amp; Bilete</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </Link>
        <span className="text-[10px] text-slate-400 font-label">
          {match.stage || "Etapa Eliminatorie"}
        </span>
      </div>
    </div>
  );
}
