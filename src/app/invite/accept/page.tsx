"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

function InfoIcon({ glyph }: { glyph: string }) {
  return <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">{glyph}</span>;
}

export default function InviteAcceptPage() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Link-ul invitației este invalid.");
      return;
    }
    // We don't fetch the invite server-side here; we just send the token on submit.
    // A lightweight fetch gives a better UX:
    fetch(`/api/invite/accept?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setTeamName(d.teamName || "echipa");
          setSport(d.sport || "campionat");
        }
      })
      .catch(() => {});
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Eroare la trimitere.");
      setLoading(false);
      return;
    }
    // Redirect to the offer page with the offer token
    router.push(`/invite/accept?offer=${data.offerToken}`);
  }

  // If user arrived with a valid offer token, show the offer instead.
  const offer = search.get("offer");

  if (offer) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <section className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 z-10 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-3xl text-emerald-500">mail</span>
          </div>
          <h2 className="text-xl font-headline font-bold mb-3">Confirmare inițiată!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-label mb-5">
            Ai fost înscris în programul <span className="font-bold">{sport}</span>. Un mesaj de confirmare a fost trimis pe email-ul tău.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Între timp, poți accepta oferta de a-ți crea contul în 48 de ore. Va trebui să scrii doar o parolă.
          </p>
          <button
            onClick={() => router.push(`/signup?invite=${offer}`)}
            className="w-full bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-bold text-xs uppercase py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>Acceptă Oferta și Creează Contul</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <section className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 z-10 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <BrandLogo size="md" />
          </div>
          <h2 className="text-2xl font-headline font-bold">Confirmă Invitația</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-label">
            ai fost invitat să te alături echipei <span className="font-bold">{teamName || " "}</span> ({sport || ""}).
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Numele tău complet
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
              <InfoIcon glyph="person" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Maria Ionescu"
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400 font-body"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Adresă Email
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
              <InfoIcon glyph="mail" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400 font-body"
              />
            </div>
          </div>

          <div className="pt-2 text-left text-[10px] text-slate-500 dark:text-slate-400 font-label">
            <label className="flex items-center gap-2">
              <input type="checkbox" required className="rounded border-slate-300 text-lime-600 focus:ring-lime-500" />
              Confirm participarea și sunt de acord cu prelucrarea datelor personale.
            </label>
          </div>

          {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-bold text-xs uppercase py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Se trimite...</span> : <><span>Confirmă și continuă</span><span className="material-symbols-outlined text-sm">arrow_forward</span></>}
          </button>
        </form>
      </section>
    </main>
  );
}
