"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Eroare la înregistrare.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      setError("Cont creat, dar autentificarea a eșuat. Încearcă manual.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-surface">
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
              Creează Contul <br /> Tău Pro.
            </h2>
            <p className="text-slate-300 font-label text-xs sm:text-sm leading-relaxed">
              Organizează campionate, gestionează meciuri live, clasamente și baze de date sportive.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <div className="flex items-center gap-3.5 p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-slate-950">
                <span className="material-symbols-outlined text-lg">verified</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-label uppercase font-bold tracking-widest">
                  Acces Gratuit
                </p>
                <p className="text-white text-xs font-bold font-headline">
                  Toate modulele depline
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
                  Înregistrare Ligue
                </h3>
                <p className="text-on-surface-variant text-xs mt-1 font-label">
                  Completează datele pentru a începe
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-label uppercase font-bold">AI CONT?</p>
                <Link
                  className="text-xs font-bold text-secondary-container dark:text-lime-400 text-slate-900 hover:underline"
                  href="/signin"
                >
                  Conectare ↗
                </Link>
              </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Rol Principal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-2 rounded-xl transition-all text-center flex flex-col items-center justify-center gap-1 border ${
                          isSelected
                            ? "bg-secondary-container text-slate-950 border-secondary-container shadow-sm font-bold scale-95"
                            : "bg-surface-container-low text-slate-600 dark:text-slate-400 border-transparent hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                        <span className="block text-[10px] font-label font-bold truncate w-full">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Nume Complet
                </label>
                <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-800">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="Alex Popescu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

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
                    placeholder="alex@organizator.ro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Parolă (min. 8 caractere)
                </label>
                <div className="flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-slate-200/60 dark:border-slate-800">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="bg-transparent border-none p-0 w-full text-xs font-body focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 text-white py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Se creează contul..." : "Finalizează Înregistrarea"}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
