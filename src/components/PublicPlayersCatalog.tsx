"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSportContext } from "@/context/SportContext";

interface PlayerItem {
  id: string;
  name: string;
  number?: number | null;
  position?: string | null;
  goals?: number;
  matchesCount?: number;
  assists?: number;
  rating?: number;
  image?: string | null;
  team: {
    id: string;
    name: string;
    shortName?: string | null;
    color?: string | null;
  };
}

// Generate realistic attributes based on position & rating
function getFUTAttributes(position: string | null | undefined, rating: number = 8.5, goals: number = 10) {
  const base = Math.min(96, Math.max(75, Math.round(rating * 10)));
  const isAttacker = !position || position.includes("Atacant") || position.includes("Extremă") || position.includes("Ofensiv");
  const isMidfielder = position?.includes("Mijlocaș") || position?.includes("Central");
  const isDefender = position?.includes("Fundaș");

  return {
    pac: Math.min(98, base + (isAttacker ? 4 : isDefender ? -3 : 1)),
    sho: Math.min(99, base + (isAttacker ? Math.min(6, Math.round(goals / 3)) : isDefender ? -15 : 2)),
    pas: Math.min(95, base + (isMidfielder ? 5 : isAttacker ? 1 : -6)),
    dri: Math.min(97, base + (isAttacker ? 3 : isMidfielder ? 4 : -8)),
    def: Math.min(94, isDefender ? base + 6 : isMidfielder ? base - 8 : 42),
    phy: Math.min(95, base + (isDefender ? 5 : 0)),
    futRating: Math.min(95, Math.max(82, base + (goals > 12 ? 3 : 0))),
    positionShort: isDefender ? "CB" : isMidfielder ? "CAM" : "ST",
  };
}

