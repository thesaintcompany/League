"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSportContext } from "@/context/SportContext";

interface RefereeItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  refereeBadge?: string | null;
  experienceYears?: number | null;
  bio?: string | null;
  image?: string | null;
  coverPhotoUrl?: string | null;
}

export const REFEREE_AUTHENTIC_UNIFORM_PHOTOS = [
  "/images/referees/referee-2.jpg", // Black Elite Referee with RIFA/FIFA patch & whistle
  "/images/referees/referee-1.jpg", // Cyan Blue VAR Elite with headset & whistle
  "/images/referees/referee-5.jpg", // Neon Yellow Referee with Yellow Card
  "/images/referees/referee-4.jpg", // Neon Lime Referee with earpiece
  "/images/referees/referee-6.jpg", // Orange / Black Referee with Red Card
  "/images/referees/referee-3.jpg", // Female Referee in official uniform & whistle
];

export function getSafeRefereePhoto(
  ref: { name?: string | null; coverPhotoUrl?: string | null; image?: string | null },
  idx: number = 0
): string {
  if (ref.coverPhotoUrl && ref.coverPhotoUrl.startsWith("/images/referees/")) return ref.coverPhotoUrl;
  if (ref.image && ref.image.startsWith("/images/referees/")) return ref.image;

  // Female referee detection by name
  const femaleNames = ["alina", "iuliana", "elena", "maria", "ana", "andreea", "mihaela", "diana", "roxana", "alexandra", "ioana", "peșu", "pesu", "demetrescu"];
  const nameLower = (ref.name || "").toLowerCase();
  const isFemale = femaleNames.some((n) => nameLower.includes(n));
  if (isFemale) return "/images/referees/referee-3.jpg";

  const malePhotos = [
    "/images/referees/referee-2.jpg",
    "/images/referees/referee-1.jpg",
    "/images/referees/referee-5.jpg",
    "/images/referees/referee-4.jpg",
    "/images/referees/referee-6.jpg",
  ];
  return malePhotos[idx % malePhotos.length];
}

// Generate realistic referee officiating telemetry
function getRefereeTelemetry(ref: RefereeItem, idx: number) {
  const years = ref.experienceYears || 10;
  const isElite = ref.refereeBadge?.includes(" ") || ref.refereeBadge?.includes("Elite");
  const matchesCount = isElite ? Math.round(years * 14 + (idx % 10) * 8) : Math.round(years * 11 + (idx % 8) * 6);
  const yellowPerMatch = (3.2 + (idx % 5) * 0.25).toFixed(1);
  const redCards = Math.round(years * 1.8 + (idx % 4));
  const penalties = Math.round(years * 2.2 + (idx % 6));
  const rating = (8.8 + ((idx % 7) * 0.15)).toFixed(1);

  return {
    matchesCount,
    yellowPerMatch,
    redCards,
    penalties,
    rating: Math.min(9.8, parseFloat(rating)),
  };
}

/**
 * Smart Badge Component:
 * - If badge has <= 2 words: Renders compact stylish badge
 * - If badge has > 2 words: Renders a glowing dot + 2 words, and full text on hover tooltip!
 */
