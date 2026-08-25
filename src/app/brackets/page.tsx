import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BracketVisualizer } from "@/components/BracketVisualizer";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicBracketsPage() {
  // Find published championship or latest championship
  const championship = await prisma.championship.findFirst({
    where: { isBracketPublished: true },
    include: {
      teams: true,
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
      },
    },
  }) || await prisma.championship.findFirst({
    include: {
      teams: true,
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
      },
    },
  });

  const matches = (championship?.matches || []).map((m: any) => ({
    id: m.id,
    round: m.round,
    stage: m.stage,
    bracketIndex: m.bracketIndex,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : undefined,
    status: m.status as any,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName || undefined,
      color: m.homeTeam.color || undefined,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName || undefined,
      color: m.awayTeam.color || undefined,
    },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    venue: m.venue || undefined,
    referee: m.referee || undefined,
  }));

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Bar Header */}
      <PublicHeader currentTab="brackets" />

      {/* Hero Banner */}
      <section className="bg-primary text-white py-12 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase font-label">
                {championship?.season || "Sezon Oficial"}
              </span>
              <span className="text-xs font-label text-slate-400 uppercase tracking-widest">
                Tragere la sorți cu Zaruri 🎲
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
              Harta Oficială a Campionatului
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 font-body">
              {championship?.name || "Liga Pro România 2026"} • Urmărește traseul echipelor calificate de la Sferturile de Finală până la Marea Finală!
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="btn bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition border border-white/20"
            >
              ← Vezi Clasamentul
            </Link>
          </div>
        </div>
      </section>

      {/* Main Interactive Bracket Visualizer Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <BracketVisualizer
          matches={matches}
          championshipId={championship?.id}
          isPublished={championship?.isBracketPublished ?? true}
          isAdmin={false}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center text-xs font-label text-slate-500 mt-auto">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
