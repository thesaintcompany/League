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
  let venue = await prisma.venue.findFirst({
    where: { ownerId: userId },
  });

  // If no arena assigned yet, fallback to default or first arena
  if (!venue) {
    venue = await prisma.venue.findFirst({
      where: { name: { contains: "Vasport" } },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Consolă Proprietar Arenă"
          subtitle="Configurează baza ta sportivă, spațiul de reclame, anunțurile și ticker-ul defilant"
        />

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl">
          <ArenaOwnerPanel initialVenue={venue} />
        </main>
      </div>
    </div>
  );
}
