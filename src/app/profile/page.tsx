import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { PlayerProfileForm } from "@/components/PlayerProfileForm";
import { RefereeProfileForm } from "@/components/RefereeProfileForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      championships: true,
      venues: true,
    },
  });

  if (!user) redirect("/signin");

  const roleLabels: Record<string, string> = {
    organizer: "Organizator Oficial",
    referee: "Arbitru Licențiat",
    player: "Fotbalist / Jucător",
    arena_owner: "Proprietar Arenă / Bază Sportivă",
    team_leader: "Lider Club / Echipă",
    observer: "Observator Oficial",
  };

  const currentRole = user.role || "organizer";

  return (
    <div className="min-h-screen bg-surface flex font-body">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Profil &amp; Setări Cont"
          subtitle={`Rol activ: ${roleLabels[currentRole] || "Utilizator"}`}
        />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-sm">
                  {roleLabels[currentRole] || "Utilizator Pro"}
                </span>
                <span className="text-xs text-slate-500 font-label">
                  ID: {user.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tight font-headline uppercase text-blue-950 dark:text-white mt-1">
                {user.name || "Profil Utilizator"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {currentRole === "organizer" && (
                <Link
                  href="/dashboard"
                  className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
                >
                  Panou Organizator ↗
                </Link>
              )}
              {currentRole === "player" && (
                <Link
                  href="/players"
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
                >
                  Catalog Public Jucători ↗
                </Link>
              )}
              {currentRole === "referee" && (
                <Link
                  href="/referees"
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
                >
                  Corp Arbitri ↗
                </Link>
              )}
            </div>
          </div>

          {/* Role-Adaptive Form */}
          {currentRole === "referee" ? (
            <RefereeProfileForm initialUser={user} />
          ) : (
            <PlayerProfileForm initialUser={user} />
          )}
        </main>
      </div>
    </div>
  );
}
