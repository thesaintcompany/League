import { prisma } from "@/lib/prisma";
import { PublicPlayersCatalog } from "@/components/PublicPlayersCatalog";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function PublicPlayersPage() {
  const players = await prisma.player.findMany({
    include: {
      team: true,
    },
    orderBy: { goals: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="players" showSportSubHeader={false} />

      {/* Players Catalog with Instant Search & Ultimate Edition Banner */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-8">
        <PublicPlayersCatalog initialPlayers={players} />
      </main>

      <PublicFooter />
    </div>
  );
}
