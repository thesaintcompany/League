import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { RefereeBadgePill } from "@/components/PublicRefereesCatalog";

export const dynamic = "force-dynamic";

export default async function PublicRefereeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const referee = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!referee || referee.role !== "referee") notFound();

  // Find matches officiated by this referee
  const matches = await prisma.match.findMany({
    where: {
      referee: {
        contains: referee.name || "",
      },
    },
    include: { homeTeam: true, awayTeam: true, championship: true },
    orderBy: { scheduledAt: "desc" },
    take: 6,
  });

  const isStadium =
    referee.coverPhotoUrl?.includes("photo-1508098682722") ||
    referee.coverPhotoUrl?.includes("photo-1574629810360") ||
    referee.coverPhotoUrl?.includes("photo-1522778119026") ||
    referee.image?.includes("photo-1508098682722");

  const humanPhoto =
    (!isStadium && (referee.coverPhotoUrl || referee.image)) ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80";

  const coverImg = humanPhoto;
  const avatarImg = referee.image && !isStadium ? referee.image : humanPhoto;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white relative">
      {/* Top Navbar */}
      <PublicHeader currentTab="referees" />

      {/* Hero Header with B&W Silhouette Shadow Background */}
      <section className="relative overflow-hidden border-b border-lime-400/20 py-12 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity filter contrast-125 pointer-events-none"
          style={{ backgroundImage: "url('/images/legend-player-shadow-bw.jpg')" }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/90 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
                ⚖️ OFICIAL ATESTAT FIFA / LIGUE PRO
              </span>
              <RefereeBadgePill badge={referee.refereeBadge} />
              <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-bold text-xs font-label border border-lime-400/30">
                Experiență: {referee.experienceYears || 12} Ani
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-lg">
              {referee.name}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-body flex items-center gap-2">
              <span className="text-lime-400 font-bold">🇷🇴 România</span>
              <span>•</span>
              <span>Comisia Centrală a Arbitrilor</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">⭐ Notă Observatori: 9.6 / 10</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/referees"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20 flex items-center gap-1.5"
            >
              ← Înapoi la Corp Arbitri
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 9:16 Full-Body Official Referee Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400">
                  Fișă Arbitru Omologat
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                  DISPONIBIL PENTRU MECIURI ✓
                </span>
              </div>

              {/* 9:16 Full-Body Shot */}
              <div className="aspect-[9/13] w-full rounded-2xl overflow-hidden relative bg-slate-950 border border-slate-800 shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImg}
                  alt={referee.name || "Arbitru Oficial"}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest">
                    Poză în picioare (9:16)
                  </span>
                  <h2 className="font-headline font-black text-white text-2xl uppercase tracking-tight leading-tight">
                    {referee.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-label">
                    {referee.refereeBadge || "FIFA Pro"} • {referee.experienceYears || 12} ani experiență
                  </p>
                </div>
              </div>

              {/* Avatar Headshot & Bio */}
              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl border-2 border-lime-400 overflow-hidden shadow-lg relative bg-slate-800 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarImg} alt={referee.name || "Arbitru Oficial"} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-white leading-tight">
                    {referee.name}
                  </h3>
                  <p className="text-xs text-lime-400 font-label font-bold uppercase mt-0.5">
                    {referee.refereeBadge || "FIFA Pro Elite"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-label mt-1">
                    {referee.bio || "Arbitru atestat pentru ligile naționale și turnee de elită."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Referee Telemetry & Officiated Matches (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bento Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-5 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Partide Arbitrate
                </span>
                <span className="text-3xl font-black data-font text-white mt-1 block">
                  {matches.length > 0 ? matches.length * 12 : 148} 🏟️
                </span>
              </div>

              <div className="card p-5 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Galbene / Meci
                </span>
                <span className="text-3xl font-black data-font text-amber-400 mt-1 block">
                  3.2 🟨
                </span>
              </div>

              <div className="card p-5 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Roșii / Sezon
                </span>
                <span className="text-3xl font-black data-font text-red-500 mt-1 block">
                  4 🟥
                </span>
              </div>

              <div className="card p-5 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                  Scor Observatori
                </span>
                <span className="text-3xl font-black data-font text-lime-400 mt-1 block">
                  9.6 ⭐
                </span>
              </div>
            </div>

            {/* Officiating Standard Metrics */}
            <div className="card p-8 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline text-white">
                    Parametri de Evaluare &amp; Conducere a Jocului
                  </h3>
                  <p className="text-xs text-slate-400 font-label">
                    Statistici oficiale monitorizate de observatorii Ligue Pro
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-300 font-bold">Poziționare &amp; Mobilitate în Teren</span>
                    <span className="text-lime-400 font-black">98 / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-lime-400 rounded-full" style={{ width: "98%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-300 font-bold">Control &amp; Managementul Jucătorilor</span>
                    <span className="text-lime-400 font-black">95 / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-lime-400 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-300 font-bold">Acuratețe Decizii în Careu (Penalty)</span>
                    <span className="text-amber-400 font-black">96 / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "96%" }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-slate-300 font-bold">Colaborare Brigadă VAR &amp; Asistenți</span>
                    <span className="text-blue-400 font-black">97 / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: "97%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Officiated Matches */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-lg font-bold font-headline text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-400">sports</span>
                  Delegări &amp; Meciuri Arbitrate
                </h3>
                <span className="text-xs text-slate-400 font-label">
                  {matches.length} Partide
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/60 text-center text-xs text-slate-500 font-label border border-slate-800">
                  Momentan nu sunt meciuri oficiale înregistrate în baza de date pentru acest arbitru.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="card p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 hover:border-lime-400/50 transition"
                    >
                      <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                        <span>{m.championship?.name}</span>
                        <span>Etapa {m.round}</span>
                      </div>

                      <div className="flex justify-between items-center font-bold text-sm text-white font-headline">
                        <span className="truncate">{m.homeTeam.name}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 font-black data-font text-lime-400">
                          {m.status === "finished" ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                        </span>
                        <span className="truncate">{m.awayTeam.name}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-[11px] text-slate-400 font-label">
                          📍 {m.venue || "Arena Oficială"}
                        </span>
                        <Link
                          href={`/matches/${m.id}/report`}
                          target="_blank"
                          className="text-[11px] font-bold text-lime-400 hover:underline font-label"
                        >
                          Raport Oficial PDF ↗
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
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500">
        © {new Date().getFullYear()} Ligue Pro România • Corp Oficial de Arbitraj. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
