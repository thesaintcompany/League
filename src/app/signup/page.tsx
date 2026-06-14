"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

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
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-slate-900">Creează cont</h1>
          <p className="mt-1 text-sm text-slate-600">Începe să organizezi campionate în câteva secunde.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label" htmlFor="name">Nume</label>
              <input id="name" type="text" required minLength={2} className="input"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">Parolă (min 8 caractere)</label>
              <input id="password" type="password" required minLength={8} className="input"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Se creează contul..." : "Creează cont"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Ai deja cont? <Link href="/signin" className="font-medium text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
