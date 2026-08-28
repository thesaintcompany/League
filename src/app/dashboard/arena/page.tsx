import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { ArenaOwnerPanel } from "@/components/ArenaOwnerPanel";

import { isArenaAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ArenaOwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/dashboard/arena");
  }

  const user = session.user as any;
  if (!isArenaAdmin(user)) {
    redirect("/dashboard");
  }

  const userId = user.id;

  // Find arena for this user
  let venue = userId
    ? await prisma.venue.findFirst({
      where: { ownerId: userId },
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

  // Fetch real matches scheduled at this arena
  let matchesData: any[] = [];
  if (venue) {
    const venueMatches = await prisma.match.findMany({
      where: { venue: venue.name },
      include: {
        homeTeam: true,
        awayTeam: true,
        championship: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    const scheduledMatches = venue.sport === "multifunctional"
      ? venueMatches
      : venueMatches.filter((match) => {
        const championshipSport = match.championship?.sport?.toLowerCase();
        return !championshipSport || championshipSport === venue.sport.toLowerCase();
      });

    const blockedSlots = await prisma.venueBlockedSlot.findMany({
      where: { venueId: venue.id },
      orderBy: { startTime: "asc" },
    });

    // Format them for the VenueCalendar component
    matchesData = [
      ...scheduledMatches.map((m) => ({
        id: m.id,
        type: "match",
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        championshipId: m.championshipId,
        championshipName: m.championship.name,
        scheduledAt: m.scheduledAt.toISOString(),
        venue: m.venue,
        referee: m.referee,
        status: m.status,
      })),
      ...blockedSlots.map((b) => ({
        id: b.id,
        type: "blocked",
        homeTeam: b.title,
        awayTeam: "",
        championshipName: "Sincronizare Externă",
        scheduledAt: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        venue: venue?.name || "",
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
          subtitle="Configurează baza ta sportivă, spațiul de reclame, anunțurile și ticker-ul defilant"
        />

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl">
          <ArenaOwnerPanel initialVenue={venue} initialMatches={matchesData} />
        </main>
      </div>
    </div>
  );
}
