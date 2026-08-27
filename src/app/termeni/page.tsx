import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Termeni și Condiții • PRO LIGUE ROMÂNIA",
  description: "Termenii și condițiile  e de utilizare a platformei PRO LIGUE, regulamentul competițiilor și politica de ticketing.",
};

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-headline font-black uppercase tracking-wider border border-slate-300 dark:border-slate-700">
            <span className="material-symbols-outlined">gavel</span> CADRU LEGAL
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Termeni și Condiții de Utilizare
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Ultima actualizare: Sezon 2026 • Operat   de <strong>  buu.ro</strong>
          </p>
        </div>
      </section>

      {/* Legal Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="card p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-8 shadow-sm text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              1. Acceptarea Termenilor
            </h2>
            <p>
              Prin accesarea și utilizarea platformei <strong>PRO LIGUE</strong> (disponibilă pe domeniile  e operate de   buu.ro), confirmați că ați citit, înțeles și sunteți de acord să respectați acești Termeni și Condiții, precum și toate legile și reglementările românești aplicabile.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              2. Rolurile și Responsabilitățile Utilizatorilor
            </h2>
            <p>
              Platforma oferă funcționalități distincte pentru <strong>Organizatori</strong>, <strong>Arbitri</strong>, <strong>Proprietari de Arene</strong>, <strong>Manageri de Echipă</strong> și <strong>Spectatori</strong>. Fiecare categorie de utilizator este responsabilă pentru acuratețea datelor introduse (scoruri, componența loturilor, date de contact și rezervări).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              3. Regulamentul Tragerii la Sorți &amp; Meciurilor
            </h2>
            <p>
              Sistemul de tragere la sorți cu zaruri 3D este guvernat de un algoritm pseudo-aleatoriu verificat. Organizatorii pot re-arunca zarurile de cel mult 3 ori înainte de publicarea  ă. Odată publicat, arborele competițional devine definitiv și nu mai poate fi rescris decât cu aprobarea comisiei de organizare.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              4. Achiziția și Utilizarea Biletelor
            </h2>
            <p>
              Biletele electronice emise prin PRO LIGUE conțin un cod unic de acces (QR). Prețul biletelor include comisionul de procesare al platformei. În caz de reprogramare a meciului, biletul rămâne valabil pentru noua dată stabilită. Returnarea contravalorii biletelor se face conform politicii stabilite de organizatorul meciului.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              5. Drepturi de Proprietate Intelectuală
            </h2>
            <p>
              Toate mărcile, siglele (inclusiv sigla  ă PRO LIGUE ROMANIA), denumirile de arene, elementele grafice și codul sursă aparțin exclusiv <strong>  buu.ro</strong> și partenerilor afiliați. Este interzisă reproducerea neautorizată.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              6. Contact Legal
            </h2>
            <p>
              Pentru orice întrebări sau clarificări legate de acești termeni, vă rugăm să ne contactați la adresa de e-mail{" "}
              <a href="mailto:contact@buu.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                contact@buu.ro
              </a>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
