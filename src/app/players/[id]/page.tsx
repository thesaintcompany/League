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
    take: 6,
  });

  const defaultCover =
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";
  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
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
            ← Înapoi la Catalog Jucători
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 9:16 Full-Body Visual Card & Headshot (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden relative group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                  Profil Atletic Oficial
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  PRO ATLET
                </span>
              </div>

              {/* 9:16 Full-Body Shot */}
              <div className="aspect-[9/14] w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaultCover}
                  alt={player.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest">
                    Poză în picioare (9:16)
                  </span>
                  <h2 className="font-headline font-bold text-white text-xl leading-tight">
                    {player.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-label">
                    #{player.number || 10} • {player.position || "Atacant"}
                  </p>
                </div>
              </div>

              {/* Face Avatar Overlay */}
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-lg -mt-10 z-20 relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={defaultAvatar}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-blue-950 dark:text-white leading-tight">
                    {player.name}
                  </h3>
                  <p className="font-label text-[11px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider">
                    {player.team?.name || "Echipă Oficială"}
                  </p>
                </div>
              </div>
            </div>

            {/* Fan Connectivity */}
            <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <h4 className="font-headline font-bold text-xs text-blue-950 dark:text-white uppercase tracking-wider">
                Fan Connectivity &amp; Social
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert("Profil Instagram oficial")}
                  className="flex-1 py-2.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 rounded-xl text-xs font-bold font-label flex items-center justify-center gap-1.5 transition hover:bg-pink-100"
                >
                  <span>📷</span> Instagram
                </button>
                <button
                  type="button"
                  onClick={() => alert("Profil Twitter/X oficial")}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-label flex items-center justify-center gap-1.5 transition hover:bg-slate-200"
                >
                  <span>𝕏</span> Twitter
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Player Telemetry & Match History (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bento Player Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Număr Tricou
                </span>
                <span className="text-3xl font-black data-font text-blue-950 dark:text-white mt-1 block">
                  #{player.number || 10}
                </span>
              </div>

              <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Poziție Teren
                </span>
                <span className="text-sm font-bold font-headline text-blue-950 dark:text-white mt-2 block truncate">
                  {player.position || "Atacant"}
                </span>
              </div>

              <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Picior Preferat
                </span>
                <span className="text-base font-bold font-headline text-lime-600 dark:text-lime-400 mt-2 block">
                  Drept (Right)
                </span>
              </div>

              <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Rating Performanță
                </span>
                <span className="text-3xl font-black data-font text-lime-600 dark:text-lime-400 mt-1 block">
                  8.8
                </span>
              </div>
            </div>

            {/* Team Affiliation Banner */}
            <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md"
                  style={{ backgroundColor: player.team?.color || "#1e293b" }}
                >
                  {player.team?.shortName || player.team?.name.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                    Club Sportiv Afiliat
                  </span>
                  <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                    {player.team?.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-label">
                    Competiție: {player.team?.championship?.name || "Liga Pro România"}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 text-xs font-bold font-label uppercase">
                Jucător Înregistrat ✓
              </span>
            </div>

            {/* Recent Match Appearances */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-600">sports_soccer</span>
                Meciuri Recente &amp; Programate
              </h3>

              {matches.length === 0 ? (
                <div className="p-8 rounded-3xl bg-surface-container-low text-center text-xs text-slate-500 font-label">
                  Momentan nu sunt meciuri înregistrate pentru acest jucător.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                        <span>Etapa {m.round}</span>
                        <span>
                          {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center font-bold text-sm text-blue-950 dark:text-white font-headline">
                        <span className="truncate">{m.homeTeam.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 data-font">
                          {m.status === "finished" ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                        </span>
                        <span className="truncate">{m.awayTeam.name}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-[11px] text-slate-500 font-label">
                          🏟️ {m.venue || "Arena Oficială"}
                        </span>
                        <Link
                          href={`/matches/${m.id}/promo`}
                          className="text-[11px] font-bold text-lime-600 hover:underline font-label"
                        >
                          Promo ↗
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400 mt-auto">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
