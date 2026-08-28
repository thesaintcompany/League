"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { getContrastTextColor } from "@/lib/utils";

/* ── Sport metadata (mirror of SportContext, inlined to avoid provider dependency) ── */
const SPORT_META: Record<string, { icon: string; accent: string; badgeBg: string; label: string }> = {
  fotbal:   { icon: "sports_soccer",     accent: "text-lime-400",    badgeBg: "bg-lime-400 text-slate-950",    label: "Fotbal" },
  futsal:   { icon: "sports_soccer",     accent: "text-indigo-400",  badgeBg: "bg-indigo-400 text-slate-950",  label: "Futsal" },
  tenis:    { icon: "sports_tennis",     accent: "text-emerald-400", badgeBg: "bg-emerald-400 text-slate-950", label: "Tenis" },
  padel:    { icon: "sports_tennis",     accent: "text-teal-400",    badgeBg: "bg-teal-400 text-slate-950",    label: "Padel" },
  pingpong: { icon: "circle",            accent: "text-rose-400",    badgeBg: "bg-rose-400 text-slate-950",    label: "Ping-Pong" },
  baschet:  { icon: "sports_basketball", accent: "text-amber-400",   badgeBg: "bg-amber-400 text-slate-950",   label: "Baschet" },
  volei:    { icon: "sports_volleyball", accent: "text-cyan-400",    badgeBg: "bg-cyan-400 text-slate-950",    label: "Volei" },
  handbal:  { icon: "sports_handball",   accent: "text-purple-400",  badgeBg: "bg-purple-400 text-slate-950",  label: "Handbal" },
};

const SPORT_GRADIENT: Record<string, string> = {
  fotbal:   "from-lime-500 to-emerald-600",
  futsal:   "from-indigo-500 to-violet-600",
  tenis:    "from-emerald-500 to-teal-600",
  padel:    "from-teal-500 to-cyan-600",
  pingpong: "from-rose-500 to-pink-600",
  baschet:  "from-amber-500 to-orange-600",
  volei:    "from-cyan-500 to-blue-600",
  handbal:  "from-purple-500 to-fuchsia-600",
};

const SCOPE_LABELS: Record<string, string> = {
  national: "National",
  judetean: "Judetean",
  oras: "Orasenesc",
};

export interface ChampionshipCard {
  id: string;
  name: string;
  sport: string;
  scope: string;
  county?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  season?: string | null;
  format?: string | null;
  teamsCount: number;
  matchesCount: number;
  finishedCount: number;
}

export interface TopTeamItem {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
  logoUrl?: string;
  championshipName: string;
  sport: string;
  matchCount: number;
}

export interface LiveMatchItem {
  id: string;
  homeTeam: { id: string; name: string; shortName?: string; color?: string; logoUrl?: string };
  awayTeam: { id: string; name: string; shortName?: string; color?: string; logoUrl?: string };
  homeScore: number;
  awayScore: number;
  stage: string;
  venue?: string;
  championshipName: string;
  sport: string;
  scheduledAt?: string;
}

interface ClasamenteListingViewProps {
  championships: ChampionshipCard[];
  topTeams?: TopTeamItem[];
  liveMatches?: LiveMatchItem[];
}

