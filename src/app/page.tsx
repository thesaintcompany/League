import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Trophy, Users, Calendar, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                Pentru organizatori de competiții
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Organizează-ți campionatul sportiv fără bătăi de cap
              </h1>
              <p className="mt-6 text-lg text-brand-100 sm:text-xl">
                Creează ligi și campionate, adaugă echipe și jucători, programează meciuri
                și urmărește clasamentul în timp real. Totul într-un singur loc.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-base">
                  Începe gratuit
                </Link>
                <Link href="/signin" className="btn bg-white/10 text-white hover:bg-white/20 px-6 py-3 text-base ring-1 ring-white/30">
                  Am deja cont
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center">
              Tot ce-ți trebuie pentru o competiție completă
            </h2>
            <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">
              De la primul meci până la finala campionatului, LeagueHub te acoperă.
            </p>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Feature icon={<Trophy className="h-6 w-6" />} title="Campionate" desc="Creează campionate, ligi sau cupe în câteva secunde." />
              <Feature icon={<Users className="h-6 w-6" />} title="Echipe & Jucători" desc="Adaugă echipe, gestionează jucători și detalii." />
              <Feature icon={<Calendar className="h-6 w-6" />} title="Programare meciuri" desc="Calendar de meciuri, runde, etape, venue-uri." />
              <Feature icon={<BarChart3 className="h-6 w-6" />} title="Clasament live" desc="Scoruri și clasament calculat automat." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 text-white py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Gata să organizezi?</h2>
            <p className="mt-3 text-slate-300">
              Creează-ți contul în 30 de secunde și pornește primul campionat azi.
            </p>
            <Link href="/signup" className="mt-8 inline-block btn bg-accent-500 text-white hover:bg-accent-600 px-6 py-3 text-base">
              Creează cont gratuit
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} LeagueHub. Toate drepturile rezervate.
          </div>
        </footer>
      </main>
    </>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
