"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InviteCardPage() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [cardNumber, setCardNumber] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) setError("Token lipsă.");
  }, [token]);

  useEffect(() => {
    if (!photoFile) { setPreview(null); return; }
    const r = new FileReader();
    r.onload = (e) => setPreview((e.target?.result as string) || null);
    r.readAsDataURL(photoFile);
  }, [photoFile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !cardNumber) return;
    setError(null);
    setLoading(true);
    let photoBase64 = "";
    try {
      if (photoFile) {
        photoBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve((r.target?.result as string) || "");
          r.onerror = reject;
          r.readAsDataURL(photoFile);
        });
      }
    } catch {
      setError("Eroare la citirea pozei.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/invite/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, cardNumber, playerPhotoBase64: photoBase64 }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Eroare la salvare.");
      setLoading(false);
      return;
    }
    setSaved(true);
    setLoading(false);
  }

  if (saved) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3">check_circle</span>
          <h2 className="text-xl font-headline font-bold mb-2">Card salvat!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cardul de membru și poza au fost asociate contului tău. Poți acum accesa platforma.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-5 px-5 py-2 bg-lime-400 text-slate-950 font-bold rounded-xl"
          >
            Accesează Panoul
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-lime-400/10 blur-3xl rounded-full pointer-events-none"></div>
      <section className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 z-10 border border-slate-200 dark:border-slate-800">
        <header className="text-center mb-6">
          <span className="material-symbols-outlined text-3xl text-lime-500 mb-2">credit_card</span>
          <h2 className="text-xl font-headline font-bold">Card de Membru &amp; Poza de Profil</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Introduce numărul cardului și încarcă poza ta.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Număr Card Membru
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-400 text-lg mr-2.5">credit_card</span>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="ex. LM-2026-001245"
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-400 font-body"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Poză de Profil (Antet / Jucător)
            </label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="hidden" />
              {preview ? (
                <img src={preview} alt="prev" className="h-28 rounded-xl object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-400">upload_file</span>
              )}
            </label>
          </div>

          {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-bold text-xs uppercase py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>Se salvează...</span> : <><span>Salvează Cardul &amp; Poza</span><span className="material-symbols-outlined text-sm">save</span></>}
          </button>
        </form>
      </section>
    </main>
  );
}
