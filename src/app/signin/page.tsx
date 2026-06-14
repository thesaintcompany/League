"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

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

  return (
    <>
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">Intră în contul tău LeagueHub.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">Parolă</label>
              <input id="password" type="password" required className="input"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Se conectează..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Nu ai cont? <Link href="/signup" className="font-medium text-brand-600 hover:underline">Creează unul</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="mx-auto max-w-md px-4 py-16">
          <div className="card p-8 text-center text-slate-600">Se încarcă…</div>
        </main>
      }>
        <SignInForm />
      </Suspense>
    </>
  );
}
