"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl py-10 pb-24 md:pb-10 px-4 sm:px-6 lg:px-12 text-slate-600 dark:text-slate-400 font-body transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
          <BrandLogo size="sm" href="/campionat" />

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          <p className="text-xs font-label">
            © {currentYear}{" "}
            <a
              href="https://buu.ro"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-slate-900 dark:text-lime-400 hover:underline"
            >
              buu.ro
            </a>
            . Toate drepturile aparțin{" "}
            <strong className="text-slate-900 dark:text-white font-black">buu.ro</strong>.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-label font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <Link href="/campionat" className="hover:text-slate-950 dark:hover:text-white transition">
            Campionat
          </Link>
          <Link href="/teams" className="hover:text-slate-950 dark:hover:text-white transition">
            Echipe
          </Link>
          <Link href="/harta-romaniei" className="hover:text-slate-950 dark:hover:text-white transition">
            Naționale
          </Link>
          <Link href="/venues" className="hover:text-slate-950 dark:hover:text-white transition">
            Arene
          </Link>
          <Link href="/players" className="hover:text-slate-950 dark:hover:text-white transition">
            Golgheteri
          </Link>
          <Link href="/referees" className="hover:text-slate-950 dark:hover:text-white transition">
            Arbitri
          </Link>
          <a
            href="mailto:contact@buu.ro"
            className="text-lime-600 dark:text-lime-400 hover:underline font-extrabold flex items-center gap-1"
          >
            <span>✉️</span> contact@buu.ro
          </a>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-label text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Platformă Oficială Operată de <strong>buu.ro</strong></span>
        </div>
        <div>
          Contact Asistență &amp; Licențiere:{" "}
          <a
            href="mailto:contact@buu.ro"
            className="text-slate-900 dark:text-white font-bold hover:underline"
          >
            contact@buu.ro
          </a>
        </div>
      </div>
    </footer>
  );
}
