import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
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
      <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
        <PublicHeader currentTab="campionat" />
        <MatchPromoClientView
          match={{
            id: fallbackMatch.id,
            round: fallbackMatch.round,
            stage: fallbackMatch.stage,
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
            },
            awayTeam: {
              id: fallbackMatch.awayTeam.id,
              name: fallbackMatch.awayTeam.name,
              shortName: fallbackMatch.awayTeam.shortName,
              color: fallbackMatch.awayTeam.color,
            },
          }}
        />
        <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500 mt-auto bg-slate-950">
          © {new Date().getFullYear()} Ligue Pro România • Meciul Etapei Promo.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
      <PublicHeader currentTab="campionat" />
      <MatchPromoClientView
        match={{
          id: match.id,
          round: match.round,
          stage: match.stage,
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
          },
          awayTeam: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            shortName: match.awayTeam.shortName,
            color: match.awayTeam.color,
          },
        }}
      />
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500 mt-auto bg-slate-950">
        © {new Date().getFullYear()} Ligue Pro România • Meciul Etapei Promo.
      </footer>
    </div>
  );
}