export function RefereeBadgePill({ badge }: { badge?: string | null }) {
  if (!badge) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-bold font-label uppercase border border-slate-700">
        FRF
      </span>
    );
  }

  const words = badge.trim().split(/\s+/);
  const isLong = words.length > 2;

  if (!isLong) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label shadow-sm">
        {badge}
      </span>
    );
  }

  // Long badge (> 2 words): Show a sleek glowing dot + 2-word preview, and full text tooltip on mouseover!
  const shortText = `${words[0]} ${words[1]}`;

  return (
    <div className="group/badge relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md text-lime-400 text-[10px] font-black uppercase font-label border border-lime-400/40 cursor-help shadow-lg">
      <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shrink-0"></span>
      <span className="truncate max-w-[90px]">{shortText}</span>

      {/* Hover Floating Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/badge:flex flex-col items-center z-50 pointer-events-none min-w-[180px] animate-in fade-in zoom-in-95">
        <span className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl border border-lime-400/50 shadow-2xl text-center leading-tight whitespace-nowrap">
          {badge}
        </span>
        <span className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-lime-400/50"></span>
      </div>
    </div>
  );
}

export function PublicRefereesCatalog({ initialReferees }: { initialReferees: RefereeItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filtered referees
  const filtered = useMemo(() => {
    return initialReferees.filter((ref) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ref.name.toLowerCase().includes(q) ||
        (ref.refereeBadge && ref.refereeBadge.toLowerCase().includes(q)) ||
        (ref.bio && ref.bio.toLowerCase().includes(q));

      let matchesCat = true;
      if (selectedCategory === "rifa") {
        matchesCat = Boolean(ref.refereeBadge?.includes("RIFA") || ref.refereeBadge?.includes("Elite"));
      } else if (selectedCategory === "liga1") {
        matchesCat = Boolean(ref.refereeBadge?.includes("Liga 1"));
      } else if (selectedCategory === "var") {
        matchesCat = Boolean(ref.refereeBadge?.includes("VAR"));
      } else if (selectedCategory === "asistent") {
        matchesCat = Boolean(ref.refereeBadge?.includes("Asistent"));
      } else if (selectedCategory === "regional") {
        matchesCat = Boolean(ref.refereeBadge?.includes("Regional") || ref.refereeBadge?.includes("Tineret"));
      }

      return matchesSearch && matchesCat;
    });
  }, [initialReferees, searchQuery, selectedCategory]);

  // Top 10 Spotlight Referees
  const spotlightReferees = useMemo(() => {
    return initialReferees.slice(0, 10);
  }, [initialReferees]);

  return (
    <div className="space-y-12 font-body">
      {/* Hero Header with B&W Shadow Background */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-12 border border-lime-400/30 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity filter contrast-125"
          style={{ backgroundImage: "url('/images/legend-player-shadow-bw.jpg')" }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">gavel</span> CORPUL DE ARBITRI OMOLOGAȚI
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase font-label">
              30 Arbitri Licențiați
            </span>
            <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-bold text-[10px] uppercase font-label border border-lime-400/30">
              <span className="material-symbols-outlined text-xs align-middle">flag</span> RIFA &amp; Ligue Pro România
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-md">
            Arbitri &amp; Oficiali de Joc
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
            Comisia Centrală a Arbitrilor din cadrul Ligue Pro. Descoperă cei 30 de arbitri omologați cu ecusoane oficiale inteligente, telemetrie avansată și delegări transparente.
          </p>

          {/* Search & Category Filter Pills */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Caută arbitru după nume, ecuson sau categorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center hover:bg-slate-700 transition"
                  title="Șterge căutarea"
                >
                  <span className="material-symbols-outlined align-middle text-sm">close</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
              {[
                { id: "all", label: "Toți (30)" },
                { id: "rifa", label: "RIFA Elite" },
                { id: "liga1", label: "Liga 1 Pro" },
                { id: "var", label: "VAR" },
                { id: "asistent", label: "Asistenți" },
                { id: "regional", label: "Regionali" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${selectedCategory === cat.id
                      ? "bg-lime-400 text-slate-950 font-black shadow-md"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Top 10 Spotlight Elite Referees Showcase */}
      {!searchQuery && selectedCategory === "all" && (
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
                Top 10 Arbitri de Elită &amp; Ecuson
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
              10 Arbitri Spotlight
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {spotlightReferees.map((ref, idx) => {
              const tel = getRefereeTelemetry(ref, idx);
              const humanImg = getSafeRefereePhoto(ref, idx);

              return (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.id}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-lime-500 dark:hover:border-lime-400/60 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
                >
                  {/* 9:16 Real Human Portrait View */}
                  <div className="aspect-[9/13] w-full rounded-t-2xl overflow-hidden relative bg-slate-950 border-b border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={humanImg}
                      alt={ref.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-start">
                        {/* Smart Badge Pill (Bulina with Hover Tooltip if > 2 words) */}
                        <RefereeBadgePill badge={ref.refereeBadge} />

                        <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-[11px] font-black flex items-center justify-center font-label">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-headline font-bold text-white text-base leading-tight">
                          {ref.name}
                        </h3>
                        <p className="text-[11px] text-slate-300 font-label">
                          {ref.experienceYears || 10} ani experiență
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Streamlined Stats Ribbon (No cards in cards) */}
                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                    <div className="py-2 px-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-center divide-x divide-slate-200 dark:divide-slate-800">
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white block">
                          {tel.matchesCount}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          Meciuri
                        </span>
                      </div>
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-amber-500 block">
                          {tel.yellowPerMatch}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          <span className="material-symbols-outlined text-xs align-middle">warning</span>/Meci
                        </span>
                      </div>
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-lime-600 dark:text-lime-400 block">
                          <span className="material-symbols-outlined">star</span> {tel.rating}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          Rating
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-label font-bold text-slate-500 group-hover:text-lime-600 dark:group-hover:text-lime-400">
                      <span>Fișă Oficială</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: Complete 30 Referees Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-slate-950 dark:bg-lime-400 rounded-full"></span>
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
              {searchQuery || selectedCategory !== "all"
                ? `Rezultate Căutare (${filtered.length} Arbitri)`
                : "Catalog Complet Corp Arbitri (30 Arbitri Licențiați)"}
            </h2>
          </div>
          <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
            {filtered.length} din {initialReferees.length} Arbitri
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 block">
              sports
            </span>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Niciun arbitru găsit pentru &quot;{searchQuery}&quot;.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Resetează filtrele sau încearcă o altă căutare.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((ref, idx) => {
              const tel = getRefereeTelemetry(ref, idx);
              const humanImg = getSafeRefereePhoto(ref, idx);

              return (
                <Link
                  key={ref.id}
                  href={`/referees/${ref.id}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-lime-500 dark:hover:border-lime-400/50 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
                >
                  {/* 9:16 Real Human Portrait View */}
                  <div className="aspect-[9/12] w-full rounded-t-2xl overflow-hidden relative bg-slate-950 border-b border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={humanImg}
                      alt={ref.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-start">
                        {/* Smart Badge Pill (Bulina with Hover Tooltip if > 2 words) */}
                        <RefereeBadgePill badge={ref.refereeBadge} />

                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-lime-400 text-[10px] font-bold font-label">
                          {ref.experienceYears || 10} Ani Exp.
                        </span>
                      </div>

                      <div>
                        <h3 className="font-headline font-bold text-white text-base leading-tight">
                          {ref.name}
                        </h3>
                        <p className="text-[11px] text-slate-300 font-label">
                          {tel.matchesCount} Meciuri • {tel.rating} <span className="material-symbols-outlined align-middle">star</span> Rating
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clean Streamlined Stats Ribbon (No cards in cards) */}
                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
                    {ref.bio && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-body line-clamp-2 leading-relaxed">
                        {ref.bio}
                      </p>
                    )}

                    <div className="py-2 px-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-center divide-x divide-slate-200 dark:divide-slate-800">
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white block">
                          {tel.matchesCount}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          Meciuri
                        </span>
                      </div>
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-amber-500 block">
                          {tel.yellowPerMatch}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          <span className="material-symbols-outlined text-xs align-middle">warning</span>/Meci
                        </span>
                      </div>
                      <div className="flex-1 px-1">
                        <span className="text-xs font-black font-mono text-lime-600 dark:text-lime-400 block">
                          <span className="material-symbols-outlined">star</span> {tel.rating}
                        </span>
                        <span className="text-[9px] font-label font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          Rating
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-label font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                      <span>Vezi Partide Arbitrate</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
