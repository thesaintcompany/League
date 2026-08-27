"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { getCurrentSeasonYear } from "@/lib/season";

const ROLES = [
  {
    id: "organizer",
    label: "Organizator",
    title: "Organizator Campionat",
    desc: "Creează turnee, gestionează ligi, meciuri și clasamente în timp real.",
    icon: "emoji_events",
  },
  {
    id: "team_leader",
    label: "Lider Echipă",
    title: "Căpitan / Delegat Echipă",
    desc: "Înscrie echipa în campionate, convoacă lotul și administrează jucătorii.",
    icon: "groups",
  },
  {
    id: "player",
    label: "Jucător",
    title: "Profil Jucător",
    desc: "Urmărește statisticile tale, golurile, meciurile programate și cartonașele.",
    icon: "sports_soccer",
  },
  {
    id: "referee",
    label: "Arbitru",
    title: "Arbitru Oficial",
    desc: "Completează rapoarte de joc live, validează scorul și sancțiunile disciplinare.",
    icon: "sports",
  },
  {
    id: "arena_owner",
    label: "Proprietar Arenă",
    title: "Administrator Bază Sportivă",
    desc: "Omologhează terenurile, publică orarul de închiriere și găzduiește meciuri.",
    icon: "stadium",
  },
];

function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const inviteToken = search.get("invite") || search.get("offer") || undefined;
  const roleParam = search.get("role") || undefined;
  const isInvite = Boolean(inviteToken);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(() => {
    if (roleParam && ROLES.some((r) => r.id === roleParam)) {
      return roleParam;
    }
    return "player";
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileView, setMobileView] = useState<"roles" | "form">(() =>
    isInvite ? "form" : "roles"
  );

  useEffect(() => {
    if (roleParam && ROLES.some((r) => r.id === roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[2];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: selectedRole,
        inviteToken,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Eroare la înregistrare.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password: password.trim(),
      redirect: false,
    });
    setLoading(false);
    if (signInRes?.error) {
      setError("Cont creat, dar autentificarea automată a eșuat. Te rugăm să te conectezi manual.");
      return;
    }

    if (selectedRole === "organizer") {
      router.push("/dashboard");
    } else if (selectedRole === "team_leader") {
      router.push("/dashboard/team");
    } else if (selectedRole === "referee") {
      router.push("/dashboard/referee");
    } else if (selectedRole === "arena_owner") {
      router.push("/dashboard/arena");
    } else {
      router.push("/profile");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-lime-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      <section className="w-full max-w-6xl bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden z-10 border border-slate-200 dark:border-slate-800/80">
        
        {/* Panel 1 (Left / Mobile Step 1): Choose Account Type & Benefits */}
        <div
          className={`w-full lg:w-7/12 relative min-h-[500px] lg:min-h-[700px] p-6 sm:p-10 lg:p-12 flex-col justify-between overflow-hidden text-white bg-slate-950 ${
            mobileView === "roles" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Subtle Background Action Image & Overlay */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-goal.jpg"
            alt="Dynamic Soccer Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent"></div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <BrandLogo size="lg" href="/" />

            <span className="px-3.5 py-1 rounded-full bg-slate-900/90 text-lime-400 font-black text-[10px] uppercase font-label border border-lime-400/40 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              SEZON {getCurrentSeasonYear()}
            </span>
          </div>

          {/* Middle: Title & Role Selection Cards */}
          <div className="relative z-10 my-4 sm:my-6 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-[11px] font-label border border-white/15 mb-2">
                <span className="material-symbols-outlined text-sm text-lime-400">person_add</span>
                <span>Pasul 1: Alege tipul contului tău</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black italic font-headline uppercase leading-tight text-white drop-shadow-xl">
                Creează Contul <br className="hidden sm:inline" />
                <span className="text-lime-400">Tău Pro.</span>
              </h1>
              <p className="text-slate-300 text-xs leading-relaxed font-body mt-1 max-w-md">
                Selectează rolul principal pentru a-ți personaliza experiența în platformă.
              </p>
            </div>

            {/* Interactive Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 relative overflow-hidden group ${
                      isSelected
                        ? "bg-slate-900/90 border-lime-400 text-white shadow-xl shadow-lime-400/10 ring-2 ring-lime-400/50"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? "bg-lime-400 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{r.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold font-headline text-white truncate">
                          {r.title}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-lime-400 text-base shrink-0">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-body leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action on Mobile & Highlights */}
          <div className="relative z-10 space-y-3 pt-2">
            {/* Quick highlight bar */}
            <div className="hidden sm:flex items-center justify-between gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-[11px] text-slate-300 font-label">
              <span className="flex items-center gap-1.5 text-lime-400 font-bold">
                <span className="material-symbols-outlined text-sm">verified</span>
                Acces Gratuit Inclus
              </span>
              <span className="text-slate-500">•</span>
              <span>Meciuri &amp; Clasamente Live</span>
              <span className="text-slate-500">•</span>
              <span>Notificări Digitale</span>
            </div>

            {/* Mobile Button: Step 1 -> Step 2 Carousel transition */}
            <button
              type="button"
              onClick={() => setMobileView("form")}
              className="w-full lg:hidden py-3.5 px-5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-lime-500/20 transition active:scale-95"
            >
              <span>Continuă ca {currentRole.label}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            {/* Mobile link to SignIn */}
            <div className="lg:hidden text-center pt-1">
              <span className="text-[11px] text-slate-400 font-label">
                Ai deja un cont?{" "}
                <Link href="/signin" className="text-lime-400 font-bold hover:underline">
                  Conectează-te ↗
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2 (Right / Mobile Step 2): Registration Form & Disabled Google Auth */}
        <div
          className={`w-full lg:w-5/12 p-6 sm:p-10 lg:p-12 bg-white dark:bg-slate-900 flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 relative overflow-hidden ${
            mobileView === "form" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Subtle Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.04] dark:opacity-[0.06] z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/legend-player-shadow-bw.jpg"
              alt="Dynamic Football Watermark"
              className="w-full h-full object-cover object-center filter grayscale"
            />
          </div>

          <div className="relative z-10">
            {/* Mobile Back Button (Step 2 -> Step 1) */}
            <div className="lg:hidden mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileView("roles")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-label hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Schimbă Rolul</span>
              </button>
              <span className="text-[10px] font-mono text-lime-600 dark:text-lime-400 font-bold uppercase">
                Pasul 2 / 2
              </span>
            </div>

            {/* Header */}
            <header className="mb-5 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-headline font-black uppercase text-slate-900 dark:text-white tracking-tight">
                  Date Înregistrare
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-label">
                  Completează datele pentru a finaliza contul
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 font-label uppercase font-bold block">
                  AI CONT?
                </span>
                <Link
                  className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                  href="/signin"
                >
                  Conectare ↗
                </Link>
              </div>
            </header>

            {/* Active Selected Role Banner */}
            <div className="mb-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-base">{currentRole.icon}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider font-label text-slate-500 dark:text-slate-400 block">
                    Rol Selectat
                  </span>
                  <span className="text-xs font-bold font-headline text-slate-900 dark:text-white">
                    {currentRole.title}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileView("roles")}
                className="lg:hidden text-[10px] font-bold text-lime-600 dark:text-lime-400 underline font-label"
              >
                Schimbă
              </button>
            </div>

            {isInvite && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-base">
                  mail
                </span>
                <p className="text-xs font-label text-emerald-800 dark:text-emerald-300">
                  Invitație detectată — contul tău este asociat echipei tale.
                </p>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={onSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Nume Complet */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Nume Complet
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus-within:border-lime-500 dark:focus-within:border-lime-400 transition">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Alexandru Popescu"
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Adresă Email
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus-within:border-lime-500 dark:focus-within:border-lime-400 transition">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nume@exemplu.ro"
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Parolă
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus-within:border-lime-500 dark:focus-within:border-lime-400 transition">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 font-headline font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Se creează contul...</span>
                ) : (
                  <>
                    <span>Creează Contul Pro</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-label">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                  sau opțiuni alternative
                </span>
              </div>
            </div>

            {/* Inactive Gray Google Login Button */}
            <div className="relative group">
              <button
                type="button"
                disabled
                title="Autentificarea cu Google va fi activată în curând"
                className="w-full py-3 px-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 font-headline font-bold text-xs flex items-center justify-between cursor-not-allowed opacity-75 select-none transition"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 opacity-50 grayscale" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Conectare cu Google</span>
                </div>

                <span className="text-[9px] font-label font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  În curând
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-1 relative z-10">
            <p className="text-[11px] font-label text-slate-500 dark:text-slate-400">
              Ai deja un cont înregistrat?{" "}
              <Link href="/signin" className="font-bold text-lime-600 dark:text-lime-400 hover:underline">
                Conectează-te aici ↗
              </Link>
            </p>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} buu.ro • Toate drepturile rezervate
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-lime-400 text-xs font-bold font-label">
          Se încarcă pagina de înregistrare...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
