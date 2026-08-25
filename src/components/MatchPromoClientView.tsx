"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface TeamData {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  city?: string | null;
}

interface MatchPromoProps {
  match: {
    id: string;
    round: number;
    stage?: string | null;
    scheduledAt?: string | null;
    venue?: string | null;
    ticketPrice?: number | null;
    championship?: { id: string; name: string; sport: string; season?: string | null } | null;
    homeTeam: TeamData;
    awayTeam: TeamData;
  };
}

export function MatchPromoClientView({ match }: MatchPromoProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketSector, setTicketSector] = useState("Tribuna 1 Central");
  const [ticketConfirmed, setTicketConfirmed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const scheduledDate = React.useMemo(() => {
    return match.scheduledAt ? new Date(match.scheduledAt) : new Date(Date.now() + 86400000 * 3);
  }, [match.scheduledAt]);
  const price = match.ticketPrice || 25;

  useEffect(() => {
    function updateCountdown() {
      const difference = scheduledDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [scheduledDate]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://sp.buu.ro/matches/${match.id}/promo`;

  function copyPromoLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleBuyTicket(e: React.FormEvent) {
    e.preventDefault();
    setTicketConfirmed(true);
    setTimeout(() => {
      setTicketConfirmed(false);
      setShowTicketModal(false);
    }, 2500);
  }

  const champName = match.championship?.name || "Ligue Pro România";
  const homeShort = match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase();
  const awayShort = match.awayTeam.shortName || match.awayTeam.name.substring(0, 3).toUpperCase();

  return (
    <div className="flex-1 w-full font-body text-white">
      {/* Hero Match Promo Banner */}
      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-lime-400/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-lg">
            <span>🔥</span> MECIUL ETAPEI • {champName}
          </div>

          {/* Versus Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-4">
            {/* Home Team */}
            <div className="flex flex-col items-center space-y-3 group">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition"
                style={{ backgroundColor: match.homeTeam.color || "#dc2626" }}
              >
                {homeShort}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight text-white drop-shadow">
                {match.homeTeam.name}
              </h2>
              <span className="text-xs font-label uppercase font-bold text-lime-400">
                Gazde (Home)
              </span>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-6xl font-black italic font-headline text-lime-400 animate-pulse">
                VS
              </span>
              <span className="text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold mt-1">
                {match.stage ? match.stage.toUpperCase() : `Etapa ${match.round}`}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center space-y-3 group">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition"
                style={{ backgroundColor: match.awayTeam.color || "#1e3a8a" }}
              >
                {awayShort}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight text-white drop-shadow">
                {match.awayTeam.name}
              </h2>
              <span className="text-xs font-label uppercase font-bold text-lime-400">
                Oaspeți (Away)
              </span>
            </div>
          </div>

          {/* Match Location & Date Pills */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-label">
            <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-slate-200">
              <span className="material-symbols-outlined text-lime-400">stadium</span>
              <span className="font-bold">{match.venue || "Arena Oficială Ligue Pro"}</span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-slate-200">
              <span className="material-symbols-outlined text-lime-400">schedule</span>
              <span className="font-bold">
                {scheduledDate.toLocaleDateString("ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-2xl sm:text-3xl font-black font-mono text-lime-400 block">
                {timeLeft.days}
              </span>
              <span className="text-[9px] uppercase font-label font-bold text-slate-400">Zile</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white block">
                {timeLeft.hours}
              </span>
              <span className="text-[9px] uppercase font-label font-bold text-slate-400">Ore</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white block">
                {timeLeft.minutes}
              </span>
              <span className="text-[9px] uppercase font-label font-bold text-slate-400">Min</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-2xl sm:text-3xl font-black font-mono text-lime-400 block">
                {timeLeft.seconds}
              </span>
              <span className="text-[9px] uppercase font-label font-bold text-slate-400">Sec</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="flex-1 min-w-[200px] py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🎟️</span> Rezervă Bilet ({price} RON)
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🔥 Hai la meci! ${match.homeTeam.name} vs ${match.awayTeam.name} pe ${match.venue || "stadion"}! Bilete și detalii: ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>💬</span> WhatsApp
            </a>

            <button
              type="button"
              onClick={copyPromoLink}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 shadow-md transition"
              title="Copiază Linkul"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              {copiedLink ? "Copiat! ✓" : "Distribuie"}
            </button>
          </div>
        </div>
      </section>

      {/* Arena Navigation & Highlights Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Venue & Access */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="w-3 h-7 bg-lime-400 rounded-full"></span>
              <h3 className="text-lg font-bold font-headline uppercase text-white">
                🏟️ Locație &amp; Acces Stadion
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Meciul se dispută pe <strong>{match.venue || "Arena Oficială"}</strong>. Accesul suporterilor este permis cu 90 de minute înainte de fluierul de start.
            </p>

            <div className="space-y-2 text-xs font-label text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span>Parcare suporteri:</span>
                <span className="text-lime-400 font-bold">Asigurată în incinta arenei</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span>Porți de acces:</span>
                <span className="text-white font-bold">Poarta A (Nord) &amp; Poarta B (Sud)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span>Transmisie Live:</span>
                <span className="text-lime-400 font-bold">Ligue Pro TV HD Stream</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(match.venue || "Arena Nationala Bucuresti")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold font-label text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <span className="material-symbols-outlined text-sm">navigation</span>
              Deschide Navigație GPS Google Maps ↗
            </a>
          </div>

          {/* Card: Match Details & Official Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="w-3 h-7 bg-blue-400 rounded-full"></span>
              <h3 className="text-lg font-bold font-headline uppercase text-white">
                📄 Documente Oficiale
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-body leading-relaxed">
              Descărcați raportul oficial de arbitraj, foaia de joc cu primul 11 și istoricul confruntărilor directe dintre cele două echipe.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href={`/matches/${match.id}/report`}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold font-headline text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                Descarcă Fișă Joc Oficială PDF
              </Link>

              <Link
                href={`/campionat?id=${match.championship?.id || ""}`}
                className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition shadow-lg"
              >
                <span>🏆</span> Vezi Clasamentul Campionatului
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-lime-400/60 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase font-label text-lime-400">
                  REZERVARE BILETE ACCES
                </span>
                <h3 className="text-lg font-black font-headline uppercase text-white mt-0.5">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {ticketConfirmed ? (
              <div className="p-6 rounded-2xl bg-lime-400/10 border border-lime-400 text-center space-y-3">
                <span className="text-4xl block">✅</span>
                <h4 className="font-headline font-bold text-base text-lime-400 uppercase">
                  Rezervare Confirmată cu Succes!
                </h4>
                <p className="text-xs text-slate-200">
                  {ticketCount} bilet(e) rezervat(e) în <strong>{ticketSector}</strong>. Biletul a fost generat digital.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBuyTicket} className="space-y-4">
                <div>
                  <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Selectează Sector / Zonă
                  </label>
                  <select
                    value={ticketSector}
                    onChange={(e) => setTicketSector(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-lime-400"
                  >
                    <option value="Tribuna 1 Central">Tribuna 1 Central ({price} RON)</option>
                    <option value="Tribuna 2">Tribuna 2 ({price} RON)</option>
                    <option value="Peluza Gazde">Peluza Gazde ({price - 5} RON)</option>
                    <option value="Loja VIP Executive">Loja VIP Executive ({price * 3} RON)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Număr de Bilete
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="text-xl font-black font-mono px-4">{ticketCount}</span>
                    <button
                      type="button"
                      onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold text-lg"
                    >
                      +
                    </button>
                    <div className="ml-auto text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-label block">Total</span>
                      <span className="text-xl font-black font-mono text-lime-400">
                        {price * ticketCount} RON
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-xl transition"
                >
                  Confirmă Rezervarea Biletului 🎟️
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
