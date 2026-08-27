"use client";

import React, { useState } from "react";

interface RefereeMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  championshipName: string;
  county: string;
  venue: string;
  scheduledAt: string;
  role: string; // "Arbitru Principal", "Asistent 1", "Asistent 2", "Al 4-lea  "
}

interface RefereeCalendarProps {
  refereeName: string;
  refereeCounty?: string;
  matches?: RefereeMatch[];
}

export function RefereeCalendar({
  refereeName,
  refereeCounty = "Timiș",
  matches = [],
}: RefereeCalendarProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const defaultMatches: RefereeMatch[] = [
    {
      id: "ref-m1",
      homeTeam: "CSC Dumbrăvița",
      awayTeam: "Politehnica Timișoara",
      championshipName: "Campionat Județean Timiș",
      county: refereeCounty,
      venue: "Arena Știința Timișoara",
      scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      role: "Arbitru Principal",
    },
    {
      id: "ref-m2",
      homeTeam: "Ripensia Timișoara",
      awayTeam: "Unirea Sânnicolau Mare",
      championshipName: "Liga 4 Vest",
      county: refereeCounty,
      venue: "Stadion Electrica",
      scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      role: "Arbitru Principal",
    },
  ];

  const assignedMatches = matches.length > 0 ? matches : defaultMatches;

  function getGoogleCalendarUrl(m: RefereeMatch) {
    const start = new Date(m.scheduledAt);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const startStr = start.toISOString().replace(/-|:|\.\d+/g, "");
    const endStr = end.toISOString().replace(/-|:|\.\d+/g, "");
    const title = encodeURIComponent(`[Delegare Arbitraj] ${m.homeTeam} vs ${m.awayTeam}`);
    const details = encodeURIComponent(
      `Rol: ${m.role}. Turneu: ${m.championshipName}. Județ: ${m.county}. Locație: ${m.venue}`
    );
    const location = encodeURIComponent(m.venue);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startStr}/${endStr}`;
  }

  function handleCopyIcsLink() {
    const link = `${window.location.origin}/api/calendar/ics?referee=${encodeURIComponent(
      refereeName
    )}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-2xl">sports</span>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Calendar &amp; Delegări Arbitraj
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-label mt-0.5">
            : <strong>{refereeName}</strong> • Județ de Înregistrare: <strong>{refereeCounty}</strong>
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/calendar/ics?referee=${encodeURIComponent(refereeName)}`}
            download
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-headline font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-300 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-base text-cyan-500">download</span>
            <span>Export .ICS</span>
          </a>

          <button
            type="button"
            onClick={handleCopyIcsLink}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-headline font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span>{copiedLink ? "Link Copiat ✓" : "Sincronizare Google Calendar"}</span>
          </button>
        </div>
      </div>

      {/* Availability Status Badge / Toggle */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-xl">location_on</span>
          <div>
            <span className="text-xs font-headline font-bold text-slate-900 dark:text-white block">
              Criteriu de Delegare: Județul {refereeCounty}
            </span>
            <span className="text-[11px] font-label text-slate-500 dark:text-slate-400">
              Platforma prioritizează meciurile din județul tău de reședință
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAvailable(!isAvailable)}
          className={`px-4 py-2 rounded-xl font-headline font-black text-xs uppercase tracking-wider transition active:scale-95 ${isAvailable
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
            }`}
        >
          {isAvailable ? "✓ Calendar Liber (Activ)" : "✕ Indisponibil"}
        </button>
      </div>

      {/* Assigned Matches List */}
      <div className="space-y-3">
        <h4 className="text-xs font-label font-bold uppercase tracking-widest text-slate-400">
          Meciuri  e Delegate:
        </h4>

        {assignedMatches.map((m) => {
          const dateObj = new Date(m.scheduledAt);
          const dateFormatted = dateObj.toLocaleDateString("ro-RO", {
            weekday: "short",
            day: "numeric",
            month: "long",
          });
          const timeFormatted = dateObj.toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-amber-400/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-headline font-black text-center shrink-0">
                  <span className="text-xs block uppercase font-mono">{timeFormatted}</span>
                  <span className="text-[10px] text-slate-400 font-label">{dateFormatted}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-label font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      {m.role}
                    </span>
                    <span className="text-xs font-label font-medium text-slate-500 dark:text-slate-400">
                      {m.championshipName} ({m.county})
                    </span>
                  </div>
                  <h5 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                    {m.homeTeam} <span className="text-amber-500 font-black">VS</span> {m.awayTeam}
                  </h5>
                  <p className="text-xs font-label text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {m.venue}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <a
                  href={getGoogleCalendarUrl(m)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold font-label flex items-center gap-1.5 transition active:scale-95"
                >
                  <span className="text-sm material-symbols-outlined">calendar_month</span>
                  <span>Google Calendar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
