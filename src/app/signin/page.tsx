"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("organizer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ROLES = [
    { id: "organizer", label: "Organizator", icon: "dashboard_customize" },
    { id: "team", label: "Lider Echipă", icon: "groups" },
    { id: "referee", label: "Arbitru", icon: "sports" },
    { id: "player", label: "Jucător", icon: "directions_run" },
    { id: "observer", label: "Observator", icon: "visibility" },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email sau parolă incorectă.");
      return;
    }
    router.push(callbackUrl);
  }

  function fillDemoAdmin() {
    setEmail("admin@leaguehub.local");
    setPassword("Admin12345");
    setSelectedRole("organizer");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-surface">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-secondary-container opacity-20 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-primary-container opacity-10 blur-3xl rounded-full pointer-events-none"></div>

      <section className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_40px_rgba(24,28,30,0.08)] flex flex-col md:flex-row overflow-hidden z-10 border border-slate-200/60 dark:border-slate-800">
        {/* Left Branding Visual */}
        <div className="w-full md:w-5/12 bg-primary p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2.5 mb-8 group">
              <span className="text-secondary-fixed text-3xl material-symbols-outlined">
                sports_soccer
              </span>
              <span className="text-2xl font-black italic tracking-tighter font-headline">
                Ligue
              </span>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-headline font-extrabold leading-tight mb-4 text-white">
              Unlock Your <br /> Performance <br /> Potential.
            </h2>
            <p className="text-slate-300 font-label text-xs sm:text-sm leading-relaxed">
              Platforma oficială pentru organizatori profesioniști de competiții, arbitri și echipe.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <div className="flex items-center gap-3.5 p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-slate-950">
                <span className="material-symbols-outlined text-lg">insights</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-label uppercase font-bold tracking-widest">
                  Telemetrie Live
                </p>
                <p className="text-white text-xs font-bold font-headline">
                  Campionate & Meciuri Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-8 lg:p-10 bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <header className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-headline font-bold text-primary dark:text-white">
                  Autentificare Ligue
                </h3>
                <p className="text-on-surface-variant text-xs mt-1 font-label">
                  Alege rolul și introdu datele de acces
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-label uppercase font-bold">CONT NOU?</p>
                <Link
                  className="text-xs font-bold text-secondary-container dark:text-lime-400 text-slate-900 hover:underline"
                  href="/signup"
                >
                  Înregistrare ↗
                </Link>
              </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Role Selection Bento Grid */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Rol Utilizator
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-2.5 rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 border ${
                          isSelected
                            ? "bg-secondary-container text-slate-950 border-secondary-container shadow-sm font-bold scale-95"
                            : "bg-surface-container-low text-slate-600 dark:text-slate-400 border-transparent hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                        <span className="block text-[10px] font-label font-bold truncate w-full">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Adresă Email
                  </label>
                  <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-800">
                    <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
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

                <div>
                  <label className="block text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Parolă
                  </label>
                  <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-800">
                    <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
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
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 text-white py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Se conectează..." : "Intră în Panou"}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-xs font-label font-bold text-lime-700 dark:text-lime-400 hover:underline bg-lime-50 dark:bg-lime-950/40 py-2 px-4 rounded-xl border border-lime-200 dark:border-lime-800 inline-flex items-center gap-1.5"
            >
              ⚡ Completează Cont Demo (Admin)
            </button>
            <p className="text-[10px] text-slate-400 font-label">
              Acces rapid la campionate și panou de arbitraj
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-xs font-label">
          Se încarcă...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
