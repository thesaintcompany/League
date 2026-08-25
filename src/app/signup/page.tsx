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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md">
            ⚡
          </div>
          <span className="text-2xl font-black italic tracking-tight text-blue-950 dark:text-white uppercase font-headline">
            Kinetic Hub
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold font-headline text-blue-950 dark:text-white">
          Creează Cont Organizator
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-label">
          Începe să organizezi ligi și campionate în câteva secunde
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="name">
                Nume Complet *
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                className="input"
                placeholder="ex: Alex Popescu"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Adresă Email *
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="alex@organizator.ro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Parolă (min. 8 caractere) *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-xs uppercase tracking-wider font-bold bg-primary text-white hover:bg-slate-800 shadow-md"
            >
              {loading ? "Se creează contul..." : "Creează Cont Gratuit 🚀"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Ai deja un cont?{" "}
            <Link
              href="/signin"
              className="font-bold text-blue-950 dark:text-lime-400 hover:underline"
            >
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
