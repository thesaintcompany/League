"use client";

import React, { useState } from "react";
import { appSignOut } from "@/lib/logout";

interface GdprDeleteAccountCardProps {
  isSuperAdmin: boolean;
  userEmail: string;
}

export function GdprDeleteAccountCard({ isSuperAdmin, userEmail }: GdprDeleteAccountCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSuperAdmin) {
    return (
      <div className="card p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="material-symbols-outlined text-amber-400 text-lg">shield</span>
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-slate-300">
            Conformitate GDPR &amp; Siguranță Cont
          </h3>
        </div>
        <p className="text-[11px] text-slate-400 font-body">
          Contul de <strong>Super Administrator</strong> este protejat de sistem și nu poate fi auto-șters pentru a menține stabilitatea bazei de date și a platformei.
        </p>
      </div>
    );
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== "STERGE CONTUL") {
      setError('Te rugăm să tastezi exact "STERGE CONTUL" pentru a confirma.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/gdpr-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason || "Solicitare directă de la profilul utilizatorului.",
          immediateDelete: true,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert(data.message || "Contul și datele tale au fost șterse definitiv.");
        appSignOut("/");
      } else {
        setError(data.error || "Eroare la ștergerea contului.");
        setLoading(false);
      }
    } catch {
      setError("Eroare de rețea. Te rugăm să reîncerci.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card p-6 bg-red-950/20 border border-red-500/30 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-lg">policy</span>
              <h3 className="font-headline font-black text-sm uppercase tracking-tight text-white">
                Ștergere Cont &amp; Date Personale (Conformitate GDPR)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-body max-w-xl">
              În conformitate cu Regulamentul European GDPR (Dreptul de a fi Uitat), poți solicita oricând ștergerea definitivă a contului tău ({userEmail}) și a tuturor datelor asociate.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            <span>Șterge Contul Meu</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="card p-6 sm:p-8 bg-slate-900 border border-red-500/50 rounded-3xl shadow-2xl max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
                <h4 className="font-headline font-black text-base uppercase text-white">
                  Confirmare Ștergere Definitivă
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Această acțiune este <strong>ireversibilă</strong>. Toate fișierele, fotografiile, calitatea de membru în echipă și istoricul asociat adresei <strong>{userEmail}</strong> vor fi eliminate definitiv din baza de date.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Motivul Ștergerii (Opțional):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ex: Nu mai particip în campionate / doresc anonimizarea datelor"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Tastează <strong className="text-red-400 font-mono">STERGE CONTUL</strong> pentru a confirma:
                </label>
                <input
                  required
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="STERGE CONTUL"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-red-500/40 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-label uppercase transition"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText.trim().toUpperCase() !== "STERGE CONTUL"}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-headline font-black text-xs uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>{loading ? "Se șterge..." : "Confirmă Ștergerea"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
