"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  variant?: "default" | "dark";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "organizer";
  const isSuperAdminRole = role === "super_admin" || role === "superadmin";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleToggle() {
      setMobileOpen((prev) => !prev);
    }
    window.addEventListener("toggle-dashboard-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-dashboard-sidebar", handleToggle);
  }, []);

  // Build role-specific navigation menu
  let navItems: NavItem[] = [];

  if (isSuperAdminRole) {
    navItems = [
      { name: "Setări Aplicație & Logo", href: "/dashboard/admin?tab=branding", icon: "tune" },
      { name: "API & Integrare Plăți", href: "/dashboard/admin?tab=api_integrations", icon: "key" },
      { name: "Permisiuni & Utilizatori", href: "/dashboard/admin?tab=users", icon: "manage_accounts" },
      { name: "Statistici Utilizare", href: "/dashboard/admin?tab=analytics", icon: "analytics" },
      { name: "Istoric Login & Securitate", href: "/dashboard/admin?tab=login_history", icon: "history" },
      { name: "Infrastructură Arene", href: "/dashboard/admin?tab=venues", icon: "domain" },
      { name: "Bază de Date & Backup", href: "/dashboard/admin?tab=data_export", icon: "database" },
    ];
  } else if (role === "referee") {
    navItems = [
      { name: "Meciuri & Panou Arbitraj", href: "/dashboard/referee", icon: "sports" },
      { name: "Profil & Setări Oficiale", href: "/profile", icon: "account_circle" },
      { name: "Vezi Campionate", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Harta Meciuri", href: "/brackets", icon: "account_tree" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Corp Arbitri", href: "/referees", icon: "badge" },
      { name: "Arene", href: "/venues", icon: "domain" },
    ];
  } else if (role === "team_leader") {
    navItems = [
      { name: "Panou Manager Echipă", href: "/dashboard/team", icon: "badge" },
      { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
      { name: "Vezi Campionate", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Harta Meciuri", href: "/brackets", icon: "account_tree" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Arene", href: "/venues", icon: "domain" },
      { name: "Corp Arbitri", href: "/referees", icon: "sports" },
    ];
  } else if (role === "arena_owner") {
    navItems = [
      { name: "Panou Arenă & Reclame", href: "/dashboard/arena", icon: "stadium" },
      { name: "Profil Bază Sportivă", href: "/profile", icon: "account_circle" },
      { name: "Arene", href: "/venues", icon: "domain" },
      { name: "Vezi Campionate", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Harta Meciuri", href: "/brackets", icon: "account_tree" },
    ];
  } else if (role === "player") {
    navItems = [
      { name: "Fișă Jucător & Carieră", href: "/profile", icon: "account_circle" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Vezi Campionate", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Harta Meciuri", href: "/brackets", icon: "account_tree" },
      { name: "Arene", href: "/venues", icon: "domain" },
    ];
  } else {
    // Organizer Menu
    navItems = [
      { name: "Panou Turnee", href: "/dashboard", icon: "dashboard" },
      { name: "Vezi Campionate", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Harta Meciuri", href: "/brackets", icon: "account_tree" },
      { name: "Arene", href: "/venues", icon: "domain" },
      { name: "Catalog Jucători", href: "/players", icon: "directions_run" },
      { name: "Corp Arbitri", href: "/referees", icon: "sports" },
      { name: "Profil & Setări", href: "/profile", icon: "account_circle" },
    ];
  }

  const isDarkTheme = variant === "dark";

  const targetDashboardHref =
    role === "referee"
      ? "/dashboard/referee"
      : role === "arena_owner"
      ? "/dashboard/arena"
      : role === "team_leader"
      ? "/dashboard/team"
      : isSuperAdminRole
      ? "/dashboard/admin"
      : "/dashboard";

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Brand Header */}
      <div>
        <div className="px-5 mb-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <BrandLogo
              size="sidebar"
              href={targetDashboardHref}
              onClick={() => setMobileOpen(false)}
            />

            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Închide meniu"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-label font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 border border-slate-200 dark:border-slate-800">
              {role === "super_admin" || role === "superadmin"
                ? "👑 Super Administrator"
                : role === "referee"
                ? "⚖️ Oficial Arbitraj"
                : role === "arena_owner"
                ? "🏟️ Panou Arenă"
                : role === "team_leader"
                ? "👔 Manager Echipă"
                : role === "player"
                ? "⚽ Fișă Jucător"
                : "⚡ Pro Organizer"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => {
            const isTabMatch = item.href.includes("?tab=")
              ? pathname === "/dashboard/admin" &&
                (item.href.includes(`tab=${currentTab}`) ||
                  (item.href.includes("tab=branding") && (!currentTab || currentTab === "branding")))
              : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isActive = isTabMatch;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium transition-all duration-200 ${
                  isActive
                    ? isDarkTheme
                      ? "bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-400/20"
                      : "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-bold shadow-md"
                    : isDarkTheme
                    ? "text-slate-300 hover:text-white hover:bg-slate-800/90"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] sm:text-[22px] ${
                  isActive
                    ? isDarkTheme ? "text-slate-950" : "text-lime-400 dark:text-slate-950"
                    : isDarkTheme ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                }`}>
                  {item.icon}
                </span>
                <span className="font-label text-xs sm:text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Theme Toggle & Actions */}
      <div className="mt-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {/* Day / Night Switcher in Sidebar */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[11px] font-label font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Temă
          </span>
          <ThemeToggle variant="full" />
        </div>

        {role === "organizer" && (
          <Link
            href="/dashboard/new"
            onClick={() => setMobileOpen(false)}
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-xs font-label uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Turneu Nou
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
                type="button"
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <aside
        className={`hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 border-r flex-col py-6 transition-colors duration-200 ${
          isDarkTheme
            ? "bg-slate-900 border-slate-800 text-white shadow-xl"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
          />
          <div
            className={`relative w-4/5 max-w-xs h-full py-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r ${
              isDarkTheme
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            }`}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
