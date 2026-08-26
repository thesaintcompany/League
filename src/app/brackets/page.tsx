import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BracketVisualizer } from "@/components/BracketVisualizer";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function PublicBracketsPage({
  searchParams,
}: {
  searchParams?: { id?: string; code?: string };
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;

  const targetId = searchParams?.id;
  const targetCode = searchParams?.code;

  // 1. Fetch targeted championship if id or code provided
  let championship = null;

  if (targetId) {
    championship = await prisma.championship.findUnique({
      where: { id: targetId },
      include: {
        teams: true,
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  } else if (targetCode) {
    championship = await prisma.championship.findUnique({
      where: { shareCode: targetCode },
      include: {
        teams: true,
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  }

  // 2. Fallback: Find published championship or latest championship
  if (!championship) {
    championship =
      (await prisma.championship.findFirst({
        where: { isBracketPublished: true },
        include: {
          teams: true,
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
          },
        },
        orderBy: { updatedAt: "desc" },
      })) ||
      (await prisma.championship.findFirst({
        include: {
          teams: true,
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
          },
        },
        orderBy: { updatedAt: "desc" },
      }));
  }

  // Fetch all published championships for the quick switcher
  const allPublishedChampionships = await prisma.championship.findMany({
    where: { isBracketPublished: true },
    select: {
      id: true,
      name: true,
      sport: true,
      season: true,
      shareCode: true,
      county: true,
      city: true,
      scope: true,
    },
    orderBy: { createdAt: "desc" },
  });

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

  const shareCode = championship?.shareCode || (championship?.id ? `LP-${championship.id.slice(-6).toUpperCase()}` : "LP-PUBLIC");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
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
                <span>🎲</span> HARTA UNICĂ DE CAMPIONAT
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-black text-xs font-label border border-lime-400/30">
                COD PUBLIC: #{shareCode}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs font-label">
                {championship?.sport || "Fotbal"} • {championship?.season || "Sezon 2026"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-lg">
              {championship?.name || "Harta Turneului Oficial"}
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl font-body leading-relaxed">
              Arborele meciurilor eliminatorii generat prin tragere la sorți cu zaruri. Fiecare campionat are o hartă unică cu link public distribuit în timp real.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/campionat"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20"
            >
              ← Clasament
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-4 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg"
            >
              🗺️ Nationale
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Switcher for other available public championship maps */}
        {allPublishedChampionships.length > 1 && (
          <div className="card p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lime-400 text-lg">🏆</span>
              <span className="text-xs font-label font-bold text-slate-300 uppercase">
                Explorează Harta Altui Campionat:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {allPublishedChampionships.map((c) => (
                <Link
                  key={c.id}
                  href={`/harta-campionat?id=${c.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-label font-bold transition border ${championship?.id === c.id
                      ? "bg-lime-400 text-slate-950 border-lime-400 font-black shadow-md"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                >
                  {c.name} {c.county ? `(${c.county})` : ""}
                </Link>
              ))}
            </div>
          </div>
        )}

        {isPrivate ? (
          <div className="card p-12 text-center text-slate-400 bg-slate-900 border border-amber-400/40 rounded-3xl space-y-4">
            <span className="material-symbols-outlined text-5xl text-amber-400 block">
              lock
            </span>
            <h2 className="text-xl font-bold font-headline text-white">
              Harta acestui campionat este momentan Privată
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Organizatorul nu a făcut încă publică harta meciurilor pentru acest campionat. Te rugăm să revii mai târziu sau să selectezi un alt campionat din lista de mai sus.
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

      <PublicFooter />
    </div>
  );
}
