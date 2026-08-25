"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export interface VenueItem {
  id: string;
  name: string;
  location: string;
  county?: string | null;
  status?: string | null;
  address?: string | null;
  specs?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  pricePerHour?: number | null;
  imageUrl?: string | null;
}

const ROMANIAN_COUNTIES_WITH_VENUES = [
  { id: "all", name: "Toată România" },
  { id: "București", name: "București (Arena Națională, Steaua, Giulești, Polivalentă)" },
  { id: "Cluj", name: "Cluj (BTarena, Turda Arena)" },
  { id: "Timiș", name: "Timiș (Dan Păltinișanu, Baze Timișoara)" },
  { id: "Dolj", name: "Dolj (Ion Oblemenco, Polivalentă Craiova)" },
  { id: "Argeș", name: "Argeș (Pitești Arena, Nicolae Dobrin, Mioveni)" },
  { id: "Bihor", name: "Bihor (Polivalentă Oradea)" },
  { id: "Brașov", name: "Brașov (Polivalentă Brașov 10k)" },
  { id: "Constanța", name: "Constanța (Polivalentă Constanța)" },
  { id: "Galați", name: "Galați (Stadionul Oțelul)" },
  { id: "Botoșani", name: "Botoșani (Stadion Municipal)" },
  { id: "Iași", name: "Iași (Polivalentă Regina Maria)" },
  { id: "Covasna", name: "Covasna (Sepsi Arena)" },
  { id: "Bistrița-Năsăud", name: "Bistrița-Năsăud (TeraPlast Arena)" },
  { id: "Tulcea", name: "Tulcea (Polivalentă Tulcea)" },
  { id: "Suceava", name: "Suceava (Polivalentă Suceava)" },
  { id: "Alba", name: "Alba (Alba Blaj Arena)" },
];

