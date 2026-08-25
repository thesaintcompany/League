import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicMatchPromoPage({
  params,
}: {
  params: { id: string };
}) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      championship: true,
      homeTeam: {
        include: { players: true },
      },
      awayTeam: {
        include: { players: true },
      },
    },
  });

  if (!match) notFound();

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
            href="/"
            className="text-xs font-label font-bold text-slate-500 hover:text-blue-950 dark:hover:text-white"
          >
            ← Înapoi la Campionat
          </Link>
        </div>
      </header>

      {/* Match Promo Hero Banner */}
      <section className="bg-primary text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-lg">
            <span>🔥</span> MECIUL ETAPEI • {match.championship.name}
          </div>

          {/* Versus Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-4">
            {/* Home Team */}
            <div className="flex flex-col items-center space-y-3">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-2xl border-4 border-white/20"
                style={{ backgroundColor: match.homeTeam.color || "#dc2626" }}
              >
                {match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase()}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight text-white">
                {match.homeTeam.name}
              </h2>
              <span className="text-xs font-label uppercase font-bold text-lime-400">
                Gazde (Home)
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-black italic font-headline text-lime-400">
                VS
              </span>
              <span className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold mt-1">
                {match.stage ? match.stage.toUpperCase() : `Etapa ${match.round}`}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center space-y-3">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-2xl border-4 border-white/20"
                style={{ backgroundColor: match.awayTeam.color || "#1e3a8a" }}
              >
                {match.awayTeam.shortName || match.awayTeam.name.substring(0, 3).toUpperCase()}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight text-white">
                {match.awayTeam.name}
              </h2>
              <span className="text-xs font-label uppercase font-bold text-lime-400">
                Oaspeți (Away)
              </span>
            </div>
          </div>

          {/* Match Location & Date Pills */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-label">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">stadium</span>
              <span className="font-bold">{match.venue || "Arena Oficială"}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">schedule</span>
              <span className="font-bold">
                {new Date(match.scheduledAt).toLocaleDateString("ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Ticket Purchase Box */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-lime-400 to-lime-500 text-slate-950 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-headline font-black text-lg uppercase">
                  Bilete Acces Stadion
                </span>
                <span className="text-2xl font-black data-font">
                  {match.ticketPrice || 25} RON
                </span>
              </div>
              <p className="text-xs font-medium text-slate-900 leading-relaxed">
                Acces general în tribune • Locuri pe scaune • Parcare asigurată
              </p>
              <button
                type="button"
                onClick={() => alert(`Rezervare bilet confirmată pentru meciul ${match.homeTeam.name} vs ${match.awayTeam.name}! Preț: ${match.ticketPrice || 25} RON.`)}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-95"
              >
                Cumpără Bilet Acum 🎟️
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Ads Banner Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-10 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            PARTENER OFICIAL DE EVENIMENT &amp; SPONSORIZARE
          </span>
          <h3 className="text-2xl font-black font-headline text-blue-950 dark:text-white uppercase">
            {match.sponsorName || "Superbet Pro / Red Bull Energy"}
          </h3>
          <p className="text-xs text-slate-500 font-label">
            {match.sponsorTagline || "Susținem sportul și performanța în comunitatea Ligue Pro"}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400 mt-auto">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
