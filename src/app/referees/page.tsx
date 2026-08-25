import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicRefereesPage() {
  const referees = await prisma.user.findMany({
    where: { role: "referee" },
    orderBy: { experienceYears: "desc" },
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
            <Link href="/brackets" className="hover:text-primary dark:hover:text-lime-400 transition flex items-center gap-1">
              <span>🗺️</span> Harta Campionatului
            </Link>
            <Link href="/venues" className="hover:text-primary dark:hover:text-lime-400 transition">
              Arene &amp; Stadioane
            </Link>
            <Link href="/players" className="hover:text-primary dark:hover:text-lime-400 transition">
              Jucători
            </Link>
            <Link href="/referees" className="text-primary dark:text-lime-400 border-b-2 border-primary dark:border-lime-400 pb-1">
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
            Corp Oficial de Arbitraj
          </span>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-none">
            Arbitri Licențiați &amp; Oficiali
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl font-body">
            Arbitri atestați pentru meciurile oficiale din ligile și turneele Ligue Pro, cu evaluări și delegări transparente.
          </p>
        </div>
      </section>

      {/* Referees Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {referees.map((ref) => (
            <Link
              key={ref.id}
              href={`/referees/${ref.id}`}
              className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-md rounded-3xl p-6 group hover:shadow-xl hover:border-lime-400/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md group-hover:bg-lime-400 group-hover:text-slate-950 transition">
                    <span className="material-symbols-outlined">sports</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 font-label">
                    {ref.refereeBadge || "FIFA Pro"}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition leading-tight">
                  {ref.name}
                </h3>

                <p className="text-xs text-slate-500 font-label mt-1">
                  Experiență: {ref.experienceYears || 10} ani în competiții oficiale
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-label font-bold text-slate-400 group-hover:text-blue-950 dark:group-hover:text-white">
                <span>Fișă Oficial Arbitraj</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
