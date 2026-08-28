import { prisma } from "@/lib/prisma";
import { ChampionshipPublicClientView } from "@/components/ChampionshipPublicClientView";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function ClasamentePage({
  searchParams,
}: {
  searchParams?: { id?: string; code?: string; sport?: string; county?: string };
}) {
  const rawId = searchParams?.id?.trim();
  const rawCode = searchParams?.code?.trim();

  // 1. Fetch targeted championship or fallback to latest available
  let championship = null;
  if (rawId) {
    championship = await prisma.championship.findFirst({
      where: {
        OR: [{ id: rawId }, { shareCode: rawId }, { shareCode: rawId.toUpperCase() }],
      },
      include: {
        teams: {
          include: { players: true },
          orderBy: { name: "asc" },
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
  } else if (rawCode) {
    const cleanCode = rawCode.replace(/^#/, "").trim();
    championship = await prisma.championship.findFirst({
      where: {
        OR: [
          { shareCode: cleanCode },
          { shareCode: cleanCode.toUpperCase() },
          { id: cleanCode },
        ],
      },
      include: {
        teams: {
          include: { players: true },
          orderBy: { name: "asc" },
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

  if (!championship) {
    championship = await prisma.championship.findFirst({
      include: {
        teams: {
          include: { players: true },
          orderBy: { name: "asc" },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  // 2. Fetch all championships for switcher
  const rawChampionships = await prisma.championship.findMany({
    include: {
      teams: { select: { id: true } },
    },
    orderBy: { name: "asc" },
  });

  const allChampionships = rawChampionships.map((c) => ({
    id: c.id,
    name: c.name,
    sport: c.sport || "Fotbal",
    season: c.season || "2025-2026",
    format: c.format || "round_robin",
    teamsCount: c.teams.length,
  }));

  // 3. Compute standings
  let standings: any[] = [];
  let finishedMatches: any[] = [];
  let upcomingMatches: any[] = [];
  let allMatchesList: any[] = [];
  let topScorers: any[] = [];

  if (championship) {
    const teams = championship.teams || [];
    const matches = championship.matches || [];

    allMatchesList = matches.map((m) => ({
      id: m.id,
      round: m.round,
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : new Date().toISOString(),
      venue: m.venue || "",
      status: m.status,
      stage: m.stage || "Grupe",
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      homeTeam: {
        id: m.homeTeam?.id || "home-tbd",
        name: m.homeTeam?.name || "Echipă Gazdă",
        shortName: m.homeTeam?.shortName || (m.homeTeam?.name ? m.homeTeam.name.substring(0, 3).toUpperCase() : "GAZ"),
        color: m.homeTeam?.color || "#1e293b",
        logoUrl: m.homeTeam?.logoUrl,
      },
      awayTeam: {
        id: m.awayTeam?.id || "away-tbd",
        name: m.awayTeam?.name || "Echipă Oaspete",
        shortName: m.awayTeam?.shortName || (m.awayTeam?.name ? m.awayTeam.name.substring(0, 3).toUpperCase() : "OAS"),
        color: m.awayTeam?.color || "#1e293b",
        logoUrl: m.awayTeam?.logoUrl,
      },
    }));

    finishedMatches = allMatchesList.filter(
      (m) => m.status === "finished" || m.status === "completed"
    );

    upcomingMatches = allMatchesList.filter(
      (m) => m.status === "scheduled" || m.status === "live" || m.status === "in_progress"
    );

    // Compute team standings
    const standingsMap = new Map<string, any>();

    teams.forEach((t) => {
      standingsMap.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
        color: t.color || "#84cc16",
        logoUrl: t.logoUrl,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        form: [] as string[],
      });
    });

    finishedMatches.forEach((m) => {
      const home = m.homeTeam?.id ? standingsMap.get(m.homeTeam.id) : null;
      const away = m.awayTeam?.id ? standingsMap.get(m.awayTeam.id) : null;
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;

      if (home) {
        home.played += 1;
        home.goalsFor += hs;
        home.goalsAgainst += as;
        if (hs > as) {
          home.won += 1;
          home.points += 3;
          home.form.push("W");
        } else if (hs === as) {
          home.drawn += 1;
          home.points += 1;
          home.form.push("D");
        } else {
          home.lost += 1;
          home.form.push("L");
        }
      }

      if (away) {
        away.played += 1;
        away.goalsFor += as;
        away.goalsAgainst += hs;
        if (as > hs) {
          away.won += 1;
          away.points += 3;
          away.form.push("W");
        } else if (as === hs) {
          away.drawn += 1;
          away.points += 1;
          away.form.push("D");
        } else {
          away.lost += 1;
          away.form.push("L");
        }
      }
    });

    standings = Array.from(standingsMap.values())
      .map((s, idx) => ({
        ...s,
        position: idx + 1,
        goalDiff: s.goalsFor - s.goalsAgainst,
        form: s.form.slice(-5),
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      })
      .map((s, idx) => ({
        ...s,
        position: idx + 1,
      }));

    // Top scorers from players
    const allPlayers: any[] = [];
    teams.forEach((t) => {
      (t.players || []).forEach((p: any) => {
        if (p.goals > 0) {
          allPlayers.push({
            id: p.id,
            name: p.name,
            number: p.number,
            teamName: t.name,
            teamColor: t.color,
            teamLogo: t.logoUrl,
            goals: p.goals,
            assists: p.assists,
            yellowCards: p.yellowCards,
            redCards: p.redCards,
            photoUrl: p.image,
          });
        }
      });
    });

    topScorers = allPlayers.sort((a, b) => b.goals - a.goals).slice(0, 10);
  }

  const championshipInfo = championship
    ? {
        id: championship.id,
        name: championship.name,
        sport: championship.sport || "Fotbal",
        season: championship.season || "2025-2026",
        scope: championship.scope || "national",
        county: championship.county,
        city: championship.city,
        logoUrl: championship.logoUrl,
        shareCode: championship.shareCode || championship.id,
        description: championship.description,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-white flex flex-col transition-colors duration-200">
      <PublicHeader currentTab="clasamente" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ChampionshipPublicClientView
          championship={championshipInfo}
          allChampionships={allChampionships}
          standings={standings}
          allMatches={allMatchesList}
          finishedMatches={finishedMatches}
          upcomingMatches={upcomingMatches}
          topScorers={topScorers}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
