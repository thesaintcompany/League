"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getCurrentSeasonLabel } from "@/lib/season";
import { useSportContext } from "@/context/SportContext";

interface TeamPlayer {
  id: string;
  name: string;
  number?: number | null;
  position?: string | null;
  goals?: number;
}

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  sport?: string | null;
  homeArena?: string | null;
  players?: TeamPlayer[];
  championship?: {
    id: string;
    name: string;
    sport?: string;
    season?: string | null;
  } | null;
}

// Preset database of popular clubs for enrichment when fewer clubs exist
const PRESET_ROMANIAN_CLUBS = [
  { name: "FCSB București", shortName: "FCSB", color: "#dc2626", category: "SuperLiga", city: "București", sport: "fotbal" },
  { name: "CFR 1907 Cluj", shortName: "CFR", color: "#831843", category: "SuperLiga", city: "Cluj-Napoca", sport: "fotbal" },
  { name: "Universitatea Craiova", shortName: "UCV", color: "#1d4ed8", category: "SuperLiga", city: "Craiova", sport: "fotbal" },
  { name: "FC Rapid 1923", shortName: "RAP", color: "#7f1d1d", category: "SuperLiga", city: "București", sport: "fotbal" },
  { name: "Dinamo București", shortName: "DIN", color: "#b91c1c", category: "SuperLiga", city: "București", sport: "fotbal" },
  { name: "Farul Constanța", shortName: "FAR", color: "#0369a1", category: "SuperLiga", city: "Constanța", sport: "fotbal" },
  { name: "CSM Volei Timișoara", shortName: "TIM", color: "#0284c7", category: "Divizia A1", city: "Timișoara", sport: "volei" },
  { name: "CS Dinamo Volei", shortName: "DIN-V", color: "#dc2626", category: "Divizia A1", city: "București", sport: "volei" },
  { name: "CSM Corona Brașov (Volei)", shortName: "COR-V", color: "#eab308", category: "Divizia A1", city: "Brașov", sport: "volei" },
  { name: "U-BT Cluj-Napoca (Baschet)", shortName: "UBT", color: "#000000", category: "Liga Națională", city: "Cluj-Napoca", sport: "baschet" },
  { name: "CSM Oradea (Baschet)", shortName: "CSM-O", color: "#dc2626", category: "Liga Națională", city: "Oradea", sport: "baschet" },
  { name: "Dinamo București (Handbal)", shortName: "DIN-H", color: "#b91c1c", category: "Liga Zimbrilor", city: "București", sport: "handbal" },
  { name: "CSM București (Handbal)", shortName: "CSM-B", color: "#2563eb", category: "Liga Florilor", city: "București", sport: "handbal" },
];

