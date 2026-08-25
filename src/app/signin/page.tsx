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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          Autentificare Organizator
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-label">
          Accesează panoul de control al competițiilor tale
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Adresă Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="admin@leaguehub.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0" htmlFor="password">
                  Parolă
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
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
              {loading ? "Se conectează..." : "Intră în Cont 🚀"}
            </button>
          </form>

          {/* Quick Demo Login Pill */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-xs font-label font-bold text-lime-700 dark:text-lime-400 hover:underline bg-lime-50 dark:bg-lime-950/40 py-2 px-4 rounded-xl border border-lime-200 dark:border-lime-800"
            >
              ⚡ Completează Cont Demo (Admin)
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Nu ai încă un cont?{" "}
            <Link
              href="/signup"
              className="font-bold text-blue-950 dark:text-lime-400 hover:underline"
            >
              Înregistrează-te gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
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
