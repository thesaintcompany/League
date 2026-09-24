"use client";

import React, { useState } from "react";

interface GdprDeleteAccountCardProps {
  isSuperAdmin?: boolean;
  userEmail?: string;
}

export function GdprDeleteAccountCard({ isSuperAdmin, userEmail }: GdprDeleteAccountCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/user/gdpr-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg("Solicitarea ta de ștergere GDPR a fost înregistrată cu succes. Echipa noastră o va procesa.");
        setReason("");
      } else {
        setStatusMsg(`Eroare: ${data.error || "A apărut o eroare."}`);
      }
    } catch (err) {
      setStatusMsg("Eroare de rețea. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuperAdmin) return null;

  return (
    <div className="pt-2 pb-6 flex flex-col items-center sm:items-start">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition active:scale-95 shadow-sm"
          title="Deschide opțiunea de ștergere a contului conform GDPR"
        >
          <span className="material-symbols-outlined text-[15px]">delete_forever</span>
          <span>Dreptul de a fi Uitat (Ștergere Cont GDPR)</span>
        </button>
      ) : (
        <div className="w-full card p-5 bg-white dark:bg-slate-900 border border-red-500/30 dark:border-red-500/20 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
              <div>
                <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                  Dreptul de a fi Uitat (Ștergere Cont GDPR)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                  Conform Regulamentului GDPR (UE 2016/679), poți solicita ștergerea definitivă a datelor tale cu caracter personal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Închide"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-label mb-1">
                Motivul solicitării (opțional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Introduceți motivele pentru ștergerea contului..."
                rows={2}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {statusMsg && (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
                {statusMsg}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-headline font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm"
              >
                {loading ? "Se procesează..." : "Solicită Ștergerea Contului"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
