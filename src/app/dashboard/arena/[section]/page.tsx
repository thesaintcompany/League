import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { ArenaOwnerPanel } from "@/components/ArenaOwnerPanel";
import { isArenaAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const sectionTabs = {
  championships: "championships",
  matches: "calendar",
  ads: "ads",
  announcements: "announcements",
  ticker: "ticker",
} as const;

export default async function ArenaOwnerSectionPage({
  params,
}: {
  params: { section: keyof typeof sectionTabs };
}) {
  const tab = sectionTabs[params.section];
  if (!tab) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/signin?callbackUrl=/dashboard/arena/${params.section}`);
  }

  const user = session.user as any;
  if (!isArenaAdmin(user)) redirect("/dashboard");

  let venue = user.id
    ? await prisma.venue.findFirst({
      where: { ownerId: user.id },
    })
    : null;

  if (!venue && session.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email.trim().toLowerCase() },
    });
    if (dbUser) {
      venue = await prisma.venue.findFirst({
        where: { ownerId: dbUser.id },
      });
    }
  }

  let matchesData: any[] = [];
  if (venue) {
    const venueMatches = await prisma.match.findMany({
      where: { venue: venue.name },
      include: { homeTeam: true, awayTeam: true, championship: true },
      orderBy: { scheduledAt: "asc" },
    });

    const matches = venue.sport === "multifunctional"
      ? venueMatches
      : venueMatches.filter((match) => {
        const championshipSport = match.championship?.sport?.toLowerCase();
        return !championshipSport || championshipSport === venue.sport.toLowerCase();
      });

    const blockedSlots = await prisma.venueBlockedSlot.findMany({
      where: { venueId: venue.id },
      orderBy: { startTime: "asc" },
    });

    matchesData = [
      ...matches.map((match) => ({
        id: match.id,
        type: "match",
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        championshipId: match.championshipId,
        championshipName: match.championship.name,
        scheduledAt: match.scheduledAt.toISOString(),
        venue: match.venue,
        referee: match.referee,
        status: match.status,
      })),
      ...blockedSlots.map((slot) => ({
        id: slot.id,
        type: "blocked",
        homeTeam: slot.title,
        awayTeam: "",
        championshipName: "Sincronizare Externă",
        scheduledAt: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        venue: venue.name,
        status: "blocked",
      })),
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Manager Arena"
          subtitle="Gestionează secțiunea selectată a bazei tale sportive"
        />
        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl">
          <ArenaOwnerPanel initialVenue={venue} initialMatches={matchesData} initialTab={tab} />
        </main>
      </div>
    </div>
  );
}
