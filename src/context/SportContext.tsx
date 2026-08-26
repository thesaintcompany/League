"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SportType = "fotbal" | "baschet" | "volei" | "handbal" | "tenis";
export type FootballCategoryType = "all" | "masculin" | "feminin" | "futsal" | "juniori";

export interface SportOption {
  id: SportType;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  description: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  shortName: string;
  icon: string;
}

export const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: "fotbal",
    name: "Fotbal & Minifotbal",
    shortName: "Fotbal",
    icon: "⚽",
    accentColor: "text-lime-400 border-lime-400 bg-lime-400/10",
    badgeBg: "bg-lime-400 text-slate-950",
    description: "Campionate județene și naționale: Masculin, Feminin, Futsal și Juniori.",
  },
  {
    id: "baschet",
    name: "Baschet 5x5 & 3x3",
    shortName: "Baschet",
    icon: "🏀",
    accentColor: "text-amber-400 border-amber-400 bg-amber-400/10",
    badgeBg: "bg-amber-400 text-slate-950",
    description: "Ligi de baschet indoor, turnee de stradă 3x3 și competiții de elită.",
  },
  {
    id: "volei",
    name: "Volei Clasic & Beach",
    shortName: "Volei",
    icon: "🏐",
    accentColor: "text-cyan-400 border-cyan-400 bg-cyan-400/10",
    badgeBg: "bg-cyan-400 text-slate-950",
    description: "Campionate de volei în sală și turnee de volei pe plajă în arene omologate.",
  },
  {
    id: "handbal",
    name: "Handbal Național",
    shortName: "Handbal",
    icon: "🤾",
    accentColor: "text-purple-400 border-purple-400 bg-purple-400/10",
    badgeBg: "bg-purple-400 text-slate-950",
    description: "Turnee de handbal masculin și feminin, etape eliminatorii și clasamente.",
  },
  {
    id: "tenis",
    name: "Tenis & Padel",
    shortName: "Tenis",
    icon: "🎾",
    accentColor: "text-emerald-400 border-emerald-400 bg-emerald-400/10",
    badgeBg: "bg-emerald-400 text-slate-950",
    description: "Circuite de tenis simplu/dublu și turnee de padel pe arene dedicate.",
  },
];

export const FOOTBALL_CATEGORIES: CategoryOption[] = [
  { id: "all", name: "Toate", shortName: "Toate", icon: "🌐" },
  { id: "masculin", name: "Masculin (Seniori)", shortName: "Masculin", icon: "👨" },
  { id: "feminin", name: "Feminin", shortName: "Feminin", icon: "👩" },
  { id: "futsal", name: "Futsal / Sală", shortName: "Futsal", icon: "⚡" },
  { id: "juniori", name: "Juniori & Tineret", shortName: "Juniori", icon: "⭐" },
];

interface SportContextType {
  selectedSport: SportType;
  selectedCategory: string;
  currentSportMeta: SportOption;
  availableSports: SportOption[];
  footballCategories: CategoryOption[];
  isSportLocked: boolean;
  selectSport: (sport: SportType) => void;
  selectCategory: (category: string) => void;
  matchesCategoryFilter: (text: string) => boolean;
  unlockAndNavigateToMap: () => void;
}

const SportContext = createContext<SportContextType | undefined>(undefined);

const STORAGE_KEY = "proligue_selected_sport";
const CATEGORY_STORAGE_KEY = "proligue_selected_category";

export function SportProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMapPage = pathname === "/harta-romaniei";

  const [selectedSport, setSelectedSport] = useState<SportType>("fotbal");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // 1. Check URL query params
    const paramSport = searchParams?.get("sport")?.toLowerCase() as SportType | null;
    if (paramSport && AVAILABLE_SPORTS.some((s) => s.id === paramSport)) {
      setSelectedSport(paramSport);
      localStorage.setItem(STORAGE_KEY, paramSport);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY) as SportType | null;
      if (saved && AVAILABLE_SPORTS.some((s) => s.id === saved)) {
        setSelectedSport(saved);
      }
    }

    const paramCategory = searchParams?.get("cat")?.toLowerCase();
    if (paramCategory && FOOTBALL_CATEGORIES.some((c) => c.id === paramCategory)) {
      setSelectedCategory(paramCategory);
      localStorage.setItem(CATEGORY_STORAGE_KEY, paramCategory);
    } else {
      const savedCat = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (savedCat && FOOTBALL_CATEGORIES.some((c) => c.id === savedCat)) {
        setSelectedCategory(savedCat);
      }
    }
  }, [searchParams]);

  function selectSport(sport: SportType) {
    setSelectedSport(sport);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, sport);
      window.dispatchEvent(new CustomEvent("app-sport-changed", { detail: { sport } }));
    }
  }

  function selectCategory(category: string) {
    setSelectedCategory(category);
    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORY_STORAGE_KEY, category);
      window.dispatchEvent(new CustomEvent("app-category-changed", { detail: { category } }));
    }
  }

  function matchesCategoryFilter(text: string): boolean {
    if (selectedSport !== "fotbal" || selectedCategory === "all") return true;
    const lower = (text || "").toLowerCase();

    if (selectedCategory === "feminin") {
      return lower.includes("feminin") || lower.includes("fete") || lower.includes("wmn");
    }
    if (selectedCategory === "futsal") {
      return lower.includes("futsal") || lower.includes("minifotbal") || lower.includes("sala") || lower.includes("5v5") || lower.includes("6v6");
    }
    if (selectedCategory === "juniori") {
      return lower.includes("junior") || lower.includes("tineret") || lower.includes("u19") || lower.includes("u17") || lower.includes("u15") || lower.includes("copii");
    }
    if (selectedCategory === "masculin") {
      const isOther =
        lower.includes("feminin") ||
        lower.includes("fete") ||
        lower.includes("junior") ||
        lower.includes("tineret") ||
        lower.includes("u19") ||
        lower.includes("u17") ||
        lower.includes("futsal");
      return !isOther || lower.includes("masculin") || lower.includes("seniori");
    }
    return true;
  }

  function unlockAndNavigateToMap() {
    router.push("/harta-romaniei");
  }

  const currentSportMeta =
    AVAILABLE_SPORTS.find((s) => s.id === selectedSport) || AVAILABLE_SPORTS[0];

  return (
    <SportContext.Provider
      value={{
        selectedSport,
        selectedCategory,
        currentSportMeta,
        availableSports: AVAILABLE_SPORTS,
        footballCategories: FOOTBALL_CATEGORIES,
        isSportLocked: !isMapPage,
        selectSport,
        selectCategory,
        matchesCategoryFilter,
        unlockAndNavigateToMap,
      }}
    >
      {children}
    </SportContext.Provider>
  );
}

export function useSportContext() {
  const context = useContext(SportContext);
  if (!context) {
    throw new Error("useSportContext must be used within a SportProvider");
  }
  return context;
}
