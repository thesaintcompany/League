import { prisma } from "@/lib/prisma";
import { TournamentPhasesView } from "@/components/TournamentPhasesView";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function ClasamentePage({
  searchParams,
}: {
  searchParams?: { id?: string; code?: string; sport?: string };
}) {
  const rawId = searchParams?.id?.trim();
  const rawCode = searchParams?.code?.trim();

  // If specific ID or code passed, query championship
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

  // Format real standings & matches if targeted championship exists and has at least 4 teams
  let initialStandings: any[] = [];
  let formattedMatches: any[] = [];

  if (championship && championship.teams && championship.teams.length >= 4) {
    const teams = championship.teams;
    const matches = championship.matches || [];
    const half = Math.ceil(teams.length / 2);

    initialStandings = teams.map((t, idx) => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      color: t.color,
      logoUrl: t.logoUrl,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      group: idx < half ? "A" : "B",
    }));

    const standingsMap = new Map(initialStandings.map((s) => [s.id, s]));
    matches.forEach((m) => {
      if (m.status === "finished" || m.status === "completed") {
        const home = standingsMap.get(m.homeTeamId);
        const away = standingsMap.get(m.awayTeamId);
        const hs = Number(m.homeScore) || 0;
        const as = Number(m.awayScore) || 0;
        if (home) {
          home.goalsFor += hs;
          home.goalsAgainst += as;
          if (hs > as) {
            home.won += 1;
            home.points += 3;
          } else if (hs === as) {
            home.drawn += 1;
            home.points += 1;
          } else {
            home.lost += 1;
          }
          home.goalDiff = home.goalsFor - home.goalsAgainst;
        }
        if (away) {
          away.goalsFor += as;
          away.goalsAgainst += hs;
          if (as > hs) {
            away.won += 1;
            away.points += 3;
          } else if (as === hs) {
            away.drawn += 1;
            away.points += 1;
          } else {
            away.lost += 1;
          }
          away.goalDiff = away.goalsFor - away.goalsAgainst;
        }
      }
    });

    formattedMatches = matches.map((m) => ({
      id: m.id,
      homeTeam: {
        id: m.homeTeam?.id || "h",
        name: m.homeTeam?.name || "Echipă Gazdă",
        shortName: m.homeTeam?.shortName,
        color: m.homeTeam?.color,
        logoUrl: m.homeTeam?.logoUrl,
      },
      awayTeam: {
        id: m.awayTeam?.id || "a",
        name: m.awayTeam?.name || "Echipă Oaspete",
        shortName: m.awayTeam?.shortName,
        color: m.awayTeam?.color,
        logoUrl: m.awayTeam?.logoUrl,
      },
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      group: m.stage?.includes("B") ? "B" : "A",
      stage: m.stage || "Faza 1",
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : undefined,
    }));
  }

  const championshipTitle = championship?.name || "Dumbravița Generation Cup";

  return (
    <div className="min-h-screen bg-[#0f1217] font-body text-slate-100 flex flex-col transition-colors duration-200">
      <PublicHeader currentTab="clasamente" showSportSubHeader={true} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <TournamentPhasesView
          championshipName={championshipTitle}
          sport={championship?.sport || "fotbal"}
          initialStandings={initialStandings}
          matches={formattedMatches}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
