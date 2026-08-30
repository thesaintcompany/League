"use client";

import React from "react";
import "@/styles/arenaCard.css";
import Link from "next/link";



import { VenueItem } from "./PublicVenuesCatalog";
import { ARENA_SPORTS_OPTIONS, parseVenueSports } from "@/lib/constants";

interface ArenaCardProps {
  venue: VenueItem;
  priority?: boolean;
}

export function ArenaCard({ venue }: ArenaCardProps) {
  const img =
    venue.imageUrl ||
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";

  // Calculate EA Sports FC / FUT Style Overall Rating (OVR 75 - 99)
  const ratingScore = venue.rating || 4.5;
  const rawOvr = Math.round(
    ratingScore * 17 +
      (venue.floodlights ? 5 : 0) +
      (venue.capacity > 10000 ? 8 : venue.capacity > 1000 ? 5 : venue.capacity > 300 ? 3 : 1)
  );
  const ovr = Math.min(99, Math.max(78, rawOvr));

  // Card Tier Theme based on OVR
  const isElite = ovr >= 93;
  const isPro = ovr >= 88 && ovr < 93;
  const tierClass = isElite ? "tier-elite" : isPro ? "tier-pro" : "tier-verified";

  const tierBorder = isElite
    ? "border-amber-400/40 hover:border-amber-400 shadow-amber-500/10 hover:shadow-amber-500/20"
    : isPro
      ? "border-lime-400/40 hover:border-lime-400 shadow-lime-500/10 hover:shadow-lime-500/20"
      : "border-cyan-400/30 hover:border-cyan-400 shadow-cyan-500/10 hover:shadow-cyan-500/20";

  const tierBadgeBg = isElite
    ? "from-amber-500 via-amber-400 to-yellow-300 text-slate-950"
    : isPro
      ? "from-lime-400 via-emerald-400 to-lime-300 text-slate-950"
      : "from-cyan-400 via-sky-400 to-blue-400 text-slate-950";

  const tierName = isElite
    ? "ELITE ARENA"
    : isPro
      ? "PRO STADIUM"
      : "VERIFIED PITCH";

  // Format Capacity
  const formattedCapacity =
    venue.capacity >= 1000
      ? `${(venue.capacity / 1000).toFixed(venue.capacity % 1000 === 0 ? 0 : 1)}k`
      : `${venue.capacity}`;

  // Sport icon & display
  const sports = parseVenueSports(venue.sport);
  const primarySportId = sports[0] || "fotbal";
  const primarySportMeta = ARENA_SPORTS_OPTIONS.find((s) => s.id === primarySportId);
  const sportIcon = primarySportMeta?.icon || "stadium";
  const sportDisplayName =
    sports.length > 1
      ? `${primarySportMeta?.shortName || "Fotbal"} +${sports.length - 1}`
      : primarySportMeta?.shortName || "Fotbal";

  return (
    <div className={`relative group arena-card ${tierClass}`}>
      {/* Outer Glow Halo on Hover (EA FC Card Lighting) */}
      <div
        className={`absolute -inset-0.5 rounded-[28px] bg-gradient-to-r ${
          isElite
            ? "from-amber-500/40 via-yellow-400/20 to-amber-600/40"
            : isPro
              ? "from-lime-400/40 via-emerald-400/20 to-lime-500/40"
              : "from-cyan-500/40 via-blue-400/20 to-cyan-600/40"
        } opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none`}
      />

      <div
        className={`relative flex flex-col h-full rounded-[26px] bg-white dark:bg-slate-900/95 border transition-all duration-300 group-hover:-translate-y-2 overflow-hidden shadow-lg`}
      >
        {/* Holographic Specular Light Sweep (EA FC Card Sheen) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden z-20">
          <div className="absolute -inset-full w-[250%] h-[250%] bg-gradient-to-tr from-transparent via-white/20 dark:via-lime-300/15 to-transparent rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>

        {/* Pitch Turf Texture Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id={`pitch-${venue.id}`} width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pitch-${venue.id})`} />
          </svg>
        </div>

        {/* Top Header Card Visual Area */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-950 select-none z-10">
          {/* Main Stadium Photography */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={venue.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Cinematic Stadium Vignette & Lighting Beam */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* EA FC Ultimate Team OVR Shield (Top-Left) */}
          <div className="absolute top-3 left-3 z-20 flex flex-col items-center">
            <div
              className={`px-3 py-1.5 rounded-xl bg-gradient-to-br ${tierBadgeBg} shadow-lg shadow-black/40 border border-white/40 backdrop-blur-md flex flex-col items-center justify-center leading-none text-center`}
            >
              <span className="font-headline font-black text-2xl tracking-tighter italic leading-none drop-shadow-sm">
                {ovr}
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest font-label mt-0.5 opacity-90">
                OVR
              </span>
            </div>
            <span className="mt-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/20 text-[8px] font-black uppercase tracking-wider text-slate-200 font-label">
              {tierName}
            </span>
          </div>

          {/* Floating Badges (Top-Right) */}
          <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
            {/* Sport Pill */}
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/20 text-lime-400 text-[10px] font-black uppercase font-label tracking-wider shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">{sportIcon}</span>
              <span>{sportDisplayName}</span>
            </span>

            {/* Floodlights Glow Badge */}
            {venue.floodlights ? (
              <span className="px-2 py-0.5 rounded-lg bg-amber-400/90 text-slate-950 font-black text-[9px] font-label uppercase tracking-wide flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[11px]">light_mode</span>
                <span>Nocturnă</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 text-slate-400 font-bold text-[9px] font-label uppercase">
                Diurn
              </span>
            )}
          </div>

          {/* Quick HUD Chips on Image (Bottom-Left & Bottom-Right) */}
          <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            {/* Rating Stars Chip */}
            <div className="pointer-events-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-amber-400/30 text-amber-400 shadow-md">
              <span className="material-symbols-outlined text-[13px] fill-current">star</span>
              <span className="text-[11px] font-black font-label text-white">
                {ratingScore.toFixed(1)}
              </span>
              {venue.reviewCount ? (
                <span className="text-[10px] text-slate-400 font-medium font-label">
                  ({venue.reviewCount})
                </span>
              ) : null}
            </div>

            {/* Quick Action Chips: Call & GPS */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {venue.phone && (
                <a
                  href={`tel:${venue.phone.replace(/\s+/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`Sună la recepție: ${venue.phone}`}
                  className="p-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                </a>
              )}
              {venue.googleMapsUrl && (
                <a
                  href={venue.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Navigație GPS Google Maps"
                  className="p-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[15px]">navigation</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Body — Stadium Details & EA FC Stats HUD */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 z-10 bg-white dark:bg-slate-900/95">
          <div className="space-y-2">
            {/* Location Subtitle */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-label">
              <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined text-[14px] text-lime-600 dark:text-lime-400">
                  location_on
                </span>
                <span>{venue.location}</span>
                {venue.county && <span>• Jud. {venue.county}</span>}
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {venue.surface || "Sintetic"}
              </span>
            </div>

            {/* Arena Title */}
            <Link
              href={`/venues/${venue.id}`}
              className="block group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors"
            >
              <h3 className="font-headline font-black text-xl text-slate-900 dark:text-white uppercase italic tracking-tight leading-tight line-clamp-1">
                {venue.name}
              </h3>
            </Link>

            {/* Arena Specs / Address */}
            <p className="text-xs text-slate-600 dark:text-slate-400 font-body line-clamp-2 leading-relaxed min-h-[2rem]">
              {venue.specs || venue.address || "Bază sportivă modernă cu facilități de joc și nocturnă omologată."}
            </p>
          </div>

          {/* EA FC Stadium Attribute Matrix (4-Pillar Stat Grid) */}
          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 text-center font-label">
            {/* Stat 1: CAP */}
            <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                CAP
              </span>
              <span className="font-headline font-black text-xs text-slate-900 dark:text-white mt-0.5">
                {formattedCapacity}
              </span>
              <span className="text-[8px] text-slate-500 font-medium">locuri</span>
            </div>

            {/* Stat 2: SRF */}
            <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                SRF
              </span>
              <span className="font-headline font-black text-xs text-slate-900 dark:text-white mt-0.5 truncate max-w-full px-0.5">
                {venue.surface ? venue.surface.substring(0, 7) : "Gazon"}
              </span>
              <span className="text-[8px] text-slate-500 font-medium">teren</span>
            </div>

            {/* Stat 3: LGT */}
            <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                LGT
              </span>
              <span className="font-headline font-black text-xs text-slate-900 dark:text-white mt-0.5">
                {venue.floodlights ? "PRO" : "STD"}
              </span>
              <span className="text-[8px] text-slate-500 font-medium">nocturnă</span>
            </div>

            {/* Stat 4: RTG */}
            <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                RTG
              </span>
              <span className="font-headline font-black text-xs text-amber-500 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-0.5">
                <span>{ratingScore.toFixed(1)}</span>
              </span>
              <span className="text-[8px] text-slate-500 font-medium">scor</span>
            </div>
          </div>

          {/* Card Footer — Scoreboard Price & Dynamic Action Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-end gap-3">
            {/* Price block removed as per redesign */}

            <Link
              href={`/venues/${venue.id}`}
              className="w-full justify-center px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-lime-400 dark:hover:bg-lime-300 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-95 group-hover:shadow-lg"
            >
              <span>Detalii Arenă</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
