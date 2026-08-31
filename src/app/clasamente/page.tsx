import { prisma } from "@/lib/prisma";
import { TournamentPhasesView } from "@/components/TournamentPhasesView";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ClasamenteListingView, type ChampionshipCard, type TopTeamItem, type LiveMatchItem } from "@/components/ClasamenteListingView";

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
        name: m.homeTeam?.name || "Echipa Gazda",
        shortName: m.homeTeam?.shortName,
        color: m.homeTeam?.color,
        logoUrl: m.homeTeam?.logoUrl,
      },
      awayTeam: {
        id: m.awayTeam?.id || "a",
        name: m.awayTeam?.name || "Echipa Oaspete",
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

  const championshipTitle = championship?.name || "Clasament Platforma";

  /* ─── Build listing data when no specific championship is selected ─── */
  let allChampionships: ChampionshipCard[] = [];
  let topTeams: TopTeamItem[] = [];
  let liveMatches: LiveMatchItem[] = [];

  if (!championship) {
    const rawChampionships = await prisma.championship.findMany({
      include: {
        teams: true,
        matches: true,
      },
      orderBy: { startDate: "desc" },
    });

    allChampionships = rawChampionships.map((c) => ({
      id: c.id,
      name: c.name,
      sport: c.sport || "fotbal",
      scope: c.scope || "national",
      county: c.county,
      city: c.city,
      logoUrl: c.logoUrl,
      season: c.season,
      format: c.format,
      teamsCount: c.teams?.length || 0,
      matchesCount: c.matches?.length || 0,
      finishedCount: (c.matches || []).filter(
        (m) => m.status === "finished" || m.status === "completed"
      ).length,
    }));

    /* ─── Top Teams: most active teams with logos ─── */
    const rawTeams = await prisma.team.findMany({
      include: {
        championship: { select: { name: true, sport: true } },
        homeMatches: { select: { id: true } },
        awayMatches: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    topTeams = rawTeams
      .map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.shortName || undefined,
        color: t.color || undefined,
        logoUrl: t.logoUrl || undefined,
        championshipName: t.championship?.name || "",
        sport: t.championship?.sport || "fotbal",
        matchCount: (t.homeMatches?.length || 0) + (t.awayMatches?.length || 0),
      }))
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 20);

    /* ─── Live Matches ─── */
    const rawLive = await prisma.match.findMany({
      where: { status: "live" },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, color: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, color: true, logoUrl: true } },
        championship: { select: { name: true, sport: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    });

    liveMatches = rawLive.map((m) => ({
      id: m.id,
      homeTeam: {
        id: m.homeTeam?.id || "",
        name: m.homeTeam?.name || "Echipa Gazda",
        shortName: m.homeTeam?.shortName || undefined,
        color: m.homeTeam?.color || undefined,
        logoUrl: m.homeTeam?.logoUrl || undefined,
      },
      awayTeam: {
        id: m.awayTeam?.id || "",
        name: m.awayTeam?.name || "Echipa Oaspete",
        shortName: m.awayTeam?.shortName || undefined,
        color: m.awayTeam?.color || undefined,
        logoUrl: m.awayTeam?.logoUrl || undefined,
      },
      homeScore: m.homeScore ?? 0,
      awayScore: m.awayScore ?? 0,
      stage: m.stage || "Etapa",
      venue: m.venue || undefined,
      championshipName: m.championship?.name || "",
      sport: m.championship?.sport || "fotbal",
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : undefined,
    }));
  }

  return (
    <div className="min-h-screen bg-slate-950 font-body text-white flex flex-col transition-colors duration-200">
      <PublicHeader currentTab="clasamente" showSportSubHeader={true} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 lg:pb-10">
        {championship ? (
          <TournamentPhasesView
            championshipId={championship.id}
            championshipCode={championship.shareCode || undefined}
            championshipName={championshipTitle}
            sport={championship.sport || "fotbal"}
            season={championship.season || undefined}
            initialStandings={initialStandings}
            matches={formattedMatches}
          />
        ) : (
          <ClasamenteListingView
            championships={allChampionships}
            topTeams={topTeams}
            liveMatches={liveMatches}
          />
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

