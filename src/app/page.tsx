import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StandingsTable, StandingRow } from "@/components/StandingsTable";
import { MatchCard, MatchData } from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch active championship with teams and matches
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
        orderBy: {
          scheduledAt: "asc",
        },
      },
    },
  });

  // Calculate standings from matches if championship exists
  const standingsMap = new Map<string, StandingRow>();

  if (championship) {
    championship.teams.forEach((t) => {
      standingsMap.set(t.id, {
        position: 1,
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
        color: t.color || "#1e293b",
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        form: [],
      });
    });

    championship.matches.forEach((m) => {
      if (m.status === "finished" && m.homeScore != null && m.awayScore != null) {
        const home = standingsMap.get(m.homeTeamId);
        const away = standingsMap.get(m.awayTeamId);

        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.goalsFor += m.homeScore;
          home.goalsAgainst += m.awayScore;
          away.goalsFor += m.awayScore;
          away.goalsAgainst += m.homeScore;

          if (m.homeScore > m.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
            home.form?.push("W");
            away.form?.push("L");
          } else if (m.homeScore < m.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
            home.form?.push("L");
            away.form?.push("W");
          } else {
            home.drawn += 1;
            home.points += 1;
            away.drawn += 1;
            away.points += 1;
            home.form?.push("D");
            away.form?.push("D");
          }

          home.goalDiff = home.goalsFor - home.goalsAgainst;
          away.goalDiff = away.goalsFor - away.goalsAgainst;
        }
      }
    });
  }

  const standings = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  standings.forEach((s, idx) => {
    s.position = idx + 1;
  });

  const matches: MatchData[] =
    championship?.matches.map((m) => ({
      id: m.id,
      round: m.round,
      scheduledAt: m.scheduledAt,
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
    })) || [];

  const finishedMatches = matches.filter((m) => m.status === "finished" || m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "scheduled");

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 h-20 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary dark:bg-lime-400 flex items-center justify-center text-white dark:text-primary font-black text-lg shadow-sm">
              ⚡
            </div>
            <span className="text-xl font-black italic tracking-tight text-blue-950 dark:text-white uppercase font-headline">
              Ligue
            </span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-950/50 text-lime-800 dark:text-lime-400 border border-lime-300/60 text-xs font-bold font-label">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
            PRO LEAGUE LIVE
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
          >
            Panou Organizator ↗
          </Link>
          <Link
            href="/signin"
            className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
          >
            Autentificare
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        {/* Championship Hero Banner */}
        <section className="bg-primary text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 bg-lime-400 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider font-label">
                  {championship?.season || "Sezon 2025-2026"}
                </span>
                <span className="text-slate-400 text-xs font-label uppercase tracking-widest font-semibold">
                  {championship?.sport || "Fotbal"} • Liga Oficială
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-headline">
                {championship?.name || "Liga Națională Pro"}
              </h1>
              {championship?.description && (
                <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base font-body">
                  {championship.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/new"
                className="btn bg-lime-400 hover:bg-lime-500 text-slate-950 font-black font-label text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-lg transition active:scale-95"
              >
                + Înscrie Echipă
              </Link>
            </div>
          </div>
        </section>

        {/* Grid Layout: Standings (8 cols) & Upcoming (4 cols) */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Standings & Results */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Standings Table */}
            <StandingsTable
              standings={standings}
              title={`Clasament ${championship?.name || "Campionat"}`}
            />

            {/* Latest Results Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 bg-primary rounded-full"></span>
                  <h2 className="text-xl font-bold text-blue-950 dark:text-white font-headline">
                    Rezultate Recente
                  </h2>
                </div>
                <span className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
                  {finishedMatches.length} Meciuri jucate
                </span>
              </div>

              {finishedMatches.length === 0 ? (
                <div className="card text-center py-10 text-slate-500">
                  Nu sunt meciuri finalizate încă.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {finishedMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Fixtures & Top Performers */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Upcoming Fixtures Dark Card */}
            <div className="bg-primary-container text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold font-headline flex items-center gap-2">
                  <span className="w-2 h-6 bg-lime-400 rounded-full"></span>
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
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/dashboard"
                className="w-full mt-6 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest text-center block transition shadow-sm"
              >
                Vezi Programul Complet
              </Link>
            </div>

            {/* Performance Leaders Widget */}
            <div className="card space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-secondary rounded-full"></span>
                <h3 className="text-base font-bold text-blue-950 dark:text-white font-headline">
                  Statistici Echipe
                </h3>
              </div>

              <div className="space-y-3">
                {standings.slice(0, 4).map((team, idx) => (
                  <div
                    key={team.teamId}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black data-font text-slate-400">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: team.color || "#1e293b" }}
                      >
                        {team.shortName}
                      </div>
                      <span className="text-xs font-bold font-headline truncate max-w-[120px]">
                        {team.teamName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black data-font text-blue-950 dark:text-lime-400">
                        {team.points} pts
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {team.goalsFor} goluri
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-10 mt-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs font-label text-slate-500">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            Ligue — Platformă Profesională de Organizare Sportivă
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Ligue. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
