import { prisma } from "@/lib/prisma";
import { PublicTeamsCatalog } from "@/components/PublicTeamsCatalog";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function PublicTeamsPage() {
  const teams = await prisma.team.findMany({
    include: {
      players: true,
      championship: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="teams" />

      {/* Teams Catalog with Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        <PublicTeamsCatalog initialTeams={teams} />
      </main>

      <PublicFooter />
    </div>
  );
}
