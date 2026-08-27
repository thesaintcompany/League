import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function UpcomingMatchesPage({
  searchParams,
}: {
  searchParams?: { sport?: string };
}) {
  const championships = await prisma.championship.findMany({
    where: { isBracketPublished: true },
    include: {
      teams: {
        include: { players: true },
        orderBy: { name: "asc" },
      },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ scheduledAt: "asc" }, { round: "asc" }],
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const upcomingMatches = championships.flatMap((champ) =>
    (champ.matches || [])
      .filter((m) => m.status !== "finished")
      .map((m) => ({
        id: m.id,
        scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
        status: m.status,
        round: m.round,
        stage: m.stage,
        venue: m.venue,
        homeTeam: {
          id: m.homeTeam?.id || "",
          name: m.homeTeam?.name || "Echipă A",
          shortName: m.homeTeam?.shortName || undefined,
          color: m.homeTeam?.color || undefined,
        },
        awayTeam: {
          id: m.awayTeam?.id || "",
          name: m.awayTeam?.name || "Echipă B",
          shortName: m.awayTeam?.shortName || undefined,
          color: m.awayTeam?.color || undefined,
        },
        championship: {
          id: champ.id,
          name: champ.name,
          sport: champ.sport,
          season: champ.season,
          shareCode: champ.shareCode,
        },
      }))
  );

  upcomingMatches.sort((a, b) => {
    const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
    const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
    return aTime - bTime;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader currentTab="brackets" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6 sm:space-y-8">
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black italic font-headline uppercase tracking-tight">
                Meciuri Programate
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Lista următoarelor meciuri din toate campionatele publice. Apasă pe un meci pentru detalii sau promovează evenimentul.
              </p>
            </div>
            <span className="text-[10px] font-label font-bold uppercase text-slate-400">
              {upcomingMatches.length} meciuri
            </span>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="card p-12 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-400 block">event_busy</span>
              <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white">
                Momentan nu există meciuri programate
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Organizatorii nu au programat meciuri încă. Revino mai târziu sau explorează campionatele disponibile.
              </p>
              <Link
                href="/harta-romaniei"
                className="inline-block px-5 py-2.5 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase shadow-md"
              >
                Vezi Campionate
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((m) => {
                const dateObj = m.scheduledAt ? new Date(m.scheduledAt) : null;
                const dateLabel = dateObj ? dateObj.toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" }) : "Data TBD";
                const timeLabel = dateObj ? dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) : "Ora TBD";

                return (
                  <Link
                    key={`${m.championship?.id || "global"}-${m.id}`}
                    href={`/matches/${m.id}/promo`}
                    className="group block p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-lime-500 dark:hover:border-lime-400 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            {m.championship?.name || "Campionat"}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            • Etapa {m.round}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-label">
                            {m.status === "scheduled" ? "Programat" : m.status === "live" ? "Live" : "Finalizat"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm uppercase shrink-0 border border-white/10"
                            style={{ backgroundColor: m.homeTeam.color || "#84cc16" }}
                          >
                            {m.homeTeam.shortName?.substring(0, 3) || m.homeTeam.name.substring(0, 3).toUpperCase()}
                          </div>
                          <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {m.homeTeam.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">vs</span>
                          <span className="font-headline font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {m.awayTeam.name}
                          </span>
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm uppercase shrink-0 border border-white/10"
                            style={{ backgroundColor: m.awayTeam.color || "#38bdf8" }}
                          >
                            {m.awayTeam.shortName?.substring(0, 3) || m.awayTeam.name.substring(0, 3).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-label font-bold text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {dateLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          {timeLabel}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-lime-500 transition-colors">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
