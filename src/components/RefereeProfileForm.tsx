"use client";

import React, { useState } from "react";
import Link from "next/link";

interface RefereeProfileProps {
  initialUser: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    image?: string | null;
    phone?: string | null;
    bio?: string | null;
    refereeBadge?: string | null;
    experienceYears?: number | null;
  };
}

export function RefereeProfileForm({ initialUser }: RefereeProfileProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialUser.phone || "+40 722 999 888");
  const [bio, setBio] = useState(
    initialUser.bio ||
    "Arbitru licențiat   cu peste 10 ani de experiență în meciuri naționale și internaționale de prim eșalon."
  );
  const [refereeBadge, setRefereeBadge] = useState(
    initialUser.refereeBadge || "  International"
  );
  const [experienceYears, setExperienceYears] = useState(
    initialUser.experienceYears || 12
  );
  const [image, setImage] = useState(
    initialUser.image ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const BADGE_OPTIONS = [
    "Arbitru  ",
    "Arbitru UEFA Elite",
    "Arbitru Liga 1 (FRF)",
    "Arbitru Liga 2",
    "Arbitru Asistent  ",
    "Arbitru VAR Certificat",
  ];

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bio,
          refereeBadge,
          experienceYears,
          image,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Eroare la salvarea profilului de arbitru");
      }

      setMessage({ text: "Profilul de arbitru oficial a fost actualizat cu succes! ✓", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Referee Identity & Badge (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Legitimație Arbitraj Oficial
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
              OFICIAL DE JOC
            </span>
          </div>

          <div className="w-24 h-24 rounded-2xl border-4 border-slate-100 dark:border-slate-800 overflow-hidden shadow-md mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Portret Arbitru" className="w-full h-full object-cover" />
          </div>

          <div className="text-center">
            <h3 className="font-headline font-bold text-lg text-blue-950 dark:text-white">
              {name || "Arbitru Oficial"}
            </h3>
            <p className="font-label text-xs text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider mt-0.5">
              {refereeBadge}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-label uppercase block">Experiență</span>
              <span className="font-black text-sm text-blue-950 dark:text-white data-font">
                {experienceYears} Ani
              </span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-label uppercase block">Statut</span>
              <span className="font-black text-sm text-lime-600 dark:text-lime-400">Activ ✓</span>
            </div>
          </div>
        </div>

        {/* Delegate Match Permissions Notice */}
        <div className="card p-6 bg-surface-container-low dark:bg-slate-800/40 border-l-4 border-lime-500 rounded-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600 text-lg">verified_user</span>
            <h4 className="font-headline font-bold text-xs text-blue-950 dark:text-white uppercase tracking-wider">
              Drepturi de Arbitraj la Meci
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-body">
            Ca arbitru licențiat, poți edita scorul, evenimentele live (cartonașe, goluri, ofsaiduri) și semna raportul oficial de meci doar pentru partidele la care ai fost delegat aleatoriu prin sistemul de zaruri.
          </p>
        </div>
      </div>

      {/* Right Column: Referee Form (8 cols) */}
      <div className="lg:col-span-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold font-label flex items-center gap-2 shadow-sm ${message.type === "success"
                ? "bg-lime-100 text-lime-900 border border-lime-300"
                : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            <span className="material-symbols-outlined text-base">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            {message.text}
          </div>
        )}

        <section className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-headline font-extrabold text-xl text-blue-950 dark:text-white">
                Date Oficiale Arbitru
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Parametri de acreditare și contact oficial
              </p>
            </div>
            <span className="w-10 h-1 bg-lime-400 rounded-full"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Nume &amp; Prenume Complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input text-sm"
                placeholder="ex: Cristian Balaj"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Ecuson &amp; Categorie Arbitraj
              </label>
              <select
                value={refereeBadge}
                onChange={(e) => setRefereeBadge(e.target.value)}
                className="input text-sm font-semibold"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Ani de Experiență
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="input text-sm data-font"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                  Telefon Oficial
                </label>
                <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input text-sm"
                placeholder="+40 722 999 888"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Biografie &amp; Meciuri Relevante
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input text-sm leading-relaxed"
                placeholder="Detalii despre acreditările și istoricul tău de arbitru..."
              />
            </div>
          </div>
        </section>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <Link
            href="/referees"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-label font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center border border-slate-200 dark:border-slate-800"
          >
            Vezi Corpul de Arbitri ↗
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-headline font-black text-xs uppercase tracking-wider bg-lime-400 hover:bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {saving ? "Se salvează..." : "Salvează Date Arbitru ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
