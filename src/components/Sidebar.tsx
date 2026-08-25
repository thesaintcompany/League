"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Panou Turnee", href: "/dashboard", icon: "dashboard" },
  { name: "Harta Campionatului", href: "/brackets", icon: "account_tree" },
  { name: "Arene & Stadioane", href: "/venues", icon: "stadium" },
  { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
  { name: "Corp Arbitri", href: "/referees", icon: "sports" },
  { name: "Pagina Publică", href: "/", icon: "public" },
  { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-100 dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col py-6">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary dark:bg-lime-400 flex items-center justify-center text-white dark:text-primary font-black text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tighter text-blue-950 dark:text-white block leading-none">
                Ligue
              </span>
              <span className="text-[10px] font-label text-slate-500 uppercase tracking-widest block mt-0.5 font-semibold">
                Pro Organizer
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-slate-200 dark:bg-slate-800 text-blue-950 dark:text-lime-400 font-bold border-l-4 border-lime-500 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / CTA */}
      <div className="mt-auto px-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
        <Link
          href="/dashboard/new"
          className="w-full bg-primary hover:bg-slate-800 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span className="font-label text-xs uppercase tracking-wider">Turneu Nou</span>
        </Link>

        {session?.user && (
          <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-200">
                  {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {session.user.name || "Organizator"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                title="Deconectare"
                className="p-1.5 text-slate-400 hover:text-error transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
