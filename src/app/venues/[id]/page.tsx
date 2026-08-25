import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  // Find matches scheduled at this venue
  const matches = await prisma.match.findMany({
    where: { venue: venue.name },
    include: { homeTeam: true, awayTeam: true, championship: true },
    orderBy: { scheduledAt: "asc" },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
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

          <div className="flex items-center gap-4">
            <Link
              href="/venues"
              className="text-xs font-label font-bold text-slate-500 hover:text-blue-950 dark:hover:text-white"
            >
              ← Înapoi la Arene
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-sm">
              Arenă Omologată Ligue
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold font-label uppercase">
              Suprafață: {venue.surface}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white">
            {venue.name}
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base flex items-center gap-2 font-label">
            <span className="material-symbols-outlined text-lime-400">location_on</span>
            {venue.location}
          </p>
        </div>
      </section>

      {/* Bento Stats & Facilities Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Capacity Card */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Capacitate Totală
            </span>
            <p className="text-3xl font-black text-blue-950 dark:text-white data-font mt-2">
              {venue.capacity.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Locuri pe scaune în tribune</p>
          </div>

          {/* Surface Card */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Tip Suprafață
            </span>
            <p className="text-2xl font-black text-lime-600 dark:text-lime-400 font-headline mt-2">
              {venue.surface}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Drenaj și amortizare pro</p>
          </div>

          {/* Nocturna */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Iluminat Nocturnă
            </span>
            <p className="text-2xl font-black text-blue-950 dark:text-white font-headline mt-2">
              {venue.floodlights ? "LED 1200 Lux" : "Fără Nocturnă"}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Compatibil transmisiuni TV</p>
          </div>

          {/* Pricing */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Tarif Meci
            </span>
            <p className="text-2xl font-black text-blue-950 dark:text-white data-font mt-2">
              {venue.pricePerHour ? `${venue.pricePerHour} RON` : "Inclus în Ligă"}
            </p>
            <p className="text-xs text-slate-500 font-label mt-1">Per oră / meci oficial</p>
          </div>
        </div>

        {/* Facilities List */}
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600">verified</span>
            Dotări &amp; Facilități Omologate
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-lime-600 text-2xl">check_circle</span>
              <span className="text-xs font-bold font-label text-slate-700 dark:text-slate-300">
                Vestiare cu Dușuri
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-lime-600 text-2xl">check_circle</span>
              <span className="text-xs font-bold font-label text-slate-700 dark:text-slate-300">
                Tabelă Electronică
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-lime-600 text-2xl">check_circle</span>
              <span className="text-xs font-bold font-label text-slate-700 dark:text-slate-300">
                Parcare Autocare
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-lime-600 text-2xl">check_circle</span>
              <span className="text-xs font-bold font-label text-slate-700 dark:text-slate-300">
                Cabinet Medical &amp; Prim Ajutor
              </span>
            </div>
          </div>
        </div>

        {/* Scheduled Matches at this Venue */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600">event</span>
            Meciuri Programate pe Această Arenă
          </h3>

          {matches.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface-container-low text-center text-xs text-slate-500 font-label">
              Momentan nu sunt meciuri programate pe această arenă.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-400 uppercase">
                    <span>{m.championship.name}</span>
                    <span>Etapa {m.round}</span>
                  </div>

                  <div className="flex justify-between items-center font-bold text-sm text-blue-950 dark:text-white font-headline">
                    <span>{m.homeTeam.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 data-font">
                      {m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : "VS"}
                    </span>
                    <span>{m.awayTeam.name}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-label">
                    📅 {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
