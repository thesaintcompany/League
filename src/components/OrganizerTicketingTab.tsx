"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";

interface MatchItem {
  id: string;
  round: number;
  stage?: string | null;
  scheduledAt: string;
  venue?: string | null;
  ticketPrice?: number | null;
  organizerIban?: string | null;
  organizerBank?: string | null;
  organizerAccountHolder?: string | null;
  gateAccessSecret?: string | null;
  homeTeam: { name: string; shortName?: string | null; color?: string | null };
  awayTeam: { name: string; shortName?: string | null; color?: string | null };
}

interface TicketTier {
  id: string;
  matchId: string;
  name: string;
  price: number;
  totalSeats: number;
  soldSeats: number;
  gateNumber?: string | null;
}

export function OrganizerTicketingTab({
  championshipId,
  matches,
}: {
  championshipId: string;
  matches: MatchItem[];
}) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || "");
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    iban: "",
    bank: "Banca Transilvania",
    accountHolder: "",
  });
  const [savingPayout, setSavingPayout] = useState(false);
  const [tierForm, setTierForm] = useState({
    name: "Tribuna 1 Central",
    price: 30,
    totalSeats: 150,
    gateNumber: "Poarta A (Nord)",
  });
  const [scannerQrUrl, setScannerQrUrl] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const activeMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  const loadTiers = useCallback(async () => {
    if (!selectedMatchId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/tiers?matchId=${selectedMatchId}`);
      const data = await res.json();
      if (data.tiers) {
        setTiers(data.tiers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedMatchId]);

  useEffect(() => {
    if (selectedMatchId) {
      loadTiers();
    }
  }, [selectedMatchId, loadTiers]);

  useEffect(() => {
    if (activeMatch) {
      setPayoutForm({
        iban: activeMatch.organizerIban || "",
        bank: activeMatch.organizerBank || "Banca Transilvania",
        accountHolder: activeMatch.organizerAccountHolder || "",
      });

      const origin = typeof window !== "undefined" ? window.location.origin : "https://sp.tscquantum.ro";
      const scannerActivationUrl = `${origin}/tickets/scanner?matchId=${activeMatch.id}&token=${activeMatch.gateAccessSecret || "SECRET"}`;

      QRCode.toDataURL(scannerActivationUrl, {
        width: 280,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      }).then(setScannerQrUrl);
    }
  }, [activeMatch]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAddTier(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatchId) return;
    try {
      const res = await fetch("/api/tickets/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          name: tierForm.name,
          price: tierForm.price,
          totalSeats: tierForm.totalSeats,
          gateNumber: tierForm.gateNumber,
        }),
      });
      if (res.ok) {
        showToast(`Categoria "${tierForm.name}" a fost adăugată! ✓`);
        loadTiers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTier(tierId: string) {
    try {
      const res = await fetch(`/api/tickets/tiers?tierId=${tierId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Categoria a fost ștearsă.");
        loadTiers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSavePayout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatchId) return;
    setSavingPayout(true);
    try {
      const res = await fetch("/api/tickets/tiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          name: "Actualizare Cont",
          price: activeMatch?.ticketPrice || 25,
          organizerIban: payoutForm.iban,
          organizerBank: payoutForm.bank,
          organizerAccountHolder: payoutForm.accountHolder,
        }),
      });
      if (res.ok) {
        showToast("Contul bancar de virament a fost salvat cu succes! ✓");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPayout(false);
    }
  }

  if (matches.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl">
        Nu există meciuri programate încă în acest campionat. Generați mai întâi meciurile din tab-ul Program &amp; Arbitraj.
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-950 text-white border border-lime-400/40 shadow-2xl flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-lime-400">verified</span>
          <span className="text-xs font-bold font-label">{toast}</span>
        </div>
      )}

      {/* Match Selector Bar */}
      <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 font-label">
            CONFIGURARE TICKETING &amp; BILETE
          </span>
          <h3 className="text-xl font-bold font-headline uppercase text-blue-950 dark:text-white mt-0.5">
            Gestiune Loturi Bilete &amp; Scanner Stewarzi
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="input text-xs font-bold cursor-pointer max-w-xs"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                Etapa {m.round}: {m.homeTeam.name} vs {m.awayTeam.name}
              </option>
            ))}
          </select>
          <Link
            href={`/matches/${selectedMatchId}/promo`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-xs uppercase font-headline tracking-wider shadow shrink-0"
          >
            Pagină Promo ↗
          </Link>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ticket Tiers & Bank Payout (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Ticket Tiers Manager */}
          <div className="card p-6 sm:p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-lime-500 rounded-full"></span>
                <h4 className="font-headline font-bold text-lg text-blue-950 dark:text-white uppercase">
                  Categorii &amp; Sectoare Bilete ({activeMatch?.homeTeam.name} vs {activeMatch?.awayTeam.name})
                </h4>
              </div>
            </div>

            {/* Add Tier Form */}
            <form onSubmit={handleAddTier} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-surface-container-low p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                  Sector / Nume
                </label>
                <input
                  type="text"
                  required
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  className="input text-xs"
                  placeholder="ex: Tribuna 1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                  Preț (RON)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  value={tierForm.price}
                  onChange={(e) => setTierForm({ ...tierForm, price: parseFloat(e.target.value) || 0 })}
                  className="input text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                  Capacitate Locuri
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={tierForm.totalSeats}
                  onChange={(e) => setTierForm({ ...tierForm, totalSeats: parseInt(e.target.value) || 0 })}
                  className="input text-xs font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider rounded-xl shadow transition"
                >
                  + Adaugă
                </button>
              </div>
            </form>

            {/* Tiers List */}
            <div className="space-y-3">
              {tiers.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Nu sunt definite categorii specifice. Se utilizează tariful standard de {activeMatch?.ticketPrice || 25} RON.
                </p>
              ) : (
                tiers.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-4 rounded-2xl bg-surface-container-low border border-slate-200/60 dark:border-slate-800"
                  >
                    <div>
                      <h5 className="font-headline font-bold text-sm text-blue-950 dark:text-white">
                        {t.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-label">
                        {t.gateNumber || "Poarta A"} • Capacitate: {t.totalSeats} locuri ({t.soldSeats} vândute)
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black font-mono text-lime-600 dark:text-lime-400">
                        {t.price} RON
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(t.id)}
                        className="text-xs text-red-500 hover:text-red-700 p-1"
                        title="Șterge"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Organizer Payout Bank Account */}
          <div className="card p-6 sm:p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-blue-500 rounded-full"></span>
                <h4 className="font-headline font-bold text-lg text-blue-950 dark:text-white uppercase">
                  Cont Bancar de Virament (Încasare Încasări Bilete)
                </h4>
              </div>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                    Nume Bancă
                  </label>
                  <input
                    type="text"
                    value={payoutForm.bank}
                    onChange={(e) => setPayoutForm({ ...payoutForm, bank: e.target.value })}
                    className="input text-xs"
                    placeholder="Banca Transilvania, BCR etc."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                    Cont IBAN (RON)
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutForm.iban}
                    onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value })}
                    className="input text-xs font-mono uppercase"
                    placeholder="RO49BTRL0000..."
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400 block mb-1">
                    Titular Cont / Denumire Asociație / Club
                  </label>
                  <input
                    type="text"
                    value={payoutForm.accountHolder}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountHolder: e.target.value })}
                    className="input text-xs"
                    placeholder="ex: Asociația Club Sportiv Elite"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPayout}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-headline font-black text-xs uppercase tracking-wider shadow"
                >
                  {savingPayout ? "Se salvează..." : "Salvează Cont Bancar ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Gatekeeper QR Scanner Activation (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card p-6 sm:p-8 bg-primary text-white border-none rounded-3xl shadow-xl space-y-6 text-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 font-label block">
                ACTIVARE RAPIDĂ PRIN QR
              </span>
              <h4 className="font-headline font-black text-lg text-white uppercase mt-0.5">
                Scanner Porți Stadion
              </h4>
              <p className="text-xs text-slate-300 font-label mt-1">
                Personalul de la porți (stewarzii) scanează acest QR cu telefonul mobil pentru a deschide direct scannerul fără parolă!
              </p>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-white rounded-3xl inline-block shadow-2xl border-4 border-lime-400/50">
              {scannerQrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={scannerQrUrl} alt="QR Activare Scanner" className="w-52 h-52 object-contain" />
              ) : (
                <div className="w-52 h-52 bg-slate-100 flex items-center justify-center text-slate-900 font-mono text-xs">
                  Generare QR...
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/tickets/scanner?matchId=${activeMatch?.id}&token=${activeMatch?.gateAccessSecret || "SECRET"}`}
                target="_blank"
                className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <span>📱</span> Deschide Scanner pe Ecran ↗
              </Link>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📲 Link Scanner Porți Meci ${activeMatch?.homeTeam.name} vs ${activeMatch?.awayTeam.name}: https://sp.tscquantum.ro/tickets/scanner?matchId=${activeMatch?.id}&token=${activeMatch?.gateAccessSecret || "SECRET"}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold font-label text-xs uppercase rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <span>💬</span> Trimite pe WhatsApp la Stewarzi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
