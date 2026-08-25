"use client";

import React from "react";
import { MatchData } from "./MatchCard";

interface BracketVisualizerProps {
  matches: MatchData[];
  onEditMatch?: (match: MatchData) => void;
  isAdmin?: boolean;
}

export function BracketVisualizer({
  matches,
  onEditMatch,
  isAdmin = false,
}: BracketVisualizerProps) {
  // Separate matches by stage or round
  const quarterFinals = matches.filter(
    (m) => m.round === 1 || (m as any).stage === "quarter_final"
  );
  const semiFinals = matches.filter(
    (m) => m.round === 2 || (m as any).stage === "semi_final"
  );
  const finals = matches.filter(
    (m) => m.round === 3 || (m as any).stage === "final"
  );

  // If no matches, display placeholder bracket preview
  const displayQuarters = quarterFinals.length > 0 ? quarterFinals : [];
  const displaySemis = semiFinals.length > 0 ? semiFinals : [];
  const displayFinal = finals.length > 0 ? finals[0] : null;

  return (
    <div className="bg-primary text-white rounded-3xl p-6 lg:p-10 shadow-2xl overflow-x-auto relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black">
            <span className="material-symbols-outlined text-2xl">account_tree</span>
          </div>
          <div>
            <h2 className="text-xl font-bold font-headline text-white">
              Arbore de Joc &amp; Brackets Eliminatorii
            </h2>
            <p className="text-xs font-label text-slate-400">
              Tragere la sorți cu zaruri • Runda eliminatorie directă
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 text-xs font-bold font-label uppercase border border-lime-400/30">
            Sistem Eliminatoriu Pro
          </span>
        </div>
      </div>

      {/* Bracket Columns Grid */}
      <div className="min-w-[760px] grid grid-cols-3 gap-8 relative z-10">
        {/* Column 1: Sferturi de Finala */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-label font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
              Sferturi de Finală
            </span>
            <span className="text-[10px] text-slate-400 font-label">Runda 1</span>
          </div>

          <div className="space-y-4">
            {displayQuarters.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                Aruncă zarurile din consolă pentru a genera meciurile din sferturi.
              </div>
            ) : (
              displayQuarters.map((m, idx) => (
                <BracketMatchCard
                  key={m.id}
                  match={m}
                  label={`Meciul #${idx + 1}`}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(m) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Semifinale */}
        <div className="space-y-6 flex flex-col justify-around">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-label font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
              Semifinale
            </span>
            <span className="text-[10px] text-slate-400 font-label">Runda 2</span>
          </div>

          <div className="space-y-8">
            {displaySemis.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                Câștigătoarele din sferturi avansează aici automat.
              </div>
            ) : (
              displaySemis.map((m, idx) => (
                <BracketMatchCard
                  key={m.id}
                  match={m}
                  label={`Semifinala ${idx + 1}`}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(m) : undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Marea Finala & Trofeu */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-label font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              🏆 Marea Finală
            </span>
            <span className="text-[10px] text-slate-400 font-label">Finala Mare</span>
          </div>

          <div>
            {displayFinal ? (
              <div className="border-2 border-amber-400/60 rounded-2xl p-1 bg-amber-400/5">
                <BracketMatchCard
                  match={displayFinal}
                  label="FINALĂ DE CAMPIONAT"
                  isGrandFinal={true}
                  onEdit={isAdmin && onEditMatch ? () => onEditMatch(displayFinal) : undefined}
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-amber-400/30 text-center space-y-3">
                <span className="text-4xl block">🏆</span>
                <p className="font-bold text-sm text-white font-headline">Marea Finală</p>
                <p className="text-xs text-slate-400">
                  Finalistele vor lupta pentru trofeul Ligue Pro!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({
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
      className={`rounded-2xl p-4 bg-white/5 hover:bg-white/10 transition-all border border-white/10 ${
        onEdit ? "cursor-pointer group hover:border-lime-400/50" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-[9px] font-label font-bold uppercase tracking-widest ${
            isGrandFinal ? "text-amber-400" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        {match.venue && (
          <span className="text-[9px] font-label text-slate-400 truncate max-w-[120px]">
            📍 {match.venue}
          </span>
        )}
      </div>

      {/* Home team */}
      <div
        className={`flex justify-between items-center p-2 rounded-xl transition ${
          homeWon ? "bg-lime-400/20 text-lime-300 font-bold" : "text-white"
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

      {/* Away team */}
      <div
        className={`flex justify-between items-center p-2 rounded-xl mt-1 transition ${
          awayWon ? "bg-lime-400/20 text-lime-300 font-bold" : "text-white"
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

      {onEdit && (
        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 group-hover:text-lime-400">
          <span>{match.referee ? `Arbitru: ${match.referee}` : "Fără arbitru alocat"}</span>
          <span className="font-bold">Scor ✏️</span>
        </div>
      )}
    </div>
  );
}
