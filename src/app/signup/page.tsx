"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

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
    { id: "team_leader", label: "Lider Echipă", icon: "groups" },
    { id: "referee", label: "Arbitru", icon: "sports" },
    { id: "player", label: "Jucător", icon: "directions_run" },
    { id: "arena_owner", label: "Proprietar Arenă", icon: "stadium" },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: selectedRole }),
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
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <section className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_40px_rgba(24,28,30,0.08)] flex flex-col md:flex-row overflow-hidden z-10 border border-slate-200 dark:border-slate-800">
        {/* Left Branding Visual */}
        <div className="w-full md:w-5/12 bg-slate-950 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <div className="mb-8">
              <BrandLogo size="lg" href="/" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-headline font-extrabold leading-tight mb-4 text-white">
              Creează Contul <br /> Tău Pro.
            </h2>
            <p className="text-slate-300 font-label text-xs sm:text-sm leading-relaxed">
              Organizează campionate, gestionează meciuri live, clasamente și baze de date sportive.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <div className="flex items-center gap-3.5 p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="w-9 h-9 rounded-full bg-lime-400 flex items-center justify-center text-slate-950 font-bold">
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
        <div className="w-full md:w-7/12 p-8 lg:p-10 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <header className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-headline font-bold text-slate-900 dark:text-white">
                  Înregistrare Ligue
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-label">
                  Completează datele pentru a începe
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-label uppercase font-bold">AI CONT?</p>
                <Link
                  className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline"
                  href="/signin"
                >
                  Conectare ↗
                </Link>
              </div>
            </header>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Rol Principal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[
                    { id: "organizer", label: "Organizator", icon: "emoji_events" },
                    { id: "team_leader", label: "Lider Echipă", icon: "groups" },
                    { id: "player", label: "Jucător", icon: "sports_soccer" },
                    { id: "referee", label: "Arbitru", icon: "sports" },
                    { id: "arena_owner", label: "Proprietar Arenă", icon: "stadium" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        selectedRole === r.id
                          ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 border-transparent shadow-md font-bold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{r.icon}</span>
                      <span className="text-[10px] font-bold font-label">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Nume Complet
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Alexandru Popescu"
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-body"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresă Email
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nume@exemplu.ro"
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-body"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Parolă
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-body"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-semibold font-body">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 font-headline font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Se creează contul...</span>
                ) : (
                  <>
                    <span>Creează Contul</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
