import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isOrganizer, isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GatekeeperScannerView } from "@/components/GatekeeperScannerView";

export const dynamic = "force-dynamic";

export default async function GatekeeperScannerPage({
  searchParams,
}: {
  searchParams?: { matchId?: string; token?: string; gate?: string };
}) {
  const session = await getServerSession(authOptions);
  const isOrganizerUser = isOrganizer(session?.user) || isSuperAdmin(session?.user);

  const matchId = searchParams?.matchId;
  const token = searchParams?.token;

  // 1. If matchId is provided, check match state and token/organizer authorization
  if (matchId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        championship: true,
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-body">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">search_off</span>
            </div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              Meci Negăsit
            </h1>
            <p className="text-xs text-slate-400 font-body leading-relaxed">
              Meciul asociat acestui link de scanare nu a fost găsit în baza de date.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="px-6 py-3 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-block">
                Înapoi în Panou
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Check if match is already finished or cancelled (Scanner links are valid ONLY until match is over)
    if (match.status === "finished" || match.status === "cancelled") {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-body">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">event_busy</span>
            </div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              Link de Scanare Expirat
            </h1>
            <p className="text-xs text-slate-400 font-body leading-relaxed">
              Meciul <strong>{match.homeTeam.name} vs {match.awayTeam.name}</strong> este finalizat. Linkul de scanare la porți este valabil doar până la meci și a fost anulat automat.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="px-6 py-3 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-block">
                Înapoi în Panou
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Verify access authorization:
    // 1. Super Admin has full access
    // 2. Organizer who created the championship has access
    // 3. Valid gate secret token (for designated gate stewards)
    const isSuper = isSuperAdmin(session?.user);
    const isChampionshipOwner = Boolean(session?.user && match.championship.ownerId === (session.user as any).id);
    const isTokenValid = Boolean(token && match.gateAccessSecret && token === match.gateAccessSecret);

    if (!isSuper && !isChampionshipOwner && !isTokenValid) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-body">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">lock</span>
            </div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              Acces Restricționat
            </h1>
            <p className="text-xs text-slate-400 font-body leading-relaxed">
              Scannerul mobil de la porți nu este public. Fiecare organizator poate accesa exclusiv meciurile din competițiile proprii sau stewarzii autorizați prin link dedicat activat înainte de începerea partidei.
            </p>
            <div className="pt-2">
              <Link href="/signin" className="px-6 py-3 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-block">
                Autentificare Organizator
              </Link>
            </div>
          </div>
        </div>
      );
    }
  } else {
    // No matchId provided: Require logged-in organizer or admin
    if (!isOrganizerUser) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white font-body">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">lock</span>
            </div>
            <h1 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              Acces Restricționat Organizator
            </h1>
            <p className="text-xs text-slate-400 font-body leading-relaxed">
              Scannerul mobil de la porți este un modul intern dedicat exclusiv organizatorilor. Vă rugăm să vă autentificați în contul de organizator.
            </p>
            <div className="pt-2">
              <Link href="/signin" className="px-6 py-3 rounded-2xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider inline-block">
                Autentificare Organizator
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <GatekeeperScannerView
      matchId={searchParams?.matchId}
      token={searchParams?.token}
      stewardInitialName={searchParams?.gate ? `Steward ${searchParams.gate}` : "Steward Poarta 1"}
    />
  );
}
