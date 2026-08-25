import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  if (userRole === "arena_owner") {
    redirect("/dashboard/arena");
  }
  if (userRole === "player") {
    redirect("/profile");
  }
  if (userRole === "referee") {
    redirect("/dashboard/referee");
  }
  if (userRole === "team_leader") {
    redirect("/dashboard/team");
  }

  const championships = await prisma.championship.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { teams: true, matches: true },
      },
      matches: {
        take: 3,
        orderBy: { scheduledAt: "asc" },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  const totalTeams = championships.reduce((sum, c) => sum + c._count.teams, 0);
  const totalMatches = championships.reduce((sum, c) => sum + c._count.matches, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Panou Organizator"
          subtitle={`Bine ai revenit, ${session.user.name || session.user.email}!`}
          action={
            <Link
              href="/dashboard/new"
              className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl shadow-sm bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Campionat Nou
            </Link>
          }
        />

        <main className="p-6 lg:p-10 space-y-8 max-w-7xl">
          {/* Bento Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Campionate Active
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white data-font mt-1">
                  {championships.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/50 text-lime-800 dark:text-lime-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">trophy</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Echipe Înscrise
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white data-font mt-1">
                  {totalTeams}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Meciuri Programate
                </p>
                <p className="text-3xl font-black text-slate-900 dark:text-white data-font mt-1">
                  {totalMatches}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">sports_soccer</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="card p-6 bg-slate-950 text-white border border-slate-800 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-lime-400 font-bold">
                  Status Sistem
                </p>
                <p className="text-2xl font-black data-font mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
                  OPERAȚIONAL
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-lime-400">bolt</span>
              </div>
            </div>
          </div>

          {/* Championships Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-6 bg-lime-500 rounded-full"></span>
                <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white">
                  Competițiile Tale
                </h2>
              </div>
            </div>

            {championships.length === 0 ? (
              <div className="card p-12 text-center bg-white dark:bg-slate-900 border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-3xl">
                <div className="w-16 h-16 rounded-3xl bg-lime-100 dark:bg-lime-950/40 text-lime-700 mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">emoji_events</span>
                </div>
                <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white">
                  Nu ai creat niciun campionat încă
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 font-body">
                  Pornește propria ligă sau turneu eliminatoriu în câteva secunde. Adaugă echipe,
                  programează etapele și transmite rezultate în timp real.
                </p>
                <Link
                  href="/dashboard/new"
                  className="btn btn-primary mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-3 px-6 rounded-xl bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Creează Primul Campionat
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {championships.map((champ) => (
                  <div
                    key={champ.id}
                    className="card p-6 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider font-label">
                          {champ.sport} • {champ.format === "knockout" ? "Turneu Eliminatoriu" : "Ligă"}
                        </span>
                        {champ.season && (
                          <span className="text-[10px] text-slate-400 font-label font-semibold">
                            {champ.season}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-1">
                        {champ.name}
                      </h3>

                      {champ.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {champ.description}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-label text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">groups</span>
                          <strong>{champ._count.teams}</strong> echipe
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">sports_soccer</span>
                          <strong>{champ._count.matches}</strong> meciuri
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                      <Link
                        href={`/dashboard/championships/${champ.id}`}
                        className="btn btn-primary flex-1 text-xs uppercase tracking-wider font-bold py-2.5 rounded-xl bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 text-center shadow-sm"
                      >
                        Administrează ⚙️
                      </Link>
                      <Link
                        href="/"
                        className="btn btn-secondary px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Vizualizare Publică"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
