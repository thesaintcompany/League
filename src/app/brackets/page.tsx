import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BracketVisualizer } from "@/components/BracketVisualizer";
import { ChampionshipBracketSwitcher } from "@/components/ChampionshipBracketSwitcher";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { isIndividualSport } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PublicBracketsPage({
  searchParams,
}: {
  searchParams?: { id?: string; code?: string };
}) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;

  const rawId = searchParams?.id?.trim();
  const rawCode = searchParams?.code?.trim();
  const isDirectLink = Boolean(rawId || rawCode);

  // 1. Fetch targeted championship if id or code provided (case-insensitive & robust matching)
  let championship = null;

  if (rawId) {
    championship = await prisma.championship.findFirst({
      where: {
        OR: [
          { id: rawId },
          { shareCode: rawId },
          { shareCode: rawId.toUpperCase() },
        ],
      },
      include: {
        teams: {
          include: { players: true },
          orderBy: { name: "asc" },
        },
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  } else if (rawCode) {
    const cleanCode = rawCode.replace(/^#/, "").trim();
    championship = await prisma.championship.findFirst({
      where: {
        OR: [
          { shareCode: cleanCode },
          { shareCode: cleanCode.toUpperCase() },
          { shareCode: cleanCode.toLowerCase() },
          { id: cleanCode },
          { id: { endsWith: cleanCode.replace(/^LP-/, "") } },
        ],
      },
      include: {
        teams: {
          include: { players: true },
          orderBy: { name: "asc" },
        },
        matches: {
          include: { homeTeam: true, awayTeam: true },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
      },
    });
  }

  // 2. Fallback: ONLY when NO direct link was specified in URL
  if (!championship && !isDirectLink) {
    championship =
      (await prisma.championship.findFirst({
        where: { isBracketPublished: true },
        include: {
          teams: {
            include: { players: true },
            orderBy: { name: "asc" },
          },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
          },
        },
        orderBy: { updatedAt: "desc" },
      })) ||
      (await prisma.championship.findFirst({
        include: {
          teams: {
            include: { players: true },
            orderBy: { name: "asc" },
          },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
          },
        },
        orderBy: { updatedAt: "desc" },
      }));
  }

  // Direct link specified but championship code was not found -> Clean Not Found Screen
  if (!championship && isDirectLink) {
    const requestedCode = rawCode || rawId || "";
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white">
        <PublicHeader currentTab="brackets" />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 flex-1">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline uppercase">
            Competiția #{requestedCode} nu a fost găsită
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Codul sau identificatorul solicitat nu corespunde niciunui campionat activ. Te rugăm să verifici linkul sau să explorezi campionatele disponibile.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/brackets"
              className="px-5 py-2.5 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase shadow-md"
            >
              Vezi Toate Tablourile
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase"
            >
              Harta României
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Fetch all published championships for the quick switcher (generic browse only)
  const allPublishedChampionships = await prisma.championship.findMany({
    where: { isBracketPublished: true },
    select: {
      id: true,
      name: true,
      sport: true,
      season: true,
      shareCode: true,
      county: true,
      city: true,
      scope: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if map is private and visitor is not the owner
  const isOwner = championship && currentUserId && championship.ownerId === currentUserId;
  const isPrivate = championship && !championship.isBracketPublished && !isOwner;

  let matches = (championship?.matches || []).map((m: any) => ({
    id: m.id,
    round: m.round,
    stage: m.stage,
    bracketIndex: m.bracketIndex,
    scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : undefined,
    status: m.status as any,
    homeTeam: {
      id: m.homeTeam?.id || "",
      name: m.homeTeam?.name || "Echipă A",
      shortName: m.homeTeam?.shortName || undefined,
      color: m.homeTeam?.color || undefined,
    },
    awayTeam: {
      id: m.awayTeam?.id || "",
      name: m.awayTeam?.name || "Echipă B",
      shortName: m.awayTeam?.shortName || undefined,
      color: m.awayTeam?.color || undefined,
    },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    venue: m.venue || undefined,
    referee: m.referee || undefined,
  }));

  // If matches were not yet drawn via dice but teams are registered, pair them up directly on the bracket
  if (matches.length === 0 && championship?.teams && championship.teams.length > 0) {
    const regTeams = championship.teams;
    for (let i = 0; i < Math.min(8, regTeams.length); i += 2) {
      const home = regTeams[i];
      const away = regTeams[i + 1] || null;
      const pairIdx = Math.floor(i / 2);

      matches.push({
        id: `match-preview-${pairIdx + 1}`,
        round: 1,
        stage: "quarter_final",
        bracketIndex: pairIdx,
        status: "scheduled",
        homeTeam: {
          id: home.id,
          name: home.name,
          shortName: home.shortName || undefined,
          color: home.color || "#10b981",
        },
        awayTeam: away
          ? {
            id: away.id,
            name: away.name,
            shortName: away.shortName || undefined,
            color: away.color || "#3b82f6",
          }
          : {
            id: `slot-bye-${pairIdx}`,
            name: "Tur Liber (Calificat Direct)",
            shortName: undefined,
            color: "#94a3b8",
          },
        scheduledAt: undefined,
        referee: undefined,
        homeScore: null,
        awayScore: null,
        venue: championship?.defaultVenue || "Arena  ă",
      });
    }
  }

  const shareCode = championship?.shareCode || (championship?.id ? `LP-${championship.id.slice(-6).toUpperCase()}` : "LP-PUBLIC");
  const isIndividual = isIndividualSport(championship?.sport);

  const formatLabel =
    championship?.format === "knockout"
      ? "Turneu Eliminatoriu"
      : championship?.format === "groups_knockout"
        ? "Grupe & Eliminatoriu"
        : "Campionat Regular (Tur-Retur)";

  const sportIcon = isIndividual
    ? championship?.sport?.toLowerCase().includes("ping") || championship?.sport?.toLowerCase().includes("masă")
      ? " "
      : "sports_tennis"
    : "sports_soccer";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden max-w-full">
      {/* Top Navbar */}
      <PublicHeader currentTab="brackets" />

      {/* Hero Banner with Dynamic Championship Metadata */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-lime-400/30 py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-12 shadow-sm transition-colors duration-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-15 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label tracking-widest shadow-md flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">{sportIcon}</span> {championship?.sport || "Sport"}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 font-black text-xs font-label border border-blue-500/20">
                {formatLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-lime-400 font-black text-xs font-label border border-slate-200 dark:border-lime-400/30">
                COD: #{shareCode}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold text-xs font-label">
                {championship?.season || "Sezon 2026"}
              </span>
              {championship?.county && (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs font-label border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-sm mr-1">location_on</span> {championship.county}{championship.city ? ` (${championship.city})` : ""}
                </span>
              )}
              {championship?.defaultVenue && (
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 font-bold text-xs font-label border border-teal-500/20">
                  <span className="material-symbols-outlined text-sm">stadium</span> {championship.defaultVenue}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight text-slate-950 dark:text-white break-words">
              {championship?.name || "Harta Turneului  "}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl font-body leading-relaxed">
              {championship?.description ||
                "Arborele meciurilor eliminatorii generat prin tragere la sorți cu zaruri. Fiecare campionat are o hartă unică cu link public distribuit în timp real."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {isDirectLink ? (
              <Link
                href="/brackets"
                className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-white/20"
              >
                ← Toate Tablourile
              </Link>
            ) : (
              <Link
                href="/campionat"
                className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-white/20"
              >
                ← Clasament
              </Link>
            )}
            <Link
              href="/matches"
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md"
            >
              📋 Lista Meciuri
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-slate-200 dark:border-white/20"
            >
              <span className="material-symbols-outlined text-sm">map</span> Harta României
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-10 overflow-x-hidden max-w-full">
        {/* Switcher ONLY displayed when browsing /brackets without a direct link */}
        {!isDirectLink && allPublishedChampionships.length > 1 && (
          <ChampionshipBracketSwitcher
            currentChampionshipId={championship?.id}
            currentChampionshipName={championship?.name}
            currentCounty={championship?.county}
            championships={allPublishedChampionships}
          />
        )}

        {isPrivate ? (
          <div className="card p-12 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-amber-400/40 rounded-3xl space-y-4 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-amber-500 block">
              lock
            </span>
            <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white">
              Harta acestui campionat este momentan Privată
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Organizatorul nu a făcut încă publică harta meciurilor pentru acest campionat. Te rugăm să revii mai târziu sau să selectezi un alt campionat din lista de mai sus.
            </p>
            <Link
              href="/harta-romaniei"
              className="inline-block px-5 py-2.5 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase shadow-md mt-2"
            >
              Campionate
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <BracketVisualizer
              matches={matches}
              championshipId={championship?.id}
              championshipName={championship?.name}
              shareCode={shareCode}
              isPublished={championship?.isBracketPublished ?? true}
              isAdmin={Boolean(isOwner)}
            />

            {/* Enrolled Participants Tray for this specific Championship */}
            {championship?.teams && championship.teams.length > 0 && (
              <section className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg material-symbols-outlined">{isIndividual ? "sports_tennis" : "shield"}</span>
                    <div>
                      <h3 className="text-sm font-black font-headline uppercase tracking-tight text-slate-950 dark:text-white">
                        {isIndividual ? "Competitori Înscriși pe Tablou" : "Echipe Înscrise la Competiție"}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                        Lista  ă a participanților validați pentru #{shareCode} ({championship.teams.length} {isIndividual ? "participanți" : "echipe"})
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs font-mono">
                    {championship.teams.length} {isIndividual ? "Înscriși" : "Cluburi"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {championship.teams.map((t: any, idx: number) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 transition hover:border-lime-400/50"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black font-headline text-xs text-white shadow-sm shrink-0"
                        style={{ backgroundColor: t.color || "#10b981" }}
                      >
                        {t.shortName || t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <h4 className="text-xs font-bold font-headline text-slate-900 dark:text-white truncate">
                            {t.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-label">
                          {t.players?.length ? `${t.players.length} jucători în lot` : "Lot validat"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
