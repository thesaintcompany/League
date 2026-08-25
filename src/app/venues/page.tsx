import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicVenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { capacity: "desc" },
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-label font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-primary dark:hover:text-lime-400 transition">
              Campionat Live
            </Link>
            <Link href="/venues" className="text-primary dark:text-lime-400 border-b-2 border-primary dark:border-lime-400 pb-1">
              Arene &amp; Stadioane
            </Link>
            <Link href="/players" className="hover:text-primary dark:hover:text-lime-400 transition">
              Jucători
            </Link>
            <Link href="/referees" className="hover:text-primary dark:hover:text-lime-400 transition">
              Arbitri
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-xl bg-primary text-white hover:bg-slate-800"
            >
              Intră în Cont 🚀
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-primary text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label inline-block mb-4 shadow-sm">
            Catalog Oficial Baze Sportive
          </span>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none">
            Arene &amp; Stadioane Partenere
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl font-body">
            Descoperă facilitățile premium, tipurile de gazon și capacitatea arenelor omologate pentru competițiile Ligue Pro.
          </p>
        </div>
      </section>

      {/* Venues Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-md rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Stadium Thumbnail Header */}
                <div className="h-44 bg-gradient-to-br from-slate-900 via-primary to-slate-800 p-6 flex flex-col justify-between relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-300"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-label">
                      {venue.surface}
                    </span>
                    <span className="material-symbols-outlined text-white/40 text-2xl group-hover:text-lime-400 transition">
                      stadium
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold font-headline leading-tight text-white group-hover:text-lime-300 transition">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-label flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {venue.location}
                    </p>
                  </div>
                </div>

                {/* Facility Details */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                        Capacitate
                      </p>
                      <p className="text-lg font-black text-blue-950 dark:text-white data-font mt-0.5">
                        {venue.capacity.toLocaleString()} Locuri
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-slate-800/40">
                      <p className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                        Nocturnă LED
                      </p>
                      <p className="text-lg font-black text-lime-600 dark:text-lime-400 data-font mt-0.5">
                        {venue.floodlights ? "Disponibilă ✓" : "Fără"}
                      </p>
                    </div>
                  </div>

                  {venue.pricePerHour && (
                    <p className="text-xs font-label text-slate-500 text-center">
                      Tarif omologat:{" "}
                      <span className="font-bold text-blue-950 dark:text-white">
                        {venue.pricePerHour} RON / oră
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-slate-700 dark:text-slate-300 font-label text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5">
                  Vezi Profil Arenă
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
