import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StandingsTable, StandingRow } from "@/components/StandingsTable";
import { MatchCard, MatchData } from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function PublicChampionshipPage() {
  const championship = await prisma.championship.findFirst({
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

  const teams = championship?.teams || [];
  const rawMatches = championship?.matches || [];

  // 10 Top Scorers
  const topPlayers = await prisma.player.findMany({
    include: { team: true },
    orderBy: { goals: "desc" },
    take: 4,
  });

  // Top 6 Arenas
  const topVenues = await prisma.venue.findMany({
    where: { isActive: true },
    orderBy: { capacity: "desc" },
    take: 6,
  });

  // Compute standings
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
    bracketIndex: m.bracketIndex || undefined,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : undefined,
    status: m.status as any,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    venue: m.venue || undefined,
    referee: m.referee || undefined,
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
  }));

  const finishedMatches = matchDataList.filter((m) => m.status === "finished");
  const upcomingMatches = matchDataList.filter((m) => m.status === "scheduled");

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 h-20 px-6 lg:px-12 flex justify-between items-center text-white">
        <div className="flex items-center gap-6">
          <Link href="/campionat" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-lime-400/20">
              ⚡
            </div>
            <div>
              <span className="text-2xl font-black italic tracking-tight text-white uppercase font-headline block leading-none">
                Ligue
              </span>
              <span className="text-[9px] font-label font-bold text-lime-400 tracking-widest uppercase">
                Pro România
              </span>
            </div>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold font-label">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            SEZONUL 2025-2026 LIVE
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-label font-bold uppercase tracking-wider text-slate-300 ml-4">
            <Link href="/campionat" className="text-lime-400 font-black border-b-2 border-lime-400 pb-1">
              Campionat
            </Link>
            <Link href="/brackets" className="hover:text-lime-400 transition flex items-center gap-1">
              <span>🗺️</span> Harta Campionatului
            </Link>
            <Link href="/venues" className="hover:text-lime-400 transition">
              Arene &amp; Stadioane (33)
            </Link>
            <Link href="/players" className="hover:text-lime-400 transition">
              Jucători &amp; Golgheteri
            </Link>
            <Link href="/referees" className="hover:text-lime-400 transition">
              Corp Arbitri
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-label font-bold uppercase tracking-wider transition border border-white/15"
          >
            Panou Organizator ↗
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-headline font-black uppercase tracking-wider shadow-lg shadow-lime-400/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Portal Autentificare
          </Link>
        </div>
      </header>

      {/* Hero Section with Dynamic Goal-in-the-Net Action Background */}
      <section className="relative min-h-[520px] lg:min-h-[620px] bg-slate-950 text-white flex items-center overflow-hidden">
        {/* Dynamic Background Goal Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-goal.jpg"
          alt="Explosive Goal in the Net Dynamic Shot"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85] contrast-[1.15] scale-105 animate-in fade-in duration-1000"
        />
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/20 backdrop-blur-md border border-lime-400/40 text-lime-300 text-xs font-black font-label uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              COMPETIȚIA DE ELITĂ • LIGA PRO ROMÂNIA
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold italic tracking-tight font-headline uppercase leading-[1.05] text-white drop-shadow-2xl">
              Trăiește Emoția <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-cyan-400">
                Fiecărui Gol.
              </span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base font-body leading-relaxed max-w-xl drop-shadow">
              Platforma oficială a campionatului: meciuri în direct, tragere la sorți cu zaruri 🎲, clasamente în timp real, foaie oficială de arbitraj PDF și rețeaua celor 33 de arene omologate din Județul Timiș.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/brackets"
                className="px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-xl shadow-lime-400/30 flex items-center gap-2 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">account_tree</span>
                Vezi Harta Campionatului 🗺️
              </Link>
              <Link
                href="/players"
                className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 transition flex items-center gap-2"
              >
                <span>🥇 Top 10 Golgheteri</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full">
        {/* Grid Layout: Standings (8 cols) & Upcoming (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Standings & Results */}
          <div className="lg:col-span-8 space-y-8">
            {/* Standings Table */}
            <StandingsTable
              standings={standings}
              title={`Clasament Oficial • ${championship?.name || "Liga Pro România 2026"}`}
            />

            {/* Latest Results Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-lime-500 rounded-full"></span>
                  <h2 className="text-xl font-bold text-blue-950 dark:text-white font-headline uppercase tracking-tight">
                    Rezultate Recente &amp; Rapoarte Arbitraj
                  </h2>
                </div>
                <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
                  {finishedMatches.length} Meciuri Finalizate
                </span>
              </div>

              {finishedMatches.length === 0 ? (
                <div className="card text-center py-10 text-slate-500 bg-surface-container-lowest rounded-3xl">
                  Nu sunt meciuri finalizate încă.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {finishedMatches.slice(0, 4).map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Fixtures & Top Performers */}
          <div className="lg:col-span-4 space-y-8">
            {/* Upcoming Fixtures Dark Card */}
            <div className="bg-primary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold font-headline uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-5 bg-lime-400 rounded-full"></span>
                  Meciuri Următoare
                </h3>
                <span className="text-[10px] font-label font-bold uppercase tracking-wider text-slate-400">
                  {upcomingMatches.length} Programate
                </span>
              </div>

              {upcomingMatches.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Toate meciurile din această etapă au fost jucate.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      className="bg-white/5 hover:bg-white/10 transition rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex justify-between items-center text-[10px] font-label font-bold tracking-wider text-lime-400 uppercase mb-2">
                        <span>Etapa {m.round || 1}</span>
                        <span>
                          {m.scheduledAt
                            ? new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Urmează"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-sm font-headline">
                        <span className="truncate pr-2">{m.homeTeam.name}</span>
                        <span className="text-slate-500 font-normal text-xs uppercase">vs</span>
                        <span className="truncate pl-2 text-right">{m.awayTeam.name}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-slate-400">
                        <span>🏟️ {m.venue || "Arena Oficială"}</span>
                        <Link
                          href={`/matches/${m.id}/promo`}
                          className="text-lime-400 font-bold hover:underline font-label"
                        >
                          Promo ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Spotlight: Top Scorers Leaderboard */}
            <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-sm text-blue-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">military_tech</span>
                  Top Golgheteri
                </h3>
                <Link
                  href="/players"
                  className="text-[11px] font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                >
                  Vezi Toți (10) ↗
                </Link>
              </div>

              <div className="space-y-3">
                {topPlayers.map((p, idx) => (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    className="p-3 rounded-2xl bg-surface-container-low hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary text-white text-xs font-black font-label flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-headline font-bold text-xs text-blue-950 dark:text-white group-hover:text-lime-600 block leading-tight">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-label">
                          {p.team.name}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-sm text-lime-600 dark:text-lime-400 data-font">
                      {p.goals || 0} ⚽
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 33 Timiș County Arenas Spotlight Showcase */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 block mb-1">
                Infrastructură Sportivă
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase text-blue-950 dark:text-white tracking-tight">
                33 Arene &amp; Baze Sportive în Județul Timiș
              </h2>
            </div>
            <Link
              href="/venues"
              className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
            >
              Catalogul Complet Arene (Fotbal, Baschet, Volei) ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topVenues.map((v) => (
              <Link
                key={v.id}
                href={`/venues/${v.id}`}
                className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        v.imageUrl ||
                        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-4 text-white">
                      <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label self-start shadow-sm">
                        {v.sport}
                      </span>
                      <div>
                        <h4 className="font-headline font-bold text-lg text-white group-hover:text-lime-300 transition leading-tight">
                          {v.name}
                        </h4>
                        <p className="text-xs text-slate-300 font-label mt-0.5">
                          📍 {v.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <p className="text-xs text-slate-500 font-label line-clamp-2">
                      {v.specs || "Arenă oficială omologată pentru competiții de top."}
                    </p>
                    <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-label">Capacitate:</span>
                      <span className="text-blue-950 dark:text-white data-font">
                        {v.capacity.toLocaleString("ro-RO")} locuri
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className="w-full py-2 rounded-xl bg-surface-container-low text-slate-700 dark:text-slate-300 text-xs font-bold font-label uppercase flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white transition">
                    Vezi Meciurile pe Arenă
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-10 text-center text-xs font-label text-slate-500 mt-auto bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Ligue Pro România. Toate drepturile rezervate.</p>
          <div className="flex gap-4 font-bold text-slate-600 dark:text-slate-400">
            <Link href="/brackets" className="hover:underline">
              Harta Campionatului
            </Link>
            <Link href="/venues" className="hover:underline">
              33 Arene Timiș
            </Link>
            <Link href="/players" className="hover:underline">
              Top 10 Golgheteri
            </Link>
            <Link href="/" className="hover:underline">
              Portal Autentificare
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
