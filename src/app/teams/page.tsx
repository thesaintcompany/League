import { prisma } from "@/lib/prisma";
import { PublicTeamsCatalog } from "@/components/PublicTeamsCatalog";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SportsBackgroundSilhouette } from "@/components/SportsBackgroundSilhouette";
import { getCurrentSeasonLabel } from "@/lib/season";

export const dynamic = "force-dynamic";

export default async function PublicTeamsPage() {
  const [teams, settings] = await Promise.all([
    prisma.team.findMany({
      include: {
        players: true,
        championship: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.systemSetting.findUnique({
      where: { id: "default" },
    }),
  ]);

  const activeSeason = getCurrentSeasonLabel(settings?.seasonYear, settings?.seasonMode);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200 relative overflow-x-hidden">
      {/* Dynamic Athletic Player Shadow & Watermark */}
      <SportsBackgroundSilhouette />

      {/* Top Navbar */}
      <PublicHeader currentTab="teams" showSportSubHeader={true} />

      {/* Teams Catalog with Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8 relative z-10">
        <PublicTeamsCatalog initialTeams={teams} activeSeason={activeSeason} />
      </main>

      <PublicFooter />
    </div>
  );
}
