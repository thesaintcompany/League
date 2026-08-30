import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { RomaniaChampionshipsMap } from "@/components/RomaniaChampionshipsMap";

export const dynamic = "force-dynamic";

export default async function RomaniaMapPage() {
  const [championships, venues] = await Promise.all([
    prisma.championship.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { teams: true, matches: true },
        },
      },
    }),
    prisma.venue.findMany({
      where: { isActive: true },
      orderBy: [{ capacity: "desc" }, { name: "asc" }],
    }),
  ]);

  const formattedChampionships = championships.map((c) => ({
    id: c.id,
    name: c.name,
    sport: c.sport,
    format: c.format,
    season: c.season,
    scope: c.scope || "national",
    county: c.county,
    city: c.city,
    description: c.description,
    isBracketPublished: c.isBracketPublished,
    createdAt: c.createdAt.toISOString(),
    teamsCount: c._count.teams,
    matchesCount: c._count.matches,
  }));

  const formattedVenues = venues.map((v) => ({
    id: v.id,
    name: v.name,
    location: v.location,
    county: v.county,
    address: v.address,
    sport: v.sport,
    surface: v.surface,
    capacity: v.capacity,
    floodlights: v.floodlights,
    imageUrl: v.imageUrl,
    rating: v.rating,
    reviewCount: v.reviewCount,
    phone: v.phone,
    website: v.website,
    googleMapsUrl: v.googleMapsUrl,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="romania-map" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <RomaniaChampionshipsMap
          initialChampionships={formattedChampionships}
          initialVenues={formattedVenues}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
