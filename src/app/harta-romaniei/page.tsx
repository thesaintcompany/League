import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { RomaniaChampionshipsMap } from "@/components/RomaniaChampionshipsMap";

export const dynamic = "force-dynamic";

export default async function RomaniaMapPage() {
  const championships = await prisma.championship.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { teams: true, matches: true },
      },
    },
  });

  const formatted = championships.map((c) => ({
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

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <PublicHeader currentTab="romania-map" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <RomaniaChampionshipsMap initialChampionships={formatted} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro România. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
