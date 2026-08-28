import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { TeamShareButton } from "@/components/TeamShareButton";
import { TeamNewsFeed } from "@/components/TeamNewsFeed";
import { generateClubNewsFeed } from "@/lib/teamNewsGenerator";
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
        include: { awayTeam: true, championship: true, homeTeam: true },
        orderBy: { scheduledAt: "desc" },
      },
      awayMatches: {
        include: { homeTeam: true, championship: true, awayTeam: true },
        orderBy: { scheduledAt: "desc" },
      },
      news: {
        orderBy: { createdAt: "desc" },
      },
      manager: {
        select: { id: true, name: true, managerXp: true, managerBadge: true },
      },
    },
  });

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
        <PublicHeader currentTab="teams" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex-1 text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">shield</span>
          </div>
          <h1 className="text-3xl font-black font-headline uppercase mb-2">Echipa nu a fost găsită</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Echipa cerută nu există pe platformă sau a fost retrasă.</p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Catalog Echipe</span>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Combine and sort all matches
  const allMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])];

  // 1. Live Matches (in progress)
  const liveMatches = allMatches.filter(
    (m) => m.status === "live" || m.status === "in_progress"
  );

  // 2. Upcoming Matches (scheduled for the future)
  const upcomingMatches = allMatches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  // 3. Finished Matches (match history)
  const finishedMatches = allMatches
    .filter((m) => m.status === "finished" || m.status === "completed")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  // Calculate Team Career / Season Statistics
  let totalMatches = finishedMatches.length;
  let wins = 0;
  let draws = 0;
  let defeats = 0;
  let goalsScored = 0;
  let goalsConceded = 0;

  finishedMatches.forEach((m) => {
    const isHome = m.homeTeamId === team.id;
    const teamScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

    goalsScored += teamScore;
    goalsConceded += oppScore;

    if (teamScore > oppScore) {
      wins++;
    } else if (teamScore === oppScore) {
      draws++;
    } else {
      defeats++;
    }
  });

  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const goalDiff = goalsScored - goalsConceded;

  const starters = team.players.filter((p) => p.isStarter);
  const reserves = team.players.filter((p) => !p.isStarter);

  // Generate automated & manual club news feed
  const newsFeed = generateClubNewsFeed(team);

  // Fallback cover if team manager didn't upload one
  const coverImage =
    team.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-slate-950 font-body text-slate-100 flex flex-col transition-colors duration-200">
      <PublicHeader currentTab="teams" />

      {/* Hero Banner Section with Team Group Photo */}
      <section className="relative w-full border-b border-slate-800 bg-slate-950 overflow-hidden">
        {/* Background Group Cover Photo */}
        <div className="relative h-72 sm:h-96 lg:h-[420px] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={`Poză de grup ${team.name}`}
            className="w-full h-full object-cover object-center opacity-40 brightness-75 scale-105 transform hover:scale-100 transition duration-700"
          />
          {/* Multi-layered Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </div>

        {/* Hero Content Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 relative z-20 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            {/* Team Crest & Titles */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Crest / Logo */}
              <div className="relative group shrink-0">
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-slate-900/90 backdrop-blur-md border-4 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center transition group-hover:border-lime-400"
                  style={{ borderColor: team.color || undefined }}
                >
                  {team.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-2xl flex items-center justify-center font-black text-white text-3xl sm:text-4xl font-headline uppercase"
                      style={{ backgroundColor: team.color || "#84cc16" }}
                    >
                      {team.shortName || team.name.substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Sport Badge */}
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-mono tracking-wider shadow-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">sports_soccer</span>
                  <span>{team.sport || "Fotbal"}</span>
                </div>
              </div>

              {/* Team Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase">
                    {team.shortName || "CLUB OFICIAL"}
                  </span>
                  {team.championship && (
                    <Link
                      href={`/campionat?id=${team.championship.id}`}
                      className="px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold hover:bg-lime-400 hover:text-slate-950 transition flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">emoji_events</span>
                      <span>{team.championship.name}</span>
                    </Link>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl sm:text-5xl font-black font-headline uppercase tracking-tight text-white">
                    {team.name}
                  </h1>
                  {team.checkInVerified && (
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white font-black text-[11px] font-mono uppercase shadow-lg border border-sky-400"
                      title={`Check-in la stadion confirmat prin GPS la ${team.checkInVenue || "teren"}`}
                    >
                      <span className="material-symbols-outlined text-sm font-black">verified</span>
                      <span>Check-in Teren</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
                  {team.checkInVerified && team.lastCheckInAt && (
                    <div className="flex items-center gap-1 text-sky-400 font-bold">
                      <span className="material-symbols-outlined text-sm">where_to_vote</span>
                      <span>Prezență Teren Confirmată ({new Date(team.lastCheckInAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })})</span>
                    </div>
                  )}
                  {team.homeArena && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="material-symbols-outlined text-lime-400 text-sm">stadium</span>
                      <span>Arena Gazdă: <strong>{team.homeArena}</strong></span>
                    </div>
                  )}
                  {team.formation && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="material-symbols-outlined text-sky-400 text-sm">sports</span>
                      <span>Așezare Tactică: <strong>{team.formation}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    <span>Lot: <strong>{team.players.length} Jucători</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Quick Action */}
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <TeamShareButton teamName={team.name} />
              {team.championship && (
                <Link
                  href={`/campionat?id=${team.championship.id}`}
                  className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">leaderboard</span>
                  <span>Vezi Clasament</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">

        {/* 1. LIVE MATCH BANNER (if playing live now) */}
        {liveMatches.length > 0 && (
          <section className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500 shadow-2xl relative overflow-hidden animate-in fade-in">
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs uppercase font-mono tracking-wider">
                Meci în Desfășurare • LIVE
              </span>
            </div>

            <div className="max-w-4xl mx-auto py-2">
              {liveMatches.map((m) => {
                const isHome = m.homeTeamId === team.id;
                const opp = isHome ? m.awayTeam : m.homeTeam;
                return (
                  <div key={m.id} className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center">
                    {/* Home Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-end gap-1">
                      <p className="font-headline font-black text-lg sm:text-xl text-white uppercase">{m.homeTeam.name}</p>
                      <span className="text-xs text-slate-400 font-label">Gazde</span>
                    </div>

                    {/* Live Score */}
                    <div className="px-6 py-3 rounded-2xl bg-slate-950 border border-rose-500/40 text-center shadow-inner">
                      <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-widest">
                        {m.homeScore ?? 0} : {m.awayScore ?? 0}
                      </div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mt-1">
                        {m.venue || "Teren Oficial"}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-start gap-1">
                      <p className="font-headline font-black text-lg sm:text-xl text-white uppercase">{m.awayTeam.name}</p>
                      <span className="text-xs text-slate-400 font-label">Oaspeți</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. BENTO STATISTICS OVERVIEW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">query_stats</span>
              Statistici Generale Club
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Rată Victorii: <strong className="text-lime-400">{winRate}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Total matches */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-slate-400 tracking-wider">
                Total Matches
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-white mt-2">
                {totalMatches}
              </p>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Meciuri Înregistrate</span>
            </div>

            {/* Wins */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-emerald-400 tracking-wider">
                Wins (Victorii)
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-emerald-400 mt-2">
                {wins}
              </p>
              <span className="text-[10px] text-emerald-500/70 font-mono mt-1">{totalMatches > 0 ? `${Math.round((wins/totalMatches)*100)}% din total` : "0%"}</span>
            </div>

            {/* Draws */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-slate-300 tracking-wider">
                Draws (Egaluri)
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-slate-200 mt-2">
                {draws}
              </p>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Meciuri Remiză</span>
            </div>

            {/* Defeats */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-rose-400 tracking-wider">
                Defeats (Înfrângeri)
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-rose-400 mt-2">
                {defeats}
              </p>
              <span className="text-[10px] text-rose-500/70 font-mono mt-1">Meciuri Pierdute</span>
            </div>

            {/* Goals scored */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-lime-400 tracking-wider">
                Goals Scored
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-lime-400 mt-2">
                {goalsScored}
              </p>
              <span className="text-[10px] text-lime-500/70 font-mono mt-1">
                {totalMatches > 0 ? `${(goalsScored/totalMatches).toFixed(1)} / meci` : "0.0"}
              </span>
            </div>

            {/* Goals conceded */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-amber-400 tracking-wider">
                Goals Conceded
              </span>
              <p className="text-2xl sm:text-4xl font-black font-headline text-amber-400 mt-2">
                {goalsConceded}
              </p>
              <span className="text-[10px] text-amber-500/70 font-mono mt-1">
                Dif: <strong className={goalDiff >= 0 ? "text-emerald-400" : "text-rose-400"}>{goalDiff > 0 ? `+${goalDiff}` : goalDiff}</strong>
              </span>
            </div>
          </div>
        </section>

        {/* 3. NEXT SCHEDULED MATCH PREVIEW */}
        {nextMatch && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-mono tracking-wider">
                  Următorul Meci
                </span>
                <span className="text-xs text-slate-400 font-label">
                  {new Date(nextMatch.scheduledAt).toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })} • {new Date(nextMatch.scheduledAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {nextMatch.venue && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-sm text-lime-400">location_on</span>
                  <span>{nextMatch.venue}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-4">
              {/* Home Team */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md shrink-0 border border-white/10 uppercase"
                  style={{ backgroundColor: nextMatch.homeTeam.color || "#84cc16" }}
                >
                  {nextMatch.homeTeam.shortName || nextMatch.homeTeam.name.substring(0, 3)}
                </div>
                <div>
                  <h4 className="font-headline font-black text-base sm:text-lg text-white uppercase">
                    {nextMatch.homeTeam.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-label">Echipă Gazdă</span>
                </div>
              </div>

              {/* VS Divider */}
              <div className="text-center">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-lime-400 font-black text-xs font-mono uppercase tracking-wider">
                  VS
                </div>
                {nextMatch.championship && (
                  <p className="text-[11px] text-slate-400 mt-1 font-label">
                    {nextMatch.championship.name}
                  </p>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-start md:justify-end gap-4">
                <div className="text-left md:text-right">
                  <h4 className="font-headline font-black text-base sm:text-lg text-white uppercase">
                    {nextMatch.awayTeam.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-label">Echipă Oaspete</span>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md shrink-0 border border-white/10 uppercase"
                  style={{ backgroundColor: nextMatch.awayTeam.color || "#38bdf8" }}
                >
                  {nextMatch.awayTeam.shortName || nextMatch.awayTeam.name.substring(0, 3)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. MATCH HISTORY & RESULTS (FIFA / CONCACAF Format) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">history</span>
              Istoric Meciuri &amp; Rezultate (Match History)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {finishedMatches.length} meciuri încheiate
            </span>
          </div>

          {finishedMatches.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-slate-500 block">sports_score</span>
              <p className="font-bold text-sm text-slate-300">Nu există meciuri finalizate încă</p>
              <p className="text-xs text-slate-500">Rezultatele din campionat și etapele trecute vor apărea aici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {finishedMatches.map((m) => {
                const isHome = m.homeTeamId === team.id;
                const teamScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
                const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

                let resultBadge = "E";
                let resultClass = "bg-slate-700 text-slate-200 border-slate-600";
                let resultText = "Egal";

                if (teamScore > oppScore) {
                  resultBadge = "V";
                  resultClass = "bg-emerald-500 text-slate-950 border-emerald-400 font-black";
                  resultText = "Victorie";
                } else if (teamScore < oppScore) {
                  resultBadge = "Î";
                  resultClass = "bg-rose-500 text-white border-rose-400 font-black";
                  resultText = "Înfrângere";
                }

                return (
                  <div
                    key={m.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 transition shadow-sm space-y-3"
                  >
                    {/* Top Metadata: Date, Tournament, Stage, Stadium */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 font-mono">
                          {new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="text-lime-400 font-bold">
                          {m.championship?.name || "Campionat Oficial"}
                        </span>
                        {m.stage && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{m.stage.replace("_", " ")}</span>
                          </>
                        )}
                      </div>

                      {m.venue && (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <span className="material-symbols-outlined text-xs text-slate-500">stadium</span>
                          <span>{m.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Match Score Row (Full Width Format) */}
                    <div className="grid grid-cols-12 items-center gap-3 sm:gap-4 py-1">
                      {/* Result Badge */}
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs border shadow-sm ${resultClass}`}
                          title={resultText}
                        >
                          {resultBadge}
                        </span>
                      </div>

                      {/* Home Team */}
                      <div className="col-span-4 sm:col-span-4 flex items-center gap-2 sm:gap-3 justify-end text-right">
                        <span className={`font-headline font-bold text-xs sm:text-sm uppercase truncate ${m.homeTeamId === team.id ? "text-lime-400" : "text-white"}`}>
                          {m.homeTeam.name}
                        </span>
                        <div
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase border border-white/10"
                          style={{ backgroundColor: m.homeTeam.color || "#84cc16" }}
                        >
                          {m.homeTeam.shortName?.substring(0, 2) || m.homeTeam.name.substring(0, 2)}
                        </div>
                      </div>

                      {/* Score Box (FT) */}
                      <div className="col-span-2 sm:col-span-2 text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                          FT
                        </span>
                        <div className="text-base sm:text-xl font-black font-mono text-white tracking-widest bg-slate-950 px-2 sm:px-3 py-1 rounded-xl border border-slate-800 inline-block mt-0.5">
                          {m.homeScore ?? 0} - {m.awayScore ?? 0}
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="col-span-4 sm:col-span-4 flex items-center gap-2 sm:gap-3 justify-start text-left">
                        <div
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase border border-white/10"
                          style={{ backgroundColor: m.awayTeam.color || "#38bdf8" }}
                        >
                          {m.awayTeam.shortName?.substring(0, 2) || m.awayTeam.name.substring(0, 2)}
                        </div>
                        <span className={`font-headline font-bold text-xs sm:text-sm uppercase truncate ${m.awayTeamId === team.id ? "text-lime-400" : "text-white"}`}>
                          {m.awayTeam.name}
                        </span>
                      </div>

                      {/* Optional Action / Report */}
                      <div className="col-span-12 sm:col-span-1 flex justify-end">
                        <Link
                          href={`/matches/${m.id}/promo`}
                          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Vezi Raport Meci"
                        >
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. FEED ȘTIRI & COMUNICATE (PENTRU COPII ȘI PĂRINȚI) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">campaign</span>
              Feed Știri &amp; Comunicate Oficiale
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Actualizări Live pentru Părinți &amp; Suporteri
            </span>
          </div>

          <TeamNewsFeed
            news={newsFeed}
            teamId={team.id}
            teamName={team.name}
            isManager={false}
          />
        </section>

        {/* 6. TEAM ROSTER (STARTERS & RESERVES) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">groups</span>
              Lotul de Jucători Oficial ({team.players.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Starters (Primul 11) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="font-headline font-black text-xs uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">sports_soccer</span>
                  Titulari (Primul 11) — {starters.length} Jucători
                </span>
              </div>

              {starters.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center text-xs text-slate-500">
                  Niciun titular desemnat încă în lot.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starters.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3 shadow-sm"
                    >
                      {/* Jersey Number */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-slate-950 font-mono shrink-0 shadow-sm"
                        style={{ backgroundColor: team.color || "#84cc16" }}
                      >
                        {p.number ? `#${p.number}` : "—"}
                      </div>

                      {/* Photo & Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-headline font-bold text-xs text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-lime-400 font-label uppercase truncate mt-0.5">
                          {p.position || "Jucător"}
                        </p>
                      </div>

                      {/* Stats Badges */}
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        {p.goals > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 font-bold" title="Goluri">
                            {p.goals}G
                          </span>
                        )}
                        {p.yellowCards > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40" title="Cartonașe Galbene">
                            {p.yellowCards}G
                          </span>
                        )}
                        {p.redCards > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40" title="Cartonașe Roșii">
                            {p.redCards}R
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reserves (Banca de Rezerve) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="font-headline font-black text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">airline_seat_recline_normal</span>
                  Banca de Rezerve — {reserves.length} Jucători
                </span>
              </div>

              {reserves.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center text-xs text-slate-500">
                  Nu există rezerve configurate.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reserves.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3 shadow-sm opacity-90"
                    >
                      {/* Jersey Number */}
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-slate-300 font-mono shrink-0 shadow-sm">
                        {p.number ? `#${p.number}` : "—"}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-headline font-bold text-xs text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-label uppercase truncate mt-0.5">
                          {p.position || "Rezervă"}
                        </p>
                      </div>

                      {/* Stats Badges */}
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        {p.goals > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 font-bold" title="Goluri">
                            {p.goals}G
                          </span>
                        )}
                        {p.yellowCards > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40" title="Cartonașe Galbene">
                            {p.yellowCards}G
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 6. TECHNICAL STAFF & CLUB DETAILS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Technical Staff */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">badge</span>
              Banca Tehnică &amp; Staff Oficial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border-l-4 border-l-lime-400 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Antrenor Principal</span>
                <p className="font-headline font-black text-sm text-white">{team.headCoach || "Nespecificat"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border-l-4 border-l-sky-400 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Antrenor Secund</span>
                <p className="font-headline font-black text-sm text-white">{team.assistantCoach || "Nespecificat"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border-l-4 border-l-rose-400 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Medic / Fiziokinetoterapeut</span>
                <p className="font-headline font-black text-sm text-white">{team.medic || "Nespecificat"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border-l-4 border-l-amber-400 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Preparator Fizic</span>
                <p className="font-headline font-black text-sm text-white">{team.fitnessCoach || "Nespecificat"}</p>
              </div>

              {team.manager && (
                <div className="p-4 rounded-2xl bg-slate-950 border-l-4 border-l-amber-400 border border-slate-800 space-y-1 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Manager Oficial Echipă</span>
                    <p className="font-headline font-black text-sm text-white">{team.manager.name || "Manager Club"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 font-black text-xs font-mono uppercase flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      <span>{team.manager.managerBadge || "Manager Debutant"}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">{team.manager.managerXp || 0} XP</span>
                    <Link
                      href={`/managers/${team.manager.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-1 shrink-0 ml-1"
                    >
                      <span>Profil Manager</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & About Club */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">info</span>
                Despre Club
              </h3>
              <p className="text-xs text-slate-300 font-body leading-relaxed mt-3 whitespace-pre-line">
                {team.description ||
                  `Echipa ${team.name} concurează pe platforma oficială de sport cu ambiția de a atinge cele mai înalte standarde de fair-play și performanță competițională.`}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Membru din:</span>
              <strong className="text-white font-mono">{new Date(team.createdAt).getFullYear()}</strong>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
