"use client";

import React, { useState } from "react";
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
  const [copiedEmbed, setCopiedEmbed] = useState(false);

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

  // Get public URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "https://sp.buu.ro";
  const publicShareUrl = championshipId
    ? `${origin}/harta-campionat?id=${championshipId}`
    : `${origin}/harta-campionat?code=${currentShareCode}`;

  const embedCode = `<iframe src="${publicShareUrl}" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`;

  function copyToClipboard(text: string, type: "link" | "code" | "embed") {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } else if (type === "embed") {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    }
  }

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 lg:p-10 shadow-2xl overflow-x-auto relative border border-slate-800 font-body">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
            🗺️
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black italic font-headline text-white tracking-tight uppercase">
                Harta Oficială a Turneului (Brackets)
              </h2>
              {published ? (
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-[10px] font-black font-label uppercase border border-lime-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                  Public ✓
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black font-label uppercase border border-amber-400/30">
                  🔒 Ciornă Privată
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[10px] font-black font-label border border-slate-700">
                #{currentShareCode}
              </span>
            </div>
            <p className="text-xs font-label text-slate-400 mt-0.5">
              Fiecare campionat are o hartă unică generată prin zaruri • Distribuire în timp real
            </p>
          </div>
        </div>

        {/* Share & Admin Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">share</span>
            Distribuie Harta
          </button>

          {isAdmin && championshipId && (
            <button
              type="button"
              onClick={togglePublish}
              disabled={loadingPublish}
              className={`px-4 py-2.5 rounded-2xl text-xs font-label font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md border ${
                published
                  ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
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
                : "Fă Harta Publică 🚀"}
            </button>
          )}
        </div>
      </div>

      {/* Mind Map Connection Lines & Bracket Columns Grid */}
      <div className="relative min-w-[900px] z-10 py-6">
        <div className="grid grid-cols-3 gap-8 relative">
          {/* Column 1: Sferturi de Finală */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="font-headline font-bold text-sm tracking-wider uppercase text-slate-300">
                Sferturi de Finală (Etapa 1)
              </h3>
            </div>

            <div className="space-y-6">
              {displayQuarters.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400 italic">
                  Meciurile de sferturi nu au fost încă trase la sorți.
                </div>
              ) : (
                displayQuarters.map((m) => (
                  <BracketMatchNode
                    key={m.id}
                    match={m}
                    onEdit={() => onEditMatch && onEditMatch(m)}
                    canEdit={isAdmin}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: Semifinale */}
          <div className="space-y-6 flex flex-col justify-around">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h3 className="font-headline font-bold text-sm tracking-wider uppercase text-slate-300">
                  Semifinale (Etapa 2)
                </h3>
              </div>

              <div className="space-y-16 my-auto">
                {displaySemis.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400 italic">
                    Câștigătoarele din sferturi se califică automat aici.
                  </div>
                ) : (
                  displaySemis.map((m) => (
                    <BracketMatchNode
                      key={m.id}
                      match={m}
                      onEdit={() => onEditMatch && onEditMatch(m)}
                      canEdit={isAdmin}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Marea Finală */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="my-auto">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-lime-400/30">
                <span className="w-3 h-3 rounded-full bg-lime-400 animate-pulse"></span>
                <h3 className="font-headline font-black text-sm tracking-wider uppercase text-lime-400 flex items-center gap-1.5">
                  🏆 Marea Finală a Campionatului
                </h3>
              </div>

              {displayFinal ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 to-amber-400 rounded-3xl blur opacity-30 animate-pulse"></div>
                  <BracketMatchNode
                    match={displayFinal}
                    isFinal={true}
                    onEdit={() => onEditMatch && onEditMatch(displayFinal)}
                    canEdit={isAdmin}
                  />
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-lime-400/20 text-center space-y-2">
                  <div className="text-4xl">👑</div>
                  <h4 className="font-headline font-bold text-white text-sm">
                    Trofeul Ligue Pro 2026
                  </h4>
                  <p className="text-xs text-slate-400 font-label">
                    Învingătoarele din semifinale vor disputa marea finală pentru titlul de campioană.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SHARE CHAMPIONSHIP MAP MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-lime-400/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  DISTRIBUIRE HARTĂ CAMPIONAT
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-headline uppercase text-white mt-1">
                  {championshipName || "Harta Oficială a Turneului"}
                </h3>
                <p className="text-xs text-slate-400 font-label">
                  Cod Unic Public: <strong className="text-lime-400 font-mono">#{currentShareCode}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Public Link Input & Copy */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-label text-slate-300 uppercase block">
                Link Unic Public de Vizualizare
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicShareUrl}
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-lime-400 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(publicShareUrl, "link")}
                  className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shrink-0"
                >
                  {copiedLink ? "Copiat! ✓" : "Copiază"}
                </button>
              </div>
            </div>

            {/* Share Code Copy */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-label font-bold text-slate-400 uppercase block">
                  Cod Unic pentru Căutare Rapidă
                </span>
                <span className="text-xl font-black font-mono text-white">
                  {currentShareCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(currentShareCode, "code")}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase transition border border-slate-700"
              >
                {copiedCode ? "Copiat! ✓" : "Copiază Cod"}
              </button>
            </div>

            {/* Instant Actions (WhatsApp, Embed) */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 Urmărește Harta Live și Meciurile din ${championshipName || "Ligue Pro"}: ${publicShareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-label font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
              >
                <span>💬</span> Trimite pe WhatsApp
              </a>

              <button
                type="button"
                onClick={() => copyToClipboard(embedCode, "embed")}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">code</span>
                {copiedEmbed ? "Cod iFrame Copiat! ✓" : "Cod Încorporare iFrame"}
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400 font-label">
              <span>Status hartă: <strong className={published ? "text-lime-400" : "text-amber-400"}>{published ? "Publică pentru toată lumea" : "Privată"}</strong></span>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BracketMatchNode({
  match,
  isFinal = false,
  onEdit,
  canEdit = false,
}: {
  match: MatchData;
  isFinal?: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
}) {
  const isFinished = match.status === "finished";
  const homeWinner = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWinner = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div
      className={`card relative p-4 rounded-2xl border transition-all duration-300 ${
        isFinal
          ? "bg-slate-900 border-lime-400/80 shadow-2xl"
          : "bg-slate-900/90 border-slate-800 hover:border-lime-400/50 shadow-md"
      }`}
    >
      {/* Node Header */}
      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5 text-[10px] font-label text-slate-400 uppercase">
        <span className="font-bold text-slate-300">
          {match.venue || "Stadion Oficial"}
        </span>
        <span className="px-2 py-0.5 rounded bg-white/5 font-bold text-lime-400">
          {match.status === "finished" ? "Finalizat ✓" : match.status === "live" ? "🔴 Live" : "Programat"}
        </span>
      </div>

      {/* Match Competitors */}
      <div className="space-y-1.5">
        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition ${
            homeWinner
              ? "bg-lime-400/20 text-lime-300 font-black border border-lime-400/40"
              : "bg-slate-950/60 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: match.homeTeam.color || "#84cc16" }}
            ></span>
            <span className="text-xs font-headline font-bold truncate">
              {match.homeTeam.name}
            </span>
          </div>
          <span className="text-sm font-black font-headline data-font px-1.5">
            {match.homeScore ?? "—"}
          </span>
        </div>

        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl transition ${
            awayWinner
              ? "bg-lime-400/20 text-lime-300 font-black border border-lime-400/40"
              : "bg-slate-950/60 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: match.awayTeam.color || "#38bdf8" }}
            ></span>
            <span className="text-xs font-headline font-bold truncate">
              {match.awayTeam.name}
            </span>
          </div>
          <span className="text-sm font-black font-headline data-font px-1.5">
            {match.awayScore ?? "—"}
          </span>
        </div>
      </div>

      {/* Node Actions */}
      {canEdit && (
        <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="text-[10px] font-label font-bold text-lime-400 hover:underline uppercase flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">edit</span>
            Editează Rezultat
          </button>
        </div>
      )}
    </div>
  );
}
