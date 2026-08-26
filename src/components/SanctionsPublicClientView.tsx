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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Header Banner */}
      <section className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/15 blur-3xl pointer-events-none rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">gavel</span>
              COMISIA DE DISCIPLINĂ &amp; ARBITRAJ
            </span>
            <h1 className="text-2xl sm:text-4xl font-black italic font-headline uppercase tracking-tight text-white">
              Sancțiuni &amp; <span className="text-red-500">Suspendări Oficiale</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body">
              Evidența centralizată a avertismentelor, cartonașelor galbene/roșii și suspendărilor aplicate în campionatele PRO L4GUE.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintReport}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-headline font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
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
      <section className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-lime-400 transition"
            />
          </div>

          {/* Championship Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedChampionship}
              onChange={(e) => setSelectedChampionship(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-950 dark:focus:border-lime-400 transition"
            >
              <option value="all">🏆 Toate Campionatele</option>
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
              className={`px-3 py-2 rounded-xl text-xs font-bold font-label transition shrink-0 ${
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
              className={`px-3 py-2 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
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
              className={`px-3 py-2 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
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
              className={`px-3 py-2 rounded-xl text-xs font-bold font-label transition shrink-0 flex items-center gap-1 ${
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

      {/* Sanctions Table View */}
      <section className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold font-headline uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-red-600 rounded-full"></span>
            Tabel Evidență Sancțiuni ({filteredSanctions.length} înregistrări)
          </h2>
          <span className="text-[11px] font-label text-slate-500 dark:text-slate-400">
            Actualizat în timp real din rapoartele oficiale
          </span>
        </div>

        {filteredSanctions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-400 block">verified_user</span>
            <p className="font-bold text-sm text-slate-900 dark:text-white">Nu există sancțiuni conform filtrelor selectate.</p>
            <p className="text-xs">Toți jucătorii sunt eligibili și nu au avertismente active.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-400 uppercase font-label font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Jucător Sancționat</th>
                  <th className="p-4">Echipă &amp; Club</th>
                  <th className="p-4">Campionat</th>
                  <th className="p-4 text-center">Cartonașe</th>
                  <th className="p-4">Status Suspendare</th>
                  <th className="p-4">Motiv &amp; Notă Arbitru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSanctions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    {/* Player Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 text-white font-black flex items-center justify-center shrink-0 border border-slate-800">
                          {s.playerImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.playerImage} alt={s.playerName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            s.playerName[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                            {s.playerName} {s.number && <span className="text-xs font-mono text-slate-400">#{s.number}</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label">
                            {s.position || "Jucător"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="p-4 font-label">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: s.teamColor || "#84cc16" }}
                        ></span>
                        <span className="font-bold text-slate-900 dark:text-white">{s.teamName}</span>
                      </div>
                    </td>

                    {/* Championship */}
                    <td className="p-4 font-label">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {s.championshipName}
                      </span>
                    </td>

                    {/* Cards Chips */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 font-mono font-bold text-xs">
                        {s.yellowCards > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40">
                            🟨 {s.yellowCards}
                          </span>
                        )}
                        {s.redCards > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-red-600/20 text-red-700 dark:text-red-300 border border-red-500/40">
                            🟥 {s.redCards}
                          </span>
                        )}
                        {s.yellowCards === 0 && s.redCards === 0 && (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </div>
                    </td>

                    {/* Suspension Badge */}
                    <td className="p-4 font-label">
                      {s.isSuspended ? (
                        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit animate-pulse">
                          <span>🚫</span> SUSPENDAT ({s.suspensionRounds || 1} ETAPĂ)
                        </span>
                      ) : s.yellowCards >= 3 ? (
                        <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <span>⚠️</span> Risc Suspendare (3 🟨)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <span>✓</span> ELIGIBIL
                        </span>
                      )}
                    </td>

                    {/* Reason / Match note */}
                    <td className="p-4 text-xs">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {s.suspensionReason || s.lastEventNote || "Conform raportului oficial de meci"}
                      </p>
                      {s.lastMatchStage && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-label block mt-0.5">
                          📍 {s.lastMatchStage} {s.lastEventMinute ? `• Min. ${s.lastEventMinute}'` : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
