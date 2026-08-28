"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { getCurrentSeasonYear } from "@/lib/season";
import { appSignOut } from "@/lib/logout";

function WelcomePortalForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("organizer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"championships" | "auth">("championships");

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

    // Direct redirection based on role
    if (selectedRole === "super_admin" || cleanEmail === "admin@leaguehub.local" || cleanEmail === "superadmin@leaguehub.local") {
      router.push("/dashboard/admin");
    } else if (selectedRole === "referee") {
      router.push("/dashboard/referee");
    } else if (selectedRole === "arena_owner") {
      router.push("/dashboard/arena");
    } else if (selectedRole === "team_leader") {
      router.push("/dashboard/team");
    } else if (selectedRole === "player") {
      router.push("/profile");
    } else {
      router.push(callbackUrl || "/dashboard");
    }
  }


  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-lime-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>


      <section className="w-full max-w-6xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden z-10 border border-slate-200 dark:border-slate-800/80">
        {/* Left Side: Teaser with Dynamic Goal Shot (Card 1 on Mobile) */}
        <div
          className={`w-full lg:w-7/12 relative min-h-[460px] lg:min-h-[680px] p-6 sm:p-12 flex-col justify-between overflow-hidden text-white group bg-slate-950 ${mobileView === "championships" ? "flex" : "hidden lg:flex"
            }`}
        >
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
              SEZON {getCurrentSeasonYear()}
            </span>
          </div>

          {/* Center Pitch Title */}
          <div className="relative z-10 my-auto py-6 sm:py-8 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-label border border-white/15">
              <span><span className="material-symbols-outlined align-middle text-sm">bolt</span></span> Turnee, Campionate &amp; 33 Arene Omologate
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

          {/* Bottom Call to Public Page & Mobile Login Action */}
          <div className="relative z-10 space-y-2.5">
            {/* Card cu Campionate (ACCES PUBLIC LIBER) */}
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
                <span>Campionate</span>
                <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Sleek, Thin Mobile Login Button placed UNDER the Championships card */}
            <button
              type="button"
              onClick={() => setMobileView("auth")}
              className="w-full lg:hidden py-2.5 px-4 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-lime-400 font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Mergi la Autentificare</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            {/* Quick public navigation links (1 line, 1 word each) */}
            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-label font-bold text-slate-300 pt-1 text-center">
              <Link href="https://spligue.ro/harta-romaniei" className="hover:text-lime-400 transition bg-white/5 hover:bg-white/10 py-1.5 px-1 rounded-lg truncate">
                <span className="material-symbols-outlined text-base">map</span> Hartă
              </Link>
              <Link href="/venues" className="hover:text-lime-400 transition bg-white/5 hover:bg-white/10 py-1.5 px-1 rounded-lg truncate">
                <span className="material-symbols-outlined text-base">stadium</span> Arene
              </Link>
              <Link href="/players" className="hover:text-lime-400 transition bg-white/5 hover:bg-white/10 py-1.5 px-1 rounded-lg truncate">
                <span className="material-symbols-outlined text-base">leaderboard</span> Golgheteri
              </Link>
              <Link href="/referees" className="hover:text-lime-400 transition bg-white/5 hover:bg-white/10 py-1.5 px-1 rounded-lg truncate">
                <span className="material-symbols-outlined text-base">gavel</span> Arbitri
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel (Card 2 on Mobile) */}
        <div
          className={`w-full lg:w-5/12 p-6 sm:p-12 bg-white dark:bg-slate-900 flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 relative overflow-hidden ${mobileView === "auth" ? "flex" : "hidden lg:flex"
            }`}
        >
          {/* Subtle Dynamic Football Action Watermark Background (<10% Contrast Shadow) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.06] dark:opacity-[0.08] z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/legend-player-shadow-bw.jpg"
              alt="Dynamic Football Shadow Background"
              className="w-full h-full object-cover object-center filter grayscale contrast-[0.08] brightness-110 dark:brightness-90 scale-110"
            />
          </div>

          <div className="relative z-10">
            {/* Mobile Header Navigation Back Button */}
            <div className="lg:hidden mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileView("championships")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-label hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Înapoi la Campionate</span>
              </button>
              <span className="text-[10px] font-mono text-lime-600 dark:text-lime-400 font-bold uppercase">
                Pasul 2 / 2
              </span>
            </div>

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

            {/* If user is already logged in, show active session banner */}
            {session?.user && (
              <div className="mb-6 p-4 rounded-2xl bg-lime-400/15 border-2 border-lime-400 text-slate-900 dark:text-white space-y-3 shadow-md animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 font-black flex items-center justify-center text-sm shadow shrink-0">
                    {session.user.name ? session.user.name[0].toUpperCase() : (session.user.email ? session.user.email[0].toUpperCase() : "U")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase font-label text-lime-700 dark:text-lime-400 tracking-wider">
                      CONECTAT ACTIV
                    </span>
                    <p className="text-xs font-bold font-headline truncate leading-tight">
                      {session.user.name || "Utilizator"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/dashboard"
                    className="py-2.5 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-center"
                  >
                    <span className="material-symbols-outlined text-sm">dashboard</span>
                    <span>Mergi la Panou</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => appSignOut("/")}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-200 dark:border-slate-700 text-center"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}


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
                {loading ? "Se verifică contul..." : "Intră în Panou "}
              </button>
            </form>
          </div>

          <footer className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-1 relative z-10">
            <p className="text-[11px] font-label text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} <a href="https://   ligue.ro" target="_blank" rel="noreferrer" className="font-bold text-slate-900 dark:text-lime-400 hover:underline">   ligue.ro</a>. Toate drepturile aparțin <strong>   ligue.ro</strong>.
            </p>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Contact  : <a href="mailto:contact@ ligue.ro" className="text-lime-600 dark:text-lime-400 hover:underline font-bold">contact@ ligue.ro</a>
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
