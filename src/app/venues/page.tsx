import Link from "next/link";
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
    <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
      {/* Top Navbar */}
      <PublicHeader currentTab="venues" />

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
