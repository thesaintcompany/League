"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "organizer";

  // Build role-specific navigation menu
  let navItems: NavItem[] = [];

  if (role === "referee") {
    navItems = [
      { name: "Meciuri & Panou Arbitraj", href: "/dashboard/referee", icon: "sports" },
      { name: "Profil & Setări Oficiale", href: "/profile", icon: "account_circle" },
      { name: "Nationale (Județe)", href: "/harta-romaniei", icon: "map" },
      { name: "Campionat", href: "/brackets", icon: "casino" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Corp Arbitri", href: "/referees", icon: "badge" },
      { name: "Arene & Stadioane", href: "/venues", icon: "domain" },
      { name: "Pagina Publică", href: "/campionat", icon: "public" },
    ];
  } else if (role === "team_leader") {
    navItems = [
      { name: "Panou Manager Echipă", href: "/dashboard/team", icon: "badge" },
      { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
      { name: "Nationale (Județe)", href: "/harta-romaniei", icon: "map" },
      { name: "Campionat", href: "/brackets", icon: "casino" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Arene & Stadioane", href: "/venues", icon: "domain" },
      { name: "Corp Arbitri", href: "/referees", icon: "sports" },
      { name: "Pagina Publică", href: "/campionat", icon: "public" },
    ];
  } else if (role === "arena_owner") {
    navItems = [
      { name: "Gestiune Arenă & Reclame", href: "/dashboard/arena", icon: "stadium" },
      { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
      { name: "Nationale (Județe)", href: "/harta-romaniei", icon: "map" },
      { name: "Arene & Stadioane", href: "/venues", icon: "domain" },
      { name: "Pagina Publică", href: "/campionat", icon: "public" },
    ];
  } else if (role === "player") {
    navItems = [
      { name: "Profil Fotbalist FUT", href: "/profile", icon: "sports_soccer" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Nationale (Județe)", href: "/harta-romaniei", icon: "map" },
      { name: "Campionat", href: "/brackets", icon: "casino" },
      { name: "Arene & Stadioane", href: "/venues", icon: "domain" },
      { name: "Corp Arbitri", href: "/referees", icon: "badge" },
      { name: "Pagina Publică", href: "/campionat", icon: "public" },
    ];
  } else {
    // Organizer / SuperAdmin Menu
    navItems = [
      { name: "Panou Turnee", href: "/dashboard", icon: "dashboard" },
      { name: "Consolă SuperAdmin", href: "/dashboard/admin", icon: "admin_panel_settings" },
      { name: "Gestiune Arenă & Reclame", href: "/dashboard/arena", icon: "stadium" },
      { name: "Nationale (Județe)", href: "/harta-romaniei", icon: "map" },
      { name: "Campionat", href: "/brackets", icon: "casino" },
      { name: "Arene & Stadioane", href: "/venues", icon: "domain" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Corp Arbitri", href: "/referees", icon: "sports" },
      { name: "Pagina Publică", href: "/campionat", icon: "public" },
      { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
    ];
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-6 transition-colors duration-200">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <Link
          href={
            role === "referee"
              ? "/dashboard/referee"
              : role === "arena_owner"
                ? "/dashboard/arena"
                : role === "team_leader"
                  ? "/dashboard/team"
                  : "/dashboard"
          }
          className="block group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white block leading-none">
                Ligue
              </span>
              <span className="text-[10px] font-label text-lime-600 dark:text-lime-400 uppercase tracking-widest block mt-0.5 font-bold">
                {role === "referee"
                  ? "Oficial Arbitraj"
                  : role === "arena_owner"
                    ? "Panou Arenă"
                    : role === "team_leader"
                      ? "Manager Echipă"
                      : role === "player"
                        ? "Fișă Jucător"
                        : "Pro Organizer"}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-lime-600 dark:text-lime-400 font-bold border-l-4 border-lime-500 dark:border-lime-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-label text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Theme Toggle & Actions */}
      <div className="mt-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        {/* Day / Night Switcher in Sidebar */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Temă Interfață
          </span>
          <ThemeToggle variant="full" />
        </div>

        {role === "organizer" && (
          <Link
            href="/dashboard/new"
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-xs font-label uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Turneu Nou
          </Link>
        )}

        {role === "team_leader" && (
          <Link
            href="/dashboard/team"
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-xs font-label uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">forward_to_inbox</span>
            Invită Jucător
          </Link>
        )}

        {role === "referee" && (
          <Link
            href="/dashboard/referee"
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-xs font-label uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">sports</span>
            Panou Arbitraj Live
          </Link>
        )}

        {session?.user && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                  {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {session.user.name || "Utilizator"}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Deconectare"
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
