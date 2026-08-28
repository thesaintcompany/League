"use client";

import React, { useState } from "react";

interface GdprDeleteAccountCardProps {
  isSuperAdmin?: boolean;
  userEmail?: string;
}

export function GdprDeleteAccountCard({ isSuperAdmin, userEmail }: GdprDeleteAccountCardProps) {
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
        setStatusMsg(" Solicitarea ta de ștergere GDPR a fost înregistrată cu succes. Echipa noastră o va procesa.");
        setReason("");
      } else {
        setStatusMsg(` Error: ${data.error || "A apărut o eroare."}`);
      }
    } catch (err) {
      setStatusMsg(" Error de rețea. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuperAdmin) return null;

  return (
    <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
        <div>
          <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
            Dreptul de a fi Uitat (Ștergere Cont GDPR)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
            Conform Regulamentului GDPR (UE 2016/679), poți solicita ștergerea definitivă a datelor tale cu caracter personal.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-label mb-1">
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-headline font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Se procesează..." : "Solicită Ștergerea Contului"}
          </button>
        </div>
      </form>
    </div>
  );
}
