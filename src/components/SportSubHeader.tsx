"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSportContext } from "@/context/SportContext";

interface SportSubHeaderProps {
  variant?: "default" | "dark";
}

export function SportSubHeader({ variant }: SportSubHeaderProps) {
  const pathname = usePathname();
  const {
    selectedSport,
    selectedCategory,
    currentSportMeta,
    availableSports,
    activeCategories,
    selectSport,
    selectCategory,
  } = useSportContext();

  const sportsScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = variant === "dark";
  const isMapPage = pathname === "/harta-romaniei";

  // State to control categories visibility (auto-retractable with delay)
  const [showCategories, setShowCategories] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Clear timer helper
  const clearHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  // Start auto-hide delay timer (5 seconds)
  const startHideTimer = useCallback((delayMs: number = 5000) => {
    clearHideTimer();
    autoHideTimerRef.current = setTimeout(() => {
      setShowCategories(false);
    }, delayMs);
  }, [clearHideTimer]);

  // When sport changes, auto-reveal categories temporarily (if sport has sub-categories)
  const handleSportSelect = (sportId: string) => {
    selectSport(sportId as any);
    setShowCategories(true);
    startHideTimer(5500);
  };

  // Reset/pause timer when hovered
  const handleMouseEnter = () => {
    setIsHovered(true);
    clearHideTimer();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startHideTimer(3500);
  };

  // Toggle categories manually
  const toggleCategories = () => {
    if (showCategories) {
      clearHideTimer();
      setShowCategories(false);
    } else {
      setShowCategories(true);
      startHideTimer(6000);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  // Find active category label
  const activeCategoryObj = activeCategories?.find((c) => c.id === selectedCategory);
  const isCustomCategoryActive = selectedCategory && selectedCategory !== "all";

  return (
    <div
      className={`border-b transition-colors duration-200 shadow-sm relative z-40 ${
        isDark
          ? "bg-slate-900/95 text-white border-slate-800"
          : "bg-slate-100/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800/80 backdrop-blur-md"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-1.5 sm:py-2 space-y-1">
        {/* Row 1: Sport Selection (Smooth Carousel on Mobile / Flex on Desktop) */}
        <div className="w-full flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-headline font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 shrink-0">
              Sport:
            </span>
          </div>

          {/* Smooth Horizontal Carousel Container */}
          <div className="relative flex-1 min-w-0 overflow-hidden">
            <div
              ref={sportsScrollRef}
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-0.5"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {availableSports.map((sport) => {
                const isActive = selectedSport === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => handleSportSelect(sport.id)}
                    className={`px-2.5 py-1 rounded-xl font-headline text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 ${
                      isActive
                        ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm ring-1 ring-lime-400/50"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold border border-slate-300 dark:border-slate-700/60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{sport.icon}</span>
                    <span>{sport.shortName}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 dark:bg-slate-950 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Button for Sub-Categories (Shows category badge when retracted) */}
          {activeCategories && activeCategories.length > 1 && (
            <button
              type="button"
              onClick={toggleCategories}
              className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider transition border flex items-center gap-1 shrink-0 shadow-sm ${
                showCategories
                  ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-slate-700"
                  : isCustomCategoryActive
                  ? "bg-lime-400 text-slate-950 border-lime-400 font-black"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700"
              }`}
              title="Afișează / Ascunde filtrele de categorii"
            >
              <span className="material-symbols-outlined text-[14px]">
                {showCategories ? "expand_less" : "tune"}
              </span>
              <span className="hidden sm:inline">
                {showCategories
                  ? "Ascunde"
                  : isCustomCategoryActive
                  ? activeCategoryObj?.shortName || "Filtru"
                  : "Categorii"}
              </span>
              <span className="material-symbols-outlined text-[14px] sm:hidden">
                {showCategories ? "expand_less" : "expand_more"}
              </span>
            </button>
          )}
        </div>

        {/* Row 2: Retractable Sub-Categories (Smooth Slide Up/Down with Fade & Height Animation) */}
        {activeCategories && activeCategories.length > 1 && (
          <div
            className={`w-full transition-all duration-500 ease-in-out overflow-hidden ${
              showCategories
                ? "max-h-20 opacity-100 translate-y-0 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 pointer-events-auto"
                : "max-h-0 opacity-0 -translate-y-2 pt-0 border-t-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-lime-500">tune</span>
                  Categorii:
                </span>
              </div>

              {/* Carousel of Categories */}
              <div className="relative flex-1 min-w-0 overflow-hidden">
                <div
                  ref={categoriesScrollRef}
                  className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain py-0.5"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {activeCategories.map((cat) => {
                    const isCatActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          selectCategory(cat.id);
                          // Keep visible for a moment then smooth retract
                          startHideTimer(3500);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 shadow-sm ${
                          isCatActive
                            ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black ring-1 ring-lime-400/50"
                            : "bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                        <span>{cat.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  clearHideTimer();
                  setShowCategories(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                title="Ascunde categorii"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
