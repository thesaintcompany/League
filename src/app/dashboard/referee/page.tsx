import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { RefereeDashboardPanel, MatchOfficiatingItem } from "@/components/RefereeDashboardPanel";

export const dynamic = "force-dynamic";

export default async function RefereeDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // Find the referee user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      refereeBadge: true,
      experienceYears: true,
      image: true,
      coverPhotoUrl: true,
    },
  });

  if (!user) redirect("/signin");

  // Fetch matches assigned to this referee
  // Or fallback to championship matches so the referee always has test assignments
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
  const upcomingMatchRaw = assignedMatches.find((m) => m.status !== "finished") || assignedMatches[0] || null;
  const matchHistoryRaw = assignedMatches.filter((m) => m.status === "finished" && m.id !== upcomingMatchRaw?.id);

  // Convert Date objects to strings for serialization
  const upcomingMatch: MatchOfficiatingItem | null = upcomingMatchRaw
    ? {
      ...upcomingMatchRaw,
      scheduledAt: upcomingMatchRaw.scheduledAt.toISOString(),
      signedAt: upcomingMatchRaw.signedAt ? upcomingMatchRaw.signedAt.toISOString() : null,
    }
    : null;

  const matchHistory: MatchOfficiatingItem[] = matchHistoryRaw.map((m) => ({
    ...m,
    scheduledAt: m.scheduledAt.toISOString(),
    signedAt: m.signedAt ? m.signedAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      {/* Role-isolated Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Panou Oficial de Arbitraj"
          subtitle={`Bine ai venit, ${user.name || "Arbitru Oficial"} (${user.refereeBadge || "  Pro"})!`}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-7xl">
          <RefereeDashboardPanel
            refereeUser={{
              id: user.id,
              name: user.name || "Arbitru Oficial",
              email: user.email,
              refereeBadge: user.refereeBadge,
              experienceYears: user.experienceYears,
              image: user.image,
              coverPhotoUrl: user.coverPhotoUrl,
            }}
            upcomingMatch={upcomingMatch}
            matchHistory={matchHistory}
          />
        </main>
      </div>
    </div>
  );
}
