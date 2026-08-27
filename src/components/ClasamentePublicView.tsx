"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ChampionshipLogoBadge } from "./ChampionshipLogoBadge";

export interface LeagueStandingRow {
  position: number;
  teamId: string;
  teamName: string;
  shortName: string;
  color: string;
  logoUrl?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ("V" | "E" | "Î")[];
}

export interface LeagueItem {
  id: string;
  name: string;
  sport: string;
  season: string;
  scope: string;
  county?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  shareCode?: string | null;
  format: string;
  standings: LeagueStandingRow[];
  totalTeams: number;
  totalMatches: number;
}

export interface ClubStoryItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logoUrl?: string | null;
  championshipId: string;
  championshipName: string;
  county?: string | null;
  position: number;
  points: number;
  badgeTag?: string | null;
}

export interface LiveMatchCardItem {
  id: string;
  championshipId: string;
  championshipName: string;
  sport: string;
  county?: string | null;
  stage?: string | null;
  round: number;
  status: string; // "live" | "scheduled" | "finished"
  minuteOrTime: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null; logoUrl?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null; logoUrl?: string | null };
  venue?: string | null;
}

interface ClasamentePublicViewProps {
  leagues: LeagueItem[];
  clubs: ClubStoryItem[];
  liveMatches: LiveMatchCardItem[];
  initialSelectedLeagueId?: string | null;
}

const SPORTS_FILTER = [
  { id: "all", label: "Toate Sporturile", icon: "sports" },
  { id: "fotbal", label: "Fotbal", icon: "sports_soccer" },
  { id: "baschet", label: "Baschet", icon: "sports_basketball" },
  { id: "handbal", label: "Handbal", icon: "sports_handball" },
  { id: "volei", label: "Volei", icon: "sports_volleyball" },
  { id: "tenis", label: "Tenis & Padel", icon: "sports_tennis" },
];

