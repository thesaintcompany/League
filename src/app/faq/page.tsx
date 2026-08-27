import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Întrebări Frecvente (FAQ) • PRO LIGUE ROMÂNIA",
  description: "Răspunsuri la cele mai comune întrebări despre organizarea campionatelor, cumpărarea biletelor, arene și arbitraj.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Cum pot crea un campionat nou pe platformă?",
      a: "Trebuie doar să îți creezi un cont de Organizator, să accesezi secțiunea 'Turneu Nou' și să completezi datele ligii (sport, categorie, format, locație). Sistemul îți va genera automat linkul public dedicat.",
    },
    {
      q: "Ce este tragerea la sorți cu zaruri și de ce există o limită de 3 aruncări?",
      a: "Tragerea la sorți cu zaruri folosește un motor 3D transparent pentru a stabili meciurile din sferturi și semifinale în mod imparțial. Limita de maxim 3 aruncări garantează corectitudinea și previne manipularea tabloului de joc.",
    },
    {
      q: "Cum pot cumpăra bilete pentru meciuri?",
      a: "Pe orice pagină promoțională a meciului (ex: /matches/[id]/promo), apeși butonul 'Cumpără Bilet Online'. Poți plăti securizat prin Stripe (card bancar), Apple Pay, Google Pay sau PayPal. Biletul este emis instantaneu cu cod QR.",
    },
    {
      q: "Ce reprezintă acreditarea RIFA pentru arbitri?",
      a: "RIFA (Romanian International Football Arbitration) este standardul   de clasificare al arbitrilor pe platformă (RIFA Pro Elite, RIFA First Class, RIFA VAR și Asistenți).",
    },
    {
      q: "Sunt disponibile toate cele 59 de arene din România?",
      a: "Da, catalogul de Arene include 59 de stadioane și săli polivalente din toate județele țării, cu fotografii HD, specificații de suprafață, capacitate de spectatori și disponibilitate nocturnă.",
    },
    {
      q: "Pot adăuga echipe de fete sau juniori la fotbal?",
      a: "Absolut! Platforma include categorii dedicate pentru Fotbal Masculin (Seniori), Feminin, Futsal / Minifotbal și Juniori & Tineret (U19, U17, U15).",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/20 text-lime-700 dark:text-lime-400 text-xs font-headline font-black uppercase tracking-wider border border-lime-400/30">
            <span>❓</span> ASISTENȚĂ &amp; FAQ
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Întrebări Frecvente
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ai nelămuriri despre cum funcționează PRO LIGUE? Iată răspunsurile la cele mai frecvente întrebări.
          </p>
        </div>
      </section>

      {/* FAQ Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="card p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2"
          >
            <h3 className="text-base font-black font-headline text-slate-900 dark:text-white flex items-start gap-2.5">
              <span className="text-lime-600 dark:text-lime-400 font-mono text-lg font-bold shrink-0">
                Q:
              </span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6 font-body">
              {faq.a}
            </p>
          </div>
        ))}

        {/* Contact fallback */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-3 mt-8 border border-slate-800">
          <h3 className="text-lg font-black font-headline uppercase text-white">
            Nu ai găsit răspunsul căutat?
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Echipa noastră de suport tehnic de la <strong>  buu.ro</strong> îți stă la dispoziție.
          </p>
          <div className="pt-2">
            <a
              href="mailto:contact@buu.ro"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm hover:bg-lime-300 transition"
            >
              <span className="material-symbols-outlined">mail</span>
              <span>Trimite un Email (contact@buu.ro)</span>
            </a>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
