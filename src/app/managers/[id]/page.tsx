import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { getBadgeForXp, getBadgeColor } from "@/lib/managerXp";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    select: { name: true, managerBadge: true, coachingLicense: true },
  });

  if (!user) {
    return { title: "Manager Negăsit | Pro Ligue România" };
  }

  return {
    title: `${user.name || "Manager Club"} • Profil Oficial & Palmares | Pro Ligue România`,
    description: `Descoperă profilul oficial al managerului ${user.name || "de club"}, gradul ${user.managerBadge || "Manager Oficial"}, calificarea ${user.coachingLicense || "Management Sportiv"} și echipele coordonate.`,
  };
}

export default async function ManagerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  if (!id) notFound();

  const manager = await prisma.user.findUnique({
    where: { id },
    include: {
      managedTeams: {
        include: {
          championship: true,
          players: {
            orderBy: [{ isStarter: "desc" }, { number: "asc" }],
          },
          homeMatches: {
            include: { awayTeam: true, championship: true },
            orderBy: { scheduledAt: "desc" },
            take: 3,
          },
          awayMatches: {
            include: { homeTeam: true, championship: true },
            orderBy: { scheduledAt: "desc" },
            take: 3,
          },
        },
      },
    },
  });

  if (!manager) notFound();

  const xp = manager.managerXp || 0;
  const badgeName = manager.managerBadge || getBadgeForXp(xp);
  const badgeStyle = getBadgeColor(badgeName);

  // Stats aggregation across managed teams
  const totalPlayers = manager.managedTeams.reduce((acc, t) => acc + (t.players?.length || 0), 0);
  const totalMatchesManaged = manager.managedTeams.reduce(
    (acc, t) => acc + (t.homeMatches?.length || 0) + (t.awayMatches?.length || 0),
    0
  );
  const primarySport = manager.primarySport || "Fotbal";

  // Calculate next target XP
  let nextTargetXp = 30;
  let nextBadgeName = "Manager de Bronz";
  if (xp >= 150) {
    nextTargetXp = 250;
    nextBadgeName = "Manager de Aur Suprem";
  } else if (xp >= 80) {
    nextTargetXp = 150;
    nextBadgeName = "Manager de Aur";
  } else if (xp >= 30) {
    nextTargetXp = 80;
    nextBadgeName = "Manager de Argint";
  }
  const progressPercent = Math.min(100, Math.round((xp / nextTargetXp) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body flex flex-col selection:bg-lime-400 selection:text-slate-950">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Link href="/teams" className="hover:text-lime-400 transition">
            Echipe &amp; Cluburi
          </Link>
          <span>/</span>
          {manager.managedTeams[0] && (
            <>
              <Link href={`/teams/${manager.managedTeams[0].id}`} className="hover:text-lime-400 transition truncate max-w-[150px]">
                {manager.managedTeams[0].name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-white font-bold truncate">Profil Manager: {manager.name}</span>
        </div>

        {/* 1. HERO BANNER: MANAGER IDENTITY & BADGE */}
        <section className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-2xl">
          {/* Background Cover */}
          <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
            {manager.coverPhotoUrl ? (
              <img
                src={manager.coverPhotoUrl}
                alt="Banner Club"
                className="w-full h-full object-cover opacity-35 filter brightness-90"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/60 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>

          {/* Profile Details Bar */}
          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Avatar with Badged Border */}
                <div className="relative shrink-0">
                  {manager.image ? (
                    <img
                      src={manager.image}
                      alt={manager.name || "Manager"}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-900 bg-slate-800 shadow-2xl ring-4 ring-amber-400/30"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 border-4 border-slate-900 text-lime-400 flex items-center justify-center font-headline font-black text-3xl sm:text-4xl shadow-2xl ring-4 ring-amber-400/30">
                      {manager.name ? manager.name.substring(0, 2).toUpperCase() : "MG"}
                    </div>
                  )}

                  {/* Golden Trophy Floating Badge */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900" title={badgeName}>
                    <span className="material-symbols-outlined text-xl font-black">{badgeStyle.icon}</span>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider border shadow-md flex items-center gap-1.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                      <span className="material-symbols-outlined text-sm">{badgeStyle.icon}</span>
                      <span>{badgeName}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                      {xp} XP
                    </span>
                    <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/40 text-xs font-bold font-mono uppercase">
                      {primarySport}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-headline font-black uppercase tracking-tight text-white leading-tight">
                    {manager.name || "Manager Oficial Club"}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 font-label flex flex-wrap items-center gap-2">
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      {manager.coachingLicense || "Manager / Delegat Club"}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      {manager.experienceYears ? `${manager.experienceYears} Ani Experiență` : "Experiență Multiplă"}
                    </span>
                    {manager.managedTeams.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-sky-400 font-bold">
                          {manager.managedTeams.length} {manager.managedTeams.length === 1 ? "Echipă Coordonată" : "Echipe Coordonate"}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Socials & Share Actions */}
              <div className="flex items-center gap-2.5 shrink-0 self-start md:self-end">
                {manager.instagramUrl && (
                  <a
                    href={`https://instagram.com/${manager.instagramUrl.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-pink-600/20 hover:text-pink-400 text-slate-300 border border-slate-700 transition"
                    title="Instagram"
                  >
                    <span className="text-xs font-mono font-bold">IG</span>
                  </a>
                )}
                {manager.facebookUrl && (
                  <a
                    href={manager.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-sky-600/20 hover:text-sky-400 text-slate-300 border border-slate-700 transition"
                    title="Facebook"
                  >
                    <span className="text-xs font-mono font-bold">FB</span>
                  </a>
                )}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Vezi profilul oficial al managerului ${manager.name} (${badgeName}) pe Pro Ligue România: `
                  )}${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  <span>Distribuie Profil</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS & XP MILESTONES GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Puncte Experiență (XP)
            </span>
            <p className="text-2xl sm:text-3xl font-headline font-black text-amber-300">
              {xp} XP
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Grad activ: {badgeName}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Echipe în Club
            </span>
            <p className="text-2xl sm:text-3xl font-headline font-black text-lime-400">
              {manager.managedTeams.length}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Cluburi înscrise pe platformă
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Sportivi Înscriși în Loturi
            </span>
            <p className="text-2xl sm:text-3xl font-headline font-black text-sky-400">
              {totalPlayers}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Titulari și rezerve valide
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Partide Oficiale
            </span>
            <p className="text-2xl sm:text-3xl font-headline font-black text-white">
              {totalMatchesManaged}
            </p>
            <span className="text-[10px] text-slate-500 font-mono">
              Meciuri acasă &amp; deplasare
            </span>
          </div>
        </section>

        {/* 3. GAMIFICATION PROGRESS & QUESTS SHOWCASE */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-headline font-black text-lg uppercase text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">military_tech</span>
                Evoluție Carieră Manager &amp; Fair-Play
              </h3>
              <p className="text-xs text-slate-400">
                Punctele XP se acumulează prin administrarea diligentă a clubului și conduita sportivă
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-slate-400">Prag următor: </span>
              <strong className="text-amber-400">{nextBadgeName} ({nextTargetXp} XP)</strong>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-lime-400 to-amber-300 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{xp} XP Acumulate</span>
              <span>{progressPercent}% completat</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-lime-400 font-bold font-mono">
                <span className="material-symbols-outlined text-base">groups</span>
                <span>+10 XP Lot Complet</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Echipa include 11+ sportivi activi</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold font-mono">
                <span className="material-symbols-outlined text-base">pin_drop</span>
                <span>+5 XP Check-in Teren</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Validare prezență GPS la stadion</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                <span className="material-symbols-outlined text-base">sports_soccer</span>
                <span>+20 XP Rezultat Rapid</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Scor încărcat imediat după fluier</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                <span className="material-symbols-outlined text-base">stars</span>
                <span>+50 XP Raport Arbitraj</span>
              </div>
              <p className="text-[11px] text-amber-400/80 mt-1">Evaluare fair-play și comportament</p>
            </div>
          </div>
        </section>

        {/* 4. MANAGED TEAMS SHOWCASE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">shield</span>
              Echipele Coordonate de Manager
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {manager.managedTeams.length} {manager.managedTeams.length === 1 ? "Club activ" : "Cluburi active"}
            </span>
          </div>

          {manager.managedTeams.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 italic">
              Managerul nu are încă nicio echipă publică activă.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {manager.managedTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-lime-400/40 transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-14 h-14 rounded-2xl object-contain bg-slate-950 border border-slate-700 p-1"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-2xl text-white font-black text-lg flex items-center justify-center font-mono shadow-md"
                          style={{ backgroundColor: team.color || "#84cc16" }}
                        >
                          {team.shortName || team.name.substring(0, 3).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-headline font-black uppercase text-white group-hover:text-lime-400 transition">
                          {team.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-label mt-0.5">
                          {team.championship?.name || "Competiție Oficială"}
                        </p>
                        {team.homeArena && (
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-sky-400">stadium</span>
                            {team.homeArena}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/teams/${team.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-white font-headline font-bold text-xs uppercase tracking-wider transition shrink-0"
                    >
                      Vezi Echipă ↗
                    </Link>
                  </div>

                  {/* Team Details Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-500 font-mono text-[9px] uppercase block">Sportivi</span>
                      <strong className="text-white font-mono">{team.players.length}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-500 font-mono text-[9px] uppercase block">Formație</span>
                      <strong className="text-lime-400 font-mono">{team.formation || "4-3-3"}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-500 font-mono text-[9px] uppercase block">Check-in</span>
                      <strong className={team.checkInVerified ? "text-emerald-400 font-mono" : "text-slate-400 font-mono"}>
                        {team.checkInVerified ? "Verificat" : "Activ"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. BIO & SPORTING PHILOSOPHY */}
        {manager.bio && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-lg font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">menu_book</span>
              Viziune Sportivă &amp; Prezentare Manager
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed whitespace-pre-line">
              {manager.bio}
            </p>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
