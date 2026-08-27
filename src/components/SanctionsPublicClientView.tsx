"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export interface SanctionItem {
  id: string;
  playerName: string;
  playerImage?: string | null;
  position?: string | null;
  number?: number | null;
  teamId: string;
  teamName: string;
  teamColor?: string | null;
  teamLogo?: string | null;
  championshipId: string;
  championshipName: string;
  yellowCards: number;
  redCards: number;
  isSuspended: boolean;
  suspensionReason?: string | null;
  suspensionRounds?: number;
  lastMatchStage?: string | null;
  lastEventNote?: string | null;
  lastEventMinute?: number | null;
}

interface SanctionsPublicClientProps {
  sanctions: SanctionItem[];
  championships: { id: string; name: string; sport: string }[];
}

export function SanctionsPublicClientView({ sanctions, championships }: SanctionsPublicClientProps) {
  const [selectedChampionship, setSelectedChampionship] = useState<string>("all");
  const [cardFilter, setCardFilter] = useState<"all" | "suspended" | "red" | "yellow">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtering
  const filteredSanctions = useMemo(() => {
    return sanctions.filter((item) => {
      const matchesChamp = selectedChampionship === "all" || item.championshipId === selectedChampionship;
      
      let matchesCard = true;
      if (cardFilter === "suspended") matchesCard = item.isSuspended;
      else if (cardFilter === "red") matchesCard = item.redCards > 0;
      else if (cardFilter === "yellow") matchesCard = item.yellowCards > 0;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.playerName.toLowerCase().includes(q) ||
        item.teamName.toLowerCase().includes(q) ||
        item.championshipName.toLowerCase().includes(q);

      return matchesChamp && matchesCard && matchesSearch;
    });
  }, [sanctions, selectedChampionship, cardFilter, searchQuery]);

  // Aggregated Stats
  const totalYellow = useMemo(() => sanctions.reduce((acc, s) => acc + s.yellowCards, 0), [sanctions]);
  const totalRed = useMemo(() => sanctions.reduce((acc, s) => acc + s.redCards, 0), [sanctions]);
  const totalSuspended = useMemo(() => sanctions.filter((s) => s.isSuspended).length, [sanctions]);

  // Generate PDF / Print Report
  function handlePrintReport() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RAPORT OFICIAL SANCȚIUNI & SUSPENDĂRI • PRO L4GUE</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; }
          .header { border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 25px; flex-direction: row; justify-content: space-between; display: flex; }
          .title { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 10px; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .badge-suspended { background: #fef2f2; color: #991b1b; padding: 3px 8px; border-radius: 12px; font-weight: 800; font-size: 10px; }
          .badge-warning { background: #fefce8; color: #854d0e; padding: 3px 8px; border-radius: 12px; font-weight: 800; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">PRO L4GUE • COMISIA DE DISCIPLINĂ</div>
            <div class="subtitle">RAPORT OFICIAL SANCȚIUNI ȘI SUSPENDĂRI JUCĂTORI</div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <div>DATA: ${new Date().toLocaleDateString("ro-RO")}</div>
            <div style="font-weight: 800; color: #dc2626;">DOCUMENT OMOLOGAT</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Jucător</th>
              <th>Echipă</th>
              <th>Campionat</th>
              <th>Cartonașe</th>
              <th>Status Suspendare</th>
              <th>Motiv / Notă</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSanctions
              .map(
                (s) => `
              <tr>
                <td><strong>${s.playerName}</strong> ${s.number ? `#${s.number}` : ""}</td>
                <td>${s.teamName}</td>
                <td>${s.championshipName}</td>
                <td>🟨 ${s.yellowCards} | 🟥 ${s.redCards}</td>
                <td>
                  ${
                    s.isSuspended
                      ? `<span class="badge-suspended">SUSPENDAT (${s.suspensionRounds || 1} ETAPĂ)</span>`
                      : `<span class="badge-warning">ELEGIBIL</span>`
                  }
                </td>
                <td>${s.suspensionReason || s.lastEventNote || "Avertisment comisie"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 font-body">
      {/* Header Banner */}
      <section className="relative rounded-3xl bg-slate-950 text-white p-5 sm:p-10 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/15 blur-3xl pointer-events-none rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">gavel</span>
              COMISIA DE DISCIPLINĂ &amp; ARBITRAJ
            </span>
            <h1 className="text-xl sm:text-4xl font-black italic font-headline uppercase tracking-tight text-white">
              Sancțiuni &amp; <span className="text-red-500">Suspendări Oficiale</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body">
              Evidența centralizată a avertismentelor, cartonașelor galbene/roșii și suspendărilor aplicate în campionatele PRO L4GUE.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-headline font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Descarcă Raport PDF</span>
          </button>
        </div>
      </section>

      {/* Strategic Compact Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: Yellow Cards */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Cartonașe Galbene
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
              🟨
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-headline text-amber-600 dark:text-amber-400">
              {totalYellow}
            </span>
            <span className="text-[10px] font-label font-bold text-slate-500">Avertismente</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label mt-1 truncate">
            Cumulate în ligă
          </p>
        </div>

        {/* Metric 2: Red Cards */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-red-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Cartonașe Roșii
            </span>
            <div className="w-7 h-7 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
              🟥
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-headline text-red-600 dark:text-red-400">
              {totalRed}
            </span>
            <span className="text-[10px] font-label font-bold text-red-500">Eliminări</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label mt-1 truncate">
            Direct &amp; dublu galben
          </p>
        </div>

        {/* Metric 3: Active Suspensions */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-red-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Jucători Suspendați
            </span>
            <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
              🚫
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-headline text-red-600 dark:text-red-400">
              {totalSuspended}
            </span>
            <span className="text-[10px] font-label font-bold text-red-600 dark:text-red-400">
              Ineligibili
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label mt-1 truncate">
            Suspendări etapa viitoare
          </p>
        </div>

        {/* Metric 4: Standard Regulation */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Regulament Cartonașe
            </span>
            <div className="w-7 h-7 rounded-xl bg-lime-400/15 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">rule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-headline text-slate-900 dark:text-white">
              4 🟨
            </span>
            <span className="text-[10px] font-label font-bold text-lime-600 dark:text-lime-400">
              = 1 Etapă
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label mt-1 truncate">
            Suspendare la 4 galbene
          </p>
        </div>
      </section>

      {/* Filter Tray */}
      <section className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Live Search */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Caută jucător, echipă sau ligă..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-lime-400 transition"
            />
          </div>

          {/* Championship Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedChampionship}
              onChange={(e) => setSelectedChampionship(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-950 dark:focus:border-lime-400 transition"
            >
              <option value="all">Toate Campionatele</option>
              {championships.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.sport})
                </option>
              ))}
            </select>
          </div>

          {/* Sanction Status Filter */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setCardFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition shrink-0 ${
                cardFilter === "all"
                  ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Toate
            </button>
            <button
              type="button"
              onClick={() => setCardFilter("suspended")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
                cardFilter === "suspended"
                  ? "bg-red-600 text-white font-black shadow-sm"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              <span>🚫</span> Suspendate ({totalSuspended})
            </button>
            <button
              type="button"
              onClick={() => setCardFilter("red")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
                cardFilter === "red"
                  ? "bg-red-600 text-white font-black shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span>🟥</span> Roșii
            </button>
            <button
              type="button"
              onClick={() => setCardFilter("yellow")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
                cardFilter === "yellow"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span>🟨</span> Galbene
            </button>
          </div>
        </div>
      </section>

      {/* Sanctions View Container */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xs sm:text-sm font-bold font-headline uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-4 bg-red-600 rounded-full"></span>
            Evidență Sancțiuni ({filteredSanctions.length})
          </h2>
          <span className="text-[10px] font-label text-slate-500 dark:text-slate-400 hidden sm:inline">
            1 Linie per înregistrare &bull; Actualizat live
          </span>
        </div>

        {filteredSanctions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-400 block">verified_user</span>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Nu există sancțiuni conform filtrelor selectate.</p>
            <p className="text-xs">Toți jucătorii sunt eligibili și nu au avertismente active.</p>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* DESKTOP TABLE VIEW (Single-Line 1-Line Row, No Text Wrap) */}
            {/* ------------------------------------------------------------- */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-body text-slate-700 dark:text-slate-300 border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-400 uppercase font-label font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Jucător Sancționat</th>
                    <th className="py-3 px-4 whitespace-nowrap">Echipă &amp; Club</th>
                    <th className="py-3 px-4 whitespace-nowrap">Campionat</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Cartonașe</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status Suspendare</th>
                    <th className="py-3 px-4 whitespace-nowrap">Motiv / Abatere</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredSanctions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      {/* Player */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-950 text-lime-400 border border-slate-800 flex items-center justify-center text-xs font-black shrink-0">
                            {s.playerName[0].toUpperCase()}
                          </div>
                          <span className="truncate max-w-[160px]" title={s.playerName}>
                            {s.playerName} {s.number && <span className="text-[10px] font-mono text-slate-400">#{s.number}</span>}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4 whitespace-nowrap font-label">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                            style={{ backgroundColor: s.teamColor || "#84cc16" }}
                          ></span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={s.teamName}>
                            {s.teamName}
                          </span>
                        </div>
                      </td>

                      {/* Championship */}
                      <td className="py-3 px-4 whitespace-nowrap font-label">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold truncate max-w-[140px] inline-block" title={s.championshipName}>
                          {s.championshipName}
                        </span>
                      </td>

                      {/* Cards Chips */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-[11px]">
                          {s.yellowCards > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                              🟨 {s.yellowCards}
                            </span>
                          )}
                          {s.redCards > 0 && (
                            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-700 dark:text-red-300 border border-red-500/40">
                              🟥 {s.redCards}
                            </span>
                          )}
                          {s.yellowCards === 0 && s.redCards === 0 && (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap font-label">
                        {s.isSuspended ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs inline-flex items-center gap-1 animate-pulse">
                            <span>🚫</span> SUSPENDAT ({s.suspensionRounds || 1} ETAPĂ)
                          </span>
                        ) : s.yellowCards >= 3 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <span>⚠️</span> Risc (3 🟨)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <span>✓</span> ELIGIBIL
                          </span>
                        )}
                      </td>

                      {/* Reason Single Line */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[220px] inline-block align-middle" title={s.suspensionReason || s.lastEventNote || "Avertisment oficial"}>
                          {s.suspensionReason || s.lastEventNote || "Avertisment oficial"}
                        </span>
                        {s.lastMatchStage && (
                          <span className="ml-2 text-[10px] font-mono text-slate-400 font-normal">
                            ({s.lastMatchStage})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE COMPACT CARDS VIEW (Elevated UI/UX 1-Thumb Compact) */}
            {/* ------------------------------------------------------------- */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredSanctions.map((s) => (
                <div key={s.id} className="p-3.5 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  {/* Top Bar: Player & Team */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-950 text-lime-400 border border-slate-800 flex items-center justify-center text-xs font-black shrink-0">
                        {s.playerName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline font-bold text-slate-900 dark:text-white text-xs truncate">
                          {s.playerName} {s.number && <span className="text-[10px] font-mono text-slate-400">#{s.number}</span>}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 border border-black/20"
                            style={{ backgroundColor: s.teamColor || "#84cc16" }}
                          ></span>
                          <span className="text-[10px] font-label font-bold text-slate-600 dark:text-slate-300 truncate">
                            {s.teamName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Suspension Badge */}
                    <div className="shrink-0">
                      {s.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5 animate-pulse">
                          <span>🚫</span> SUSPENDAT ({s.suspensionRounds || 1}E)
                        </span>
                      ) : s.yellowCards >= 3 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <span>⚠️</span> RISC (3 🟨)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <span>✓</span> ELIGIBIL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Cards & Reason */}
                  <div className="flex items-center justify-between text-[10px] font-label text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60 gap-2">
                    <div className="inline-flex items-center gap-1 font-mono font-bold shrink-0">
                      {s.yellowCards > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                          🟨 {s.yellowCards}
                        </span>
                      )}
                      {s.redCards > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-red-600/20 text-red-700 dark:text-red-300 border border-red-500/40">
                          🟥 {s.redCards}
                        </span>
                      )}
                    </div>

                    <div className="truncate text-right font-medium text-slate-700 dark:text-slate-300">
                      {s.suspensionReason || s.lastEventNote || "Avertisment comisie"} {s.lastMatchStage ? `• ${s.lastMatchStage}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
