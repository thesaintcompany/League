import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { ChampionshipTabs } from "@/components/ChampionshipTabs";
import { notFound } from "next/navigation";

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
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="badge-slate">{champ.sport}</span>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{champ.name}</h1>
            {champ.season && <p className="text-slate-500">{champ.season}</p>}
            {champ.description && <p className="mt-3 text-slate-600 max-w-2xl">{champ.description}</p>}
          </div>
        </div>

        <ChampionshipTabs
          championshipId={champ.id}
          teams={champ.teams.map((t) => ({
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            color: t.color,
            players: t.players.map((p) => ({ id: p.id, name: p.name, number: p.number, position: p.position })),
          }))}
          matches={champ.matches.map((m) => ({
            id: m.id,
            scheduledAt: m.scheduledAt.toISOString(),
            venue: m.venue,
            round: m.round,
            status: m.status,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name },
            awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name },
          }))}
        />
      </main>
    </>
  );
}
