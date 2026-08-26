"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ROMANIAN_COUNTIES } from "@/lib/constants";
import { InteractiveRomaniaSvgMap } from "@/components/InteractiveRomaniaSvgMap";
import { useSportContext } from "@/context/SportContext";

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

interface VenueData {
  id: string;
  name: string;
  location: string;
  county?: string | null;
  address?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  imageUrl?: string | null;
}

interface RomaniaMapProps {
  initialChampionships: ChampionshipData[];
  initialVenues?: VenueData[];
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

export function RomaniaChampionshipsMap({ initialChampionships, initialVenues = [] }: RomaniaMapProps) {
  const { selectedSport, currentSportMeta } = useSportContext();
  const [selectedCounty, setSelectedCounty] = useState<string>("Timiș");
  const [activeTab, setActiveTab] = useState<"championships" | "venues">("championships");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedScope, setSelectedScope] = useState<string>("all"); // "all" | "national" | "judetean" | "oras"

  // 1. Strict filtering by chosen global sport
  const sportChampionships = useMemo(() => {
    return initialChampionships.filter((c) => {
      const cSport = (c.sport || "").toLowerCase();
      return (
        cSport.includes(selectedSport) ||
        (selectedSport === "fotbal" && (cSport.includes("minifotbal") || cSport.includes("futsal")))
      );
    });
  }, [initialChampionships, selectedSport]);

  const sportVenues = useMemo(() => {
    return initialVenues.filter((v) => {
      const vSport = (v.sport || "").toLowerCase();
      return (
        vSport.includes(selectedSport) ||
        vSport.includes("multifunctional") ||
        vSport.includes("mixt") ||
        vSport.includes("sala")
      );
    });
  }, [initialVenues, selectedSport]);

  // National championships in current sport
  const nationalChampionships = useMemo(() => {
    return sportChampionships.filter(
      (c) => c.scope === "national" || (!c.county && c.scope !== "oras" && c.scope !== "judetean")
    );
  }, [sportChampionships]);

  // County specific championships in current sport
  const countyChampionships = useMemo(() => {
    return sportChampionships.filter(
      (c) => (c.scope === "judetean" || c.scope === "oras") && c.county?.toLowerCase() === selectedCounty.toLowerCase()
    );
  }, [sportChampionships, selectedCounty]);

  // Combined list for current view with search & scope applied
  const filteredChampionships = useMemo(() => {
    let list = [...nationalChampionships, ...countyChampionships];

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
  }, [nationalChampionships, countyChampionships, selectedScope, searchQuery]);

  // Filtered venues for selected county or nearby
  const countyVenues = useMemo(() => {
    return sportVenues.filter((v) => {
      const vCounty = v.county?.toLowerCase() || "";
      const vLoc = v.location.toLowerCase();
      const sCounty = selectedCounty.toLowerCase();
      return vCounty.includes(sCounty) || vLoc.includes(sCounty) || (sCounty === "bucurești" && (vLoc.includes("bucuresti") || vLoc.includes("ilfov")));
    });
  }, [sportVenues, selectedCounty]);

  // County statistics calculator for map tooltip & badges (strictly for selected sport)
  function getCountyStats(countyName: string) {
    const champCount = sportChampionships.filter(
      (c) => (c.scope === "judetean" || c.scope === "oras") && c.county?.toLowerCase() === countyName.toLowerCase()
    ).length + nationalChampionships.length;

    const venCount = sportVenues.filter((v) => {
      const vCounty = v.county?.toLowerCase() || "";
      const vLoc = v.location.toLowerCase();
      const sCounty = countyName.toLowerCase();
      return vCounty.includes(sCounty) || vLoc.includes(sCounty);
    }).length;

    return { championshipsCount: champCount, venuesCount: venCount };
  }

  // Find region for selected county
  const selectedRegion = useMemo(() => {
    for (const [reg, counties] of Object.entries(ROMANIAN_REGIONS)) {
      if (counties.some((c) => c.toLowerCase() === selectedCounty.toLowerCase())) {
        return reg;
      }
    }
    return "România";
  }, [selectedCounty]);

