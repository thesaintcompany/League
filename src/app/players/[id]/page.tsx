import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const dynamic = "force-dynamic";

function calculateFUTStats(position: string | null | undefined, rating: number = 8.8, goals: number = 10) {
  const base = Math.min(96, Math.max(75, Math.round(rating * 10)));
  const isAttacker = !position || position.includes("Atacant") || position.includes("Extremă") || position.includes("Ofensiv");
  const isMidfielder = position?.includes("Mijlocaș") || position?.includes("Central");
  const isDefender = position?.includes("Fundaș");

  return {
    pac: Math.min(98, base + (isAttacker ? 4 : isDefender ? -3 : 1)),
    sho: Math.min(99, base + (isAttacker ? Math.min(6, Math.round(goals / 3)) : isDefender ? -15 : 2)),
    pas: Math.min(95, base + (isMidfielder ? 5 : isAttacker ? 1 : -6)),
    dri: Math.min(97, base + (isAttacker ? 3 : isMidfielder ? 4 : -8)),
    def: Math.min(94, isDefender ? base + 6 : isMidfielder ? base - 8 : 42),
    phy: Math.min(95, base + (isDefender ? 5 : 0)),
    futRating: Math.min(95, Math.max(82, base + (goals > 12 ? 3 : 0))),
    positionShort: isDefender ? "CB" : isMidfielder ? "CAM" : "ST",
    finishing: Math.min(99, base + (isAttacker ? 7 : 0)),
    sprintSpeed: Math.min(98, base + 3),
    agility: Math.min(96, base + 2),
    vision: Math.min(95, base + (isMidfielder ? 6 : 0)),
    shotPower: Math.min(98, base + (isAttacker ? 6 : 2)),
    stamina: Math.min(94, base + 1),
  };
}

