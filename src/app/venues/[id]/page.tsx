import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isActive: boolean;
}

export default async function PublicVenueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (!venue) notFound();

  // Parse Ads
  let adsList: AdItem[] = [];
  try {
    if (venue.ads) adsList = JSON.parse(venue.ads);
  } catch {
    adsList = [];
  }
  const activeAds = adsList.filter((a) => a.isActive);

  // Parse Announcements
  let annList: AnnouncementItem[] = [];
  try {
    if (venue.announcements) annList = JSON.parse(venue.announcements);
  } catch {
    annList = [];
  }
  const activeAnnouncements = annList.filter((a) => a.isActive);

  // Find all matches for this venue
  const allMatches = await prisma.match.findMany({
    where: { venue: venue.name },
    include: {
      homeTeam: true,
      awayTeam: true,
      championship: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  const finishedMatches = allMatches.filter((m) => m.status === "finished");
  const upcomingMatches = allMatches.filter((m) => m.status === "scheduled" || m.status === "live");

  // Calculate arena telemetry
  const totalGoals = finishedMatches.reduce(
    (acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0
  );
  const avgGoals = finishedMatches.length > 0 ? (totalGoals / finishedMatches.length).toFixed(1) : "—";

  // Group finished matches by championship and round
  const groupedResults: Record<string, typeof finishedMatches> = {};
  finishedMatches.forEach((m) => {
    const key = `${m.championship.name} • Etapa ${m.round}`;
    if (!groupedResults[key]) groupedResults[key] = [];
    groupedResults[key].push(m);
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <PublicHeader currentTab="venues" />

      {/* Live Scrolling Ticker Marquee if active */}
      {venue.tickerActive && venue.tickerText && (
        <div className="bg-primary text-white py-2.5 px-4 flex items-center gap-3 overflow-hidden border-b border-lime-400/30">
          <div className="px-2.5 py-0.5 rounded-lg bg-lime-400 text-slate-950 font-black text-[9px] uppercase font-label shrink-0 shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
            TICKER ARENĂ
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div
              className="inline-block font-headline font-bold text-xs text-lime-300 animate-marquee"
              style={{ animationDuration: `${venue.tickerSpeed || 20}s` }}
            >
              {venue.tickerText}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Stadium Glow */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-lime-400/30 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105"
          style={{ backgroundImage: `url('${venue.imageUrl || "/images/stadium-hero.jpg"}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-lg">
                Arenă Oficială Ligue Pro
              </span>
              <span className="px-3.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold font-label uppercase border border-slate-700">
                Sport: {venue.sport} • Gazon: {venue.surface}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-2xl">
              {venue.name}
            </h1>

            <p className="mt-3 text-slate-200 text-sm sm:text-base flex items-center gap-2 font-label drop-shadow">
              <span className="material-symbols-outlined text-lime-400">location_on</span>
              {venue.location} {venue.address ? `• ${venue.address}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(venue.name + " " + (venue.address || venue.location))}`}
              target="_blank"
              rel="noreferrer"
              className="btn bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-wider py-3 px-5 rounded-2xl shadow-xl transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">map</span>
              Vezi Indicații Rutiere
            </a>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Capacitate Spectatori
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              {venue.capacity.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Locuri pe scaune în tribune</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Meciuri Disputate
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              {finishedMatches.length}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Partide oficiale jucate</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Total Goluri Marcate
            </span>
            <p className="text-3xl font-black text-lime-600 dark:text-lime-400 data-font mt-2">
              {totalGoals} ⚽
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Spectacol garantat pe teren</p>
          </div>

          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Medie Goluri / Meci
            </span>
            <p className="text-3xl font-black text-lime-600 dark:text-lime-400 data-font mt-2">
              {avgGoals}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Reușite per meci disputat</p>
          </div>
        </div>

        {/* Written Announcements from Arena Owner */}
        {activeAnnouncements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="w-2.5 h-6 bg-lime-500 rounded-full"></span>
              <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Comunicate &amp; Anunțuri Oficiale ale Arenei
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-2 border-l-4 border-l-lime-400"
                >
                  <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                    📅 {ann.date}
                  </span>
                  <h4 className="font-headline font-bold text-base text-blue-950 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sponsor Banners & Advertising Space */}
        {activeAds.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="w-2.5 h-6 bg-secondary-container rounded-full"></span>
              <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Sponsori &amp; Parteneri Oficiali Arenă
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAds.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition group block"
                >
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] font-label font-bold uppercase text-lime-400">
                        Partener Oficial
                      </span>
                      <h4 className="font-headline font-bold text-base text-white">
                        {ad.title}
                      </h4>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Section 1: Upcoming Matches Scheduled on this Venue */}
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-lime-500 rounded-full"></span>
              <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Meciuri Programate pe Arenă
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-400 uppercase">
              {upcomingMatches.length} Partide
            </span>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface-container-low text-center text-xs text-slate-500 font-label">
              Nu sunt meciuri viitoare programate pe această arenă în următoarele zile.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map((m) => (
                <div
                  key={m.id}
                  className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                    <span className="text-lime-600 font-bold">
                      {m.championship.name} • Etapa {m.round}
                    </span>
                    <span>
                      {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-bold text-base text-blue-950 dark:text-white font-headline py-2">
                    <span className="truncate w-5/12">{m.homeTeam.name}</span>
                    <span className="w-2/12 text-center text-xs text-slate-400 font-normal">VS</span>
                    <span className="truncate w-5/12 text-right">{m.awayTeam.name}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-[11px] text-slate-500 font-label">
                      {m.referee ? `⚖️ ${m.referee}` : "Arbitru nedelegat"}
                    </span>
                    <Link
                      href={`/matches/${m.id}/promo`}
                      className="text-lime-600 font-bold hover:underline text-[11px] font-label"
                    >
                      Promo Meci ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Historical Match Results Grouped by League & Round */}
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-primary rounded-full"></span>
              <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Istoric Meciuri &amp; Rezultate pe Arenă
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-400 uppercase">
              {finishedMatches.length} Partide Jucate
            </span>
          </div>

          {finishedMatches.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface-container-low text-center text-xs text-slate-500 font-label">
              Nu există încă meciuri finalizate pe această arenă.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([groupTitle, groupMatches]) => (
                <div key={groupTitle} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold font-label uppercase">
                      {groupTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupMatches.map((m) => (
                      <div
                        key={m.id}
                        className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                          <span>
                            {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-lime-600 font-bold">✓ Finalizat</span>
                        </div>

                        {/* Score Banner */}
                        <div className="flex justify-between items-center font-bold text-base text-blue-950 dark:text-white font-headline py-1">
                          <span className="truncate w-5/12">{m.homeTeam.name}</span>
                          <span className="w-2/12 text-center text-lg font-black data-font px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {m.homeScore} - {m.awayScore}
                          </span>
                          <span className="truncate w-5/12 text-right">{m.awayTeam.name}</span>
                        </div>

                        {m.referee && (
                          <p className="text-[11px] text-slate-400 font-label flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">sports</span>
                            Arbitru: {m.referee}
                          </p>
                        )}

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <Link
                            href={`/matches/${m.id}/report`}
                            target="_blank"
                            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold font-label uppercase tracking-wider text-center block transition"
                          >
                            📄 Raport Meci PDF
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
