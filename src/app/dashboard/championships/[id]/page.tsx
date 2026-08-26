import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { ChampionshipTabs } from "@/components/ChampionshipTabs";

export const dynamic = "force-dynamic";

export default async function ChampionshipDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const champ = await prisma.championship.findFirst({
    where: { id: params.id, ownerId: (session.user as any).id },
    include: {
      teams: {
        include: { players: true },
        orderBy: { name: "asc" },
      },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!champ) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title={champ.name}
          subtitle={`${champ.sport} • ${champ.season || "Sezon Activ"}`}
          action={
            <Link
              href="/"
              className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2 px-3 rounded-xl flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span className="hidden sm:inline">Vizualizare Publică</span>
              <span className="sm:hidden">Public</span>
            </Link>
          }
        />

        <main className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl">
          {/* Championship Hero Card */}
          <div className="card p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-lime-400 text-slate-950 text-[10px] font-black rounded uppercase tracking-wider font-label">
                    {champ.sport}
                  </span>
                  <span className="text-slate-400 text-xs font-label uppercase tracking-widest font-semibold">
                    {champ.format === "knockout" ? "Turneu Eliminatoriu" : "Ligă Round-Robin"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-headline">
                  {champ.name}
                </h1>
                {champ.description && (
                  <p className="text-slate-300 mt-2 text-sm max-w-2xl font-body">
                    {champ.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 bg-white/10 px-6 py-4 rounded-2xl border border-white/10">
                <div className="text-center">
                  <span className="text-2xl font-black data-font text-lime-400 block">
                    {champ.teams.length}
                  </span>
                  <span className="text-[10px] font-label uppercase tracking-widest text-slate-300">
                    Echipe
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-white/20"></div>
                <div className="text-center">
                  <span className="text-2xl font-black data-font text-lime-400 block">
                    {champ.matches.length}
                  </span>
                  <span className="text-[10px] font-label uppercase tracking-widest text-slate-300">
                    Meciuri
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Championship Tabs (Standings, Matches, Teams) */}
          <ChampionshipTabs
            championshipId={champ.id}
            teams={champ.teams.map((t) => ({
              id: t.id,
              name: t.name,
              shortName: t.shortName,
              color: t.color,
              players: t.players.map((p) => ({
                id: p.id,
                name: p.name,
                number: p.number,
                position: p.position,
              })),
            }))}
            matches={champ.matches.map((m) => ({
              id: m.id,
              scheduledAt: m.scheduledAt.toISOString(),
              venue: m.venue,
              round: m.round,
              status: m.status,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, color: m.homeTeam.color },
              awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, color: m.awayTeam.color },
            }))}
          />
        </main>
      </div>
    </div>
  );
}
