import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import {
  ClasamentePublicView,
  LeagueItem,
  ClubStoryItem,
  LiveMatchCardItem,
  LeagueStandingRow,
} from "@/components/ClasamentePublicView";

export const dynamic = "force-dynamic";

export default async function ClasamentePublicPage({
  searchParams,
}: {
  searchParams?: { id?: string; sport?: string; county?: string; teamId?: string };
}) {
  const targetId = searchParams?.id || null;

  // 1. Fetch all active championships with teams and matches
  const championships = await prisma.championship.findMany({
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
        orderBy: [{ scheduledAt: "asc" }, { round: "asc" }],
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  // 2. Process standings and form for each championship
  const leagues: LeagueItem[] = championships.map((c) => {
    const teams = c.teams || [];
    const matches = c.matches || [];

    const statsMap = new Map<
      string,
      {
        teamId: string;
        name: string;
        shortName: string;
        color: string;
        logoUrl?: string | null;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        ga: number;
        points: number;
        formResults: { date: Date; res: "V" | "E" | "Î" }[];
      }
    >();

    teams.forEach((t) => {
      statsMap.set(t.id, {
        teamId: t.id,
        name: t.name,
        shortName: t.shortName || t.name.substring(0, 3).toUpperCase(),
        color: t.color || "#1e293b",
        logoUrl: t.logoUrl || null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0,
        formResults: [],
      });
    });

    matches.forEach((m) => {
      if (m.status !== "finished" || m.homeScore === null || m.awayScore === null) return;
      const home = statsMap.get(m.homeTeamId);
      const away = statsMap.get(m.awayTeamId);

      const matchDate = m.scheduledAt ? new Date(m.scheduledAt) : new Date();

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
          home.formResults.push({ date: matchDate, res: "V" });
        }
        if (away) {
          away.lost += 1;
          away.formResults.push({ date: matchDate, res: "Î" });
        }
      } else if (m.homeScore < m.awayScore) {
        if (away) {
          away.won += 1;
          away.points += 3;
          away.formResults.push({ date: matchDate, res: "V" });
        }
        if (home) {
          home.lost += 1;
          home.formResults.push({ date: matchDate, res: "Î" });
        }
      } else {
        if (home) {
          home.drawn += 1;
          home.points += 1;
          home.formResults.push({ date: matchDate, res: "E" });
        }
        if (away) {
          away.drawn += 1;
          away.points += 1;
          away.formResults.push({ date: matchDate, res: "E" });
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

    const standings: LeagueStandingRow[] = sortedStats.map((s, idx) => {
      // Last 5 results sorted chronologically
      const form = s.formResults
        .sort((x, y) => x.date.getTime() - y.date.getTime())
        .slice(-5)
        .map((x) => x.res);

      return {
        position: idx + 1,
        teamId: s.teamId,
        teamName: s.name,
        shortName: s.shortName,
        color: s.color,
        logoUrl: s.logoUrl,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        goalDiff: s.gf - s.ga,
        points: s.points,
        form,
      };
    });

    return {
      id: c.id,
      name: c.name,
      sport: c.sport || "Fotbal",
      season: c.season || "2026/2027",
      scope: c.scope,
      county: c.county,
      city: c.city,
      logoUrl: c.logoUrl,
      shareCode: c.shareCode,
      format: c.format === "round_robin" ? "Sistem Ligă (Tur-Retur)" : "Grupe & Eliminatoriu",
      standings,
      totalTeams: teams.length,
      totalMatches: matches.length,
    };
  });

  // 3. Build Top Clubs Story list across all leagues
  const allClubsMap = new Map<string, ClubStoryItem>();
  leagues.forEach((l) => {
    l.standings.forEach((t) => {
      if (!allClubsMap.has(t.teamId)) {
        let badgeTag: string | null = null;
        if (t.position === 1) badgeTag = "Lider";
        else if (t.position <= 3) badgeTag = `Top ${t.position}`;

        allClubsMap.set(t.teamId, {
          id: t.teamId,
          name: t.teamName,
          shortName: t.shortName,
          color: t.color,
          logoUrl: t.logoUrl,
          championshipId: l.id,
          championshipName: l.name,
          county: l.county,
          position: t.position,
          points: t.points,
          badgeTag,
        });
      }
    });
  });

  const clubs = Array.from(allClubsMap.values()).sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return b.points - a.points;
  });

  // 4. Build Live / Recent Matches
  const allMatchesList: LiveMatchCardItem[] = [];
  championships.forEach((c) => {
    (c.matches || []).forEach((m) => {
      let minuteOrTime = "Programat";
      if (m.status === "live") {
        minuteOrTime = "Repriza 1 • 38'";
      } else if (m.status === "finished") {
        minuteOrTime = "Finalizat";
      } else if (m.scheduledAt) {
        const d = new Date(m.scheduledAt);
        minuteOrTime = d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }) + " • " + d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
      }

      allMatchesList.push({
        id: m.id,
        championshipId: c.id,
        championshipName: c.name,
        sport: c.sport || "Fotbal",
        county: c.county,
        stage: m.stage || `Etapa ${m.round}`,
        round: m.round,
        status: m.status,
        minuteOrTime,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeTeam: {
          id: m.homeTeam?.id || "",
          name: m.homeTeam?.name || "Echipă Gazdă",
          shortName: m.homeTeam?.shortName,
          color: m.homeTeam?.color,
          logoUrl: m.homeTeam?.logoUrl,
        },
        awayTeam: {
          id: m.awayTeam?.id || "",
          name: m.awayTeam?.name || "Echipă Oaspete",
          shortName: m.awayTeam?.shortName,
          color: m.awayTeam?.color,
          logoUrl: m.awayTeam?.logoUrl,
        },
        venue: m.venue,
      });
    });
  });

  // Sort matches: live first, then finished, then scheduled
  allMatchesList.sort((a, b) => {
    const statusOrder: Record<string, number> = { live: 0, finished: 1, scheduled: 2 };
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader currentTab="clasamente" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <ClasamentePublicView
          leagues={leagues}
          clubs={clubs}
          liveMatches={allMatchesList}
          initialSelectedLeagueId={targetId}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