export function ClasamentePublicView({
  leagues,
  clubs,
  liveMatches,
  initialSelectedLeagueId,
}: ClasamentePublicViewProps) {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [activeLeagueFilter, setActiveLeagueFilter] = useState<string | null>(initialSelectedLeagueId || null);

  const storiesRef = useRef<HTMLDivElement | null>(null);

  // Extract list of unique counties
  const counties = useMemo(() => {
    const set = new Set<string>();
    leagues.forEach((l) => {
      if (l.county && l.county.trim()) set.add(l.county.trim());
    });
    return Array.from(set).sort();
  }, [leagues]);

  // Filter leagues based on sport, county, search query, and active selection
  const filteredLeagues = useMemo(() => {
    return leagues.filter((league) => {
      const sportMatch =
        selectedSport === "all" ||
        league.sport.toLowerCase().includes(selectedSport.toLowerCase());

      const countyMatch =
        selectedCounty === "all" ||
        (league.county && league.county.toLowerCase() === selectedCounty.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const queryMatch =
        !query ||
        league.name.toLowerCase().includes(query) ||
        (league.county && league.county.toLowerCase().includes(query)) ||
        (league.city && league.city.toLowerCase().includes(query)) ||
        league.standings.some((t) => t.teamName.toLowerCase().includes(query));

      const clubMatch =
        !selectedClubId ||
        league.standings.some((t) => t.teamId === selectedClubId);

      const explicitLeagueMatch =
        !activeLeagueFilter || league.id === activeLeagueFilter;

      return sportMatch && countyMatch && queryMatch && clubMatch && (activeLeagueFilter ? explicitLeagueMatch : true);
    });
  }, [leagues, selectedSport, selectedCounty, searchQuery, selectedClubId, activeLeagueFilter]);

  // Filter live matches by sport
  const filteredMatches = useMemo(() => {
    return liveMatches.filter((m) => {
      if (selectedSport === "all") return true;
      return m.sport.toLowerCase().includes(selectedSport.toLowerCase());
    });
  }, [liveMatches, selectedSport]);

  function handleClubClick(club: ClubStoryItem) {
    if (selectedClubId === club.id) {
      setSelectedClubId(null);
      setActiveLeagueFilter(null);
    } else {
      setSelectedClubId(club.id);
      setActiveLeagueFilter(club.championshipId);
    }
  }

  function scrollStories(dir: "left" | "right") {
    if (!storiesRef.current) return;
    const offset = dir === "left" ? -280 : 280;
    storiesRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION: Title & Live Platform Stats */}
      {/* ========================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border-2 border-lime-400/30 shadow-2xl relative overflow-hidden space-y-6">
        {/* Subtle dynamic background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                CAMPIONATE SPORTIVE • EDIȚIA NAȚIONALĂ 2026/2027
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic font-headline uppercase tracking-tight text-white drop-shadow-md">
              Clasament
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body max-w-2xl">
              Urmărește clasamentele oficiale, punctajele în timp real, forma echipelor și rezultatele fiecărei ligi din România.
            </p>
          </div>

          {/* Quick Filters / Search in Header */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută echipă, ligă, județ..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {counties.length > 0 && (
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 font-bold uppercase font-label cursor-pointer"
              >
                <option value="all">Toate Județele</option>
                {counties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP STORY CIRCLES / CLUB BADGES CAROUSEL (Sigle de Club Rotunde) */}
        {/* ========================================================================= */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-lime-400">shield</span>
              Cluburi &amp; Echipe din Competiție:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollStories("left")}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                aria-label="Scroll stânga cluburi"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollStories("right")}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                aria-label="Scroll dreapta cluburi"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            ref={storiesRef}
            className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar scroll-smooth"
          >
            {clubs.map((club) => {
              const isSelected = selectedClubId === club.id;

              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleClubClick(club)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none transition-transform duration-200 ${
                    isSelected ? "scale-105" : "hover:scale-105"
                  }`}
                >
                  <div className="relative">
                    {/* Ring border with team color / neon pulse */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? "ring-4 ring-lime-400 ring-offset-2 ring-offset-slate-950 bg-lime-400 shadow-lg shadow-lime-400/30"
                          : "bg-gradient-to-tr from-slate-800 via-slate-700 to-lime-400/60 group-hover:bg-lime-400"
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                        {club.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={club.logoUrl}
                            alt={club.name}
                            className="max-h-full max-w-full object-contain rounded-full"
                          />
                        ) : (
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center font-headline font-black text-xs sm:text-sm text-white"
                            style={{ backgroundColor: club.color || "#1e293b" }}
                          >
                            {club.shortName || club.name.substring(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top mini badge tag */}
                    {club.badgeTag && (
                      <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-lime-400 text-slate-950 text-[8px] font-black uppercase font-label tracking-tighter shadow-md">
                        {club.badgeTag}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-headline font-bold text-slate-300 group-hover:text-white max-w-[70px] truncate block text-center leading-tight">
                    {club.shortName || club.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TOP LIVE & SPORTS SELECTOR SECTION (Inspirat din Superbet LIVE Hub) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Top Live Banner & Sport Pills */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-black uppercase font-label tracking-wider shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>TOP LIVE</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-label">
              Meciuri &amp; Rezultate în Direct
            </span>
          </div>

          {/* Sport Icon Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {SPORTS_FILTER.map((sport) => {
              const active = selectedSport === sport.id;

              return (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                    active
                      ? "bg-slate-950 text-lime-400 dark:bg-lime-400 dark:text-slate-950 shadow-md ring-2 ring-lime-400/40"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{sport.icon}</span>
                  <span>{sport.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live / Recent Match Cards Grid */}
        {filteredMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-lime-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Match Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 truncate">
                      {match.county ? `🇷🇴 ${match.county}` : "🇷🇴 Național"} • {match.championshipName}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
                      match.status === "live"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse"
                        : match.status === "finished"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        : "bg-lime-400/20 text-lime-700 dark:text-lime-400 border border-lime-400/40"
                    }`}
                  >
                    {match.minuteOrTime}
                  </span>
                </div>

                {/* Scoreboard Row */}
                <div className="grid grid-cols-3 items-center gap-2 py-1 text-center">
                  {/* Home Team */}
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black font-headline text-white shadow-sm border border-slate-200 dark:border-slate-700"
                      style={{ backgroundColor: match.homeTeam.color || "#1e293b" }}
                    >
                      {match.homeTeam.shortName || match.homeTeam.name.substring(0, 3)}
                    </div>
                    <span className="text-xs font-headline font-bold text-slate-900 dark:text-white line-clamp-1">
                      {match.homeTeam.name}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono font-black text-lg sm:text-xl text-slate-900 dark:text-lime-400 border border-slate-200 dark:border-slate-800">
                      {match.homeScore !== null ? match.homeScore : 0} - {match.awayScore !== null ? match.awayScore : 0}
                    </div>
                    <span className="text-[9px] font-label font-bold uppercase text-slate-400 mt-1">
                      {match.stage || `Etapa ${match.round}`}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black font-headline text-white shadow-sm border border-slate-200 dark:border-slate-700"
                      style={{ backgroundColor: match.awayTeam.color || "#1e293b" }}
                    >
                      {match.awayTeam.shortName || match.awayTeam.name.substring(0, 3)}
                    </div>
                    <span className="text-xs font-headline font-bold text-slate-900 dark:text-white line-clamp-1">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-label">
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    <span className="material-symbols-outlined text-xs align-middle mr-1">stadium</span>
                    {match.venue || "Teren Oficial"}
                  </span>

                  <Link
                    href={`/matches`}
                    className="font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-0.5"
                  >
                    Detalii Meci →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. CHAMPIONSHIP STANDINGS TABLES (Tabele cu fiecare Ligă / Campionat) */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic font-headline uppercase text-slate-900 dark:text-white">
              Tabele Clasament pe Competiții
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
              {filteredLeagues.length} {filteredLeagues.length === 1 ? "campionat afișat" : "campionate afișate"}
            </p>
          </div>

          {(activeLeagueFilter || selectedClubId) && (
            <button
              type="button"
              onClick={() => {
                setActiveLeagueFilter(null);
                setSelectedClubId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-headline font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Afișează Toate Competițiile</span>
            </button>
          )}
        </div>

        {filteredLeagues.length === 0 ? (
          <div className="card p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white uppercase">
              Niciun campionat găsit pentru filtrele selectate
            </h3>
            <p className="text-xs text-slate-500 font-body">
              Încearcă să resetezi căutarea sau să selectezi un alt județ/sport.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSport("all");
                setSelectedCounty("all");
                setSearchQuery("");
                setSelectedClubId(null);
                setActiveLeagueFilter(null);
              }}
              className="btn btn-primary text-xs py-2 px-4 rounded-xl font-bold uppercase tracking-wider inline-block mt-2"
            >
              Resetează Toate Filtrele
            </button>
          </div>
        ) : (
          filteredLeagues.map((league) => (
            <div
              key={league.id}
              className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-0"
            >
              {/* League Card Header Banner */}
              <div className="p-5 sm:p-6 bg-slate-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
                <Link
                  href={`/brackets?id=${league.id}`}
                  className="flex items-center gap-3.5 min-w-0 group hover:opacity-90 transition"
                  title={`Deschide tabloul eliminatoriu pentru ${league.name}`}
                >
                  <ChampionshipLogoBadge name={league.name} logoUrl={league.logoUrl} size="md" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {league.county && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono uppercase">
                          🇷🇴 Jud. {league.county}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30 text-[10px] font-bold font-label uppercase">
                        {league.sport || "Fotbal"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        Sezon {league.season || "2026"}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black italic font-headline uppercase text-white truncate group-hover:text-lime-400 transition-colors">
                      {league.name}
                    </h3>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/brackets?id=${league.id}`}
                    className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Tablou Eliminatoriu</span>
                    <span className="material-symbols-outlined text-sm">account_tree</span>
                  </Link>
                </div>
              </div>

              {/* Standings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-400 uppercase font-label font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 pl-4 sm:pl-6 pr-2 w-12 text-center">#</th>
                      <th className="py-3.5 px-3 min-w-[200px]">Echipă</th>
                      <th className="py-3.5 px-2.5 text-center font-bold">M</th>
                      <th className="py-3.5 px-2.5 text-center font-bold text-emerald-700 dark:text-emerald-400">V</th>
                      <th className="py-3.5 px-2.5 text-center font-bold text-amber-700 dark:text-amber-400">E</th>
                      <th className="py-3.5 px-2.5 text-center font-bold text-red-700 dark:text-red-400">Î</th>
                      <th className="py-3.5 px-3 text-center hidden sm:table-cell">GM-GP</th>
                      <th className="py-3.5 px-3 text-center font-bold">+/-</th>
                      <th className="py-3.5 px-4 text-center font-headline font-black text-slate-900 dark:text-lime-400 text-sm bg-lime-400/5">
                        PCT
                      </th>
                      <th className="py-3.5 px-4 text-center hidden md:table-cell">Formă</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {league.standings.map((row) => {
                      const isHighlighted = selectedClubId === row.teamId;
                      const isTop1 = row.position === 1;
                      const isTop3 = row.position <= 3;
                      const isRelegation = row.position >= Math.max(league.standings.length - 1, 4);

                      return (
                        <tr
                          key={row.teamId}
                          className={`transition-colors duration-150 ${
                            isHighlighted
                              ? "bg-lime-400/15 dark:bg-lime-400/20 font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {/* Rank / Position */}
                          <td className="py-3.5 pl-4 sm:pl-6 pr-2 text-center">
                            <span
                              className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-headline font-black ${
                                isTop1
                                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-300"
                                  : row.position === 2
                                  ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white"
                                  : row.position === 3
                                  ? "bg-amber-700/80 text-white"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {row.position}
                            </span>
                          </td>

                          {/* Team Details */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black font-headline text-white shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: row.color || "#1e293b" }}
                              >
                                {row.logoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={row.logoUrl}
                                    alt={row.teamName}
                                    className="max-h-full max-w-full object-contain rounded-full"
                                  />
                                ) : (
                                  row.shortName || row.teamName.substring(0, 2)
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-headline font-bold text-slate-900 dark:text-white text-xs sm:text-sm block truncate">
                                  {row.teamName}
                                </span>
                                {row.shortName && (
                                  <span className="text-[10px] font-mono text-slate-400 block sm:hidden">
                                    {row.shortName}
                                  </span>
                                )}
                              </div>
                              {isTop1 && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold font-label uppercase">
                                  Lider
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stats */}
                          <td className="py-3.5 px-2.5 text-center font-bold text-slate-900 dark:text-white">
                            {row.played}
                          </td>
                          <td className="py-3.5 px-2.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                            {row.won}
                          </td>
                          <td className="py-3.5 px-2.5 text-center text-amber-600 dark:text-amber-400">
                            {row.drawn}
                          </td>
                          <td className="py-3.5 px-2.5 text-center text-red-600 dark:text-red-400">
                            {row.lost}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                            {row.goalsFor} : {row.goalsAgainst}
                          </td>
                          <td
                            className={`py-3.5 px-3 text-center font-mono font-bold ${
                              row.goalDiff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : row.goalDiff < 0
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          >
                            {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                          </td>

                          {/* Points */}
                          <td className="py-3.5 px-4 text-center font-headline font-black text-sm sm:text-base text-slate-950 dark:text-lime-400 bg-lime-400/5">
                            {row.points}
                          </td>

                          {/* Form Pills */}
                          <td className="py-3.5 px-4 text-center hidden md:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              {row.form.length === 0 ? (
                                <span className="text-[10px] text-slate-400">-</span>
                              ) : (
                                row.form.map((res, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-black font-label ${
                                      res === "V"
                                        ? "bg-emerald-500 text-white"
                                        : res === "E"
                                        ? "bg-amber-500 text-slate-950"
                                        : "bg-red-500 text-white"
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Standings Card Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-label text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Locul 1 • Campioană</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Locurile 2-3 • Playoff</span>
                  </div>
                </div>

                <span>
                  {league.totalTeams} Echipe înscrise • {league.totalMatches} Meciuri programate
                </span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
