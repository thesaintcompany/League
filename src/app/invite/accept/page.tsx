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
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [sport, setSport] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Link-ul invitației este invalid.");
      return;
    }
    fetch(`/api/invite/accept?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setTeamName(d.teamName || "echipa");
          setTeamLogo(d.teamLogo || null);
          setSport(d.sport || "fotbal");
          if (d.name) setName(d.name);
          if (d.email) setEmail(d.email);
          if (d.player) setPlayerData(d.player);
        } else {
          setError(d.error || "Invitația nu a putut fi găsită.");
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
    // Redirect to the direct signup page with the offer token and email
    if (data.directSignupLink) {
      router.push(data.directSignupLink);
    } else {
      router.push(`/signup?inviteToken=${data.offerToken}&email=${encodeURIComponent(email)}`);
    }
  }

  // If user arrived with a valid offer token, show the offer confirmation instead.
  const offer = search.get("offer");

  if (offer) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-body">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <section className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 z-10 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 text-emerald-500">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-xl font-headline font-bold mb-2 text-slate-900 dark:text-white">
            Invitație Confirmată!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-label mb-5">
            Profilul tău pentru echipa <strong className="text-lime-500">{teamName || "echipă"}</strong> este gata configurat. Creează-ți contul acum setând doar o parolă.
          </p>
          <button
            onClick={() => router.push(`/signup?inviteToken=${offer}&email=${encodeURIComponent(email)}`)}
            className="w-full bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-black text-xs uppercase py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <span>Finalizează Crearea Contului</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>
      </main>
    );
  }

  const initials = (playerData?.name || name || "J")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase() || "J";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-body">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <section className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 z-10 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="text-center space-y-2">
          <div className="mb-2 flex justify-center">
            <BrandLogo size="md" />
          </div>
          <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Invitație în Echipă
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-label">
            Ai fost invitat să te alături echipei{" "}
            <strong className="text-slate-900 dark:text-white">{teamName || "Echipă"}</strong> ({sport.toUpperCase()}).
          </p>
        </div>

        {/* Pre-configured Player Profile Highlight Card */}
        {playerData && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-lime-400/40 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-lime-400 overflow-hidden flex items-center justify-center text-white font-black text-base shadow">
                {playerData.image ? (
                  <img src={playerData.image} alt={playerData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lime-400">{initials}</span>
                )}
              </div>
              {playerData.number && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-lime-400 text-slate-950 font-mono font-black text-[9px] shadow">
                  #{playerData.number}
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-mono text-lime-600 dark:text-lime-400 font-bold uppercase block">
                Profil Presetat de Liderul Echipei
              </span>
              <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white truncate">
                {playerData.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                Poziție: <strong className="text-slate-700 dark:text-slate-300">{playerData.position || "Jucător"}</strong>
                {playerData.preferredFoot ? ` • Picior: ${playerData.preferredFoot}` : ""}
              </p>
            </div>
          </div>
        )}

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
                placeholder="ex. Andrei Popescu"
                className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-body"
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
                className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white placeholder:text-slate-400 font-body"
              />
            </div>
          </div>

          <div className="pt-1 text-left text-[11px] text-slate-500 dark:text-slate-400 font-label">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                defaultChecked
                className="mt-0.5 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
              />
              <span>
                Confirm asocierea cu echipa și sunt de acord cu termenii platformei.
              </span>
            </label>
          </div>

          {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <span>Se procesează...</span>
            ) : (
              <>
                <span>Continuă &amp; Activează Contul</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
