"use client";

import React, { useState } from "react";

interface VenueClaimModalProps {
  venueId: string;
  venueName: string;
  venueLocation: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VenueClaimModal({
  venueId,
  venueName,
  venueLocation,
  isOpen,
  onClose,
}: VenueClaimModalProps) {
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    companyName: "",
    companyCui: "",
    companyRegCom: "",
    jobTitle: "",
    justification: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Eroare la trimiterea cererii de revendicare.");
      }

      setSuccessMessage(data.message || "Cererea ta a fost trimisă către SuperAdmin!");
    } catch (err: any) {
      setError(err.message || "A apărut o eroare neprevăzută.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-body">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label tracking-widest">
              🏛️ REVENDICARE  Ă ARENĂ
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              ID: {venueId.slice(-6).toUpperCase()}
            </span>
          </div>

          <h3 className="text-2xl font-black italic font-headline tracking-tight uppercase">
            Revendică Administrarea: {venueName}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-body leading-relaxed">
            Ești administratorul, directorul sau reprezentantul legal al acestei baze sportive ({venueLocation})? Completează datele entității juridice / companiei pentru verificarea SuperAdmin și preluarea controlului deplin asupra arenei.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-bold text-red-800 dark:text-red-300 flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-lime-400/20 animate-bounce">
              ✓
            </div>
            <h4 className="text-xl font-headline font-bold uppercase text-slate-900 dark:text-white">
              Cerere Transmisă cu Succes!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition"
              >
                Am Înțeles • Închide Fereastra
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Applicant Personal Data */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                1. Date de Contact Solicitant
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Nume &amp; Prenume *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ion Popescu"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Email   *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@arena-ta.ro"
                    value={formData.applicantEmail}
                    onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Telefon Mobil / Direct *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="07xxxxxxxx"
                    value={formData.applicantPhone}
                    onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Legal Entity / Company Data */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                2. Date Entitate Juridică / Companie / Primărie
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Denumire Companie / Club / Primărie *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: SC Complex Sportiv Arena SRL"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    CUI / CIF / Cod Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="53063735"
                    value={formData.companyCui}
                    onChange={(e) => setFormData({ ...formData, companyCui: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Nr. Reg. Comerțului / Act Înființare
                  </label>
                  <input
                    type="text"
                    placeholder="ex: J40/1234/2020 sau Decizie Primărie"
                    value={formData.companyRegCom}
                    onChange={(e) => setFormData({ ...formData, companyRegCom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                    Funcția / Rolul în Organizație *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Director General / Administrator Bază"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-label">
                  Mesaj Justificativ / Note către SuperAdmin (opțional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Precizări suplimentare, link către site-ul   sau documente doveditoare..."
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-body focus:border-lime-400 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-slate-500 font-label">
                🛡️ Datele sunt transmise securizat către SuperAdmin pentru verificare și atribuire acces.
              </p>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold font-label text-slate-700 dark:text-slate-300 transition"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition flex items-center gap-1.5 active:scale-95"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      <span>Se trimite...</span>
                    </>
                  ) : (
                    <>
                      <span>Trimite Cererea</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