export function PublicTeamsCatalog({
  initialTeams = [],
  activeSeason,
}: {
  initialTeams: TeamItem[];
  activeSeason?: string;
}) {
  const { selectedSport } = useSportContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>("all");

  const seasonDisplay = activeSeason || getCurrentSeasonLabel();

  // Combine database teams first, and supplement with presets if catalog is small
  const allTeams = useMemo(() => {
    const dbTeams = initialTeams || [];
    const dbTeamNames = new Set(dbTeams.map((t) => t.name.toLowerCase().trim()));

    const nonDuplicatePresets: TeamItem[] = PRESET_ROMANIAN_CLUBS.filter(
      (p) => !dbTeamNames.has(p.name.toLowerCase().trim())
    ).map((c, idx) => ({
      id: `preset-${idx}`,
      name: c.name,
      shortName: c.shortName,
      color: c.color,
      logoUrl: null,
      sport: c.sport,
      homeArena: null,
      players: [],
      championship: {
        id: `champ-${c.sport}`,
        name: `${c.category} - ${c.sport.toUpperCase()}`,
        sport: c.sport,
        season: seasonDisplay,
      },
    }));

    return [...dbTeams, ...nonDuplicatePresets];
  }, [initialTeams, seasonDisplay]);

  // Filter by sport (synced with header selectedSport or local filter)
  const activeSport = selectedSportFilter !== "all" ? selectedSportFilter : (selectedSport || "all");

  const sportFilteredTeams = useMemo(() => {
    if (activeSport === "all") return allTeams;
    return allTeams.filter((t) => {
      const s = (t.sport || t.championship?.sport || "fotbal").toLowerCase();
      if (activeSport === "fotbal") {
        return s.includes("fotbal") || s.includes("minifotbal") || s.includes("futsal") || !t.sport;
      }
      if (activeSport === "pingpong") {
        return s.includes("ping") || s.includes("pong") || s.includes("masă") || s.includes("masa");
      }
      return s.includes(activeSport.toLowerCase());
    });
  }, [allTeams, activeSport]);

  // Filter by search query
  const filteredTeams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sportFilteredTeams;

    return sportFilteredTeams.filter((team) => {
      return (
        team.name.toLowerCase().includes(q) ||
        (team.shortName && team.shortName.toLowerCase().includes(q)) ||
        (team.championship?.name && team.championship.name.toLowerCase().includes(q)) ||
        (team.homeArena && team.homeArena.toLowerCase().includes(q))
      );
    });
  }, [sportFilteredTeams, searchQuery]);

  return (
    <div className="space-y-8 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero Header Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-10 border border-lime-400/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-headline tracking-widest shadow-lg">
              CATALOG CLUBURI &amp; ECHIPE
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase font-mono">
              {allTeams.length} Cluburi Înregistrate
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase font-mono border border-blue-400/30">
              {seasonDisplay}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-md">
            Echipele &amp; Cluburile din Ligă
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
            Explorează toate cluburile participante în campionatele naționale și regionale din România. Descoperă loturile de jucători, siglele oficiale și statisticile fiecărei echipe.
          </p>

          {/* Search Bar & Sport Filters */}
          <div className="pt-2 flex flex-col gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Caută după nume echipă, prescurtare, arenă sau competiție..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center hover:bg-slate-700 transition"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Sport Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: "all", label: "Toate Sporturile", icon: "sports" },
                { id: "fotbal", label: "Fotbal & Minifotbal", icon: "sports_soccer" },
                { id: "baschet", label: "Baschet", icon: "sports_basketball" },
                { id: "volei", label: "Volei", icon: "sports_volleyball" },
                { id: "handbal", label: "Handbal", icon: "sports_handball" },
                { id: "tenis", label: "Tenis & Padel", icon: "sports_tennis" },
                { id: "pingpong", label: "Ping-Pong", icon: "circle" },
              ].map((sport) => {
                const isActive = selectedSportFilter === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSportFilter(sport.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline uppercase transition flex items-center gap-1.5 border ${
                      isActive
                        ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black"
                        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{sport.icon}</span>
                    <span>{sport.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Teams */}
      {filteredTeams.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">
            shield
          </span>
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Nicio echipă găsită pentru filtrul curent.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Resetează căutarea sau selectează &quot;Toate Sporturile&quot; pentru a vedea lista completă.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedSportFilter("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-lime-400 text-slate-950 text-xs font-headline font-black uppercase tracking-wider inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Resetează Filtrele</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTeams.map((team, idx) => {
            const isDbTeam = !team.id.startsWith("preset-");
            const playersCount = team.players?.length || (isDbTeam ? 0 : Math.floor(Math.random() * 10) + 14);
            const shortName = team.shortName || team.name.substring(0, 3).toUpperCase();
            const color = team.color || "#1e293b";

            return (
              <div
                key={team.id}
                className={`group card p-6 bg-white dark:bg-slate-900 border rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isDbTeam
                    ? "border-lime-500/40 dark:border-lime-400/30 hover:border-lime-400"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    {team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-14 h-14 object-contain rounded-2xl bg-slate-950 p-1 border border-slate-700 shadow-xl group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-headline font-black text-lg text-white shadow-xl border-2 border-white/20 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        {shortName}
                      </div>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono border ${
                        isDbTeam
                          ? "bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-400/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isDbTeam ? "OFICIAL" : `Slot #${idx + 1}`}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-label mt-1">
                      {team.championship?.name || "Campionatul Național Pro"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs font-label">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Lot Jucători:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {playersCount} Sportivi
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-label">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Statut Club:</span>
                    <span className="text-emerald-600 dark:text-lime-400 font-extrabold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                      Confirmat <span className="material-symbols-outlined text-xs align-middle">check_circle</span>
                    </span>
                  </div>
                </div>

                {isDbTeam ? (
                  <Link
                    href={`/teams/${team.id}`}
                    className="w-full py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1 active:scale-95 shadow-md"
                  >
                    <span>Vezi Fanion &amp; Profil</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                ) : (
                  <Link
                    href="/teams"
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span>Club Partener</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
