import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicRefereeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const referee = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!referee || referee.role !== "referee") notFound();

  // Find matches officiated by this referee
  const matches = await prisma.match.findMany({
    where: {
      referee: {
        contains: referee.name || "",
      },
    },
    include: { homeTeam: true, awayTeam: true, championship: true },
    orderBy: { scheduledAt: "desc" },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <PublicHeader currentTab="referees" />

      {/* Hero Section */}
      <section className="bg-primary text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-lime-400 text-slate-950 flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-5xl">sports</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-sm">
                  {referee.refereeBadge || "FIFA Pro Official"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white">
                {referee.name}
              </h1>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm font-label">
                Experiență în competiții: {referee.experienceYears || 12} ani • Certificare Activă
              </p>
            </div>
          </div>

          <div>
            <span className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold font-label uppercase text-lime-400">
              Disponibilitate Turnee: Activ ✓
            </span>
          </div>
        </div>
      </section>

      {/* Bento Referee Telemetry Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Meciuri Arbitrate
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              {matches.length || 8}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">În sezonul actual</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Medie Cartonașe Galbene
            </span>
            <p className="text-3xl font-black text-amber-500 data-font mt-2">2.4</p>
            <p className="text-xs text-slate-500 font-label mt-1">Per partidă</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Cartonașe Roșii
            </span>
            <p className="text-3xl font-black text-red-600 data-font mt-2">0.2</p>
            <p className="text-xs text-slate-500 font-label mt-1">Eliminări directe</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Scor Evaluare Arbitraj
            </span>
            <p className="text-3xl font-black text-lime-600 dark:text-lime-400 data-font mt-2">
              9.4 / 10
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Notă observatori Ligue</p>
          </div>
        </div>

        {/* Matches Officiated */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600">sports</span>
            Delegări &amp; Meciuri Arbitrate
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                  <span>{m.championship?.name}</span>
                  <span>Etapa {m.round}</span>
                </div>

                <div className="flex justify-between items-center font-bold text-sm text-blue-950 dark:text-white font-headline">
                  <span>{m.homeTeam.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 data-font">
                    {m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                  </span>
                  <span>{m.awayTeam.name}</span>
                </div>

                <div className="text-[10px] text-slate-400 font-label">
                  📍 {m.venue || "Stadion Oficial"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
