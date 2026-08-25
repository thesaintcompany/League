import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { ChampionshipPublicClientView } from "@/components/ChampionshipPublicClientView";

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
    take: 5,
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
      shortName: string;
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
      shortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
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

  const standings = sortedStats.map((s, idx) => ({
    position: idx + 1,
    teamId: s.teamId,
    teamName: s.name,
    shortName: s.shortName,
    color: s.color,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.gf,
    goalsAgainst: s.ga,
    goalDiff: s.gf - s.ga,
    points: s.points,
  }));

  const finishedMatches = rawMatches.filter((m) => m.status === "finished");
  const upcomingMatches = rawMatches.filter((m) => m.status !== "finished");

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
      {/* 1. Global Public Top Navbar */}
      <PublicHeader currentTab="campionat" />

      {/* 2. Client-Rendered Kinetic Precision Pro Hub */}
      <ChampionshipPublicClientView
        championship={championship ? {
          id: championship.id,
          name: championship.name,
          sport: championship.sport,
          season: championship.season || "2026",
          scope: championship.scope,
          county: championship.county,
          city: championship.city,
          shareCode: championship.shareCode || "LP-2026",
          description: championship.description,
        } : null}
        allChampionships={allChampionships.map((c) => ({
          id: c.id,
          name: c.name,
          sport: c.sport,
          season: c.season || "2026",
          format: c.format,
          teamsCount: c._count.teams,
        }))}
        standings={standings}
        allMatches={rawMatches.map((m) => ({
          id: m.id,
          round: m.round,
          stage: m.stage || "Etapa " + m.round,
          scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : "",
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
          venue: m.venue || "Arenă Oficială",
          bracketIndex: m.bracketIndex,
          homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName || m.homeTeam.name.substring(0, 3), color: m.homeTeam.color || "#84cc16" },
          awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName || m.awayTeam.name.substring(0, 3), color: m.awayTeam.color || "#38bdf8" },
        }))}
        finishedMatches={finishedMatches.map((m) => ({
          id: m.id,
          round: m.round,
          stage: m.stage || "Etapa " + m.round,
          scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : "",
          homeScore: m.homeScore ?? 0,
          awayScore: m.awayScore ?? 0,
          status: m.status,
          venue: m.venue || "Arenă Oficială",
          bracketIndex: m.bracketIndex,
          homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName || m.homeTeam.name.substring(0, 3), color: m.homeTeam.color || "#84cc16" },
          awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName || m.awayTeam.name.substring(0, 3), color: m.awayTeam.color || "#38bdf8" },
        }))}
        upcomingMatches={upcomingMatches.map((m) => ({
          id: m.id,
          round: m.round,
          stage: m.stage || "Etapa " + m.round,
          scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : "",
          venue: m.venue || "Arenă Oficială",
          status: m.status,
          bracketIndex: m.bracketIndex,
          homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName || m.homeTeam.name.substring(0, 3), color: m.homeTeam.color || "#84cc16" },
          awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName || m.awayTeam.name.substring(0, 3), color: m.awayTeam.color || "#38bdf8" },
        }))}
        topScorers={topPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          goals: p.goals,
          teamName: p.team?.name || "Club Oficial",
          image: p.image || null,
        }))}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500 mt-auto bg-slate-950">
        © {new Date().getFullYear()} Ligue Pro România • Format Kinetic High-Performance Championship. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