export function PublicPlayersCatalog({ initialPlayers }: { initialPlayers: PlayerItem[] }) {
  const { selectedSport, currentSportMeta } = useSportContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");

  // Sort by goals descending for the top scorers ranking
  const sortedPlayers = [...initialPlayers].sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const filtered = sortedPlayers.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.team.name.toLowerCase().includes(q) ||
      (p.position && p.position.toLowerCase().includes(q));

    const matchesPos =
      selectedPosition === "all" ||
      (p.position && p.position.toLowerCase().includes(selectedPosition.toLowerCase()));

    return matchesSearch && matchesPos;
  });

  return (
    <div className="space-y-10 font-body">
      {/*  -Inspired Hero Header with B&W Legendary Player Shadow Background */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-12 border border-amber-400/30 shadow-2xl">
        {/* Black and White Legendary Player Shadow Background with high transparency */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity filter contrast-125"
          style={{ backgroundImage: "url('/images/legend-player-shadow-bw.jpg')" }}
        ></div>

        {/* Stadium Glow & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-lg flex items-center gap-1.5">
              <span>⭐</span> EA FC /   ULTIMATE EDITION
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase font-label">
              Top 10 Golgheteri • Liga Pro
            </span>
            <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-bold text-[10px] uppercase font-label border border-lime-400/30">
              🇷🇴 Sezonul de Aur 2025-2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-md">
            Golgheteri &amp; Legende ale Terenului
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
            Carduri profesionale de performanță atletică inspirate din cele mai mari meciuri mondiale. Caută fotbalistul favorit, verifică atributele tehnice (PAC, SHO, PAS, DRI) și numărul de goluri înscrise.
          </p>

          {/* Search & Filters */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Caută fotbalist sau club sportiv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center hover:bg-slate-700 transition"
                  title="Șterge căutarea"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Position filter - Smooth Touch Carousel on Mobile */}
            <div
              className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain shrink-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { id: "all", label: "Toate" },
                { id: "Atacant", label: "Atacanți" },
                { id: "Mijlocaș", label: "Mijlocași" },
                { id: "Fundaș", label: "Fundași" },
                { id: "Portar", label: "Portari" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setSelectedPosition(pos.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition shrink-0 whitespace-nowrap active:scale-95 ${selectedPosition === pos.id
                      ? "bg-amber-400 text-slate-950 font-black shadow-md scale-105"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*   Ultimate Team Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest rounded-3xl border border-slate-200/60 dark:border-slate-800">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">
            sports_soccer
          </span>
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Niciun jucător găsit pentru &quot;{searchQuery}&quot;.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Resetează căutarea pentru a vedea toți cei 10 golgheteri  i.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filtered.map((player, idx) => {
            const fut = getFUTAttributes(player.position, player.rating || 8.8, player.goals || 10);
            const isTop3 = idx < 3;

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="group relative rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between"
              >
                {/*   Ultimate Card Frame */}
                <div
                  className={`relative rounded-3xl overflow-hidden p-1 border shadow-xl flex flex-col justify-between h-full ${idx === 0
                    ? "bg-gradient-to-b from-amber-300 via-amber-600 to-slate-950 border-amber-300/80 shadow-amber-500/20"
                    : idx === 1
                      ? "bg-gradient-to-b from-slate-200 via-slate-500 to-slate-950 border-slate-300/80 shadow-slate-400/20"
                      : idx === 2
                        ? "bg-gradient-to-b from-amber-600 via-amber-900 to-slate-950 border-amber-600/80 shadow-amber-700/20"
                        : "bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 border-slate-700/80 shadow-slate-900/40"
                    }`}
                >
                  <div className="bg-slate-950/95 rounded-[22px] p-5 flex flex-col justify-between h-full relative overflow-hidden">
                    {/* Carbon Fiber / FUT Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                    {/* Top FUT Telemetry Bar: Rating, Position, Flag, Club */}
                    <div className="relative z-10 flex justify-between items-start">
                      {/* Left: Overall Rating & Position */}
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-3xl sm:text-4xl font-black font-headline tracking-tighter leading-none ${idx === 0
                            ? "text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]"
                            : "text-white"
                            }`}
                        >
                          {fut.futRating}
                        </span>
                        <span className="text-xs font-black font-headline uppercase text-amber-400 tracking-wider">
                          {fut.positionShort}
                        </span>
                        <div className="w-5 h-3.5 rounded-sm overflow-hidden mt-1 border border-white/20 shadow-sm" title="România">
                          <div className="w-full h-full flex">
                            <span className="w-1/3 h-full bg-blue-600"></span>
                            <span className="w-1/3 h-full bg-yellow-400"></span>
                            <span className="w-1/3 h-full bg-red-600"></span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-label font-bold mt-1">
                          #{player.number || 10}
                        </span>
                      </div>

                      {/* Right: Golden Boot Rank Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-label shadow-md ${idx === 0
                            ? "bg-amber-400 text-slate-950 font-extrabold animate-pulse"
                            : idx === 1
                              ? "bg-slate-200 text-slate-950"
                              : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-slate-800 text-slate-300"
                            }`}
                        >
                          {idx === 0 ? "👑 Top 1" : `#${idx + 1} Sezon`}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase font-label text-white shadow-sm"
                          style={{ backgroundColor: player.team?.color || "#1e293b" }}
                        >
                          {player.team?.shortName || player.team?.name.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Player Headshot & Shadow */}
                    <div className="relative my-2 py-2 flex justify-center items-center">
                      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-amber-400/40 relative shadow-2xl bg-gradient-to-t from-slate-900 to-slate-800 group-hover:scale-105 transition-transform duration-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            player.image ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                          }
                          alt={player.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    {/* Name & Team */}
                    <div className="text-center relative z-10 pt-1">
                      <h3 className="font-headline font-black text-lg text-white uppercase tracking-tight truncate leading-tight group-hover:text-amber-400 transition-colors">
                        {player.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-label truncate mt-0.5">
                        {player.team?.name}
                      </p>
                    </div>

                    {/* Goals Ribbon */}
                    <div className="my-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400/20 via-lime-400/20 to-amber-400/20 border border-amber-400/40 flex justify-between items-center text-xs font-label">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <span>⚽</span> {player.goals || 0} GOLURI
                      </span>
                      <span className="font-bold text-lime-400">
                        ⭐ {player.rating || 8.8} RATING
                      </span>
                    </div>

                    {/* FUT 6-Attributes Grid */}
                    <div className="grid grid-cols-6 gap-1 pt-2 border-t border-slate-800/80 text-center font-headline">
                      <div>
                        <span className="text-xs font-black text-white block">{fut.pac}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">PAC</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-400 block">{fut.sho}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">SHO</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{fut.pas}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">PAS</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{fut.dri}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">DRI</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-300 block">{fut.def}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">DEF</span>
                      </div>
                      <div>
                        <span className="text-xs font-black text-lime-400 block">{fut.phy}</span>
                        <span className="text-[9px] font-bold text-slate-400 block">PHY</span>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="mt-3 pt-2 text-center">
                      <span className="text-[10px] font-label font-bold uppercase tracking-wider text-amber-400 group-hover:underline flex items-center justify-center gap-1">
                        Vezi Fișa  ă   ↗
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
