"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";

function WelcomePortalForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("organizer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const DEMO_ACCOUNTS = [
    {
      id: "organizer",
      role: "Organizator Pro",
      email: "demo@leaguehub.local",
      pass: "demo12345",
      badge: "Turnee & Meciuri",
      icon: "emoji_events",
      color: "border-lime-400 bg-lime-500/10 text-lime-400",
    },
    {
      id: "referee",
      role: "Arbitru Oficial",
      email: "arbitru@leaguehub.local",
      pass: "demo12345",
      badge: "Raport Meci",
      icon: "sports",
      color: "border-cyan-400 bg-cyan-500/10 text-cyan-400",
    },
    {
      id: "player",
      role: "Fotbalist Pro",
      email: "jucator@leaguehub.local",
      pass: "demo12345",
      badge: "Profil 9:16",
      icon: "directions_run",
      color: "border-amber-400 bg-amber-500/10 text-amber-400",
    },
    {
      id: "arena_owner",
      role: "Proprietar Arenă",
      email: "arena@leaguehub.local",
      pass: "demo12345",
      badge: "59 Arene RO",
      icon: "stadium",
      color: "border-purple-400 bg-purple-500/10 text-purple-400",
    },
    {
      id: "team_leader",
      role: "Manager Echipă",
      email: "lider@leaguehub.local",
      pass: "demo12345",
      badge: "Staff & Invitații",
      icon: "badge",
      color: "border-emerald-400 bg-emerald-500/10 text-emerald-400",
    },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const res = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPass,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email sau parolă incorectă.");
      return;
    }

    // Direct redirection based on user
    if (cleanEmail === "admin@leaguehub.local" || cleanEmail === "superadmin@leaguehub.local") {
      router.push("/dashboard/admin");
    } else if (cleanEmail === "arbitru@leaguehub.local" || selectedRole === "referee") {
      router.push("/dashboard/referee");
    } else if (cleanEmail === "arena@leaguehub.local" || selectedRole === "arena_owner") {
      router.push("/dashboard/arena");
    } else if (cleanEmail === "lider@leaguehub.local" || selectedRole === "team_leader") {
      router.push("/dashboard/team");
    } else if (cleanEmail === "jucator@leaguehub.local" || selectedRole === "player") {
      router.push("/profile");
    } else {
      router.push(callbackUrl || "/dashboard");
    }
  }

  function pickAccount(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedRole(acc.id);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-lime-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Floating Global Day/Night Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle variant="pill" />
      </div>

      <section className="w-full max-w-6xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden z-10 border border-slate-200 dark:border-slate-800/80">
        {/* Left Side: Teaser with Dynamic Goal Shot */}
        <div className="w-full lg:w-7/12 relative min-h-[460px] lg:min-h-[680px] p-8 sm:p-12 flex flex-col justify-between overflow-hidden text-white group bg-slate-950">
          {/* Dynamic Background Goal Action Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-goal.jpg"
            alt="Dynamic Soccer Goal in the Net"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-110"
          />
          {/* Cinematic Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent"></div>

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <BrandLogo size="lg" href="/" />

            <span className="px-3.5 py-1 rounded-full bg-slate-900/90 text-lime-400 font-black text-[10px] uppercase font-label border border-lime-400/40 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              SEZON 2026 LIVE
            </span>
          </div>

          {/* Center Pitch Title */}
          <div className="relative z-10 my-auto py-8 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-label border border-white/15">
              <span>⚡</span> Turnee, Campionate &amp; 33 Arene Omologate
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black italic font-headline uppercase leading-none tracking-tight text-white drop-shadow-xl">
              Campionatul <br />
              <span className="text-lime-400">Tău Începe Aici.</span>
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-body drop-shadow-md max-w-md">
              Platforma unificată pentru fotbal amator și semi-pro din România. Generare automată
              de grupe, meciuri eliminatorii, bilete online și statistici în timp real.
            </p>
          </div>

          {/* Bottom Call to Public Page */}
          <div className="relative z-10 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xl">
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-300">
                  ACCES PUBLIC LIBER
                </p>
                <p className="text-sm font-headline font-bold text-white">
                  Vezi Meciurile, Clasamentul &amp; Brackets
                </p>
              </div>

              <Link
                href="/harta-romaniei"
                className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-xl shadow-lime-500/20 flex items-center justify-center gap-2 transition active:scale-95 group/btn"
              >
                <span>Vezi Campionate (Harta RO)</span>
                <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Quick public navigation links */}
            <div className="flex flex-wrap gap-2 text-[11px] font-label font-bold text-slate-300 pt-2">
              <Link href="/brackets" className="hover:text-lime-400 transition bg-white/5 px-2.5 py-1 rounded-lg">
                🗺️ Harta Campionatului
              </Link>
              <Link href="/venues" className="hover:text-lime-400 transition bg-white/5 px-2.5 py-1 rounded-lg">
                🏟️ 59 Arene RO
              </Link>
              <Link href="/players" className="hover:text-lime-400 transition bg-white/5 px-2.5 py-1 rounded-lg">
                🥇 Top Golgheteri
              </Link>
              <Link href="/referees" className="hover:text-lime-400 transition bg-white/5 px-2.5 py-1 rounded-lg">
                ⚖️ Corp Arbitri (30)
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="w-full lg:w-5/12 p-8 sm:p-12 bg-white dark:bg-slate-900 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
          <div>
            <header className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl sm:text-3xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight">
                  Autentificare
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-label">
                  Intră în cont sau alege un profil demonstrativ
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-label uppercase font-bold block">
                  CONT NOU?
                </span>
                <Link
                  className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                  href="/signup"
                >
                  Înregistrare ↗
                </Link>
              </div>
            </header>

            {/* Fast 1-Click Demo Accounts Selector */}
            <div className="mb-6 space-y-2">
              <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                Alege Rapid Cont Demo (1-Click Login):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => pickAccount(acc)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-lime-500 bg-lime-500/10 text-slate-950 dark:text-white shadow-md ring-1 ring-lime-400"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-1">
                        <span className="material-symbols-outlined text-[18px] text-lime-600 dark:text-lime-400">
                          {acc.icon}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-label">
                          {acc.badge}
                        </span>
                      </div>
                      <span className="font-headline font-bold text-xs block leading-tight">
                        {acc.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Adresă Email
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus-within:border-lime-500 dark:focus-within:border-lime-400 transition">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-3">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="admin@leaguehub.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Parolă
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-800 focus-within:border-lime-500 dark:focus-within:border-lime-400 transition">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-3">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 font-headline font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                {loading ? "Se verifică contul..." : "Intră în Panou ✓"}
              </button>
            </form>
          </div>

          <footer className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-1">
            <p className="text-[11px] font-label text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} <a href="https://buu.ro" target="_blank" rel="noreferrer" className="font-bold text-slate-900 dark:text-lime-400 hover:underline">buu.ro</a>. Toate drepturile aparțin <strong>buu.ro</strong>.
            </p>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Contact oficial: <a href="mailto:contact@buu.ro" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">contact@buu.ro</a>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function RootIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-lime-400 text-xs font-bold font-label">
          Se încarcă portalul Ligue...
        </div>
      }
    >
      <WelcomePortalForm />
    </Suspense>
  );
}
