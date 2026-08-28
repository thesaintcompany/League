"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { appSignOut } from "@/lib/logout";
import { BrandLogo } from "./BrandLogo";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

interface SidebarProps {
  variant?: "default" | "dark";
  teamTabCounts?: { roster?: number; calendar?: number; invites?: number };
}

export function Sidebar({ variant, teamTabCounts = {} }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "organizer";
  const isSuperAdminRole = role === "super_admin" || role === "superadmin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userChampionships, setUserChampionships] = useState<{ id: string; name: string; sport: string }[]>([]);
  const [selectedChampId, setSelectedChampId] = useState<string | null>(null);
  const [arenaId, setArenaId] = useState<string | null>(null);

  useEffect(() => {
    function handleToggle() {
      setMobileOpen((prev) => !prev);
    }
    window.addEventListener("toggle-dashboard-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-dashboard-sidebar", handleToggle);
  }, []);

  // Fetch organizer championships for direct navigation
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/championships")
      .then((r) => (r.ok ? r.json() : { championships: [] }))
      .then((d) => {
        const list = (d.championships || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          sport: c.sport,
        }));
        setUserChampionships(list);
        if (list.length > 0 && !selectedChampId) {
          setSelectedChampId(list[0].id);
        }
      })
      .catch(() => setUserChampionships([]));
  }, [session, selectedChampId]);

  useEffect(() => {
    if (role !== "arena_owner") return;
    fetch("/api/arena")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setArenaId(data?.venue?.id || null))
      .catch(() => setArenaId(null));
  }, [role]);

  // Build role-specific navigation menu
  let navItems: NavItem[] = [];

  if (isSuperAdminRole) {
    navItems = [
      { name: "Setări", href: "/dashboard/admin?tab=branding", icon: "tune" },
      { name: "API & Plăți", href: "/dashboard/admin?tab=api_integrations", icon: "key" },
      { name: "Utilizatori", href: "/dashboard/admin?tab=users", icon: "manage_accounts" },
      { name: "Statistici Utilizare", href: "/dashboard/admin?tab=analytics", icon: "analytics" },
      { name: "Istoric Login", href: "/dashboard/admin?tab=login_history", icon: "history" },
      { name: "Arene", href: "/dashboard/admin?tab=venues", icon: "domain" },
      { name: "DB", href: "/dashboard/admin?tab=data_export", icon: "database" },
    ];
  } else if (role === "referee") {
    navItems = [
      { name: "Panou Arbitraj", href: "/dashboard/referee", icon: "sports" },
      { name: "Foaie Arbitraj Live", href: "/dashboard/referee?tab=live", icon: "scoreboard" },
      { name: "Meciuri Viitoare", href: "/dashboard/referee?tab=upcoming", icon: "calendar_month" },
      { name: "Invitații & Notificări", href: "/dashboard/referee?tab=invitations", icon: "mark_email_unread" },
      { name: "Istoric & Foaie A4", href: "/dashboard/referee?tab=history", icon: "description" },
      { name: "Profil & Date Contact", href: "/dashboard/referee?tab=profile", icon: "badge" },
      { name: "Campionate & Arene", href: "/harta-romaniei", icon: "map" },
    ];
  } else if (role === "team_leader") {
    const rosterCount = teamTabCounts.roster ?? 0;
    const matchCount = teamTabCounts.calendar ?? 0;
    const inviteCount = teamTabCounts.invites ?? 0;
    navItems = [
      { name: "Panou Club", href: "/dashboard/team", icon: "dashboard" },
      { name: `Lot Jucători${rosterCount ? ` (${rosterCount})` : ""}`, href: `/dashboard/team?tab=roster`, icon: "groups" },
      { name: `Invitații${inviteCount ? ` (${inviteCount})` : ""}`, href: `/dashboard/team?tab=invites`, icon: "mark_email_unread" },
      { name: "Tactică", href: `/dashboard/team?tab=tactics`, icon: "sports" },
      { name: "Staff", href: `/dashboard/team?tab=staff`, icon: "badge" },
      { name: `Calendar${matchCount ? ` (${matchCount})` : ""}`, href: `/dashboard/team?tab=calendar`, icon: "calendar_month" },
      { name: "Știri", href: `/dashboard/team?tab=news`, icon: "campaign" },
      { name: "Finanțe", href: `/dashboard/team?tab=payments`, icon: "payments" },
      { name: "Setări", href: "/profile", icon: "account_circle" },
    ];
  } else if (role === "arena_owner") {
    navItems = [
      { name: "Configurare", href: "/dashboard/arena", icon: "tune" },
      { name: "Campionate", href: "/dashboard/arena/championships", icon: "emoji_events" },
      { name: "Meciuri & Calendar", href: "/dashboard/arena/matches", icon: "calendar_month" },
      { name: "Reclame", href: "/dashboard/arena/ads", icon: "ad_units" },
      { name: "Anunțuri", href: "/dashboard/arena/announcements", icon: "campaign" },
      { name: "Ticker", href: "/dashboard/arena/ticker", icon: "rss_feed" },
    ];
  } else if (role === "player") {
    navItems = [
      { name: "Fișă Jucător", href: "/profile", icon: "account_circle" },
      { name: "Notificări", href: "/profile?tab=notifications", icon: "notifications" },
      { name: "Campionate", href: "/harta-romaniei", icon: "emoji_events" },
    ];
  } else {
    // Organizer Menu
    const isChampDetail = pathname.startsWith("/dashboard/championships/");
    const currentChampIdFromPath = isChampDetail ? pathname.split("/dashboard/championships/")[1]?.split("?")[0]?.split("/")[0] : null;
    const targetChampId = currentChampIdFromPath || selectedChampId || (userChampionships.length > 0 ? userChampionships[0].id : null);
    const hasChamp = Boolean(targetChampId);
    const activeBase = hasChamp ? `/dashboard/championships/${targetChampId}` : "/dashboard";

    navItems = [
      {
        name: "Clasament General",
        href: hasChamp ? `${activeBase}?tab=standings` : "#",
        icon: "leaderboard",
        disabled: !hasChamp,
        disabledTooltip: "Creează un campionat pentru a activa clasamentul",
      },
      {
        name: "Program & Arbitraj",
        href: hasChamp ? `${activeBase}?tab=matches` : "#",
        icon: "sports_soccer",
        disabled: !hasChamp,
        disabledTooltip: "Creează un campionat pentru a programa meciuri",
      },
      {
        name: "Arbore Eliminatoriu",
        href: hasChamp ? `${activeBase}?tab=brackets` : "#",
        icon: "account_tree",
        disabled: !hasChamp,
        disabledTooltip: "Nu ai niciun campionat activ. Creează un campionat pentru a genera tabloul.",
      },
      {
        name: "Echipe Înscrise",
        href: hasChamp ? `${activeBase}?tab=teams` : "/dashboard/organizer/teams",
        icon: "shield",
      },
      ...(isChampDetail || hasChamp
        ? [
          {
            name: "Bilete & Scanner Porți",
            href: `${activeBase}?tab=tickets`,
            icon: "confirmation_number",
            disabled: !hasChamp,
            disabledTooltip: "Creează un campionat pentru a vinde bilete",
          },
        ]
        : []),
      {
        name: "Promotion Hub",
        href: hasChamp ? `${activeBase}?tab=promo` : "#",
        icon: "campaign",
        disabled: !hasChamp,
        disabledTooltip: "Creează un campionat pentru a accesa Promotion Hub",
      },
      { name: "Panou Turnee", href: "/dashboard", icon: "dashboard" },
      { name: "Campionate & Harta", href: "/harta-romaniei", icon: "emoji_events" },
      { name: "Arene", href: "/venues", icon: "domain" },
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
        <div className="px-5 mb-4 flex flex-col gap-2">
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-label font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 border border-slate-200 dark:border-slate-800">
                {role === "super_admin" || role === "superadmin"
                  ? "Super Administrator"
                  : role === "referee"
                    ? "  Arbitraj"
                    : role === "arena_owner"
                      ? "Panou Arenă"
                      : role === "team_leader"
                        ? "Manager Echipă"
                        : role === "player"
                          ? "Fișă Jucător"
                          : "Pro Organizer"}
              </span>
            </div>

            {/* Organizer Active Championship Selector Badge */}
            {role === "organizer" && userChampionships.length > 0 && (
              <div className="pt-1">
                {userChampionships.length === 1 ? (
                  <Link
                    href={`/dashboard/championships/${userChampionships[0].id}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-700 dark:text-lime-300 border border-lime-400/30 text-[10px] font-headline font-black truncate transition"
                    title={userChampionships[0].name}
                  >
                    <span className="truncate">{userChampionships[0].name}</span>
                  </Link>
                ) : (
                  <select
                    value={
                      pathname.startsWith("/dashboard/championships/")
                        ? pathname.split("/dashboard/championships/")[1]?.split("?")[0]?.split("/")[0]
                        : selectedChampId || ""
                    }
                    onChange={(e) => {
                      setSelectedChampId(e.target.value);
                      window.location.href = `/dashboard/championships/${e.target.value}`;
                    }}
                    className="w-full px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-headline font-bold text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 truncate"
                  >
                    {userChampionships.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.sport})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
          {navItems.map((item) => {
            const itemTab = item.href.includes("?tab=") ? item.href.split("?tab=")[1] : null;
            const isTabMatch = itemTab
              ? currentTab === itemTab || (!currentTab && itemTab === "standings" && pathname.startsWith("/dashboard/championships/"))
              : (pathname === item.href && (!currentTab || currentTab === "overview"));
            const isActive = isTabMatch;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  title={item.disabledTooltip || "Funcționalitate inactivă - Nu ai niciun campionat creat"}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50 select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                      {item.icon}
                    </span>
                    <span className="font-label text-xs sm:text-sm">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    Inactiv
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium transition-all duration-200 ${isActive
                  ? isDarkTheme
                    ? "bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-400/20 scale-[1.02]"
                    : "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-bold shadow-md scale-[1.02]"
                  : isDarkTheme
                    ? "text-slate-300 hover:text-white hover:bg-slate-800/90"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70"
                  }`}
              >
                <span className={`material-symbols-outlined text-[20px] sm:text-[22px] ${isActive
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

      {/* Footer / Actions */}
      <div className="mt-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
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

        {(role === "team_leader" || role === "team_manager") && (
          <button
            type="button"
            disabled
            title="Managerii de echipă nu pot crea turnee (doar organizatorii)"
            className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/60 text-xs font-label uppercase tracking-wider cursor-not-allowed opacity-60"
          >
            <span className="material-symbols-outlined text-sm">lock</span>
            Turneu Nou (Inactiv)
          </button>
        )}

        {role === "referee" && (
          <Link
            href="/dashboard/referee?tab=live"
            onClick={() => setMobileOpen(false)}
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 py-2.5 px-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-xs font-label uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">scoreboard</span>
            Foaie Meci Live
          </Link>
        )}

        {session?.user && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* User Profile Card */}
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3 hover:border-lime-400/60 transition group"
            >
              <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-sm font-black shadow-md shrink-0 group-hover:scale-105 transition-transform">
                {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : "U")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-headline font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                  {session.user.name || "Utilizator"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                  {session.user.email}
                </p>
              </div>
            </Link>

            {/* Prominent Dedicated Logout Button */}
            <button
              type="button"
              onClick={() => appSignOut("/")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 text-xs font-headline font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 border border-slate-200/60 dark:border-slate-700/60 hover:border-red-500"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <aside
        className={`hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40 border-r flex-col py-6 transition-colors duration-200 ${isDarkTheme
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
            className={`relative w-4/5 max-w-xs h-full py-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r ${isDarkTheme
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
