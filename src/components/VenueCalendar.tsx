"use client";

import React, { useState } from "react";

interface MatchEvent {
  id: string;
  type?: string;
  homeTeam: string;
  awayTeam: string;
  championshipName: string;
  scheduledAt: string;
  endTime?: string;
  venue: string;
  referee?: string;
  status: string;
}

interface VenueCalendarProps {
  venueId?: string;
  venueName: string;
  county?: string;
  surface?: string;
  matches?: MatchEvent[];
  onDeleteMatch?: (id: string) => Promise<void>;
}

export function VenueCalendar({
  venueId,
  venueName,
  county,
  surface,
  matches = [],
  onDeleteMatch,
}: VenueCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter matches by selected date or list upcoming
  const upcomingMatches = matches;


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
    if (!venueId) return;
    const link = `${window.location.origin}/api/calendar/ics?venueId=${encodeURIComponent(venueId)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Sigur doriți să anulați/ștergeți acest eveniment din calendarul arenei?")) return;
    setDeletingId(id);
    try {
      if (onDeleteMatch) {
        await onDeleteMatch(id);
      }
    } finally {
      setDeletingId(null);
    }
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
            href={venueId ? `/api/calendar/ics?venueId=${encodeURIComponent(venueId)}` : "#"}
            download
            className={`px-3.5 py-2 rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border ${venueId
                ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 pointer-events-none"
              }`}
          >
            <span className="material-symbols-outlined text-base text-cyan-500">download</span>
            <span>Export .ICS</span>
          </a>

          <button
            type="button"
            onClick={handleCopyIcsLink}
            disabled={!venueId}
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
            Meci   Ocupat
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
                        <span className="material-symbols-outlined text-sm">gavel</span> {m.referee}
                      </span>
                    )}
                  </div>
                  <h5 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
                    {m.type === "blocked" ? (
                      <span className="text-amber-500">{m.homeTeam}</span>
                    ) : (
                      <>
                        {m.homeTeam} <span className="text-lime-500 font-black">VS</span> {m.awayTeam}
                      </>
                    )}
                  </h5>
                </div>
              </div>

              <a
                href={getGoogleCalendarUrl(m)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold font-label flex items-center gap-1.5 transition active:scale-95"
              >
                <span className="text-sm material-symbols-outlined">calendar_month</span>
                <span className="hidden sm:inline">Google</span>
              </a>

              {onDeleteMatch && (
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold font-label flex items-center gap-1.5 transition active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>{deletingId === m.id ? "..." : "Șterge"}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
