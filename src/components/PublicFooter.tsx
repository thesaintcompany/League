"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-12 text-slate-600 dark:text-slate-400 font-body transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="md" href="/campionat" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body">
              Platforma națională digitală pentru organizarea, arbitrajul oficial și telemetria meciurilor sportive din România.
            </p>
            <div className="flex items-center gap-2 text-xs font-label">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                Operat oficial de{" "}
                <a
                  href="https://buu.ro"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-950 dark:text-lime-400 font-black hover:underline"
                >
                  buu.ro
                </a>
              </span>
            </div>
          </div>

          {/* Col 2: Competiții & Sport */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
              Competiții &amp; Sport
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/campionat" className="hover:text-slate-950 dark:hover:text-white transition">
                  Campionate Oficiale
                </Link>
              </li>
              <li>
                <Link href="/harta-romaniei" className="hover:text-slate-950 dark:hover:text-white transition">
                  🗺️ Harta României
                </Link>
              </li>
              <li>
                <Link href="/brackets" className="hover:text-slate-950 dark:hover:text-white transition">
                  🎲 Arbore Meciuri cu Zaruri
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-slate-950 dark:hover:text-white transition">
                  Echipe &amp; Loturi
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-slate-950 dark:hover:text-white transition">
                  🏟️ 59 Arene Naționale
                </Link>
              </li>
              <li>
                <Link href="/players" className="hover:text-slate-950 dark:hover:text-white transition">
                  Golgheteri &amp; Jucători
                </Link>
              </li>
              <li>
                <Link href="/referees" className="hover:text-slate-950 dark:hover:text-white transition">
                  ⚖️ Corp Arbitri RIFA
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platformă & Ghid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
              Aplicație &amp; Ghid
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/despre" className="hover:text-slate-950 dark:hover:text-white transition font-bold">
                  📖 Despre Aplicație
                </Link>
              </li>
              <li>
                <Link href="/cum-functioneaza" className="hover:text-slate-950 dark:hover:text-white transition font-bold">
                  ⚡ Cum Funcționează
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-slate-950 dark:hover:text-white transition font-bold">
                  ❓ Întrebări Frecvente (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-slate-950 dark:hover:text-white transition">
                  Autentificare / Cont
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-slate-950 dark:hover:text-white transition text-lime-600 dark:text-lime-400 font-bold">
                  Înregistrare Organizator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider font-headline text-slate-900 dark:text-white">
              Legal &amp; Asistență
            </h4>
            <ul className="space-y-2 text-xs font-label">
              <li>
                <Link href="/termeni" className="hover:text-slate-950 dark:hover:text-white transition">
                  ⚖️ Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className="hover:text-slate-950 dark:hover:text-white transition">
                  🛡️ Confidențialitate &amp; GDPR
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950 dark:hover:text-white transition font-bold">
                  ✉️ Contact &amp; Asistență
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:contact@buu.ro"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-lime-400 text-xs font-mono font-bold hover:bg-lime-400 hover:text-slate-950 transition border border-slate-200 dark:border-slate-800"
                >
                  <span>✉️</span>
                  <span>contact@buu.ro</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-label text-slate-500 dark:text-slate-400">
          <p>
            © {currentYear}{" "}
            <a
              href="https://buu.ro"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-900 dark:text-lime-400 hover:underline"
            >
              buu.ro
            </a>
            . Toate drepturile rezervate.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link href="/despre" className="hover:underline">
              Despre
            </Link>
            <span>•</span>
            <Link href="/cum-functioneaza" className="hover:underline">
              Ghid
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:underline">
              FAQ
            </Link>
            <span>•</span>
            <Link href="/termeni" className="hover:underline">
              Termeni
            </Link>
            <span>•</span>
            <Link href="/confidentialitate" className="hover:underline">
              Confidențialitate
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
