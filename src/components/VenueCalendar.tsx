"use client";

import React, { useState } from "react";

interface MatchEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  championshipName: string;
  scheduledAt: string;
  venue: string;
  referee?: string;
  status: string;
}

interface VenueCalendarProps {
  venueName: string;
  county?: string;
  surface?: string;
  matches?: MatchEvent[];
}

export function VenueCalendar({ venueName, county, surface, matches = [] }: VenueCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter matches by selected date or list upcoming
  const upcomingMatches = matches.length > 0 ? matches : [
    {
      id: "demo-m1",
      homeTeam: "FC Timișoara Pro",
      awayTeam: "Real Banat",
      championshipName: "Campionatul Județean Timiș",
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      venue: venueName,
      referee: "Alexandru Popa",
      status: "scheduled",
    },
    {
      id: "demo-m2",
      homeTeam: "Spartans Bega",
      awayTeam: "Vulturii Lugoj",
      championshipName: "Liga 4 Vest",
      scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      venue: venueName,
      referee: "Mihai Ionescu",
      status: "scheduled",
    },
  ];

  function getGoogleCalendarUrl(m: MatchEvent) {
    const start = new Date(m.scheduledAt);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const startStr = start.toISOString().replace(/-|:|\.\d+/g, "");
    const endStr = end.toISOString().replace(/-|:|\.\d+/g, "");
    const title = encodeURIComponent(`[Meci Arenă] ${m.homeTeam} vs ${m.awayTeam}`);
    const details = encodeURIComponent(
      `Turneu: ${m.championshipName}. Locație: ${m.venue}. Arbitru: ${m.referee || "TBD"}`
    );
    const location = encodeURIComponent(m.venue);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startStr}/${endStr}`;
  }

  function handleCopyIcsLink() {
    const link = `${window.location.origin}/api/calendar/ics?venueId=all`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-500 text-2xl">calendar_month</span>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Calendar &amp; Disponibilitate Arenă
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-label mt-0.5">
            {venueName} • Județul {county || "România"} • Suprafață {surface || "Gazon Sintetic"}
          </p>
        </div>

        {/* Sync Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/calendar/ics?venueId=${encodeURIComponent(venueName)}`}
            download
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-headline font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-300 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-base text-cyan-500">download</span>
            <span>Export .ICS</span>
          </a>

          <button
            type="button"
            onClick={handleCopyIcsLink}
            className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span>{copiedLink ? "Link Copiat ✓" : "Sincronizare Google Calendar"}</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Status Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Selectează Data:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-lime-400"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-label font-bold">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Disponibil pentru Rezervare
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Meci Oficial Ocupat
          </span>
        </div>
      </div>

      {/* Events Timeline / Schedule List */}
      <div className="space-y-3">
        <h4 className="text-xs font-label font-bold uppercase tracking-widest text-slate-400">
          Meciuri &amp; Sloturi Ocupate în Arenă:
        </h4>

        {upcomingMatches.map((m) => {
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
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-lime-400/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-3 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400 font-headline font-black text-center shrink-0">
                  <span className="text-xs block uppercase font-mono">{timeFormatted}</span>
                  <span className="text-[10px] text-slate-400 font-label">{dateFormatted}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-label font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {m.championshipName}
                    </span>
                    {m.referee && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-label">
                        ⚖️ {m.referee}
                      </span>
                    )}
                  </div>
                  <h5 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                    {m.homeTeam} <span className="text-lime-500 font-black">VS</span> {m.awayTeam}
                  </h5>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <a
                  href={getGoogleCalendarUrl(m)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold font-label flex items-center gap-1.5 transition active:scale-95"
                >
                  <span className="text-sm">📅</span>
                  <span>Adaugă în Google Calendar</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