  return (
    <div className="space-y-6 sm:space-y-10 font-body">
      {/* Hero Header */}
      <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm border border-slate-200 dark:border-lime-400/30 transition-colors duration-200">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase font-label tracking-wider shadow-md flex items-center gap-1.5">
              <span>🗺️</span> HARTA PE JUDEȚE
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-[10px] sm:text-[11px] uppercase font-label border border-slate-200 dark:border-slate-700">
              41 Județe + București
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold text-[10px] sm:text-[11px] uppercase font-label border border-blue-200 dark:border-blue-400/30">
              {initialChampionships.length} Competiții
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight text-slate-950 dark:text-white break-words">
            Explorează Competițiile
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-3xl font-body">
            Fiecare județ are propriul său selector dedicat. Apasă pe oricare dintre cele <strong>42 de regiuni administrative</strong> de pe desenul vectorial al României pentru a deschide instant ligile, turneele și bazele sportive arondate.
          </p>

          {/* Quick Scope Filter Bar with Mobile Scroll */}
          <div className="pt-2 flex flex-wrap gap-1.5 sm:gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-label mr-1">Filtru Tip:</span>
            {[
              { id: "all", label: "Toate" },
              { id: "national", label: `🇷🇴 Naționale (${nationalChampionships.length})` },
              { id: "judetean", label: "🏛️ Județene" },
              { id: "oras", label: "🏙️ Municipale" },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScope(sc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition fluid-press ${selectedScope === sc.id
                  ? "bg-lime-400 text-slate-950 font-black shadow-md scale-105"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                  }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout: Left SVG Interactive Map (6 cols) + Right County Hub (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Vector Map of Romania */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  RO MAP
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-label font-bold text-lime-600 dark:text-lime-400 uppercase bg-lime-400/10 px-2.5 py-1 rounded-full border border-lime-400/30">
                Atinge un județ
              </span>
            </div>

            {/* Vector SVG Map Component */}
            <InteractiveRomaniaSvgMap
              selectedCounty={selectedCounty}
              onSelectCounty={(county) => {
                setSelectedCounty(county);
              }}
              getCountyStats={getCountyStats}
            />

            {/* Fast Region Jump Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                Săritură Rapidă pe Județe Mari:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["Timiș", "Cluj", "București", "Iași", "Brașov", "Dolj", "Constanța", "Bihor", "Argeș", "Prahova"].map((cName) => {
                  const isSel = selectedCounty.toLowerCase() === cName.toLowerCase();
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedCounty(cName)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold font-label transition fluid-press ${isSel
                        ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-lime-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {cName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive County Selector & Deck */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Active County Spotlight Banner */}
          <div className="card p-4 sm:p-6 bg-white dark:bg-slate-900 border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4 sm:space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header with County Name, Region, & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label shadow-sm">
                    JUDEȚ SELECTAT
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-label">
                    Regiunea {selectedRegion}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black italic font-headline uppercase text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>📍</span> {selectedCounty === "București" ? "București" : `Județul ${selectedCounty}`}
                </h2>
              </div>

              <Link
                href="/dashboard/new"
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition fluid-press shrink-0"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                + Adaugă Turneu
              </Link>
            </div>

            {/* County Selector Tabs & Mobile-Enabled Search Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setActiveTab("championships")}
                    className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-label transition fluid-press flex items-center justify-center gap-1.5 ${activeTab === "championships"
                      ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-lime-400 font-black shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <span>🏆</span> Campionate ({filteredChampionships.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("venues")}
                    className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-label transition fluid-press flex items-center justify-center gap-1.5 ${activeTab === "venues"
                      ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-lime-400 font-black shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <span>🏟️</span> Arene ({countyVenues.length})
                  </button>
                </div>
              </div>

              {/* Search within County (Visible on both mobile & desktop) */}
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Caută competiții sau baze sportive în județ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400 transition"
                />
              </div>
            </div>

            {/* TAB 1: Championships Content */}
            {activeTab === "championships" && (
              <div className="space-y-3 sm:space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {filteredChampionships.length === 0 ? (
                  <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <span className="text-4xl block">🏟️</span>
                    <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                      Niciun campionat găsit în Județul {selectedCounty}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-label max-w-sm mx-auto">
                      Nu există încă turnee locale înregistrate pentru această selecție. Fii primul organizator care creează un campionat în {selectedCounty}!
                    </p>
                    <Link
                      href="/dashboard/new"
                      className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md"
                    >
                      + Creează Primul Campionat
                    </Link>
                  </div>
                ) : (
                  filteredChampionships.map((champ) => {
                    const isNational = champ.scope === "national";
                    const isJudetean = champ.scope === "judetean";

                    return (
                      <div
                        key={champ.id}
                        className="card p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm hover:border-lime-400/80 transition space-y-3 group"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-700">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase font-label ${isNational
                                ? "bg-blue-600 text-white"
                                : isJudetean
                                  ? "bg-lime-400 text-slate-950"
                                  : "bg-amber-400 text-slate-950"
                                }`}
                            >
                              {isNational
                                ? "🇷🇴 NAȚIONAL"
                                : isJudetean
                                  ? `🏛️ JUDEȚEAN (${champ.county || selectedCounty})`
                                  : `🏙️ MUNICIPAL (${champ.city || selectedCounty})`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[9px] sm:text-[10px] font-bold font-label uppercase">
                              {champ.sport}
                            </span>
                          </div>

                          <span className="text-xs text-slate-500 dark:text-slate-400 font-label font-bold shrink-0">
                            {champ.teamsCount} Echipe
                          </span>
                        </div>

                        <div>
                          <h4 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors break-words">
                            {champ.name}
                          </h4>
                          {champ.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed mt-1 line-clamp-2">
                              {champ.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-label">
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] sm:text-[11px]">
                            Format: <strong>{champ.format}</strong> {champ.city ? `• ${champ.city}` : ""}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/brackets?id=${champ.id}`}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-[10px] sm:text-[11px] uppercase font-label transition flex items-center gap-1"
                            >
                              🌳 Harta
                            </Link>
                            <Link
                              href={`/campionat?id=${champ.id}`}
                              className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase font-headline shadow-sm transition flex items-center gap-1"
                            >
                              Clasament ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: Venues Content */}
            {activeTab === "venues" && (
              <div className="space-y-3 sm:space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {countyVenues.length === 0 ? (
                  <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <span className="text-4xl block">🏟️</span>
                    <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                      Nu există baze sportive înregistrate în {selectedCounty}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-label max-w-sm mx-auto">
                      Explorează catalogul național complet de 59 de arene și săli polivalente din România!
                    </p>
                    <Link
                      href="/venues"
                      className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md"
                    >
                      Vezi Toate Arenele ↗
                    </Link>
                  </div>
                ) : (
                  countyVenues.map((v) => (
                    <div
                      key={v.id}
                      className="card p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm hover:border-lime-400/80 transition space-y-3 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                            {v.sport}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-label">
                            {v.surface}
                          </span>
                        </div>

                        <span className="text-xs font-black font-mono text-lime-600 dark:text-lime-400">
                          {v.capacity.toLocaleString()} Locuri
                        </span>
                      </div>

                      <div>
                        <h4 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                          {v.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-label flex items-center gap-1 mt-0.5">
                          <span>📍</span> {v.location} {v.address ? `• ${v.address}` : ""}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-[11px] font-label text-slate-500">
                          {v.floodlights ? "💡 Nocturnă Omologată" : "Fără nocturnă"}
                        </span>

                        <Link
                          href={`/venues/${v.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-black text-[11px] uppercase tracking-wider hover:bg-lime-500 transition flex items-center gap-1 shadow-sm"
                        >
                          Detalii Arenă ↗
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
