import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Contact & Asistență Tehnică • PRO L4GUE ROMÂNIA",
  description: "Contactează echipa PRO L4GUE și tscquantum.ro pentru asistență tehnică, parteneriate, înscriere arene sau organizare campionate.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/20 text-lime-700 dark:text-lime-400 text-xs font-headline font-black uppercase tracking-wider border border-lime-400/30">
            <span>✉️</span> SUPORT &amp; CONTACT
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Contactează Echipa PRO L4GUE
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Suntem aici pentru a te ajuta cu asistență tehnică, parteneriate sportive, acreditări sau listarea arenei tale în rețeaua națională.
          </p>
        </div>
      </section>

      {/* Contact Cards & Info */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-2xl mx-auto">
              ✉️
            </div>
            <h3 className="font-headline font-black uppercase text-slate-900 dark:text-white text-base">
              Email Oficial
            </h3>
            <p className="text-xs text-slate-500 font-label">Răspundem în maxim 24h</p>
            <a
              href="mailto:contact@tscquantum.ro"
              className="text-xs font-black font-mono text-lime-600 dark:text-lime-400 hover:underline block pt-1"
            >
              contact@tscquantum.ro
            </a>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl mx-auto">
              🏢
            </div>
            <h3 className="font-headline font-black uppercase text-slate-900 dark:text-white text-base">
              Operator Platformă
            </h3>
            <p className="text-xs text-slate-500 font-label">Găzduit și administrat de</p>
            <a
              href="https://tscquantum.ro"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-black font-headline text-blue-600 dark:text-blue-400 hover:underline block pt-1"
            >
              tscquantum.ro
            </a>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-2xl mx-auto">
              📍
            </div>
            <h3 className="font-headline font-black uppercase text-slate-900 dark:text-white text-base">
              Acoperire
            </h3>
            <p className="text-xs text-slate-500 font-label">Național • 41 Județe + Buc.</p>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block pt-1">
              România (59 Arene)
            </span>
          </div>
        </div>

        {/* Quick FAQ pointer */}
        <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm text-center">
          <h2 className="text-xl font-black font-headline uppercase text-slate-900 dark:text-white">
            Ai o întrebare rapidă?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Consultă secțiunea noastră de întrebări frecvente pentru răspunsuri instantanee despre bilete, arbitraj și organizare.
          </p>
          <div className="pt-2">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition"
            >
              <span>❓</span>
              <span>Vezi Întrebările Frecvente (FAQ)</span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
