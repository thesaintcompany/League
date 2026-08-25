import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicPlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      team: {
        include: {
          championship: true,
        },
      },
    },
  });

  if (!player) notFound();

  // Find team matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: player.teamId }, { awayTeamId: player.teamId }],
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary dark:bg-lime-400 flex items-center justify-center text-white dark:text-primary font-black text-lg shadow-sm">
              ⚡
            </div>
            <span className="text-xl font-black italic tracking-tight text-blue-950 dark:text-white uppercase font-headline">
              Ligue
            </span>
          </Link>

          <Link
            href="/players"
            className="text-xs font-label font-bold text-slate-500 hover:text-blue-950 dark:hover:text-white"
          >
            ← Înapoi la Jucători
          </Link>
        </div>
      </header>

      {/* Player Hero Section */}
      <section className="bg-primary text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Jersey Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-lime-400 text-slate-950 flex flex-col items-center justify-center shadow-xl">
              <span className="text-xs font-label font-bold uppercase tracking-widest text-slate-700">
                Tricou
              </span>
              <span className="text-4xl sm:text-5xl font-black data-font leading-none mt-0.5">
                #{player.number || 10}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider font-label"
                  style={{ backgroundColor: player.team?.color || "#1e293b" }}
                >
                  {player.team?.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold font-label uppercase">
                  {player.position || "Mijlocaș"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none text-white">
                {player.name}
              </h1>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm font-label">
                Competiție activă: {player.team?.championship?.name || "Liga Națională"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold font-label uppercase text-lime-400">
              Statut: Jucător Titular ✓
            </span>
          </div>
        </div>
      </section>

      {/* Bento Performance Telemetry Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Meciuri Jucate
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              {matches.filter((m) => m.status === "finished").length || 4}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Prezențe în teren</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Goluri Marcate
            </span>
            <p className="text-3xl font-black text-lime-600 dark:text-lime-400 data-font mt-2">
              3
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">În sezonul curent</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Cartonașe Galbene
            </span>
            <p className="text-3xl font-black text-amber-500 data-font mt-2">1</p>
            <p className="text-xs text-slate-500 font-label mt-1">Disciplină bună</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Rating Individual
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              8.6
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Scor performanță Ligue</p>
          </div>
        </div>

        {/* Match History */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600">history</span>
            Istoric Meciuri Recente
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                  <span>Etapa {m.round}</span>
                  <span className={m.status === "finished" ? "text-lime-600 font-bold" : ""}>
                    {m.status === "finished" ? "Finalizat" : "Programat"}
                  </span>
                </div>

                <div className="flex justify-between items-center font-bold text-sm text-blue-950 dark:text-white font-headline">
                  <span>{m.homeTeam.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 data-font">
                    {m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                  </span>
                  <span>{m.awayTeam.name}</span>
                </div>

                <div className="text-[10px] text-slate-400 font-label">
                  📍 {m.venue || "Stadion Oficial"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
