"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublicHeaderProps {
  currentTab?: "campionat" | "romania-map" | "brackets" | "venues" | "players" | "referees";
}

export function PublicHeader({ currentTab }: PublicHeaderProps) {
  const pathname = usePathname();

  const isCampionat = currentTab === "campionat" || pathname === "/campionat" || pathname === "/liga";
  const isRomaniaMap = currentTab === "romania-map" || pathname === "/harta-romaniei";
  const isBrackets = currentTab === "brackets" || pathname === "/brackets" || pathname === "/harta-campionat";
  const isVenues = currentTab === "venues" || pathname.startsWith("/venues");
  const isPlayers = currentTab === "players" || pathname.startsWith("/players");
  const useReferees = currentTab === "referees" || pathname.startsWith("/referees");

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 h-20 px-6 lg:px-12 flex justify-between items-center text-white font-body">
      {/* Left: Brand & Badge & Navigation */}
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <Link href="/campionat" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-lime-400/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="text-2xl font-black italic tracking-tight text-white uppercase font-headline block leading-none">
              Ligue
            </span>
            <span className="text-[9px] font-label font-bold text-lime-400 tracking-widest uppercase">
              Pro România
            </span>
          </div>
        </Link>

        {/* Live Season Pulsing Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold font-label">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          SEZONUL 2025-2026 LIVE
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-label font-bold uppercase tracking-wider text-slate-300 ml-4">
          <Link
            href="/campionat"
            className={`transition py-1 ${
              isCampionat
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            Campionat
          </Link>
          <Link
            href="/harta-romaniei"
            className={`transition py-1 flex items-center gap-1 ${
              isRomaniaMap
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            <span>🇷🇴</span> Harta României
          </Link>
          <Link
            href="/brackets"
            className={`transition py-1 flex items-center gap-1 ${
              isBrackets
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            <span>🎲</span> Harta Campionat (Zaruri)
          </Link>
          <Link
            href="/venues"
            className={`transition py-1 ${
              isVenues
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            Arene &amp; Stadioane
          </Link>
          <Link
            href="/players"
            className={`transition py-1 ${
              isPlayers
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            Golgheteri
          </Link>
          <Link
            href="/referees"
            className={`transition py-1 ${
              useReferees
                ? "text-lime-400 font-black border-b-2 border-lime-400"
                : "hover:text-lime-400"
            }`}
          >
            Corp Arbitri
          </Link>
        </nav>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-label font-bold uppercase tracking-wider transition border border-white/15 active:scale-95"
        >
          Panou Organizator ↗
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-headline font-black uppercase tracking-wider shadow-lg shadow-lime-400/20 transition active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          Portal Autentificare
        </Link>
      </div>
    </header>
  );
}
