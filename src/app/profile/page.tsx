import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { PlayerProfileForm } from "@/components/PlayerProfileForm";
import { RefereeProfileForm } from "@/components/RefereeProfileForm";
import { SuperAdminProfileForm } from "@/components/SuperAdminProfileForm";
import Link from "next/link";
import { canEditPlayerProfile, isTeamLeader } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { userId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const sessionUser = session.user as any;
  const targetUserId = searchParams?.userId || sessionUser.id;

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      championships: true,
      venues: true,
    },
  });

  if (!user) redirect("/signin");

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    superadmin: "Super Admin",
    organizer: "Organizator  ",
    referee: "Arbitru Licențiat",
    player: "Fotbalist / Jucător",
    arena_owner: "Proprietar / Bază Sportivă",
    team_leader: "Manager Echipă",
    observer: "Observator  ",
  };

  const currentRole = user.role || "organizer";
  const isSuperAdminUser = currentRole === "super_admin" || currentRole === "superadmin";

  // Determine if logged-in user can edit target user profile
  let isEditable = canEditPlayerProfile(sessionUser, user.id);
  if (!isEditable && isTeamLeader(sessionUser)) {
    const managedTeam = await prisma.team.findFirst({
      where: { managerId: sessionUser.id },
      include: { players: true },
    });
    if (managedTeam) {
      const isPlayerInTeam = managedTeam.players.some(
        (p) => p.email === user.email || (user.name && p.name.toLowerCase() === user.name.toLowerCase())
      );
      if (isPlayerInTeam) {
        isEditable = true;
      }
    }
  }

  // Fetch system settings if Super Admin
  let systemSettings = null;
  if (isSuperAdminUser) {
    systemSettings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Profil &amp; Setări Cont"
          subtitle={`Rol activ: ${roleLabels[currentRole] || "Utilizator"}`}
        />

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-sm">
                  {roleLabels[currentRole] || "Utilizator Pro"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-label font-mono">
                  ID: {user.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight font-headline uppercase text-slate-900 dark:text-white mt-1">
                {user.name || "Super Administrator"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isSuperAdminUser ? (
                <Link
                  href="/dashboard/admin"
                  className="px-4 py-2.5 rounded-xl bg-lime-400 text-slate-950 hover:bg-lime-300 font-headline font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition"
                >
                  <span>⚙️</span> Consolă Master ↗
                </Link>
              ) : currentRole === "organizer" ? (
                <Link
                  href="/dashboard"
                  className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
                >
                  Panou Organizator ↗
                </Link>
              ) : currentRole === "player" ? (
                <Link
                  href="/players"
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
                >
                  Catalog Public Jucători ↗
                </Link>
              ) : currentRole === "referee" ? (
                <Link
                  href="/referees"
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
                >
                  Corp Arbitri ↗
                </Link>
              ) : null}
            </div>
          </div>

          {/* SUPER ADMIN SPECIFIC VIEW: Direct in-place configuration */}
          {isSuperAdminUser ? (
            <SuperAdminProfileForm initialUser={user} initialSettings={systemSettings} />
          ) : currentRole === "referee" ? (
            /* Role-Adaptive Form for Referees */
            <RefereeProfileForm initialUser={user} />
          ) : (
            /* Role-Adaptive Form for Players / Organizers */
            <PlayerProfileForm initialUser={user} isEditable={isEditable} />
          )}
        </main>
      </div>
    </div>
  );
}
