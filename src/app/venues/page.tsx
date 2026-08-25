import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicVenuesCatalog } from "@/components/PublicVenuesCatalog";

export const dynamic = "force-dynamic";

export default async function PublicVenuesPage() {
  const venues = await prisma.venue.findMany({
    where: { isActive: true },
    orderBy: [{ capacity: "desc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 h-20 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary dark:bg-lime-400 flex items-center justify-center text-white dark:text-primary font-black text-lg shadow-sm">
              ⚡
            </div>
            <span className="text-xl font-black italic tracking-tight text-blue-950 dark:text-white uppercase font-headline">
              Ligue
            </span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-950/50 text-lime-800 dark:text-lime-400 border border-lime-300/60 text-xs font-bold font-label">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
            33 ARENE ÎN TIMIȘ
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-label font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-4">
            <Link href="/" className="hover:text-primary dark:hover:text-lime-400 transition">
              Campionat
            </Link>
            <Link href="/brackets" className="hover:text-primary dark:hover:text-lime-400 transition flex items-center gap-1">
              <span>🗺️</span> Harta Campionatului
            </Link>
            <Link href="/venues" className="text-primary dark:text-lime-400 font-black border-b-2 border-primary dark:border-lime-400 pb-1">
              Arene &amp; Stadioane
            </Link>
            <Link href="/players" className="hover:text-primary dark:hover:text-lime-400 transition">
              Jucători
            </Link>
            <Link href="/referees" className="hover:text-primary dark:hover:text-lime-400 transition">
              Arbitri
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
          >
            Panou Organizator ↗
          </Link>
          <Link
            href="/signin"
            className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
          >
            Intră în Cont 🚀
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-primary text-white py-16 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label inline-block mb-4 shadow-sm">
            Catalog Oficial Baze Sportive • Județul Timiș
          </span>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Arene &amp; Terenuri Sportive din Timiș
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-3xl font-body">
            Explorează cele 33 de stadioane și baze sportive omologate din Timișoara, Lugoj, Sânnicolau Mare, Jimbolia și comunele limitrofe pentru competiții de <strong>Fotbal</strong>, <strong>Baschet</strong>, <strong>Volei</strong> și <strong>Multisport</strong>.
          </p>
        </div>
      </section>

      {/* Venues Grid with Interactive Client Filter & Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <PublicVenuesCatalog initialVenues={venues} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center text-xs font-label text-slate-400">
        © {new Date().getFullYear()} Ligue Pro. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
