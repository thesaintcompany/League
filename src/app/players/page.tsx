import { prisma } from "@/lib/prisma";
import { PublicPlayersCatalog } from "@/components/PublicPlayersCatalog";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

export default async function PublicPlayersPage() {
  const players = await prisma.player.findMany({
    include: {
      team: true,
    },
    orderBy: { goals: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="players" />

      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-16 px-6 lg:px-12 relative overflow-hidden border-b border-lime-400/20 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label inline-block mb-4 shadow-sm">
            Top Performeri • Sezonul Trecut
          </span>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Golgheterii &amp; Starurile din Liga Pro
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl font-body">
            Clasamentul oficial al celor mai buni 10 marcatori din sezonul trecut al <strong>Ligii Pro</strong>. Caută orice jucător după nume sau club pentru a-i vedea profilul complet!
          </p>
        </div>
      </section>

      {/* Players Catalog with Instant Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <PublicPlayersCatalog initialPlayers={players} />
      </main>

      <PublicFooter />
    </div>
  );
}
