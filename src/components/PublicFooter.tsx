"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 pt-16 pb-28 lg:pb-14 px-4 sm:px-6 lg:px-12 text-slate-600 dark:text-slate-400 font-body transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* PRO LIGUE Promotional Callout Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl group">
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-goal.jpg"
            alt="PRO LIGUE • Și tu poți fi un profesionist în sport. Începe acum!"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/40 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                PRO LIGUE ROMÂNIA
              </span>
              <h3 className="text-2xl sm:text-3xl font-black italic font-headline uppercase leading-tight tracking-tight text-white drop-shadow-md">
                Și tu poți fi un <span className="text-lime-400">profesionist în sport</span> — începe acum!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-body drop-shadow-sm">
                Creează propria ta ligă sau înscrie-te ca jucător, arbitru ori manager de echipă pe platforma  ă.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <span>Începe Acum 🚀</span>
              </Link>
              <Link
                href="/harta-romaniei"
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-headline font-bold text-xs uppercase tracking-wider border border-slate-700 transition"
              >
                <span>Vezi Ligi</span>
              </Link>
            </div>
          </div>
        </div>

        {/* The brand spans the first row on phones; navigation stays in two clear columns. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-9 sm:gap-x-10 lg:gap-12">
          {/* Column 1: Brand & Operator Identity */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <BrandLogo size="md" href="/campionat" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body">
              Platforma națională digitală de gestiune competițională, clasamente  e și arbitraj omologat.
            </p>
            <div className="pt-2 text-xs font-label space-y-1">
              <p className="text-slate-500 dark:text-slate-400">
                Operator platformă: <strong className="text-slate-900 dark:text-white font-bold">TSC Q - BUU.RO</strong>
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                CUI: 53063735 • J2025095153006
              </p>
            </div>
          </div>

          {/* Column 2: Competiții & Sport */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest font-headline text-slate-900 dark:text-white">
              Competiții
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/campionat" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Campionate Naționale
                </Link>
              </li>
              <li>
                <Link href="/harta-romaniei" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Harta Competițională
                </Link>
              </li>
              <li>
                <Link href="/brackets" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Tablou &amp; Meciuri
                </Link>
              </li>
              <li>
                <Link href="/sanctiuni" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Sancțiuni &amp; Disciplină
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Echipe Înregistrate
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Arene Omologate
                </Link>
              </li>
              <li>
                <Link href="/players" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Catalog Jucători
                </Link>
              </li>
              <li>
                <Link href="/referees" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Corp Arbitri  i
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Despre & Resurse */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest font-headline text-slate-900 dark:text-white">
              Platformă
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/despre" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Despre Aplicație
                </Link>
              </li>
              <li>
                <Link href="/cum-functioneaza" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Ghid de Utilizare
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Întrebări Frecvente
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Autentificare Cont
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Înregistrare Organizator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Consolă Administrare
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Asistență */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest font-headline text-slate-900 dark:text-white">
              Legal &amp; Suport
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/termeni" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Politică de Confidențialitate
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950 dark:hover:text-white transition-colors">
                  Contact &amp; Asistență
                </Link>
              </li>
              <li className="pt-3">
                <a
                  href="mailto:contact@buu.ro"
                  className="inline-block text-xs font-mono font-bold text-slate-900 dark:text-lime-400 hover:underline"
                >
                  contact@buu.ro
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Inline Secondary Links */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-label text-slate-500 dark:text-slate-400">
          <p>
            © {currentYear} PRO LIGUE • Operat de{" "}
            <a
              href="https://tscquantum.ro"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-800 dark:text-slate-200 hover:underline"
            >
              TSC Q - BUU.RO
            </a>
            . Toate drepturile rezervate.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
            <Link href="/despre" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Despre
            </Link>
            <Link href="/cum-functioneaza" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Cum Funcționează
            </Link>
            <Link href="/faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/termeni" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Termeni
            </Link>
            <Link href="/confidentialitate" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Confidențialitate
            </Link>
            <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
