import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { VenueDetailClientView } from "@/components/VenueDetailClientView";

export const dynamic = "force-dynamic";

export default async function PublicVenueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const rawId = decodeURIComponent(params.id);

  // 1. Try finding venue by id, then by name
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
          { name: { contains: rawId } },
        ],
      },
      include: {
        owner: {
          select: { name: true, email: true, phone: true },
        },
      },
    });
  }

  // If still not found, fallback to first active venue or 404
  if (!venue) {
    venue = await prisma.venue.findFirst({
      where: { isActive: true },
      include: {
        owner: {
          select: { name: true, email: true, phone: true },
        },
      },
    });
  }

  if (!venue) notFound();

  // Find all matches for this venue
  let allMatches = await prisma.match.findMany({
    where: { venue: venue.name },
    include: {
      homeTeam: true,
      awayTeam: true,
      championship: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  // If this venue has no specific matches yet, load upcoming matches from active championships
  let upcomingMatches = allMatches.filter((m) => m.status === "scheduled" || m.status === "live");
  let finishedMatches = allMatches.filter((m) => m.status === "finished");

  if (upcomingMatches.length === 0) {
    const generalUpcoming = await prisma.match.findMany({
      where: { status: { in: ["scheduled", "live"] } },
      take: 4,
      include: {
        homeTeam: true,
        awayTeam: true,
        championship: true,
      },
      orderBy: { scheduledAt: "asc" },
    });
    upcomingMatches = generalUpcoming;
  }

  if (finishedMatches.length === 0) {
    const generalFinished = await prisma.match.findMany({
      where: { status: "finished" },
      take: 6,
      include: {
        homeTeam: true,
        awayTeam: true,
        championship: true,
      },
      orderBy: { scheduledAt: "desc" },
    });
    finishedMatches = generalFinished;
  }

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
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        © {new Date().getFullYear()} Ligue Pro România • Profil Oficial Arenă Sportivă. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