export default async function PublicPlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params?.id) notFound();

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

  // Find team matches safely
  const matches = player.teamId
    ? await prisma.match.findMany({
        where: {
          OR: [{ homeTeamId: player.teamId }, { awayTeamId: player.teamId }],
        },
        include: { homeTeam: true, awayTeam: true },
        orderBy: { scheduledAt: "desc" },
        take: 6,
      })
    : [];

  const fut = calculateFUTStats(player.position, player.rating || 8.8, player.goals || 10);
  const defaultCover =
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";
  const defaultAvatar =
    player.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white relative transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="players" />

      {/* Hero Header with B&W Legendary Player Silhouette Shadow Background */}
      <section className="relative overflow-hidden border-b border-amber-400/20 py-12 px-4 sm:px-6 lg:px-8">
        {/* High Transparency B&W Silhouette Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity filter contrast-125 pointer-events-none"
          style={{ backgroundImage: "url('/images/legend-player-shadow-bw.jpg')" }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/90 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
                <span className="material-symbols-outlined">star</span>   ULTIMATE ATLET
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs font-label">
                #{player.number || 10} • {player.position || "Atacant Central"}
              </span>
              <span
                className="px-3 py-1 rounded-full text-white text-xs font-black uppercase font-label shadow-sm"
                style={{ backgroundColor: player.team?.color || "#1e293b" }}
              >
                {player.team?.name}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-lg">
              {player.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-body flex items-center gap-2">
              <span className="text-amber-400 font-bold"><span className="material-symbols-outlined text-xs align-middle">flag</span> România</span>
              <span>•</span>
              <span>{player.team?.championship?.name || "Liga Pro România"}</span>
              <span>•</span>
              <span className="text-lime-400 font-bold"><span className="material-symbols-outlined align-middle">sports_soccer</span> {player.goals || 0} Goluri Marcate</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/players"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20 flex items-center gap-1.5"
            >
              ← Înapoi la Golgheteri
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Giant   FUT Gold Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-amber-300 via-amber-600 to-slate-950 border border-amber-300/80 shadow-2xl shadow-amber-500/20">
              <div className="bg-slate-950/95 rounded-[22px] p-6 relative overflow-hidden space-y-6">
                {/* Header:   Rating, Position, Nation, Club */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black font-headline text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)] leading-none">
                      {fut.futRating}
                    </span>
                    <span className="text-sm font-black font-headline uppercase text-amber-400 tracking-wider mt-1">
                      {fut.positionShort}
                    </span>
                    <div className="w-6 h-4 rounded-sm overflow-hidden mt-1.5 border border-white/20 shadow-sm" title="România">
                      <div className="w-full h-full flex">
                        <span className="w-1/3 h-full bg-blue-600"></span>
                        <span className="w-1/3 h-full bg-yellow-400"></span>
                        <span className="w-1/3 h-full bg-red-600"></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase font-label shadow-md inline-block">
                      GOLD CARD
                    </span>
                    <p className="text-xs font-bold text-slate-300 font-label mt-1">
                      #{player.number || 10} • {player.team?.shortName || "CLUB"}
                    </p>
                  </div>
                </div>

                {/* 9:16 Full-Body Shot in Card */}
                <div className="aspect-[9/12] w-full rounded-2xl overflow-hidden relative bg-slate-900 border border-amber-400/30 shadow-inner group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={defaultAvatar}
                    alt={player.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] font-label font-bold text-amber-400 uppercase tracking-widest">
                      Fișă Oficială Atlet
                    </span>
                    <h2 className="font-headline font-black text-white text-2xl uppercase tracking-tight leading-tight">
                      {player.name}
                    </h2>
                    <p className="text-xs text-slate-300 font-label">
                      {player.position || "Atacant Central"} • {player.team?.name}
                    </p>
                  </div>
                </div>

                {/* FUT 6-Attributes Matrix */}
                <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-800 text-center font-headline">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-sm font-black text-white block">{fut.pac}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">PAC</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-400/30">
                    <span className="text-sm font-black text-amber-400 block">{fut.sho}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">SHO</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-sm font-black text-white block">{fut.pas}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">PAS</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-sm font-black text-white block">{fut.dri}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">DRI</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-sm font-black text-slate-300 block">{fut.def}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">DEF</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-lime-400/30">
                    <span className="text-sm font-black text-lime-400 block">{fut.phy}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">PHY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connectivity */}
            <div className="card p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3 shadow-md">
              <h4 className="font-headline font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Rețele Sociale  e
              </h4>
              <div className="flex gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 rounded-xl text-xs font-bold font-label flex items-center justify-center gap-1.5 transition border border-pink-200/60 dark:border-pink-800/40"
                >
                  <span><span className="material-symbols-outlined align-middle text-sm">photo_camera</span></span> Instagram
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-label flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
                >
                  <span>𝕏</span> Twitter / X
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Attributes & Match Statistics (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bento Season Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-md dark:shadow-xl hover:shadow-lg transition">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Goluri Înscrise
                </span>
                <span className="text-3xl sm:text-4xl font-black data-font text-amber-500 dark:text-amber-400 mt-1 block">
                  {player.goals || 0} <span className="material-symbols-outlined align-middle">sports_soccer</span>
                </span>
              </div>

              <div className="card p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-md dark:shadow-xl hover:shadow-lg transition">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Pase de Gol
                </span>
                <span className="text-3xl sm:text-4xl font-black data-font text-lime-600 dark:text-lime-400 mt-1 block">
                  {player.assists || 6} 
                </span>
              </div>

              <div className="card p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-md dark:shadow-xl hover:shadow-lg transition">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Meciuri Jucate
                </span>
                <span className="text-3xl sm:text-4xl font-black data-font text-slate-900 dark:text-white mt-1 block">
                  {player.matchesCount || 18}
                </span>
              </div>

              <div className="card p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center shadow-md dark:shadow-xl hover:shadow-lg transition">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                  Rating
                </span>
                <span className="text-3xl sm:text-4xl font-black data-font text-amber-500 dark:text-amber-400 mt-1 block">
                  {fut.futRating} <span className="material-symbols-outlined align-middle">star</span>
                </span>
              </div>
            </div>

            {/* Detailed Attribute Breakdown Bars */}
            <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-[2rem] space-y-6 shadow-xl dark:shadow-2xl">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-2xl border border-amber-400/40 shadow-inner">
                  <span className="material-symbols-outlined align-middle text-sm">bolt</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-headline text-slate-900 dark:text-white">
                    Atribute Tehnice &amp; Parametri de Performanță
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    Statistici calibrate conform standardelor  e de elită
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Finishing */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Finalizare &amp; Șut (Finishing)</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">{fut.finishing} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${fut.finishing}%` }}></div>
                  </div>
                </div>

                {/* Sprint Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Viteză Maximă (Sprint Speed)</span>
                    <span className="text-lime-600 dark:text-lime-400 font-black">{fut.sprintSpeed} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-lime-400 to-lime-500 rounded-full" style={{ width: `${fut.sprintSpeed}%` }}></div>
                  </div>
                </div>

                {/* Agility */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Agilitate &amp; Dribling</span>
                    <span className="text-blue-600 dark:text-blue-400 font-black">{fut.agility} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${fut.agility}%` }}></div>
                  </div>
                </div>

                {/* Shot Power */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Forță Șut (Shot Power)</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">{fut.shotPower} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${fut.shotPower}%` }}></div>
                  </div>
                </div>

                {/* Vision */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Viziune &amp; Pase Decisive</span>
                    <span className="text-purple-600 dark:text-purple-400 font-black">{fut.vision} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" style={{ width: `${fut.vision}%` }}></div>
                  </div>
                </div>

                {/* Stamina */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Rezistență Fizică (Stamina)</span>
                    <span className="text-lime-600 dark:text-lime-400 font-black">{fut.stamina} / 99</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-lime-400 to-lime-500 rounded-full" style={{ width: `${fut.stamina}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Match Appearances */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 dark:text-amber-400">sports_soccer</span>
                  Meciuri  e &amp; Rapoarte
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-label font-bold">
                  {matches.length} Partide
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 text-center text-xs text-slate-500 font-label border border-slate-200 dark:border-slate-800 shadow-sm">
                  Momentan nu sunt meciuri înregistrate pentru acest jucător.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="card p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 shadow-md hover:border-amber-400/60 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                        <span>Etapa {m.round}</span>
                        <span>
                          {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white font-headline">
                        <span className="truncate">{m.homeTeam.name}</span>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-black data-font text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                          {m.status === "finished" ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                        </span>
                        <span className="truncate">{m.awayTeam.name}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                          {m.venue || "Arena  ă"}
                        </span>
                        <Link
                          href={`/matches/${m.id}/report`}
                          target="_blank"
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline font-label flex items-center gap-0.5"
                        >
                          <span>Raport PDF</span>
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
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

      <PublicFooter />
    </div>
  );
}
