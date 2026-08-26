"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SportType = "fotbal" | "baschet" | "volei" | "handbal" | "tenis";

export interface SportOption {
  id: SportType;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  description: string;
}

export const AVAILABLE_SPORTS: SportOption[] = [
  {
    id: "fotbal",
    name: "Fotbal & Minifotbal",
    shortName: "Fotbal",
    icon: "⚽",
    accentColor: "text-lime-400 border-lime-400 bg-lime-400/10",
    badgeBg: "bg-lime-400 text-slate-950",
    description: "Campionate județene și naționale de fotbal 11v11, minifotbal 6v6 și futsal.",
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

interface SportContextType {
  selectedSport: SportType;
  currentSportMeta: SportOption;
  availableSports: SportOption[];
  isSportLocked: boolean; // True on inner pages (/campionat, /teams, etc.), False on /harta-romaniei
  selectSport: (sport: SportType) => void;
  unlockAndNavigateToMap: () => void;
}

const SportContext = createContext<SportContextType | undefined>(undefined);

const STORAGE_KEY = "proligue_selected_sport";

export function SportProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary page where choosing/switching sports is allowed
  const isMapPage = pathname === "/harta-romaniei";

  const [selectedSport, setSelectedSport] = useState<SportType>("fotbal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 1. Check URL query param first
    const paramSport = searchParams.get("sport")?.toLowerCase() as SportType | null;
    if (paramSport && AVAILABLE_SPORTS.some((s) => s.id === paramSport)) {
      setSelectedSport(paramSport);
      localStorage.setItem(STORAGE_KEY, paramSport);
      setHydrated(true);
      return;
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as SportType | null;
    if (saved && AVAILABLE_SPORTS.some((s) => s.id === saved)) {
      setSelectedSport(saved);
    }
    setHydrated(true);
  }, [searchParams]);

  function selectSport(sport: SportType) {
    setSelectedSport(sport);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, sport);
      window.dispatchEvent(new CustomEvent("app-sport-changed", { detail: { sport } }));
    }
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
        currentSportMeta,
        availableSports: AVAILABLE_SPORTS,
        isSportLocked: !isMapPage,
        selectSport,
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
