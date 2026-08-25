import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
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
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Profil Utilizator"
          subtitle={`Rol activ: ${roleLabels[currentRole] || "Utilizator"}`}
        />

        <main className="p-6 lg:p-10 max-w-4xl space-y-8">
          {/* Profile Hero Card */}
          <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                    {user.name || "Utilizator Ligue"}
                  </h2>
                  <p className="text-xs text-slate-500 font-label">{user.email}</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-label mt-2 shadow-sm">
                    {roleLabels[currentRole] || "Organizator"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-slate-800"
                >
                  Panou de Control ↗
                </Link>
              </div>
            </div>

            {/* Role-Specific Telemetry Panels */}
            <div className="mt-8 space-y-6">
              {/* 1. Fotbalist / Jucator Profile */}
              {currentRole === "player" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-lime-600">directions_run</span>
                    Fișă Tehnică Jucător
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Număr Tricou
                      </p>
                      <p className="text-2xl font-black text-blue-950 dark:text-white data-font mt-1">
                        #{user.jerseyNumber || 10}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Poziție în Teren
                      </p>
                      <p className="text-base font-bold text-blue-950 dark:text-white mt-1">
                        {user.position || "Mijlocaș Ofensiv"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Picior de Bază
                      </p>
                      <p className="text-base font-bold text-blue-950 dark:text-white mt-1">
                        {user.preferredFoot || "Drept"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Arbitru Profile */}
              {currentRole === "referee" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-lime-600">sports</span>
                    Licență &amp; Delegări Arbitraj
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Insignă / Categorie
                      </p>
                      <p className="text-lg font-black text-blue-950 dark:text-white data-font mt-1">
                        {user.refereeBadge || "FIFA Pro Official"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Experiență Arbitraj
                      </p>
                      <p className="text-lg font-bold text-blue-950 dark:text-white mt-1">
                        {user.experienceYears || 8} Ani în competiții oficiale
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Proprietar Arena / Baza Sportiva */}
              {currentRole === "arena_owner" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-lime-600">stadium</span>
                      Arene &amp; Stadioane Înregistrate
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {user.venues.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-surface-container-low text-center text-xs text-slate-500">
                        Nicio arenă înregistrată. Contactează organizatorul pentru alocare.
                      </div>
                    ) : (
                      user.venues.map((v) => (
                        <div
                          key={v.id}
                          className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-blue-950 dark:text-white font-headline">
                              {v.name}
                            </p>
                            <p className="text-xs text-slate-400">{v.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-800 text-[10px] font-bold uppercase">
                              {v.surface}
                            </span>
                            <span className="block text-xs font-bold text-slate-600 mt-1">
                              {v.capacity} Locuri
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 4. Organizator Profile */}
              {currentRole === "organizer" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-lime-600">trophy</span>
                    Statistici Organizator
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Campionate Administrate
                      </p>
                      <p className="text-2xl font-black text-blue-950 dark:text-white data-font mt-1">
                        {user.championships.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold">
                        Statut Platformă
                      </p>
                      <p className="text-base font-bold text-lime-600 dark:text-lime-400 mt-1">
                        Verificat • Drepturi depline
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
