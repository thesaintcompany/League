import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata = {
  title: "Cum Funcționează • PRO LIGUE ROMÂNIA",
  description: "Ghid pas cu pas despre organizarea campionatelor, managementul echipelor, tragerea la sorți cu zaruri, bilete electronice și arbitraj digital în timp real.",
};

export default function CumFunctioneazaPage() {
  const steps = [
    {
      num: "01",
      title: "Crearea Competiției & Harta Națională pe Județe",
      desc: "Organizatorul configurează campionatul alegând sportul (Fotbal, Minifotbal, Baschet, Tenis, Ping-Pong, Padel, Volei, Handbal), categoria (Masculin, Feminin, Dublu, Amatori, Elită) și nivelul teritorial (Național, Județean sau Municipal). Competiția este indexată automat pe Harta celor 41 de județe + București.",
      icon: "map",
    },
    {
      num: "02",
      title: "Management de Club, Lot & Check-in la Stadion",
      desc: "Managerii de echipă își configurează identitatea clubului (siglă, culori, formație tactică, arenă gazdă), trimit invitații securizate pe email jucătorilor și confirmă prezența la meci prin modulul de Check-in digital GPS.",
      icon: "groups",
    },
    {
      num: "03",
      title: "Tragerea la Sorți cu Zaruri 3D (Dice Roll)",
      desc: "Sistemul generează automat și transparent tabloul meciurilor prin aruncarea zarurilor 3D animate. Pentru corectitudine deplină, organizatorul are la dispoziție maximum 3 aruncări înainte ca arborele competițional să fie blocat și publicat oficial.",
      icon: "casino",
    },
    {
      num: "04",
      title: "Tabloul Interactiv & Arborele de Meciuri (Brackets)",
      desc: "Fiecare campionat primește un cod unic de partajare (ex: #LP-2026) și un arbore eliminatoriu dinamic tip Mindmap cu linii de conexiune între Sferturi, Semifinale și Marea Finală, accesibil direct în secțiunea Meciuri.",
      icon: "account_tree",
    },
    {
      num: "05",
      title: "Bilete Electronice & Validare la Arenă prin QR",
      desc: "Suporterii pot achiziționa bilete online securizate (General, VIP), descărcabile cu cod QR unic pe telefon. La intrarea pe stadion sau arenă, organizatorii validează tichetele în fracțiuni de secundă folosind scannerul mobil integrat.",
      icon: "confirmation_number",
    },
    {
      num: "06",
      title: "Arbitraj Digital, Rapoarte Live & Clasamente",
      desc: "Arbitrii omologați completează scorul, marcatorii, cartonașele și foaia de meci în timp real. Clasamentele, golaverajul, punctele și topul golgheterilor (carduri de performanță Ultimate Edition) se recalculează automat la fluierul final.",
      icon: "sports_score",
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
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-lime-400 dark:bg-lime-400 dark:text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md font-mono">
              {step.num}
            </div>

            <div className="space-y-1.5 flex-1">
              <h3 className="text-base sm:text-lg font-black font-headline uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-xl shrink-0">{step.icon}</span>
                <span>{step.title}</span>
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
