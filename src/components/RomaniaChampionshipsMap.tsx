"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ROMANIAN_COUNTIES } from "@/lib/constants";

interface ChampionshipData {
  id: string;
  name: string;
  sport: string;
  format: string;
  season?: string | null;
  scope: string; // "national" | "judetean" | "oras"
  county?: string | null;
  city?: string | null;
  description?: string | null;
  isBracketPublished: boolean;
  createdAt: string;
  teamsCount: number;
  matchesCount: number;
}

interface RomaniaMapProps {
  initialChampionships: ChampionshipData[];
}

// Region categorization for organized navigation
const ROMANIAN_REGIONS: Record<string, string[]> = {
  "Banat & Crișana": ["Timiș", "Arad", "Bihor", "Caraș-Severin"],
  "Transilvania": ["Cluj", "Brașov", "Sibiu", "Mureș", "Alba", "Bistrița-Năsăud", "Covasna", "Harghita", "Hunedoara", "Sălaj"],
  "București & Ilfov": ["București", "Ilfov"],
  "Moldova": ["Iași", "Bacău", "Galați", "Suceava", "Botoșani", "Neamț", "Vaslui", "Vrancea"],
  "Muntenia": ["Prahova", "Argeș", "Dâmbovița", "Buzău", "Brăila", "Călărași", "Giurgiu", "Ialomița", "Teleorman"],
  "Oltenia": ["Dolj", "Gorj", "Mehedinți", "Olt", "Vâlcea"],
  "Dobrogea & Maramureș": ["Constanța", "Tulcea", "Maramureș", "Satu Mare"],
};