export function PublicVenuesCatalog({ initialVenues }: { initialVenues: VenueItem[] }) {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filtering logic
  const filtered = useMemo(() => {
    return initialVenues.filter((v) => {
      // County match
      const vCounty = v.county || (v.location.includes("Timiș") ? "Timiș" : "Altele");
      const matchesCounty = selectedCounty === "all" || vCounty.toLowerCase() === selectedCounty.toLowerCase();

      // Sport match
      const matchesSport =
        sportFilter === "all" ||
        v.sport.toLowerCase() === sportFilter.toLowerCase() ||
        (sportFilter === "multifunctional" && (v.sport === "multifunctional" || v.specs?.toLowerCase().includes("handbal") || v.specs?.toLowerCase().includes("baschet")));

      // Capacity match
      let matchesCapacity = true;
      if (capacityFilter === "over10k") matchesCapacity = v.capacity >= 10000;
      else if (capacityFilter === "3k-10k") matchesCapacity = v.capacity >= 3000 && v.capacity < 10000;
      else if (capacityFilter === "under3k") matchesCapacity = v.capacity < 3000;

      // Status match
      const vStatus = v.status || "activ";
      const matchesStatus = statusFilter === "all" || vStatus.toLowerCase() === statusFilter.toLowerCase();

      // Search match
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        (vCounty && vCounty.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.specs && v.specs.toLowerCase().includes(q));

      return matchesCounty && matchesSport && matchesCapacity && matchesStatus && matchesSearch;
    });
  }, [initialVenues, selectedCounty, sportFilter, capacityFilter, statusFilter, searchQuery]);

  // Statistics
  const totalCapacity = useMemo(() => {
    return initialVenues.reduce((acc, v) => acc + (v.capacity || 0), 0);
  }, [initialVenues]);

  const stadiumsOver10k = useMemo(() => {
    return initialVenues.filter((v) => v.capacity >= 10000).length;
  }, [initialVenues]);

  const polyvalentHalls = useMemo(() => {
    return initialVenues.filter(
      (v) =>
        v.sport === "multifunctional" ||
        v.sport === "baschet" ||
        v.sport === "handbal" ||
        v.sport === "volei" ||
        v.name.toLowerCase().includes("polivalent") ||
        v.name.toLowerCase().includes("arena")
    ).length;
  }, [initialVenues]);

  return (
    <div className="space-y-10 font-body">
      {/* SECTION 1: Strategic Investments & International Competitions Banner */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl text-white space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400">
              Total Arene &amp; Săli
            </span>
            <span className="text-xl">🏟️</span>
          </div>
          <p className="text-3xl font-black font-headline text-white">{initialVenues.length}</p>
          <p className="text-xs text-slate-400 font-label">Baze sportive &amp; stadioane omologate</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl text-white space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400">
              Capacitate Cumulată
            </span>
            <span className="text-xl">👥</span>
          </div>
          <p className="text-3xl font-black font-headline text-lime-400">{totalCapacity.toLocaleString("ro-RO")}</p>
          <p className="text-xs text-slate-400 font-label">Locuri în tribune pe teritoriul României</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl text-white space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-amber-400">
              Arene Majore &gt;10k
            </span>
            <span className="text-xl">⭐</span>
          </div>
          <p className="text-3xl font-black font-headline text-amber-400">{stadiumsOver10k} Arene</p>
          <p className="text-xs text-slate-400 font-label">Stadioane de top UEFA &amp; Săli 10.000+</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl text-white space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-cyan-400">
              Săli Polivalente Moderne
            </span>
            <span className="text-xl">🎪</span>
          </div>
          <p className="text-3xl font-black font-headline text-cyan-400">{polyvalentHalls} Săli</p>
          <p className="text-xs text-slate-400 font-label">Baschet, Handbal, Volei &amp; Concerte</p>
        </div>
      </section>

      {/* SECTION 2: Interactive Romanian Map & Geographic County Filter */}
      <section className="card p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl">
              🗺️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-headline text-white uppercase tracking-tight">
                Filtrare pe Nationale &amp; Județe
              </h2>
              <p className="text-xs text-slate-400 font-label">
                Apasă pe un județ pentru a vedea arenele, stadioanele și sălile polivalente disponibile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCounty("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-label transition ${selectedCounty === "all"
                  ? "bg-lime-400 text-slate-950 font-black shadow-md"
                  : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
            >
              🇷🇴 Toate Județele ({initialVenues.length})
            </button>
          </div>
        </div>

        {/* Interactive Counties Grid / Chips */}
        <div className="flex flex-wrap gap-2">
          {ROMANIAN_COUNTIES_WITH_VENUES.map((c) => {
            const count =
              c.id === "all"
                ? initialVenues.length
                : initialVenues.filter((v) => (v.county || "").toLowerCase() === c.id.toLowerCase()).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCounty(c.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-label font-bold transition flex items-center gap-2 border ${selectedCounty === c.id
                    ? "bg-lime-400 text-slate-950 border-lime-400 font-black shadow-lg scale-105"
                    : "bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
              >
                <span>{c.name.split(" (")[0]}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedCounty === c.id ? "bg-slate-950 text-lime-400" : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Multi-Criteria Filter Bar & Live Search */}
      <section className="card p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Live Search */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Caută stadion, arenă, oraș, beneficiar (ex: Oblemenco, BTarena, Steaua, Blaj)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
            />
          </div>

          {/* Sport Filter */}
          <div className="md:col-span-3">
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              aria-label="Filtru Disciplină Sportivă"
              className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white font-bold focus:outline-none focus:border-lime-400 transition"
            >
              <option value="all">⚽ Toate Sporturile</option>
              <option value="fotbal">⚽ Fotbal (Stadioane)</option>
              <option value="baschet">🏀 Baschet (Săli &amp; Arene)</option>
              <option value="handbal">🤾 Handbal (Săli)</option>
              <option value="volei">🏐 Volei (Săli &amp; Plajă)</option>
              <option value="multifunctional">🏟️ Multifuncțional / Polivalente</option>
            </select>
          </div>

          {/* Capacity Filter */}
          <div className="md:col-span-3">
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              aria-label="Filtru Capacitate Tribune"
              className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white font-bold focus:outline-none focus:border-lime-400 transition"
            >
              <option value="all">👥 Orice Capacitate</option>
              <option value="over10k">🏟️ Peste 10.000 locuri (Arene Majore)</option>
              <option value="3k-10k">🎪 3.000 – 10.000 locuri (Săli Polivalente)</option>
              <option value="under3k">⚡ Sub 3.000 locuri (Baze Municipale)</option>
            </select>
          </div>

          {/* Status Filter & View Switcher */}
          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtru Stadiu Arenă"
              className="w-full px-3 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white font-bold focus:outline-none focus:border-lime-400 transition"
            >
              <option value="all">Status: Toate</option>
              <option value="activ">✅ Active</option>
              <option value="constructie">🏗️ În Construcție</option>
              <option value="proiect">📐 Proiect</option>
            </select>

            {/* View Mode Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Vizualizare Grid Carduri"
                className={`p-2 rounded-xl text-xs transition ${viewMode === "grid" ? "bg-lime-400 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Vizualizare Tabel Comparativ"
                className={`p-2 rounded-xl text-xs transition ${viewMode === "table" ? "bg-lime-400 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">table_rows</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Spotlight Arene cu Competiții Internaționale */}
      {selectedCounty === "all" && !searchQuery && sportFilter === "all" && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
            <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
              🏅 Arene de Nivel Mondial (Gazde Competiții Internaționale)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "BTarena Cluj-Napoca",
                loc: "Cluj-Napoca",
                cap: "10.000",
                event: "Sferturi Basketball Champions League (10.000 spectatori), Campionate Europene Gimnastică",
                badge: "FIBA & EHF World Class",
              },
              {
                name: "Arena Națională",
                loc: "București",
                cap: "55.634",
                event: "Finala UEFA Europa League, UEFA EURO 2020, Meciurile Echipei Naționale",
                badge: "UEFA Categoria 4 Elite",
              },
              {
                name: "Sala Polivalentă București",
                loc: "București",
                cap: "5.300",
                event: "Campionatul European de Judo, Club World Championship Handbal, Meciuri EHF Champions League",
                badge: "Tradiție Internațională",
              },
              {
                name: "Sala Polivalentă Craiova",
                loc: "Craiova",
                cap: "4.215",
                event: "Meciuri Naționale de Handbal, Baschet și Volei, Turnee Balcanice Oficiale",
                badge: "Modernizată EHF",
              },
            ].map((arena, i) => (
              <div
                key={i}
                className="card p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-lime-400/30 rounded-3xl space-y-3 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[9px] font-black uppercase font-label">
                    {arena.badge}
                  </span>
                  <span className="text-xs font-black text-amber-400 font-headline">
                    {arena.cap} locuri
                  </span>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-white text-base leading-tight">
                    {arena.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-label">📍 {arena.loc}</p>
                </div>

                <p className="text-xs text-slate-300 font-body leading-relaxed border-t border-slate-800 pt-2">
                  🏆 {arena.event}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: Results View (Grid or Table) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-primary rounded-full"></span>
            <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
              {filtered.length} Arene &amp; Stadioane Disponibile
            </h2>
          </div>
          <span className="text-xs font-label font-bold text-slate-400 uppercase">
            {selectedCounty !== "all" ? `Județul: ${selectedCounty}` : "Toată România"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 bg-slate-900/80 rounded-3xl border border-slate-800">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2 block">
              stadium
            </span>
            <p className="font-bold text-sm text-white">
              Nu a fost găsită nicio arenă conform filtrelor selectate.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Încearcă să resetezi căutarea sau să selectezi alt județ / sport.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((venue) => {
              const img =
                venue.imageUrl ||
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";

              return (
                <Link
                  key={venue.id}
                  href={`/venues/${venue.id}`}
                  className="card bg-slate-900/90 border border-slate-800 hover:border-lime-400/60 shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Header */}
                    <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950 border-b border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start">
                          <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label shadow-sm">
                            {venue.sport.toUpperCase()}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-400 font-headline font-black text-xs">
                            👥 {venue.capacity.toLocaleString("ro-RO")} locuri
                          </span>
                        </div>

                        <div>
                          {venue.status && venue.status !== "activ" && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase font-label mb-1 inline-block">
                              {venue.status === "constructie" ? "🏗️ În Construcție" : "📐 În Proiect"}
                            </span>
                          )}
                          <h3 className="font-headline font-bold text-white text-lg leading-tight group-hover:text-lime-400 transition">
                            {venue.name}
                          </h3>
                          <p className="text-xs text-slate-300 font-label flex items-center gap-1 mt-0.5">
                            <span>📍 {venue.location}</span>
                            {venue.county && <span>• Jud. {venue.county}</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body Specs */}
                    <div className="p-5 space-y-3">
                      {venue.specs && (
                        <p className="text-xs text-slate-400 font-body line-clamp-2 leading-relaxed">
                          {venue.specs}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-label pt-2 border-t border-slate-800 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lime-400">🌱</span>
                          <span>Suprafață: <strong>{venue.surface}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400">💡</span>
                          <span>Nocturnă: <strong>{venue.floodlights ? "Da ✓" : "Nu"}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-xs font-label">
                    <span className="font-bold text-lime-400">
                      {venue.pricePerHour ? `${venue.pricePerHour} RON / oră` : "La cerere"}
                    </span>
                    <span className="font-bold text-slate-400 group-hover:text-white flex items-center gap-1">
                      Detalii &amp; Ticker
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="card overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-label font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Stadion / Sală</th>
                    <th className="p-4">Localitate &amp; Județ</th>
                    <th className="p-4">Capacitate</th>
                    <th className="p-4">Sporturi Găzduite</th>
                    <th className="p-4">Stadiu / Inaugurare</th>
                    <th className="p-4">Suprafață</th>
                    <th className="p-4 text-right">Acțiune</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-headline font-bold text-white text-sm">
                        <Link href={`/venues/${v.id}`} className="hover:text-lime-400 transition">
                          {v.name}
                        </Link>
                        {v.specs && (
                          <span className="block text-[11px] font-body text-slate-400 font-normal truncate max-w-xs">
                            {v.specs}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-label">
                        <span className="text-white font-bold">{v.location}</span>
                        {v.county && <span className="text-slate-400 block text-[11px]">Jud. {v.county}</span>}
                      </td>
                      <td className="p-4 font-headline font-black text-amber-400 text-sm">
                        {v.capacity.toLocaleString("ro-RO")}
                      </td>
                      <td className="p-4 font-label uppercase font-bold text-lime-400">
                        {v.sport}
                      </td>
                      <td className="p-4 font-label">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${v.status === "constructie"
                              ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                              : v.status === "proiect"
                                ? "bg-blue-400/20 text-blue-400 border border-blue-400/30"
                                : "bg-lime-400/20 text-lime-300 border border-lime-400/30"
                            }`}
                        >
                          {v.status === "constructie"
                            ? "În Construcție"
                            : v.status === "proiect"
                              ? "Proiect"
                              : "Inaugurată / Activă"}
                        </span>
                      </td>
                      <td className="p-4 font-label">{v.surface}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/venues/${v.id}`}
                          className="px-3 py-1.5 rounded-xl bg-lime-400 text-slate-950 font-label font-bold text-[11px] hover:bg-lime-300 transition shadow-sm inline-block"
                        >
                          Vezi Arenă
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
