"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MatchData } from "./MatchCard";
import { RefereeControlModal } from "./RefereeControlModal";

interface BracketVisualizerProps {
  matches: MatchData[];
  championshipId?: string;
  championshipName?: string;
  sport?: string;
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
  sport,
  shareCode = "LP-OFFICIAL",
  isPublished = true,
  onEditMatch,
  isAdmin = false,
  onVisibilityChanged,
}: BracketVisualizerProps) {
  const router = useRouter();
  const [internalEditingMatch, setInternalEditingMatch] = useState<MatchData | null>(null);
  const handleEdit = onEditMatch || setInternalEditingMatch;

  const [published, setPublished] = useState(isPublished);
  const [currentShareCode, setCurrentShareCode] = useState(shareCode);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Mobile navigation modes: "tree" (mindmap flow with horizontal scroll) vs "stages" (tabs)
  const [mobileViewMode, setMobileViewMode] = useState<"tree" | "stages">("tree");
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

  // Group Quarters into pairs (Pair 1 -> Semi 1, Pair 2 -> Semi 2)
  const qfPair1 = quarterFinals.slice(0, 2);
  const qfPair2 = quarterFinals.slice(2, 4);

  const semi1 = semiFinals[0] || null;
  const semi2 = semiFinals[1] || null;
  const grandFinal = finals[0] || null;

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

  // Get clean direct public URL
  const origin = typeof window !== "undefined" ? window.location.origin : "https://sp.tscquantum.ro";
  const publicShareUrl = `${origin}/brackets?code=${currentShareCode}`;

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
    <div className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 font-body transition-colors duration-200 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg shadow-lime-400/20 shrink-0">
            🎲
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black italic font-headline text-slate-900 dark:text-white tracking-tight uppercase">
                {championshipName || "Harta Meciurilor"}
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
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-lime-600 dark:text-lime-400 text-[10px] font-black font-mono border border-slate-300 dark:border-slate-700">
                #{currentShareCode}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-label text-slate-500 dark:text-slate-400 mt-0.5">
              Tablou eliminatoriu oficial {sport ? `• ${sport}` : ""} (Arbore Mindmap)
            </p>
          </div>
        </div>

        {/* Share & Admin Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">share</span>
            <span>Distribuie</span>
          </button>

          {isAdmin && championshipId && (
            <button
              type="button"
              onClick={togglePublish}
              disabled={loadingPublish}
              className={`w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm border ${
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
                : "Fă Publică 🚀"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Mode Switcher (Visible on small screens < md) */}
      <div className="flex md:hidden items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 mb-5">
        <button
          type="button"
          onClick={() => setMobileViewMode("tree")}
          className={`flex-1 py-2 rounded-xl text-[11px] font-headline font-black uppercase transition flex items-center justify-center gap-1.5 ${
            mobileViewMode === "tree"
              ? "bg-lime-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>🌳</span> Mindmap Arbore
        </button>
        <button
          type="button"
          onClick={() => setMobileViewMode("stages")}
          className={`flex-1 py-2 rounded-xl text-[11px] font-headline font-black uppercase transition flex items-center justify-center gap-1.5 ${
            mobileViewMode === "stages"
              ? "bg-lime-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>📑</span> Etape Separate
        </button>
      </div>

      {/* Stage Tabs (Visible only in 'stages' mode on mobile) */}
      {mobileViewMode === "stages" && (
        <div className="flex md:hidden items-center justify-between gap-1.5 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 animate-in fade-in">
          <button
            type="button"
            onClick={() => setActiveMobileStage("quarters")}
            className={`flex-1 py-2 rounded-lg text-[10px] font-headline font-black uppercase transition ${
              activeMobileStage === "quarters"
                ? "bg-slate-900 text-white dark:bg-slate-800 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sferturi ({quarterFinals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileStage("semis")}
            className={`flex-1 py-2 rounded-lg text-[10px] font-headline font-black uppercase transition ${
              activeMobileStage === "semis"
                ? "bg-slate-900 text-white dark:bg-slate-800 shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Semifinale ({semiFinals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileStage("final")}
            className={`flex-1 py-2 rounded-lg text-[10px] font-headline font-black uppercase transition ${
              activeMobileStage === "final"
                ? "bg-amber-400 text-slate-950 font-black shadow"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Finala
          </button>
        </div>
      )}

      {/* Mobile Scroll Hint for Mindmap Flow */}
      {mobileViewMode === "tree" && (
        <div className="flex md:hidden items-center justify-between text-[10px] font-label text-slate-500 dark:text-slate-400 mb-3 px-1">
          <span className="flex items-center gap-1 font-bold text-lime-600 dark:text-lime-400">
            <span>⟷</span> Glisează orizontal pentru a naviga în arborele Mindmap
          </span>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            Sferturi ➔ Semis ➔ Finală
          </span>
        </div>
      )}

      {/* MAIN MINDMAP BRACKET CANVAS */}
      {/* On desktop: full flex layout with fine SVG connector lines */}
      {/* On mobile in 'tree' mode: horizontal smooth touch scroll container with full fine connector lines */}
      {/* On mobile in 'stages' mode: single active column */}
      <div
        className={`w-full max-w-full relative z-10 transition-all duration-300 ${
          mobileViewMode === "tree"
            ? "overflow-x-auto pb-4 scroll-smooth scrollbar-thin snap-x overscroll-x-contain"
            : "overflow-hidden"
        }`}
      >
        <div
          className={`flex items-stretch gap-0 w-full ${
            mobileViewMode === "tree"
              ? "min-w-[760px] lg:min-w-0"
              : "flex-col md:flex-row"
          }`}
        >
          {/* ================= COLUMN 1: SFERTURI DE FINALĂ (QUARTERS) ================= */}
          <div
            className={`flex-1 flex flex-col justify-between space-y-6 ${
              mobileViewMode === "stages" && activeMobileStage !== "quarters"
                ? "hidden md:flex"
                : "flex"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                <h3 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
                  Sferturi de Finală
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                {quarterFinals.length || 4} Meciuri
              </span>
            </div>

            {/* Quarter Pair 1 */}
            <div className="space-y-4 flex-1 flex flex-col justify-around py-2">
              <BracketMatchNode
                match={qfPair1[0] || createPlaceholderMatch(1, "Sfert de Finală 1")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Sfert 1"
              />
              <BracketMatchNode
                match={qfPair1[1] || createPlaceholderMatch(2, "Sfert de Finală 2")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Sfert 2"
              />
            </div>

            {/* Quarter Pair 2 */}
            <div className="space-y-4 flex-1 flex flex-col justify-around py-2">
              <BracketMatchNode
                match={qfPair2[0] || createPlaceholderMatch(3, "Sfert de Finală 3")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Sfert 3"
              />
              <BracketMatchNode
                match={qfPair2[1] || createPlaceholderMatch(4, "Sfert de Finală 4")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Sfert 4"
              />
            </div>
          </div>

          {/* ================= CONNECTOR 1: QUARTERS TO SEMIS (SVG FINE LINES) ================= */}
          <div
            className={`w-10 sm:w-16 shrink-0 flex flex-col justify-around relative select-none pointer-events-none ${
              mobileViewMode === "stages" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Top Branch Connector (QF 1 & 2 -> Semi 1) */}
            <div className="flex-1 flex items-center justify-center relative">
              <svg
                className="w-full h-full stroke-slate-300 dark:stroke-slate-700 stroke-[1.25] fill-none overflow-visible"
                viewBox="0 0 40 100"
                preserveAspectRatio="none"
              >
                {/* Upper QF to center curve */}
                <path
                  d="M 0,25 C 22,25 18,50 40,50"
                  className="transition-all duration-300"
                />
                {/* Lower QF to center curve */}
                <path
                  d="M 0,75 C 22,75 18,50 40,50"
                  className="transition-all duration-300"
                />
              </svg>
            </div>

            {/* Bottom Branch Connector (QF 3 & 4 -> Semi 2) */}
            <div className="flex-1 flex items-center justify-center relative">
              <svg
                className="w-full h-full stroke-slate-300 dark:stroke-slate-700 stroke-[1.25] fill-none overflow-visible"
                viewBox="0 0 40 100"
                preserveAspectRatio="none"
              >
                {/* Upper QF to center curve */}
                <path
                  d="M 0,25 C 22,25 18,50 40,50"
                  className="transition-all duration-300"
                />
                {/* Lower QF to center curve */}
                <path
                  d="M 0,75 C 22,75 18,50 40,50"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* ================= COLUMN 2: SEMIFINALE (SEMIS) ================= */}
          <div
            className={`flex-1 flex flex-col justify-between space-y-6 ${
              mobileViewMode === "stages" && activeMobileStage !== "semis"
                ? "hidden md:flex"
                : "flex"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
                <h3 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
                  Semifinale
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                {semiFinals.length || 2} Meciuri
              </span>
            </div>

            {/* Semifinal 1 */}
            <div className="flex-1 flex flex-col justify-center py-4">
              <BracketMatchNode
                match={semi1 || createPlaceholderMatch(5, "Semifinala 1", "Câștigătoare Sfert 1 vs Sfert 2")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Semifinala 1"
                isSemi={true}
              />
            </div>

            {/* Semifinal 2 */}
            <div className="flex-1 flex flex-col justify-center py-4">
              <BracketMatchNode
                match={semi2 || createPlaceholderMatch(6, "Semifinala 2", "Câștigătoare Sfert 3 vs Sfert 4")}
                onEdit={handleEdit}
                isAdmin={isAdmin}
                stageLabel="Semifinala 2"
                isSemi={true}
              />
            </div>
          </div>

          {/* ================= CONNECTOR 2: SEMIS TO FINAL (SVG FINE LINES) ================= */}
          <div
            className={`w-10 sm:w-16 shrink-0 flex flex-col justify-center relative select-none pointer-events-none ${
              mobileViewMode === "stages" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="h-[70%] w-full flex items-center justify-center relative">
              <svg
                className="w-full h-full stroke-slate-300 dark:stroke-slate-700 stroke-[1.25] fill-none overflow-visible"
                viewBox="0 0 40 100"
                preserveAspectRatio="none"
              >
                {/* Semi 1 to center curve */}
                <path
                  d="M 0,25 C 22,25 18,50 40,50"
                  className="transition-all duration-300"
                />
                {/* Semi 2 to center curve */}
                <path
                  d="M 0,75 C 22,75 18,50 40,50"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* ================= COLUMN 3: MAREA FINALĂ (GRAND FINAL) ================= */}
          <div
            className={`flex-1 flex flex-col justify-between space-y-6 ${
              mobileViewMode === "stages" && activeMobileStage !== "final"
                ? "hidden md:flex"
                : "flex"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-400/40 mb-2 shadow-sm">
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

            {/* Grand Final Card with Mindmap Node Styling */}
            <div className="flex-1 flex flex-col justify-center py-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-lime-400 to-amber-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                <div className="relative">
                  <BracketMatchNode
                    match={grandFinal || createPlaceholderMatch(7, "Marea Finală 🏆", "Câștigătoare Semifinala 1 vs Semifinala 2")}
                    onEdit={handleEdit}
                    isAdmin={isAdmin}
                    stageLabel="Trofeul Oficial 🏆"
                    isFinal={true}
                  />
                </div>
              </div>
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
            <div className="pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Urmărește Harta Campionatului ${championshipName || "Ligue Pro"}: ${publicShareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
              >
                <span>💬</span> Trimite pe WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Internal Referee & Match Organization Modal if triggered from Bracket */}
      {internalEditingMatch && championshipId && (
        <RefereeControlModal
          match={internalEditingMatch}
          championshipId={championshipId}
          isOpen={true}
          onClose={() => setInternalEditingMatch(null)}
          onUpdated={() => {
            router.refresh();
            if (onVisibilityChanged) onVisibilityChanged();
          }}
        />
      )}
    </div>
  );
}

// Mindmap Match Node Component with Port Anchors
function BracketMatchNode({
  match,
  onEdit,
  isAdmin,
  stageLabel,
  isSemi = false,
  isFinal = false,
}: {
  match: MatchData;
  onEdit?: (m: MatchData) => void;
  isAdmin?: boolean;
  stageLabel?: string;
  isSemi?: boolean;
  isFinal?: boolean;
}) {
  const isFinished =
    match.status === "finished" ||
    (match.homeScore !== null && match.homeScore !== undefined);
  const homeWin = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWin = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const isPlaceholder = match.id.startsWith("placeholder-");

  const cardContent = (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border relative group shadow-md hover:shadow-lg ${
        isFinal
          ? "bg-amber-50/95 dark:bg-amber-950/40 border-amber-300 dark:border-amber-400/50 shadow-amber-500/10 hover:border-amber-400"
          : isSemi
          ? "bg-slate-50 dark:bg-slate-900/95 border-slate-200 dark:border-purple-500/30 hover:border-purple-400"
          : "bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/90 hover:border-lime-500/80"
      }`}
    >
      {/* Top Meta Info */}
      <div className="flex justify-between items-center text-[10px] font-label text-slate-500 dark:text-slate-400 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80 gap-2">
        <span className="truncate flex-1 min-w-0 flex items-center gap-1 font-medium">
          <span>📍</span>
          <span className="truncate">{match.venue || "Teren Oficial"}</span>
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {match.status === "live" ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black animate-pulse uppercase text-[9px]">
              LIVE
            </span>
          ) : isFinished ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[9px]">
              Finalizat
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
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

          {isAdmin && onEdit && !isPlaceholder && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(match);
              }}
              title="Editează Scorul"
              className="p-1 rounded-lg text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Teams and Scores with Robust Truncation */}
      <div className="space-y-1.5 font-headline">
        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition ${
            homeWin
              ? "bg-lime-500/15 text-slate-950 dark:text-white font-bold"
              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.homeTeam.color || "#84cc16" }}
            ></span>
            <span className="text-xs truncate font-medium" title={match.homeTeam.name}>
              {match.homeTeam.name}
            </span>
          </div>
          <span
            className={`text-xs sm:text-sm font-mono font-black shrink-0 px-1.5 py-0.5 rounded-lg ${
              homeWin
                ? "bg-lime-400/20 text-lime-600 dark:text-lime-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {match.homeScore !== null && match.homeScore !== undefined
              ? match.homeScore
              : "-"}
          </span>
        </div>

        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition ${
            awayWin
              ? "bg-lime-500/15 text-slate-950 dark:text-white font-bold"
              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: match.awayTeam.color || "#38bdf8" }}
            ></span>
            <span className="text-xs truncate font-medium" title={match.awayTeam.name}>
              {match.awayTeam.name}
            </span>
          </div>
          <span
            className={`text-xs sm:text-sm font-mono font-black shrink-0 px-1.5 py-0.5 rounded-lg ${
              awayWin
                ? "bg-lime-400/20 text-lime-600 dark:text-lime-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {match.awayScore !== null && match.awayScore !== undefined
              ? match.awayScore
              : "-"}
          </span>
        </div>
      </div>

      {/* Clean Match Stage & Quick Link Footer */}
      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-[10px] gap-2">
        <span className="text-slate-500 dark:text-slate-400 font-label uppercase tracking-wider text-[9px] font-bold truncate">
          {stageLabel || match.stage || "Etapă Oficială"}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {isAdmin && !isPlaceholder && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(match);
              }}
              className="px-2 py-0.5 rounded-lg bg-lime-400 text-slate-950 hover:bg-lime-300 font-label font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition shadow-sm active:scale-95"
              title="Panou Organizare Meci (Arbitraj, Notițe, Bilete)"
            >
              <span>⚙️</span>
              <span>Organizare</span>
            </button>
          )}

          {!isPlaceholder && (
            <span className="font-label font-bold text-lime-600 dark:text-lime-400 opacity-80 group-hover:opacity-100 flex items-center gap-0.5 text-[10px] transition transform group-hover:translate-x-0.5">
              <span>Detalii</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isPlaceholder) {
    return cardContent;
  }

  return (
    <Link href={`/matches/${match.id}/promo`} className="block group">
      {cardContent}
    </Link>
  );
}

// Helper to create placeholder match nodes when bracket is building up
function createPlaceholderMatch(index: number, title: string, subtitle?: string): MatchData {
  return {
    id: `placeholder-${index}`,
    round: index > 4 ? (index > 6 ? 3 : 2) : 1,
    stage: title,
    status: "scheduled",
    homeTeam: {
      id: `p-home-${index}`,
      name: subtitle ? subtitle.split("vs")[0]?.trim() || "Echipă A" : "Se stabilește...",
      color: "#94a3b8",
    },
    awayTeam: {
      id: `p-away-${index}`,
      name: subtitle ? subtitle.split("vs")[1]?.trim() || "Echipă B" : "Se stabilește...",
      color: "#64748b",
    },
    homeScore: null,
    awayScore: null,
    venue: "Stadion Principal",
  };
}
