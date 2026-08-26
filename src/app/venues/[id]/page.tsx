import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { VenueDetailClientView } from "@/components/VenueDetailClientView";

export const dynamic = "force-dynamic";

export default async function PublicVenueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rawId = decodeURIComponent(params.id);

  // Resolve the exact arena requested by id, with a strict name fallback for legacy links.
  let venue = await prisma.venue.findUnique({
    where: { id: rawId },
    include: {
      owner: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (!venue) {
    venue = await prisma.venue.findFirst({
      where: {
        OR: [
          { name: rawId },
        ],
      },
      include: {
        owner: {
          select: { name: true, email: true, phone: true },
        },
      },
    });
  }

  if (!venue) notFound();

  // Show only matches directly linked to this arena through the saved venue name.
  const venueMatches = await prisma.match.findMany({
    where: { venue: venue.name },
    include: {
      homeTeam: true,
      awayTeam: true,
      championship: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  const allMatches = venue.sport === "multifunctional"
    ? venueMatches
    : venueMatches.filter((match) => {
        const venueSport = venue.sport.toLowerCase();
        const championshipSport = match.championship?.sport?.toLowerCase();
        return !championshipSport || championshipSport === venueSport;
      });

  const upcomingMatches = allMatches.filter(
    (m) => m.status === "scheduled" || m.status === "live"
  );
  const finishedMatches = allMatches.filter((m) => m.status === "finished");

  const competitions = Array.from(
    new Map(
      allMatches
        .filter((m) => m.championship)
        .map((m) => [m.championship!.id, {
          id: m.championship!.id,
          name: m.championship!.name,
          sport: m.championship!.sport,
          season: m.championship!.season,
        }])
    ).values()
  );

  const formattedUpcoming = upcomingMatches.map((m) => ({
    id: m.id,
    round: m.round,
    stage: m.stage,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    referee: m.referee,
    ticketPrice: m.ticketPrice || 30,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName,
      color: m.homeTeam.color,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName,
      color: m.awayTeam.color,
    },
    championship: m.championship
      ? {
          id: m.championship.id,
          name: m.championship.name,
          sport: m.championship.sport,
          season: m.championship.season,
        }
      : null,
  }));

  const formattedFinished = finishedMatches.map((m) => ({
    id: m.id,
    round: m.round,
    stage: m.stage,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    referee: m.referee,
    ticketPrice: m.ticketPrice,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName,
      color: m.homeTeam.color,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName,
      color: m.awayTeam.color,
    },
    championship: m.championship
      ? {
          id: m.championship.id,
          name: m.championship.name,
          sport: m.championship.sport,
          season: m.championship.season,
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="venues" />

      {/* Main Interactive Venue Detail View */}
      <main className="flex-1 pb-16">
        <VenueDetailClientView
          venue={{
            id: venue.id,
            name: venue.name,
            location: venue.location,
            address: venue.address,
            specs: venue.specs,
            amenities: venue.amenities,
            sport: venue.sport,
            surface: venue.surface,
            capacity: venue.capacity,
            floodlights: venue.floodlights,
            pricePerHour: venue.pricePerHour,
            imageUrl: venue.imageUrl,
            tickerText: venue.tickerText,
            tickerActive: venue.tickerActive,
            tickerSpeed: venue.tickerSpeed,
            ads: venue.ads,
            announcements: venue.announcements,
            owner: venue.owner,
          }}
          upcomingMatches={formattedUpcoming}
          finishedMatches={formattedFinished}
          competitions={competitions}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
