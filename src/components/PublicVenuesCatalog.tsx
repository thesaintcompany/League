"use client";

import React, { useState } from "react";
import Link from "next/link";

interface VenueItem {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  specs?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  pricePerHour?: number | null;
  imageUrl?: string | null;
}

export function PublicVenuesCatalog({ initialVenues }: { initialVenues: VenueItem[] }) {
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = initialVenues.filter((v) => {
    const matchesSport = sportFilter === "all" || v.sport === sportFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      (v.address && v.address.toLowerCase().includes(q)) ||
      (v.specs && v.specs.toLowerCase().includes(q));
    return matchesSport && matchesSearch;
  });

  const footballCount = initialVenues.filter((v) => v.sport === "fotbal").length;
  const basketballCount = initialVenues.filter((v) => v.sport === "baschet").length;
  const volleyballCount = initialVenues.filter((v) => v.sport === "volei").length;
  const multiCount = initialVenues.filter((v) => v.sport === "multifunctional").length;

  return (
    <div className="space-y-8">
      {/* Filter and Search Bar */}
      <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Sport Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSportFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                sportFilter === "all"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "bg-surface-container-low text-slate-600 hover:bg-slate-200"
              }`}
            >
              Toate ({initialVenues.length})
            </button>
            <button
              type="button"
              onClick={() => setSportFilter("fotbal")}
              className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                sportFilter === "fotbal"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "bg-surface-container-low text-slate-600 hover:bg-slate-200"
              }`}
            >
              ⚽ Fotbal ({footballCount})
            </button>
            <button
              type="button"
              onClick={() => setSportFilter("baschet")}
              className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                sportFilter === "baschet"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "bg-surface-container-low text-slate-600 hover:bg-slate-200"
              }`}
            >
              🏀 Baschet ({basketballCount})
            </button>
            <button
              type="button"
              onClick={() => setSportFilter("volei")}
              className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                sportFilter === "volei"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "bg-surface-container-low text-slate-600 hover:bg-slate-200"
              }`}
            >
              🏐 Volei ({volleyballCount})
            </button>
            <button
              type="button"
              onClick={() => setSportFilter("multifunctional")}
              className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                sportFilter === "multifunctional"
                  ? "bg-primary text-white shadow-sm font-black"
                  : "bg-surface-container-low text-slate-600 hover:bg-slate-200"
              }`}
            >
              🏟️ Multifuncțional ({multiCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Caută bază, oraș sau adresă (ex: Vasport, Lugoj)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-xs w-full"
            />
          </div>
        </div>
      </div>

      {/* Grid of Arenas */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest rounded-3xl">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
            stadium
          </span>
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Nu a fost găsită nicio arenă conform căutării.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Încearcă să resetezi filtrele sau să cauți după alt termen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Header */}
                <div className="h-48 relative overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={venue.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-between p-5 text-white">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-label shadow-sm">
                        {venue.surface}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase font-label">
                        {venue.sport}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-headline leading-tight text-white group-hover:text-lime-300 transition">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-label flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[14px] text-lime-400">
                          location_on
                        </span>
                        {venue.location} {venue.address ? `• ${venue.address}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-6 space-y-4">
                  {venue.specs && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed line-clamp-2">
                      {venue.specs}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                        Capacitate
                      </p>
                      <p className="text-lg font-black text-blue-950 dark:text-white data-font mt-0.5">
                        {venue.capacity.toLocaleString()} Locuri
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                        Nocturnă LED
                      </p>
                      <p className="text-lg font-black text-lime-600 dark:text-lime-400 data-font mt-0.5">
                        {venue.floodlights ? "Disponibilă ✓" : "Fără"}
                      </p>
                    </div>
                  </div>

                  {venue.pricePerHour && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-label">Tarif Închiriere:</span>
                      <span className="font-black text-lime-600 dark:text-lime-400 data-font text-sm">
                        {venue.pricePerHour} RON / oră
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-700 dark:text-slate-300 font-label text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                  Vezi Istoric Meciuri pe Arenă
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
