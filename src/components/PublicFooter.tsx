"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 pt-16 pb-28 lg:pb-14 px-4 sm:px-6 lg:px-12 text-slate-600 dark:text-slate-400 font-body transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main 4-Column Structured Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand & Operator Identity */}
          <div className="space-y-4">
            <BrandLogo size="md" href="/campionat" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body">
              Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat.
            </p>
            <div className="pt-2 text-xs font-label space-y-1">
              <p className="text-slate-500 dark:text-slate-400">
                Operator platformă: <strong className="text-slate-900 dark:text-white font-bold">buu.ro S.R.L.</strong>
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                CUI: RO12345678 • J35/123/2024
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
                  Corp Arbitri Oficiali
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
            © {currentYear} PRO L4GUE • Operat de{" "}
            <a
              href="https://buu.ro"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-800 dark:text-slate-200 hover:underline"
            >
              buu.ro S.R.L.
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
