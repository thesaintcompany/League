import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeamPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      championship: true,
      players: {
        orderBy: [{ isStarter: "desc" }, { number: "asc" }],
      },
      homeMatches: {
        where: { status: "scheduled" },
        include: { awayTeam: true, championship: true, homeTeam: true },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
      awayMatches: {
        where: { status: "scheduled" },
        include: { homeTeam: true, championship: true, awayTeam: true },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      },
    },
  });

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
        <PublicHeader currentTab="teams" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex-1 text-center">
          <h1 className="text-3xl font-black font-headline uppercase mb-4">Echipa nu a fost gătită</h1>
          <p className="text-slate-400 mb-6">Ne pare rău, echipa cerută nu există sau a fost eliminată.</p>
          <Link
            href="/teams"
            className="inline-block px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase transition"
          >
            Înapoi la Catalogul Echipelor
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const allUpcomingMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const starters = team.players.filter((p) => p.isStarter);
  const reserves = team.players.filter((p) => !p.isStarter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      <PublicHeader currentTab="teams" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-10">
        {/* Hero Section with Logo / Crest */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="relative h-56 sm:h-72 lg:h-80 bg-gradient-to-b from-lime-400/20 to-transparent">
            {/* Fanion / Crest (very important) */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 sm:-bottom-16 lg:-bottom-20 z-20">
              {team.logoUrl ? (
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-white dark:border-slate-950 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center">
                  <Image
                    src={team.logoUrl}
                    alt={`Fanionul {team.name}`}
                    fill
                    className="object-cover"
                    sizes="80vw"
                  />
                </div>
              ) : (
                <div
                  className="w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-white dark:border-slate-950 shadow-2xl flex items-center justify-center font-black text-white text-3xl sm:text-4xl lg:text-5xl font-headline uppercase"
                  style={{ backgroundColor: team.color || "#84cc16" }}
                >
                  {team.shortName || team.name.substring(0, 3).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="pt-20 sm:pt-24 pb-8 px-6 sm:px-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black font-headline uppercase text-slate-900 dark:text-white tracking-tight">
              {team.name}
            </h1>
            {team.shortName && (
              <p className="text-sm font-label font-bold text-slate-500 dark:text-slate-400 uppercase mt-2">
                {team.shortName}
              </p>
            )}
            {team.championship && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                🏆 {team.championship.name}
              </p>
            )}
          </div>

          {/* Decorative gradient overlay for the crest area */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-950 pointer-events-none"></div>
        </section>

        {/* Description Section */}
        {team.description && (
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight">
              Despre Echipa Noastră
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-body leading-relaxed whitespace-pre-line">
              {team.description}
            </p>
          </section>
        )}

        {/* Sponsors Section */}
        {team.sponsors && JSON.parse(team.sponsors).length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight">
              Sponsori
            </h2>
            <div className="flex flex-wrap gap-6 items-center">
              {JSON.parse(team.sponsors).map((sponsor: any) => (
                <a
                  key={sponsor.id}
                  href={sponsor.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center gap-2"
                >
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      width={80}
                      height={80}
                      className="object-contain grayscale group-hover:grayscale-0 transition"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                      {sponsor.name}
                    </div>
                  )}
                  <span className="text-xs font-label text-slate-600 dark:text-slate-400 group-hover:text-lime-500 transition">
                    {sponsor.name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Players / Squad Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Starters */}
          <div>
            <h2 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight mb-4">
              Titulari ({starters.length})
            </h2>
            <div className="space-y-2">
              {starters.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                    style={{ backgroundColor: team.color || "#84cc16" }}
                  >
                    {p.number || "—"}
                  </div>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-label text-slate-500 dark:text-slate-400 uppercase">
                      {p.position || "Jucător"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reserves */}
          <div>
            <h2 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight mb-4">
              Rezerve ({reserves.length})
            </h2>
            <div className="space-y-2">
              {reserves.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                    style={{ backgroundColor: "#94a3b8" }}
                  >
                    {p.number || "—"}
                  </div>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-label text-slate-500 dark:text-slate-400 uppercase">
                      {p.position || "Jucător"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Matches Section */}
        {allUpcomingMatches.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight">
              Meciurile Viitoare
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allUpcomingMatches.map((m) => {
                const isHome = m.homeTeam.id === team.id;
                const opponent = isHome ? m.awayTeam : m.homeTeam;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                        style={{ backgroundColor: isHome ? team.color || "#84cc16" : opponent.color || "#38bdf8" }}
                      >
                        {isHome ? (team.shortName || "HOME") : (opponent.shortName || "AWAY")}
                      </div>
                      <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                        {isHome ? team.name : opponent.name}
                      </span>
                    </div>
                    <div className="text-center text-xs font-label">
                      <p className="text-slate-500 dark:text-slate-400">
                        {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {new Date(m.scheduledAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-headline font-black text-xs text-slate-500 dark:text-slate-400">VS</span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                        style={{ backgroundColor: isHome ? opponent.color || "#38bdf8" : team.color || "#84cc16" }}
                      >
                        {isHome ? (opponent.shortName || "AWAY") : (team.shortName || "HOME")}
                      </div>
                      <span className="font-headline font-bold text-sm text-slate-900 dark:text-white text-right">
                        {isHome ? opponent.name : team.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
