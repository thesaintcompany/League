"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopHeader({ title = "Championship Pro", subtitle, action }: TopHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center px-6 lg:px-8 h-20 transition-colors duration-200">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-label text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>

        {/* Live status ticker badge */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 border border-lime-300/60 dark:border-lime-500/30 text-xs font-bold font-label">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          LIVE HUB
        </div>
      </div>

      <div className="flex items-center gap-3">
        {action}

        {/* Day / Night Toggle */}
        <ThemeToggle variant="compact" />

        <Link
          href="/"
          className="text-xs font-label font-bold uppercase tracking-wider px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Pagina Publică ↗
        </Link>

        {session ? (
          <Link
            href="/profile"
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-lime-400 dark:bg-lime-400 dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              {session.user?.name ? session.user.name[0].toUpperCase() : "A"}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="text-xs font-label font-bold uppercase px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Autentificare
            </Link>
            <Link
              href="/signup"
              className="text-xs font-label font-bold uppercase px-4 py-2 bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 rounded-xl hover:bg-slate-800 shadow-sm"
            >
              Cont Nou
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
