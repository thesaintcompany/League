import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BracketVisualizer } from "@/components/BracketVisualizer";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function StandaloneChampionshipMapPage({
  params,
}: {
  params: { code: string };
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const rawCode = decodeURIComponent(params.code);

  // 1. Try finding championship by shareCode or by id
  let championship = await prisma.championship.findFirst({
    where: {
      OR: [
        { shareCode: rawCode },
        { shareCode: rawCode.toUpperCase() },
        { id: rawCode },
      ],
    },
    include: {
      teams: true,
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
      },
    },
  });

  // Fallback: If not found, try finding any championship or latest
  if (!championship) {
    championship = await prisma.championship.findFirst({
      where: { isBracketPublished: true },
      include: {
        teams: true,
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Check if map is private and visitor is not the owner
  const isOwner = championship && currentUserId && championship.ownerId === currentUserId;
  const isPrivate = championship && !championship.isBracketPublished && !isOwner;

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

  const shareCode = championship?.shareCode || (championship?.id ? `LP-${championship.id.slice(-6).toUpperCase()}` : "LP-OFFICIAL");

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
      {/* Top Bar Header */}
      <PublicHeader currentTab="brackets" />

      {/* Hero Banner with Stadium Glow & Unique Share Code */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-lime-400/30 py-14 px-6 lg:px-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label tracking-widest shadow-md flex items-center gap-1.5">
                <span>🎲</span> HARTA DEDICATĂ DE CAMPIONAT
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-black text-xs font-label border border-lime-400/30 font-mono">
                COD ACCES: #{shareCode}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs font-label">
                {championship?.sport || "Fotbal"} • {championship?.season || "Sezon 2026"}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-label">
                {championship?.scope === "national"
                  ? "🇷🇴 Competiție Națională"
                  : `📍 ${championship?.county || "Județean"}`}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-lg">
              {championship?.name || "Harta Turneului Oficial"}
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl font-body leading-relaxed">
              Pagină separată oficială dedicată arborelui eliminatoriu și meciurilor campionatului. Acces direct prin link securizat și cod unic.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/campionat?id=${championship?.id || ""}`}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20"
            >
              ← Clasament Campionat
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-4 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg"
            >
              🗺️ Harta României
            </Link>
          </div>
        </div>
      </section>

      {/* Main Interactive Bracket Visualizer Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {isPrivate ? (
          <div className="card p-12 text-center text-slate-400 bg-slate-900 border border-amber-400/40 rounded-3xl space-y-4">
            <span className="material-symbols-outlined text-5xl text-amber-400 block">
              lock
            </span>
            <h2 className="text-xl font-bold font-headline text-white">
              Harta acestui campionat este momentan Privată
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Organizatorul nu a făcut încă publică harta meciurilor pentru acest campionat. Te rugăm să revii mai târziu.
            </p>
            <Link
              href="/campionat"
              className="inline-block px-5 py-2.5 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase shadow-md mt-2"
            >
              Înapoi la Pagina Publică
            </Link>
          </div>
        ) : (
          <BracketVisualizer
            matches={matches}
            championshipId={championship?.id}
            championshipName={championship?.name}
            shareCode={shareCode}
            isPublished={championship?.isBracketPublished ?? true}
            isAdmin={Boolean(isOwner)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500 mt-auto bg-slate-950">
        © {new Date().getFullYear()} Ligue Pro România • Pagină Separată Oficială de Campionat. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