export function ClasamenteListingView({ championships, topTeams = [], liveMatches = [] }: ClasamenteListingViewProps) {
  const [activeSport, setActiveSport] = useState<string>("toate");
  const [searchQuery, setSearchQuery] = useState("");
  const pillsRef = useRef<HTMLDivElement>(null);

  /* Derive unique sports from data */
  const availableSports = useMemo(() => {
    const s = new Set<string>();
    championships.forEach((c) => { if (c.sport) s.add(c.sport.toLowerCase()); });
    return Array.from(s);
  }, [championships]);

  /* Filter championships */
  const filtered = useMemo(() => {
    return championships.filter((c) => {
      const sportOk = activeSport === "toate" || (c.sport || "").toLowerCase() === activeSport;
      const searchOk =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.county || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || "").toLowerCase().includes(searchQuery.toLowerCase());
      return sportOk && searchOk;
    });
  }, [championships, activeSport, searchQuery]);

  /* Pill scroll with drag */
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  function handleMouseDown(e: React.MouseEvent) {
    if (!pillsRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - pillsRef.current.offsetLeft);
    setScrollLeft(pillsRef.current.scrollLeft);
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !pillsRef.current) return;
    e.preventDefault();
    const x = e.pageX - pillsRef.current.offsetLeft;
    pillsRef.current.scrollLeft = scrollLeft - (x - startX);
  }
  function handleMouseUp() { setIsDragging(false); }

  /* Stagger animation */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO SECTION — Dark gradient header with branding
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl">
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-lime-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
          {/* Top row: badge + season */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-7 bg-red-500 rounded-full" />
                <span className="text-[11px] font-headline font-black uppercase tracking-[0.2em] text-red-400">
                  Pro Ligue Romania
                </span>
                <span className="ml-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold uppercase border border-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  Sezon Activ
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-headline font-black uppercase text-white tracking-tight leading-none">
                Clasamente
              </h1>
              <p className="text-sm text-slate-400 max-w-lg">
                Clasamentele oficiale ale tuturor competitiilor din platforma. Selecteaza o disciplina sau cauta campionatul dorit.
              </p>
            </div>

            {/* Live stats counters */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">{championships.length}</div>
                <div className="text-[10px] font-label uppercase tracking-widest text-slate-500">Competitii</div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-lime-400">
                  {championships.reduce((sum, c) => sum + c.teamsCount, 0)}
                </div>
                <div className="text-[10px] font-label uppercase tracking-widest text-slate-500">Echipe</div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black font-mono text-red-400">
                  {championships.reduce((sum, c) => sum + c.matchesCount, 0)}
                </div>
                <div className="text-[10px] font-label uppercase tracking-widest text-slate-500">Meciuri</div>
              </div>
            </div>
          </div>

          {/* ─── Sport Pills Bar (horizontal scroll, inspired by "Competiții de Top") ─── */}
          <div className="pt-5 border-t border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-sm text-red-400">sports</span>
              <span className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-slate-500">Disciplina Sportiva</span>
            </div>

            <div
              ref={pillsRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide select-none cursor-grab active:cursor-grabbing"
              style={{ scrollBehavior: "smooth", msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {/* "Toate" pill */}
              <button
                type="button"
                onClick={() => setActiveSport("toate")}
                className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 ${
                  activeSport === "toate"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105 font-black"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600"
                }`}
              >
                <span className="material-symbols-outlined text-base">public</span>
                <span>Toate</span>
                <span className={`text-[10px] font-mono ${activeSport === "toate" ? "text-red-100" : "text-slate-500"}`}>
                  {championships.length}
                </span>
              </button>

              {/* Per-sport pills */}
              {availableSports.map((sport) => {
                const meta = SPORT_META[sport] || SPORT_META.fotbal;
                const isActive = activeSport === sport;
                const count = championships.filter((c) => (c.sport || "").toLowerCase() === sport).length;

                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setActiveSport(sport)}
                    className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? `${meta.badgeBg} shadow-lg scale-105 font-black`
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-base ${!isActive ? meta.accent : ""}`}>{meta.icon}</span>
                    <span>{meta.label}</span>
                    <span className={`text-[10px] font-mono ${isActive ? "opacity-70" : "text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. TOP TEAMS — Horizontal scroll of circular team logos
         ═══════════════════════════════════════════════════════════════════ */}
      {topTeams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-red-400">star</span>
              <h2 className="text-sm font-headline font-black uppercase tracking-wider text-white">
                Echipe de Top
              </h2>
            </div>
            <Link href="/teams" className="text-[10px] font-label font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition">
              Vezi Toate
            </Link>
          </div>

          <div
            className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 select-none"
            style={{ scrollBehavior: "smooth", msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {topTeams.map((team) => {
              const sport = (team.sport || "fotbal").toLowerCase();
              const gradient = SPORT_GRADIENT[sport] || SPORT_GRADIENT.fotbal;
              const initials = (team.shortName || team.name || "EC")
                .substring(0, 3)
                .toUpperCase();

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group flex flex-col items-center gap-2 shrink-0 w-[72px]"
                >
                  {/* Circle logo */}
                  <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${gradient} p-[2px] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span
                          className="text-sm font-black text-white"
                          style={team.color ? { color: team.color } : undefined}
                        >
                          {initials}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] font-headline font-bold text-slate-400 text-center leading-tight truncate w-full group-hover:text-white transition-colors">
                    {team.shortName || team.name.split(/\s+/).slice(0, 2).join(" ")}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          3. TOP LIVE — Live matches with scores
         ═══════════════════════════════════════════════════════════════════ */}
      {liveMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <h2 className="text-sm font-headline font-black uppercase tracking-wider text-white">
                Top Live
              </h2>
              <span className="text-[10px] font-mono text-red-400 font-bold">
                {liveMatches.length} {liveMatches.length === 1 ? "meci" : "meciuri"}
              </span>
            </div>
            <Link href="/matches" className="text-[10px] font-label font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition">
              Vezi Toate
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((match) => {
              const sportKey = (match.sport || "fotbal").toLowerCase();
              const meta = SPORT_META[sportKey] || SPORT_META.fotbal;

              return (
                <div
                  key={match.id}
                  className="relative rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-red-500/40 transition-all duration-300 overflow-hidden shadow-lg"
                >
                  {/* Top bar: championship + sport + LIVE badge */}
                  <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 text-[10px] font-label text-slate-400 truncate">
                      <span className={`material-symbols-outlined text-[13px] ${meta.accent}`}>{meta.icon}</span>
                      <span className="truncate">{match.championshipName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{match.stage}</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-headline font-black text-red-400 uppercase">Live</span>
                      </span>
                    </div>
                  </div>

                  {/* Match body: teams + score */}
                  <div className="px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      {/* Home team */}
                      <div className="flex-1 min-w-0 text-center space-y-2">
                        <div
                          className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xs font-black shadow-md border border-slate-300 dark:border-white/10"
                          style={{ backgroundColor: match.homeTeam.color || "#334155", color: getContrastTextColor(match.homeTeam.color || "#334155") }}
                        >
                          {match.homeTeam.logoUrl ? (
                            <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            (match.homeTeam.shortName || match.homeTeam.name).substring(0, 3).toUpperCase()
                          )}
                        </div>
                        <p className="text-xs font-headline font-bold text-white truncate">
                          {match.homeTeam.name}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="shrink-0 text-center space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black font-mono text-white">{match.homeScore}</span>
                          <span className="text-sm font-mono text-red-500">-</span>
                          <span className="text-2xl font-black font-mono text-white">{match.awayScore}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[9px] font-mono text-red-400 uppercase font-bold">In desfasurare</span>
                        </div>
                      </div>

                      {/* Away team */}
                      <div className="flex-1 min-w-0 text-center space-y-2">
                        <div
                          className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-xs font-black shadow-md border border-slate-300 dark:border-white/10"
                          style={{ backgroundColor: match.awayTeam.color || "#334155", color: getContrastTextColor(match.awayTeam.color || "#334155") }}
                        >
                          {match.awayTeam.logoUrl ? (
                            <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            (match.awayTeam.shortName || match.awayTeam.name).substring(0, 3).toUpperCase()
                          )}
                        </div>
                        <p className="text-xs font-headline font-bold text-white truncate">
                          {match.awayTeam.name}
                        </p>
                      </div>
                    </div>

                    {/* Venue row */}
                    {match.venue && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-label">
                        <span className="material-symbols-outlined text-[12px]">stadium</span>
                        <span className="truncate">{match.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          4. SEARCH BAR
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative">
        <span className="material-symbols-outlined text-lg text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cauta campionat, judet sau oras..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-500 font-body focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition shadow-lg"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          5. CHAMPIONSHIPS GRID — Premium dark cards
         ═══════════════════════════════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 block">emoji_events</span>
          <h3 className="text-lg font-headline font-bold text-slate-400 mb-1">
            Niciun campionat gasit
          </h3>
          <p className="text-xs text-slate-500 font-label">
            {searchQuery
              ? `Nu exista rezultate pentru "${searchQuery}". Incearca alt termen.`
              : "Nu sunt competitii disponibile in platforma momentan."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((c, idx) => {
            const sport = (c.sport || "fotbal").toLowerCase();
            const meta = SPORT_META[sport] || SPORT_META.fotbal;
            const gradient = SPORT_GRADIENT[sport] || SPORT_GRADIENT.fotbal;
            const scope = SCOPE_LABELS[(c.scope || "").toLowerCase()] || c.scope || "National";
            const initials = (c.name || "CP")
              .trim()
              .replace(/\b(202\d|203\d)\b/g, "")
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 3) || "CP";

            const matchesFinished = c.finishedCount || 0;
            const progressPct = c.matchesCount > 0 ? Math.round((matchesFinished / c.matchesCount) * 100) : 0;

            return (
              <Link
                key={c.id}
                href={`/clasamente?id=${c.id}`}
                className={`group relative block rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-red-500/40 shadow-lg hover:shadow-red-500/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: mounted ? `${idx * 60}ms` : "0ms" }}
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Row 1: Logo + Name + Arrow */}
                  <div className="flex items-start gap-4">
                    {/* Logo / Initials */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-base shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-headline font-black text-white truncate group-hover:text-red-400 transition-colors duration-200">
                        {c.name}
                      </h3>

                      {/* Sport badge + scope */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-headline font-bold uppercase tracking-wider ${meta.badgeBg}`}>
                          <span className="material-symbols-outlined text-[11px]">{meta.icon}</span>
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-label text-slate-500 uppercase tracking-wider">
                          {scope}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-red-500 flex items-center justify-center transition-all duration-300 group-hover:translate-x-0.5">
                      <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-white transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Location */}
                  {(c.county || c.city) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-label">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span className="truncate">
                        {[c.city, c.county].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Row 3: Stats bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-label">
                        <span className="material-symbols-outlined text-[14px] text-slate-500">groups</span>
                        <span className="font-bold text-white">{c.teamsCount}</span>
                        <span className="hidden sm:inline">echipe</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-label">
                        <span className="material-symbols-outlined text-[14px] text-slate-500">sports_score</span>
                        <span className="font-bold text-white">{c.matchesCount}</span>
                        <span className="hidden sm:inline">meciuri</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {c.matchesCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{progressPct}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          6. BOTTOM INFO BAR
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/60 text-[11px] font-label text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">info</span>
          <span>Clasamentele se actualizeaza automat dupa fiecare meci finalizat</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Live
          </span>
          <span>{filtered.length} din {championships.length} afisate</span>
        </div>
      </div>
    </div>
  );
}
