"use client";

import React, { useState } from "react";
import Link from "next/link";

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

export function PublicPlayersCatalog({ initialPlayers }: { initialPlayers: PlayerItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Sort by goals descending for the top scorers ranking
  const sortedPlayers = [...initialPlayers].sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const filtered = sortedPlayers.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.team.name.toLowerCase().includes(q) ||
      (p.position && p.position.toLowerCase().includes(q))
    );
  });

  const RANK_BADGES: Record<number, { label: string; bg: string; text: string }> = {
    0: { label: "Golgheterul Sezonului 🏆", bg: "bg-amber-400", text: "text-slate-950" },
    1: { label: "Gheata de Argint 🥈", bg: "bg-slate-300", text: "text-slate-950" },
    2: { label: "Gheata de Bronz 🥉", bg: "bg-amber-700", text: "text-white" },
  };

  return (
    <div className="space-y-10">
      {/* Search Header Bar */}
      <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 block mb-1">
              Top 10 Golgheteri • Liga Pro România
            </span>
            <h2 className="font-headline font-black text-2xl text-blue-950 dark:text-white uppercase tracking-tight">
              Cei Mai Buni Jucători &amp; Marcatori din Sezonul Trecut
            </h2>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută fotbalist după nume sau club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input text-xs w-full pl-9"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                search
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Player Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest rounded-3xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
            directions_run
          </span>
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Nu a fost găsit niciun jucător cu numele &quot;{searchQuery}&quot;.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Încearcă să cauți după alt nume de jucător sau club.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((player, idx) => {
            const rankBadge = RANK_BADGES[idx];
            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-lime-400/50 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Visual Header */}
                  <div className="h-56 relative overflow-hidden bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        player.image ||
                        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={player.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-start">
                        {/* Rank Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 font-black font-label text-sm flex items-center justify-center shadow-md">
                            #{idx + 1}
                          </span>
                          {rankBadge && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-label shadow-sm ${rankBadge.bg} ${rankBadge.text}`}
                            >
                              {rankBadge.label}
                            </span>
                          )}
                        </div>

                        {/* Jersey Number */}
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-lime-400 text-xs font-black font-label">
                          #{player.number || 10}
                        </span>
                      </div>

                      {/* Goals Highlight Ribbon */}
                      <div className="flex justify-between items-end">
                        <div>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider font-label inline-block mb-1 shadow-sm"
                            style={{ backgroundColor: player.team?.color || "#1e293b" }}
                          >
                            {player.team?.name}
                          </span>
                          <h3 className="text-xl font-bold font-headline leading-tight text-white group-hover:text-lime-300 transition">
                            {player.name}
                          </h3>
                          <p className="text-xs text-slate-300 font-label mt-0.5">
                            {player.position || "Atacant"}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-black data-font text-lime-400 block leading-none">
                            {player.goals || 0}
                          </span>
                          <span className="text-[9px] font-label font-bold uppercase tracking-widest text-slate-300">
                            GOLURI ⚽
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Performance Telemetry */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                        <p className="text-[9px] font-label font-bold uppercase tracking-widest text-slate-400">
                          Meciuri
                        </p>
                        <p className="text-sm font-black text-blue-950 dark:text-white data-font mt-0.5">
                          {player.matchesCount || 26}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                        <p className="text-[9px] font-label font-bold uppercase tracking-widest text-slate-400">
                          Pase Gol
                        </p>
                        <p className="text-sm font-black text-blue-950 dark:text-white data-font mt-0.5">
                          {player.assists || 4}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                        <p className="text-[9px] font-label font-bold uppercase tracking-widest text-slate-400">
                          Rating
                        </p>
                        <p className="text-sm font-black text-lime-600 dark:text-lime-400 data-font mt-0.5">
                          {player.rating || 8.8} ⭐
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-label text-center">
                      Competiție: <strong className="text-slate-800 dark:text-slate-200">Liga Pro</strong>
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <span className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-700 dark:text-slate-300 font-label text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                    Vezi Profilul Jucătorului
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
