import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StandingsTable, StandingRow } from "@/components/StandingsTable";
import { MatchCard, MatchData } from "@/components/MatchCard";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicChampionshipPage({
  searchParams,
}: {
  searchParams?: { id?: string; sport?: string };
}) {
  const targetId = searchParams?.id;

  // 1. Fetch all championships to populate the multi-league selector
  const allChampionships = await prisma.championship.findMany({
    include: {
      _count: { select: { teams: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch targeted championship or fallback to the latest
  let championship = null;
  if (targetId) {
    championship = await prisma.championship.findUnique({
      where: { id: targetId },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  }

  if (!championship && allChampionships.length > 0) {
    championship = await prisma.championship.findUnique({
      where: { id: allChampionships[0].id },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  }

  const teams = championship?.teams || [];
  const rawMatches = championship?.matches || [];

  // Top Scorers across system
  const topPlayers = await prisma.player.findMany({
    include: { team: true },
    orderBy: { goals: "desc" },
    take: 4,
  });

  // Top Arenas
  const topVenues = await prisma.venue.findMany({
    where: { isActive: true },
    orderBy: { capacity: "desc" },
    take: 6,
  });

  // Compute standings for this specific championship
  const statsMap = new Map<
    string,
    {
      teamId: string;
      name: string;
      color: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      gf: number;
      ga: number;
      points: number;
    }
  >();

  teams.forEach((t) => {
    statsMap.set(t.id, {
      teamId: t.id,
      name: t.name,
      color: t.color || "#1e293b",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
    });
  });

  rawMatches.forEach((m) => {
    if (m.status !== "finished" || m.homeScore === null || m.awayScore === null) return;
    const home = statsMap.get(m.homeTeamId);
    const away = statsMap.get(m.awayTeamId);

    if (home) {
      home.played += 1;
      home.gf += m.homeScore;
      home.ga += m.awayScore;
    }
    if (away) {
      away.played += 1;
      away.gf += m.awayScore;
      away.ga += m.homeScore;
    }

    if (m.homeScore > m.awayScore) {
      if (home) {
        home.won += 1;
        home.points += 3;
      }
      if (away) away.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      if (away) {
        away.won += 1;
        away.points += 3;
      }
      if (home) home.lost += 1;
    } else {
      if (home) {
        home.drawn += 1;
        home.points += 1;
      }
      if (away) {
        away.drawn += 1;
        away.points += 1;
      }
    }
  });

  const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  const standings: StandingRow[] = sortedStats.map((s, idx) => ({
    position: idx + 1,
    teamId: s.teamId,
    teamName: s.name,
    shortName: s.name.substring(0, 3).toUpperCase(),
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.gf,
    goalsAgainst: s.ga,
    goalDiff: s.gf - s.ga,
    points: s.points,
    form: ["W", "W", "D", "W", "L"],
  }));

  const matchDataList: MatchData[] = rawMatches.map((m) => ({
    id: m.id,
    round: m.round,
    stage: m.stage || undefined,
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

  // Cross-League / Inter-League Friendly Matches Showcase
  const crossLeagueMatches = rawMatches.filter(
    (m) => m.stage === "friendly" || m.round === 0 || (m.venue && m.venue.includes("Amical"))
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
      {/* 1. Global Public Top Navbar */}
      <PublicHeader currentTab="campionat" />

      {/* 2. Multi-Championship & League Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lime-400 font-bold text-sm">🏆</span>
            <span className="text-xs font-label font-bold text-slate-300 uppercase">
              Ligi &amp; Campionate Active ({allChampionships.length}):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {allChampionships.map((c) => {
              const isSelected = championship?.id === c.id;
              return (
                <Link
                  key={c.id}
                  href={`/campionat?id=${c.id}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-label font-bold transition flex items-center gap-1.5 border whitespace-nowrap ${
                    isSelected
                      ? "bg-lime-400 text-slate-950 border-lime-400 font-black shadow-md scale-[1.02]"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span>{c.format === "knockout" ? "🎲" : "⚽"}</span>
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({c._count.teams} echipe)
                  </span>
                </Link>
              );
            })}

            <Link
              href="/dashboard/new"
              className="px-3 py-1.5 rounded-xl text-xs font-label font-bold bg-slate-800 hover:bg-slate-700 text-lime-400 border border-lime-400/30 transition flex items-center gap-1"
            >
              <span>+</span> Creează Campionat Nou
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Hero Championship Spotlight */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-lime-400/30 py-12 px-6 lg:px-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label tracking-widest shadow-md">
                {championship?.sport || "Fotbal"}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-bold text-xs font-label border border-lime-400/30">
                {championship?.season || "Sezon 2026"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs font-label">
                {championship?.scope === "national"
                  ? "🇷🇴 Național (Toată România)"
                  : `📍 ${championship?.county || "Județean"} • ${championship?.city || "Local"}`}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                Cod: #{championship?.shareCode || "LP-2026"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-lg">
              {championship?.name || "Liga Pro România"}
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl font-body leading-relaxed">
              {championship?.description ||
                "Portalul oficial cu clasamente live, rezultate de meci în timp real, loturi confirmate și arbore eliminatoriu cu zaruri."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/harta-campionat?id=${championship?.id || ""}`}
              className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 active:scale-95"
            >
              <span>🎲</span> Arbore Brackets Turneu
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20"
            >
              🗺️ Harta României
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {teams.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-black text-3xl mx-auto">
              🏆
            </div>
            <h2 className="text-2xl font-black font-headline uppercase text-white">
              Campionatul a fost creat cu succes!
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Acest campionat este salvat și activ în baza de date. Echipele pot fi adăugate și meciurile programate direct din panoul de administrare.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href={`/dashboard/championships/${championship?.id}`}
                className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg"
              >
                ⚙️ Gestionează Echipele &amp; Meciurile
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Standings & Matches Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Cols: Clasament Oficial */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
                    <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
                      Clasament Oficial Live
                    </h2>
                  </div>
                  <span className="text-xs font-label font-bold text-slate-400 uppercase">
                    {standings.length} Cluburi Înscrise
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
                  <StandingsTable standings={standings} />
                </div>
              </div>

              {/* Right Col: Program & Meciuri */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-blue-400 rounded-full"></span>
                    <h2 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
                      Meciuri &amp; Rezultate
                    </h2>
                  </div>
                  <span className="text-xs font-label font-bold text-slate-400 uppercase">
                    {matchDataList.length} Meciuri
                  </span>
                </div>

                <div className="space-y-4">
                  {matchDataList.length === 0 ? (
                    <div className="card p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
                      Meciurile urmează să fie programate.
                    </div>
                  ) : (
                    matchDataList.slice(0, 5).map((m) => (
                      <MatchCard key={m.id} match={m} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 5. Cross-League & Friendly Matches Showcase (Meciuri Amicale Inter-Ligi) */}
            <section className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
                      Jocuri &amp; Meciuri Amicale Inter-Ligi
                    </h3>
                    <p className="text-xs text-slate-400 font-label">
                      Meciuri demonstrative și partide de pregătire între cluburi din ligi diferite
                    </p>
                  </div>
                </div>

                <Link
                  href="/venues"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-label font-bold uppercase transition border border-amber-400/30"
                >
                  🏟️ Rezervă o Arenă pentru Meci Amical
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-label text-slate-400 uppercase">
                    <span>Meci Amical Inter-Județean</span>
                    <span className="text-amber-400 font-bold">Programat</span>
                  </div>
                  <div className="flex justify-between items-center font-headline font-bold text-sm text-white">
                    <span>Poli Timișoara</span>
                    <span className="text-xs text-slate-500 font-mono">VS</span>
                    <span>CFR Cluj</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span>🏟️ Stadionul Dan Păltinișanu</span>
                    <span className="text-lime-400 font-bold">18:00</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-label text-slate-400 uppercase">
                    <span>Turneu Amical Baschet / Handbal</span>
                    <span className="text-lime-400 font-bold">Live</span>
                  </div>
                  <div className="flex justify-between items-center font-headline font-bold text-sm text-white">
                    <span>U-BT Cluj</span>
                    <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 font-mono text-xs">84 - 79</span>
                    <span>CSM Oradea</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span>🏟️ BTarena Cluj</span>
                    <span className="text-lime-400 font-bold">Final</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-label text-slate-400 uppercase">
                    <span>Cupa de Pregătire Timiș</span>
                    <span className="text-slate-400 font-bold">Weekend</span>
                  </div>
                  <div className="flex justify-between items-center font-headline font-bold text-sm text-white">
                    <span>Ripensia Timișoara</span>
                    <span className="text-xs text-slate-500 font-mono">VS</span>
                    <span>CSC Dumbrăvița</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span>🏟️ Baza Sportivă Textila</span>
                    <span className="text-slate-300 font-bold">Sâmbătă 11:00</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500 mt-auto">
        © {new Date().getFullYear()} Ligue Pro România • Sistem Multi-Ligă &amp; Multi-Campionat. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
