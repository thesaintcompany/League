import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Despre Aplicație • PRO L4GUE ROMÂNIA",
  description: "Platforma digitală dedicată organizării și urmăririi campionatelor sportive naționale și județene din România.",
};

export default function DesprePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/20 text-lime-700 dark:text-lime-400 text-xs font-headline font-black uppercase tracking-wider border border-lime-400/30">
            <span>🇷🇴</span> DESPRE PLATFORMĂ
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            PRO L4GUE • ROMÂNIA
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Platforma digitală integrată pentru organizarea, arbitrajul oficial și telemetria în timp real a competițiilor sportive din România, operată de <strong>tscquantum.ro</strong>.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-2xl font-black">
              🎲
            </div>
            <h3 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              Tragere la Sorți cu Zaruri
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-body">
              Algoritm unic și transparent de generare a meciurilor eliminatorii, limitat la maxim 3 aruncări înainte de publicarea oficială a arborelui.
            </p>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl font-black">
              🏟️
            </div>
            <h3 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              59 Arene Naționale
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-body">
              Infrastructură completă de stadioane și săli polivalente omologate, cu detalii despre capacitate, suprafață și nocturnă.
            </p>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-2xl font-black">
              ⚖️
            </div>
            <h3 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              Corp Arbitri RIFA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-body">
              Sistem de delegare oficială și arbitraj video (VAR) cu insigne acreditate RIFA Pro Elite, First Class și Asistenți.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-2xl font-black font-headline uppercase text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Viziunea Noastră
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            PRO L4GUE a fost creată pentru a aduce sportului de amatori și de performanță din România un standard tehnologic de clasă mondială. Fie că este vorba despre un campionat municipal de fotbal, o ligă de baschet 3x3, un turneu de volei pe plajă sau o competiție națională de futsal, platforma oferă vizibilitate instantanee, clasamente calculate automat și bilete electronice securizate.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/cum-functioneaza"
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-sm"
            >
              Vezi Cum Funcționează →
            </Link>
            <Link
              href="/harta-romaniei"
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-headline font-bold text-xs uppercase tracking-wider transition"
            >
              Explorează Harta României
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