export function RomaniaChampionshipsMap({ initialChampionships }: RomaniaMapProps) {
  const [selectedCounty, setSelectedCounty] = useState<string>("Timiș");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedScope, setSelectedScope] = useState<string>("all"); // "all" | "national" | "judetean" | "oras"

  // National championships appear across ALL counties
  const nationalChampionships = useMemo(() => {
    return initialChampionships.filter(
      (c) => c.scope === "national" || (!c.county && c.scope !== "oras" && c.scope !== "judetean")
    );
  }, [initialChampionships]);

  // County specific championships
  const countyChampionships = useMemo(() => {
    return initialChampionships.filter(
      (c) => (c.scope === "judetean" || c.scope === "oras") && c.county?.toLowerCase() === selectedCounty.toLowerCase()
    );
  }, [initialChampionships, selectedCounty]);

  // Combined list for current view with filters applied
  const filteredChampionships = useMemo(() => {
    let list = [...nationalChampionships, ...countyChampionships];

    if (selectedSport !== "all") {
      list = list.filter((c) => c.sport.toLowerCase() === selectedSport.toLowerCase());
    }

    if (selectedScope !== "all") {
      list = list.filter((c) => c.scope === selectedScope);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sport.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.county && c.county.toLowerCase().includes(q))
      );
    }

    // Deduplicate by ID
    const map = new Map<string, ChampionshipData>();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [nationalChampionships, countyChampionships, selectedSport, selectedScope, searchQuery]);

  // County statistics calculator
  function getCountyTotalCount(countyName: string) {
    const localCount = initialChampionships.filter(
      (c) => (c.scope === "judetean" || c.scope === "oras") && c.county?.toLowerCase() === countyName.toLowerCase()
    ).length;
    return nationalChampionships.length + localCount;
  }

  // Filtered counties by search
  const filteredCounties = useMemo(() => {
    if (!searchQuery.trim()) return ROMANIAN_COUNTIES;
    return ROMANIAN_COUNTIES.filter((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-10 font-body">
      {/* Hero Header */}
      <section className="bg-primary text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-lime-400/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-wider shadow-sm">
              🇷🇴 ACOPERIRE TERITORIALĂ NAȚIONALĂ
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase font-label">
              41 Județe + București
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase font-label border border-blue-400/30">
              {initialChampionships.length} Competiții Înregistrate
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white">
            Harta Campionatelor din România
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-body">
            Explorează competițiile sportive pe județe. Campionatele <strong className="text-lime-300">Naționale</strong> sunt prezente în toată țara, iar ligile <strong className="text-lime-300">Județene &amp; Municipale</strong> sunt arondate fiecărui județ în parte.
          </p>

          {/* Quick Search and Filters Bar */}
          <div className="pt-2 flex flex-wrap gap-3 items-center">
            <div className="relative min-w-[260px] flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Caută județ, oraș sau nume campionat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400 transition"
              />
            </div>

            {/* Scope Filter Pills */}
            <div className="flex gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedScope("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                  selectedScope === "all" ? "bg-lime-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                Toate
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope("national")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                  selectedScope === "national" ? "bg-lime-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                🇷🇴 Naționale ({nationalChampionships.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope("judetean")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                  selectedScope === "judetean" ? "bg-lime-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                🏛️ Județene
              </button>
              <button
                type="button"
                onClick={() => setSelectedScope("oras")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                  selectedScope === "oras" ? "bg-lime-400 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                🏙️ Municipale
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left County Selector Matrix + Right Active Championships */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive County Matrix by Region (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-xl">
                  map
                </span>
                <h3 className="font-headline font-bold text-base text-blue-950 dark:text-white">
                  Selectează Județul
                </h3>
              </div>
              <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                {filteredCounties.length} Județe
              </span>
            </div>

            {/* Region-by-Region Selector Accordion / Pills */}
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
              {Object.entries(ROMANIAN_REGIONS).map(([regionName, countiesInRegion]) => {
                const visibleCounties = countiesInRegion.filter((c) =>
                  filteredCounties.includes(c as any)
                );
                if (visibleCounties.length === 0) return null;

                return (
                  <div key={regionName} className="space-y-2">
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block px-1">
                      {regionName}
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {visibleCounties.map((county) => {
                        const isSelected = selectedCounty.toLowerCase() === county.toLowerCase();
                        const count = getCountyTotalCount(county);
                        const hasLocal = initialChampionships.some(
                          (c) =>
                            (c.scope === "judetean" || c.scope === "oras") &&
                            c.county?.toLowerCase() === county.toLowerCase()
                        );

                        return (
                          <button
                            key={county}
                            type="button"
                            onClick={() => setSelectedCounty(county)}
                            className={`p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
                              isSelected
                                ? "bg-lime-400 text-slate-950 border-lime-500 shadow-md font-black scale-[1.02]"
                                : "bg-surface-container-low text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className="truncate">
                              <span className="text-xs block truncate">
                                {county === "București" ? "București" : `Jud. ${county}`}
                              </span>
                              {hasLocal && (
                                <span
                                  className={`text-[9px] font-label font-bold uppercase ${
                                    isSelected ? "text-slate-900" : "text-lime-600 dark:text-lime-400"
                                  }`}
                                >
                                  Ligă Locală ✓
                                </span>
                              )}
                            </div>

                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isSelected
                                  ? "bg-slate-950 text-lime-400"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Organizer CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/dashboard/new"
                className="w-full py-3 rounded-2xl bg-surface-container-low hover:bg-lime-400 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-headline font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Creează Campionat Nou în {selectedCounty}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Active Championships for Selected County (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active County Spotlight Banner */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-lime-400">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  JUDEȚ ACTIV
                </span>
                <span className="text-xs text-slate-400 font-label">
                  {filteredChampionships.length} Competiții Disponibile
                </span>
              </div>
              <h2 className="text-2xl font-bold font-headline text-blue-950 dark:text-white">
                Județul {selectedCounty}
              </h2>
              <p className="text-xs text-slate-500 font-label mt-0.5">
                Include campionatele naționale (cu meciuri în toată țara) și ligile locale ale județului.
              </p>
            </div>

            {/* Sport Filter */}
            <div className="flex gap-1.5">
              {["all", "Fotbal", "Baschet", "Volei"].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSelectedSport(sp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                    selectedSport === sp
                      ? "bg-primary text-white dark:bg-lime-400 dark:text-slate-950"
                      : "bg-surface-container-low text-slate-600 dark:text-slate-400 hover:text-white"
                  }`}
                >
                  {sp === "all" ? "Toate Sporturile" : sp}
                </button>
              ))}
            </div>
          </div>

          {/* Championships Grid */}
          <div className="space-y-4">
            {filteredChampionships.length === 0 ? (
              <div className="p-10 rounded-3xl bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 text-center space-y-3">
                <span className="text-3xl block">🏟️</span>
                <h3 className="font-headline font-bold text-base text-blue-950 dark:text-white">
                  Niciun campionat găsit pentru filtrele selectate
                </h3>
                <p className="text-xs text-slate-500 font-label">
                  Încearcă să resetezi filtrele sau adaugă primul turneu în Județul {selectedCounty}!
                </p>
                <Link
                  href="/dashboard/new"
                  className="btn btn-primary text-xs uppercase font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 mt-2"
                >
                  Adaugă Campionat ↗
                </Link>
              </div>
            ) : (
              filteredChampionships.map((champ) => {
                const isNational = champ.scope === "national";
                const isJudetean = champ.scope === "judetean";
                const isOras = champ.scope === "oras";

                return (
                  <div
                    key={champ.id}
                    className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase font-label shadow-sm ${
                            isNational
                              ? "bg-blue-600 text-white"
                              : isJudetean
                              ? "bg-lime-400 text-slate-950"
                              : "bg-amber-400 text-slate-950"
                          }`}
                        >
                          {isNational
                            ? "🇷🇴 NAȚIONAL (Peste Tot)"
                            : isJudetean
                            ? `🏛️ JUDEȚEAN (${champ.county || selectedCounty})`
                            : `🏙️ MUNICIPAL (${champ.city || selectedCounty})`}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold font-label uppercase">
                          {champ.sport}
                        </span>

                        {champ.season && (
                          <span className="text-[10px] font-label font-bold text-slate-400">
                            Sezon {champ.season}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400 font-label">
                        {champ.teamsCount} Echipe Înscrise
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xl text-blue-950 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                        {champ.name}
                      </h3>
                      {champ.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed mt-1.5">
                          {champ.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-label">
                      <div className="flex items-center gap-3 text-slate-500">
                        <span>📊 Format: {champ.format}</span>
                        {champ.city && <span>📍 Oraș: {champ.city}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/brackets"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-[11px] uppercase font-label transition flex items-center gap-1"
                        >
                          🎲 Harta Zaruri
                        </Link>

                        <Link
                          href="/campionat"
                          className="px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-[11px] uppercase font-headline shadow-sm transition flex items-center gap-1"
                        >
                          Clasament &amp; Meciuri ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
