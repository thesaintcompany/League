import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Politica de Confidențialitate & GDPR • PRO LIGUE ROMÂNIA",
  description: "Politica privind protecția datelor cu caracter personal, utilizarea cookie-urilor și drepturile utilizatorilor conform Regulamentului GDPR.",
};

export default function ConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-headline font-black uppercase tracking-wider border border-slate-300 dark:border-slate-700">
            <span className="material-symbols-outlined">shield</span> PROTECȚIA DATELOR
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Politica de Confidențialitate (GDPR)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Protecția datelor dumneavoastră este prioritatea noastră • Operat de <strong>   ligue.ro</strong>
          </p>
        </div>
      </section>

      {/* Legal Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="card p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-8 shadow-sm text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              1. Datele pe Care le Colectăm
            </h2>
            <p>
              Colectăm doar datele strict necesare bunei funcționări a campionatelor și emiterii biletelor: nume, prenume, adresă de e-mail, număr de telefon (opțional), rol în cadrul echipei/competiției și detalii de tranzacție (prin procesatori securizați Stripe/PayPal - nu stocăm date de card pe serverele noastre).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              2. Scopul Prelucrării
            </h2>
            <p>
              Datele sunt utilizate exclusiv pentru: autentificare și securitatea contului, emiterea și validarea biletelor electronice cu cod QR, afișarea clasamentelor și a fișelor de meci și comunicarea notificărilor legate de turneu.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              3. Drepturile Dumneavoastră conform GDPR
            </h2>
            <p>
              Conform Regulamentului General privind Protecția Datelor (UE 2016/679), aveți dreptul de acces la date, dreptul la rectificare, dreptul la ștergerea datelor („dreptul de a fi uitat”), dreptul la restricționarea prelucrării și dreptul la portabilitatea datelor.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              4. Securitatea Informațiilor
            </h2>
            <p>
              Implementăm protocoale avansate de criptare SSL/TLS, autentificare pe bază de token-uri securizate și izolarea bazelor de date pentru a garanta protecția împotriva accesului neautorizat.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
              5. Responsabil cu Protecția Datelor (DPO)
            </h2>
            <p>
              Pentru orice solicitare privind datele dumneavoastră cu caracter personal, vă rugăm să trimiteți un e-mail către responsabilul DPO la{" "}
              <a href="mailto:contact@ligue.ro" className="text-lime-600 dark:text-lime-400 font-bold hover:underline">
                contact@ligue.ro
              </a>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
