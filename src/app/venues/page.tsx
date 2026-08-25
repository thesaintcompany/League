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

      {/* Hero Header with Panoramic Majestic Stadium Background */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-lime-400/30 py-20 px-6 lg:px-12 shadow-2xl min-h-[360px] flex items-center">
        {/* Full-width High-Definition Stadium Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 transform duration-1000"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        {/* Cinematic Gradient Overlays for High Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-4 w-full">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[11px] uppercase font-label tracking-widest shadow-lg flex items-center gap-1.5">
              <span>🏟️</span> ARENE &amp; SĂLI POLIVALENTE DIN ROMÂNIA
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs font-label border border-slate-700">
              59 de Baze &amp; Stadioane de Top
            </span>
            <span className="px-3 py-1 rounded-full bg-lime-400/20 backdrop-blur-md text-lime-300 font-bold text-xs font-label border border-lime-400/30">
              Fotbal, Baschet, Handbal &amp; Volei
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-2xl">
            Stadioane de Top &amp; Săli Polivalente
          </h1>

          <p className="text-slate-200 text-sm sm:text-base max-w-3xl font-body leading-relaxed drop-shadow-md">
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
