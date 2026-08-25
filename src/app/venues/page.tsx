import { prisma } from "@/lib/prisma";
import { PublicVenuesCatalog } from "@/components/PublicVenuesCatalog";
import { PublicHeader } from "@/components/PublicHeader";

export const dynamic = "force-dynamic";

export default async function PublicVenuesPage() {
  const venues = await prisma.venue.findMany({
    where: { isActive: true },
    orderBy: [{ capacity: "desc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body text-white">
      {/* Top Navbar */}
      <PublicHeader currentTab="venues" />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-lime-400/20 py-16 px-6 lg:px-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/legend-player-shadow-bw.jpg')" }}
        ></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
              🏟️ ARENE &amp; SĂLI POLIVALENTE DIN ROMÂNIA
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs font-label">
              Fotbal, Baschet, Handbal, Volei &amp; Multisport
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight text-white drop-shadow-md">
            Stadioane de Top &amp; Săli Polivalente
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl font-body leading-relaxed">
            Catalogul național al infrastructurii sportive din România: de la <strong>Arena Națională (55.634 locuri)</strong>, <strong>BTarena Cluj (10.000 locuri)</strong>, <strong>Stadionul Steaua</strong> și <strong>Ion Oblemenco</strong>, până la noile săli polivalente moderne din Pitești, Oradea, Tulcea, Brașov și arenele municipale din țară.
          </p>
        </div>
      </section>

      {/* Venues Grid with Interactive Client Filter & Search */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <PublicVenuesCatalog initialVenues={venues} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs font-label text-slate-500">
        © {new Date().getFullYear()} Ligue Pro România • Catalog Oficial Arene &amp; Stadioane. Toate drepturile rezervate.
      </footer>
    </div>
  );
}
