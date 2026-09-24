"use client";

import React, { useState, useRef, useEffect } from "react";

interface PlayerPhotoCarouselProps {
  playerName: string;
  playerNumber?: number | null;
  playerPosition?: string | null;
  teamName?: string | null;
  teamColor?: string | null;
  teamLogoUrl?: string | null;
  primaryImage?: string | null;
  secondaryImage?: string | null;
}

const DEFAULT_STANDING_PORTRAIT =
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&auto=format&fit=crop&q=85";

const DEFAULT_PROFILE_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85";

export function PlayerPhotoCarousel({
  playerName,
  playerNumber = 10,
  playerPosition = "Atacant Central",
  teamName = "Club Pro Ligue",
  teamColor = "#eab308",
  teamLogoUrl,
  primaryImage,
  secondaryImage,
}: PlayerPhotoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Touch gesture state for "slide left" / "slide right"
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 45; // in px

  const photo1 = primaryImage?.trim() || DEFAULT_STANDING_PORTRAIT;
  const photo2 = (secondaryImage?.trim() && secondaryImage.trim() !== photo1)
    ? secondaryImage.trim()
    : DEFAULT_PROFILE_PHOTO;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;

    // Slide Left: user swiped left -> go to secondary photo (slide 1)
    if (distance > minSwipeDistance) {
      setCurrentSlide(1);
      setHasInteracted(true);
    }
    // Slide Right: user swiped right -> go back to standing portrait (slide 0)
    else if (distance < -minSwipeDistance) {
      setCurrentSlide(0);
      setHasInteracted(true);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setCurrentSlide(0);
        setHasInteracted(true);
      } else if (e.key === "ArrowRight") {
        setCurrentSlide(1);
        setHasInteracted(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-3 select-none">
      {/* 1. Main Full-Height Standing Portrait Frame */}
      <div
        className="relative w-full aspect-[9/13] sm:aspect-[9/14] min-h-[480px] sm:min-h-[580px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/10 group cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle Athletic Stadium Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Carousel Slider Track */}
        <div
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* SLIDE 0: POZĂ PORTRET ÎN PICIOARE (FULL-BODY STANDING PORTRAIT) */}
          <div className="w-full h-full shrink-0 relative overflow-hidden flex items-end justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo1}
              alt={`${playerName} - Portret în picioare`}
              className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_STANDING_PORTRAIT;
              }}
            />

            {/* Stadium Glow Overlay & Silhouette Fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Badge Indicator for Slide 1 */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>1 / 2 • Portret Mare (În Picioare)</span>
              </span>
            </div>
          </div>

          {/* SLIDE 1: POZĂ DE PROFIL (PROFILE PHOTO) */}
          <div className="w-full h-full shrink-0 relative overflow-hidden flex items-end justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo2}
              alt={`${playerName} - Poză de profil`}
              className="w-full h-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_PROFILE_PHOTO;
              }}
            />

            {/* Profile Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />

            {/* Badge Indicator for Slide 2 */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-lime-400/40 text-lime-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span>2 / 2 • Poză de Profil</span>
              </span>
            </div>
          </div>
        </div>

        {/* Floating Navigation Arrows (Desktop & Mobile Click) */}
        {currentSlide === 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(1);
              setHasInteracted(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-950/85 hover:bg-lime-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-lime-400 flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group/btn"
            title="Slide stânga pentru a vedea poza de profil"
            aria-label="Poză de profil"
          >
            <span className="material-symbols-outlined text-2xl group-hover/btn:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </button>
        )}

        {currentSlide === 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(0);
              setHasInteracted(true);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-950/85 hover:bg-amber-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group/btn"
            title="Revenire la portretul mare în picioare"
            aria-label="Portret în picioare"
          >
            <span className="material-symbols-outlined text-2xl group-hover/btn:-translate-x-0.5 transition-transform">
              chevron_left
            </span>
          </button>
        )}

        {/* Animated Swipe Left Hint (Visible until first interaction) */}
        {currentSlide === 0 && !hasInteracted && (
          <div
            onClick={() => {
              setCurrentSlide(1);
              setHasInteracted(true);
            }}
            className="absolute bottom-24 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xl animate-bounce cursor-pointer hover:bg-slate-900"
          >
            <span>Glisează stânga pentru poza de profil</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        )}

        {/* Bottom Athlete Info Banner Overlay inside Card */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col justify-end pointer-events-none">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-label font-bold text-amber-400 uppercase tracking-widest block">
                {currentSlide === 0 ? "Portret Mare • În Picioare" : "Poză Oficială de Profil"}
              </span>
              <h2 className="font-headline font-black text-white text-2xl sm:text-3xl uppercase tracking-tight leading-tight truncate">
                {playerName}
              </h2>
              <p className="text-xs text-slate-300 font-label flex items-center gap-1.5 truncate">
                <span className="font-mono font-bold text-lime-400">#{playerNumber}</span>
                <span>•</span>
                <span>{playerPosition}</span>
                <span>•</span>
                <span className="text-slate-400">{teamName}</span>
              </p>
            </div>

            {/* Club Crest Mini */}
            {teamLogoUrl ? (
              <img
                src={teamLogoUrl}
                alt={teamName || "Club"}
                className="w-12 h-12 rounded-xl object-contain bg-slate-900/80 p-1 border border-slate-700 shrink-0 shadow-md"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-headline font-black text-white text-sm shrink-0 shadow-md"
                style={{ backgroundColor: teamColor || "#84cc16" }}
              >
                {teamName ? teamName.substring(0, 3).toUpperCase() : "PRO"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Minimalist Line Indicator (No text, distinct colored line per slide) */}
      <div className="flex items-center justify-center gap-2.5 py-1.5">
        <button
          type="button"
          onClick={() => {
            setCurrentSlide(0);
            setHasInteracted(true);
          }}
          title="Slide 1: Portret în Picioare"
          aria-label="Slide 1: Portret în Picioare"
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 0
              ? "w-12 sm:w-14 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.75)]"
              : "w-4 sm:w-5 bg-slate-700/80 hover:bg-slate-600"
          }`}
        />

        <button
          type="button"
          onClick={() => {
            setCurrentSlide(1);
            setHasInteracted(true);
          }}
          title="Slide 2: Poză de Profil"
          aria-label="Slide 2: Poză de Profil"
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 1
              ? "w-12 sm:w-14 bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.75)]"
              : "w-4 sm:w-5 bg-slate-700/80 hover:bg-slate-600"
          }`}
        />
      </div>
    </div>
  );
}
