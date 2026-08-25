"use client";

import React, { useState } from "react";
import { MatchData } from "./MatchCard";

interface BracketVisualizerProps {
  matches: MatchData[];
  championshipId?: string;
  isPublished?: boolean;
  onEditMatch?: (match: MatchData) => void;
  isAdmin?: boolean;
  onVisibilityChanged?: () => void;
}

export function BracketVisualizer({
  matches,
  championshipId,
  isPublished = true,
  onEditMatch,
  isAdmin = false,
  onVisibilityChanged,
}: BracketVisualizerProps) {
  const [published, setPublished] = useState(isPublished);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [copied, setCopied] = useState(false);

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
        if (onVisibilityChanged) onVisibilityChanged();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPublish(false);
    }
  }

  function copyPublicLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/#harta-campionat`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-primary text-white rounded-3xl p-6 lg:p-10 shadow-2xl overflow-x-auto relative border border-slate-800">
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black italic font-headline text-white tracking-tight uppercase">
                Harta Campionatului &amp; Brackets Live
              </h2>
              {published ? (
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-[10px] font-black font-label uppercase border border-lime-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                  Public
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black font-label uppercase border border-amber-400/30">
                  🔒 Ciornă Privată
                </span>
              )}
            </div>
            <p className="text-xs font-label text-slate-400 mt-0.5">
              Generată automat prin algoritmul de zaruri • Arbore eliminatoriu direct
            </p>
          </div>
        </div>

        {/* Visibility Actions (Organizer only) */}
        {isAdmin && championshipId && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyPublicLink}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-label font-bold text-white transition flex items-center gap-1.5 border border-white/10"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              {copied ? "Link Copiat! ✓" : "Distribuie Hartă"}
            </button>

            <button
              type="button"
              onClick={togglePublish}
              disabled={loadingPublish}
              className={`px-4 py-2 rounded-xl text-xs font-label font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md ${
                published
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-lime-400 hover:bg-lime-500 text-slate-950 font-black"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {published ? "visibility_off" : "public"}
              </span>
              {loadingPublish
                ? "Se actualizează..."
                : published
                ? "Treci pe Mod Privat"
                : "Publică Harta Live 🚀"}
            </button>
          </div>
        )}
      </div>

      {/* Mind Map Connection Lines & Bracket Columns Grid */}
      <div className="min-w-[820px] grid grid-cols-3 gap-8 relative z-10">
        {/* Column 1: Sferturi de Finala (4 Meciuri) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-xs font-label font-black text-lime-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400"></span>
              Sferturi de Finală
            </span>
            <span className="text-[10px] text-slate-400 font-label uppercase font-bold">Runda 1</span>
          </div>

          <div className="space-y-4">
            {displayQuarters.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/15 text-center space-y-2">
                <span className="text-3xl block">🎲</span>
                <p className="text-xs font-bold text-slate-300 font-headline">
                  Harta este în așteptare
                </p>
                <p className="text-[11px] text-slate-400 font-body">
                  Aruncă zarurile din consolă pentru a distribui echipele în arborele de joc.
                </p>
              </div>
            ) : (
              displayQuarters.map((m, idx) => (
                <BracketMatchNode
                  key={m.id}
                  match={m}
                  label={`Sfert #${idx + 1}`}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(m) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Semifinale (2 Meciuri) */}
        <div className="space-y-6 flex flex-col justify-around">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-xs font-label font-black text-lime-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400"></span>
              Semifinale
            </span>
            <span className="text-[10px] text-slate-400 font-label uppercase font-bold">Runda 2</span>
          </div>

          <div className="space-y-8">
            {displaySemis.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/15 text-center space-y-2">
                <span className="text-3xl block">⚡</span>
                <p className="text-xs font-bold text-slate-300 font-headline">
                  În așteptarea rezultatelor
                </p>
                <p className="text-[11px] text-slate-400 font-body">
                  Echipele învingătoare din sferturi avansează aici automat.
                </p>
              </div>
            ) : (
              displaySemis.map((m, idx) => (
                <BracketMatchNode
                  key={m.id}
                  match={m}
                  label={`Semifinala ${idx + 1}`}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(m) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Marea Finala (1 Meci) & Trofeu */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-xs font-label font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              🏆 Marea Finală
            </span>
            <span className="text-[10px] text-slate-400 font-label uppercase font-bold">Ultimul Act</span>
          </div>

          <div>
            {displayFinal ? (
              <div className="border-2 border-amber-400/80 rounded-3xl p-1 bg-amber-400/10 shadow-2xl">
                <BracketMatchNode
                  match={displayFinal}
                  label="FINALĂ DE CAMPIONAT"
                  isGrandFinal={true}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(displayFinal) : undefined}
                />
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-white/5 border-2 border-dashed border-amber-400/40 text-center space-y-3 shadow-inner">
                <span className="text-5xl block animate-bounce">🏆</span>
                <p className="font-extrabold text-base text-white font-headline">Trofeul Ligue Pro</p>
                <p className="text-xs text-slate-400 font-body">
                  Cele mai bune două echipe din semifinale vor disputa marea finală pe stadionul oficial!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatchNode({
  match,
  label,
  isGrandFinal = false,
  onEdit,
}: {
  match: MatchData;
  label: string;
  isGrandFinal?: boolean;
  onEdit?: () => void;
}) {
  const isFinished = match.status === "finished";
  const homeWon = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div
      onClick={onEdit}
      className={`rounded-2xl p-4 bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 ${
        onEdit ? "cursor-pointer group hover:border-lime-400/60 shadow-lg" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2.5">
        <span
          className={`text-[9px] font-label font-black uppercase tracking-widest ${
            isGrandFinal ? "text-amber-400" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        {match.venue && (
          <span className="text-[9px] font-label text-slate-400 truncate max-w-[130px] flex items-center gap-1">
            <span className="material-symbols-outlined text-[11px]">location_on</span>
            {match.venue}
          </span>
        )}
      </div>

      {/* Home team node */}
      <div
        className={`flex justify-between items-center p-2.5 rounded-xl transition ${
          homeWon
            ? "bg-lime-400/20 text-lime-300 font-bold border border-lime-400/30"
            : "text-white bg-black/20"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] text-white shrink-0"
            style={{ backgroundColor: match.homeTeam.color || "#1e293b" }}
          >
            {match.homeTeam.shortName || match.homeTeam.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs truncate font-headline">{match.homeTeam.name}</span>
        </div>
        <span className="text-sm font-black data-font ml-2">
          {match.homeScore != null ? match.homeScore : "—"}
        </span>
      </div>

      {/* Away team node */}
      <div
        className={`flex justify-between items-center p-2.5 rounded-xl mt-1.5 transition ${
          awayWon
            ? "bg-lime-400/20 text-lime-300 font-bold border border-lime-400/30"
            : "text-white bg-black/20"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] text-white shrink-0"
            style={{ backgroundColor: match.awayTeam.color || "#047857" }}
          >
            {match.awayTeam.shortName || match.awayTeam.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs truncate font-headline">{match.awayTeam.name}</span>
        </div>
        <span className="text-sm font-black data-font ml-2">
          {match.awayScore != null ? match.awayScore : "—"}
        </span>
      </div>

      {/* Referee footer info */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
        <span className="truncate">
          {match.referee ? `Arbitru: ${match.referee}` : "Fără arbitru delegat"}
        </span>
        {onEdit && (
          <span className="font-bold text-lime-400 opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
            Scor ✏️
          </span>
        )}
      </div>
    </div>
  );
}
