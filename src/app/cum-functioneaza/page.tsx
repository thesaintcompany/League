import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Cum Funcționează • PRO LIGUE ROMÂNIA",
  description: "Ghid pas cu pas despre cum funcționează organizarea campionatelor, tragerea la sorți cu zaruri, cumpărarea biletelor și arbitrajul  .",
};

export default function CumFunctioneazaPage() {
  const steps = [
    {
      num: "01",
      title: "Crearea Competiției & Înscrierea Echipelor",
      desc: "Organizatorul alege sportul (Fotbal, Baschet, Volei, Handbal, Tenis), categoria (Masculin, Feminin, Futsal, Juniori) și aria de acoperire (Național, Județean sau Local). Echipele își configurează lotul și staff-ul tehnic.",
      icon: "add_circle",
    },
    {
      num: "02",
      title: "Tragerea la Sorți cu Zaruri (Dice Roll)",
      desc: "Sistemul generează automat tabloul eliminatoriu prin aruncarea zarurilor 3D. Pentru a asigura corectitudinea, organizatorul are la dispoziție maxim 3 aruncări înainte ca arborele meciurilor să fie publicat  .",
      icon: "casino",
    },
    {
      num: "03",
      title: "Tabloul Interactiv & Arborele de Meciuri",
      desc: "Fiecare campionat primește un cod public (ex: LP-2026) și un arbore eliminatoriu tip Mindmap cu linii fine de conexiune între Sferturi, Semifinale și Marea Finală direct în secțiunea Meciuri.",
      icon: "account_tree",
    },
    {
      num: "04",
      title: "Bilete Electronice & Plăți Securizate",
      desc: "Suporterii pot achiziționa bilete online prin Stripe, Apple Pay, Google Pay sau PayPal. Fiecare bilet conține un cod QR unic și oferă acces rapid la arenă.",
      icon: "confirmation_number",
    },
    {
      num: "05",
      title: "Arbitraj   RIFA & Statistici Live",
      desc: "Arbitrii omologați completează rapoartele de meci, cartonașele și golurile în timp real. Clasamentele și clasamentele golgheterilor se actualizează automat.",
      icon: "sports",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-200">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/20 text-lime-700 dark:text-lime-400 text-xs font-headline font-black uppercase tracking-wider border border-lime-400/30">
            <span><span className="material-symbols-outlined align-middle text-sm">bolt</span></span> GHID UTILIZATOR
          </div>
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight font-headline uppercase leading-tight">
            Cum Funcționează Platforma
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            De la crearea primei ligi până la finala cu trofeu, iată pașii simpli prin care PRO LIGUE digitalizează sportul românesc.
          </p>
        </div>
      </section>

      {/* Steps Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-lime-400 dark:bg-lime-400 dark:text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {step.num}
            </div>

            <div className="space-y-1.5 flex-1">
              <h3 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-body">
                {step.desc}
              </p>
            </div>
          </div>
        ))}

        <div className="p-8 rounded-3xl bg-lime-400 text-slate-950 text-center space-y-4 shadow-lg mt-8">
          <h2 className="text-2xl font-black font-headline uppercase tracking-tight">
            Ești gata să organizezi propriul turneu?
          </h2>
          <p className="text-xs sm:text-sm font-medium max-w-xl mx-auto">
            Înregistrează-te ca organizator și lansează competiția în câteva minute.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-headline font-black text-xs uppercase tracking-wider shadow-md transition"
            >
              Creează Cont Gratuit →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
