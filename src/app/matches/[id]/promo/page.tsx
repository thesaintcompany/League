import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { MatchPromoClientView } from "@/components/MatchPromoClientView";

export const dynamic = "force-dynamic";

export default async function PublicMatchPromoPage({
  params,
}: {
  params: { id: string };
}) {
  const matchId = params.id;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      championship: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (!match) {
    // If not found, look for any match or 404
    const fallbackMatch = await prisma.match.findFirst({
      include: {
        championship: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!fallbackMatch) notFound();

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
        <PublicHeader currentTab="campionat" />
        <MatchPromoClientView
          match={{
            id: fallbackMatch.id,
            round: fallbackMatch.round,
            stage: fallbackMatch.stage,
            status: fallbackMatch.status,
            homeScore: fallbackMatch.homeScore,
            awayScore: fallbackMatch.awayScore,
            scheduledAt: fallbackMatch.scheduledAt ? fallbackMatch.scheduledAt.toISOString() : null,
            venue: fallbackMatch.venue,
            ticketPrice: fallbackMatch.ticketPrice,
            championship: fallbackMatch.championship
              ? {
                  id: fallbackMatch.championship.id,
                  name: fallbackMatch.championship.name,
                  sport: fallbackMatch.championship.sport,
                  season: fallbackMatch.championship.season,
                }
              : null,
            homeTeam: {
              id: fallbackMatch.homeTeam.id,
              name: fallbackMatch.homeTeam.name,
              shortName: fallbackMatch.homeTeam.shortName,
              color: fallbackMatch.homeTeam.color,
              logoUrl: fallbackMatch.homeTeam.logoUrl,
            },
            awayTeam: {
              id: fallbackMatch.awayTeam.id,
              name: fallbackMatch.awayTeam.name,
              shortName: fallbackMatch.awayTeam.shortName,
              color: fallbackMatch.awayTeam.color,
              logoUrl: fallbackMatch.awayTeam.logoUrl,
            },
          }}
        />
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      <PublicHeader currentTab="campionat" />
      <MatchPromoClientView
        match={{
          id: match.id,
          round: match.round,
          stage: match.stage,
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          scheduledAt: match.scheduledAt ? match.scheduledAt.toISOString() : null,
          venue: match.venue,
          ticketPrice: match.ticketPrice,
          championship: match.championship
            ? {
                id: match.championship.id,
                name: match.championship.name,
                sport: match.championship.sport,
                season: match.championship.season,
              }
            : null,
          homeTeam: {
            id: match.homeTeam.id,
            name: match.homeTeam.name,
            shortName: match.homeTeam.shortName,
            color: match.homeTeam.color,
            logoUrl: match.homeTeam.logoUrl,
          },
          awayTeam: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            shortName: match.awayTeam.shortName,
            color: match.awayTeam.color,
            logoUrl: match.awayTeam.logoUrl,
          },
        }}
      />
      <PublicFooter />
    </div>
  );
}
