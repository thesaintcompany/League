import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { RefereeDashboardPanel, MatchOfficiatingItem } from "@/components/RefereeDashboardPanel";

export const dynamic = "force-dynamic";

export default async function RefereeDashboardPage(props: {
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}) {
  const rawParams = props.searchParams;
  let searchParams: { tab?: string } = {};
  if (rawParams) {
    if (typeof (rawParams as any).then === "function") {
      searchParams = (await (rawParams as Promise<{ tab?: string }>)) || {};
    } else {
      searchParams = (rawParams as { tab?: string }) || {};
    }
  }

  const currentTab = searchParams.tab || "overview";

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const userId = (session.user as any).id;

  // Find the referee user profile with complete contact info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      role: true,
      primarySport: true,
      refereeBadge: true,
      experienceYears: true,
      image: true,
      coverPhotoUrl: true,
    },
  });

  if (!user) redirect("/signin");

  // Fetch matches assigned to this referee
  const assignedMatches = await prisma.match.findMany({
    where: {
      OR: [
        {
          referee: {
            contains: user.name || "",
          },
        },
        {
          referee: null,
        },
        {
          referee: "",
        },
      ],
    },
    include: {
      homeTeam: {
        select: { id: true, name: true, shortName: true, color: true, logoUrl: true },
      },
      awayTeam: {
        select: { id: true, name: true, shortName: true, color: true, logoUrl: true },
      },
      championship: {
        select: { id: true, name: true, sport: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  // Separate upcoming match from match history
  const liveOrUpcomingMatch = assignedMatches.find((m) => m.status === "live") ||
    assignedMatches.find((m) => m.status !== "finished") ||
    assignedMatches[0] || null;

  const matchHistoryRaw = assignedMatches.filter((m) => m.status === "finished");
  const upcomingMatchesRaw = assignedMatches.filter((m) => m.status !== "finished");

  // Convert Date objects to strings for serialization
  const upcomingMatch: MatchOfficiatingItem | null = liveOrUpcomingMatch
    ? {
      ...liveOrUpcomingMatch,
      scheduledAt: liveOrUpcomingMatch.scheduledAt.toISOString(),
      signedAt: liveOrUpcomingMatch.signedAt ? liveOrUpcomingMatch.signedAt.toISOString() : null,
      refereeConfirmedAt: liveOrUpcomingMatch.refereeConfirmedAt ? liveOrUpcomingMatch.refereeConfirmedAt.toISOString() : null,
    }
    : null;

  const matchHistory: MatchOfficiatingItem[] = matchHistoryRaw.map((m) => ({
    ...m,
    scheduledAt: m.scheduledAt.toISOString(),
    signedAt: m.signedAt ? m.signedAt.toISOString() : null,
    refereeConfirmedAt: m.refereeConfirmedAt ? m.refereeConfirmedAt.toISOString() : null,
  }));

  const pendingMatches: MatchOfficiatingItem[] = upcomingMatchesRaw.map((m) => ({
    ...m,
    scheduledAt: m.scheduledAt.toISOString(),
    signedAt: m.signedAt ? m.signedAt.toISOString() : null,
    refereeConfirmedAt: m.refereeConfirmedAt ? m.refereeConfirmedAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      {/* Role-isolated Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Panou Oficial de Arbitraj"
          subtitle={`Bine ai venit, ${user.name || "Arbitru Oficial"} (${user.refereeBadge || "RIFA"})`}
        />

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1 max-w-7xl">
          <RefereeDashboardPanel
            refereeUser={{
              id: user.id,
              name: user.name || "Arbitru Oficial",
              email: user.email,
              phone: user.phone || "",
              bio: user.bio || "",
              primarySport: user.primarySport || "fotbal",
              refereeBadge: user.refereeBadge,
              experienceYears: user.experienceYears,
              image: user.image,
              coverPhotoUrl: user.coverPhotoUrl,
            }}
            upcomingMatch={upcomingMatch}
            matchHistory={matchHistory}
            pendingMatches={pendingMatches}
            initialTab={currentTab}
          />
        </main>
      </div>
    </div>
  );
}
