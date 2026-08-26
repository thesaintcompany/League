"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatchSponsorsSection } from "./MatchSponsorsSection";
import { MatchRegulationsSection } from "./MatchRegulationsSection";
import { isTicketSalesClosed } from "@/lib/tickets";

interface TeamData {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  city?: string | null;
}

interface MatchPromoProps {
  match: {
    id: string;
    round: number;
    stage?: string | null;
    status?: string | null; // "scheduled" | "live" | "finished"
    homeScore?: number | null;
    awayScore?: number | null;
    scheduledAt?: string | null;
    venue?: string | null;
    ticketPrice?: number | null;
    championship?: { id: string; name: string; sport: string; season?: string | null } | null;
    homeTeam: TeamData;
    awayTeam: TeamData;
  };
}

function TeamLogoCrest({ team, fallbackShort }: { team: TeamData; fallbackShort: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="w-16 h-16 xs:w-20 xs:h-20 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-xl xs:text-2xl sm:text-4xl text-white shadow-2xl border-2 sm:border-4 border-white/20 transform group-hover:scale-105 transition-all overflow-hidden bg-slate-900/90 relative backdrop-blur-md shrink-0"
      style={{ backgroundColor: team.color || "#1e293b" }}
    >
      {team.logoUrl && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.logoUrl}
          alt={team.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-1.5 sm:p-2.5 transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
        />
      ) : (
        <span className="font-headline font-black uppercase tracking-tight drop-shadow-md text-white">
          {fallbackShort}
        </span>
      )}
    </div>
  );
}

export function MatchPromoClientView({ match }: MatchPromoProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketSector, setTicketSector] = useState("Tribuna 1 Central");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "paypal">("card");
  const [processing, setProcessing] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<{ id: string; ticketCode: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const scheduledDate = React.useMemo(() => {
    return match.scheduledAt ? new Date(match.scheduledAt) : new Date(Date.now() + 86400000 * 3);
  }, [match.scheduledAt]);

  const priceMap: Record<string, number> = {
    "Tribuna 1 Central": match.ticketPrice || 30,
    "Tribuna 2": (match.ticketPrice || 30) - 5,
    "Peluza Gazde": Math.max(15, (match.ticketPrice || 30) - 10),
    "Loja VIP Executive": (match.ticketPrice || 30) * 3,
  };

  const unitPrice = priceMap[ticketSector] || (match.ticketPrice || 25);
  const totalPrice = unitPrice * ticketCount;

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

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://sp.tscquantum.ro/matches/${match.id}/promo`;

  function copyPromoLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function handleBuyTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/tickets/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          quantity: ticketCount,
          buyerName,
          buyerEmail,
          buyerPhone,
          paymentMethod,
          seatSector: ticketSector,
        }),
      });

      const data = await res.json();
      if (res.ok && data.tickets && data.tickets.length > 0) {
        setPurchasedTicket({
          id: data.tickets[0].id,
          ticketCode: data.tickets[0].ticketCode,
        });
      } else {
        alert(data.error || "Eroare la emiterea biletului.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Eroare de conexiune la serverul de plăți.");
    } finally {
      setProcessing(false);
    }
  }

  const champName = match.championship?.name || "Campionat Oficial";
  const homeShort = match.homeTeam.shortName || match.homeTeam.name.substring(0, 3).toUpperCase();
  const awayShort = match.awayTeam.shortName || match.awayTeam.name.substring(0, 3).toUpperCase();

  const isLive = match.status === "live" || match.status === "in_progress";
  const isFinished = match.status === "finished";
  const hasScore = (match.homeScore !== null && match.homeScore !== undefined) && (match.awayScore !== null && match.awayScore !== undefined);
  const isSalesClosed = isTicketSalesClosed(match);

  return (
    <div className="flex-1 w-full font-body text-white">
      {/* Hero Match Promo Banner — Major Champions League Style */}
      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-lime-400/30 shadow-2xl">
        {/* Dynamic Dual Split Team Color Glows */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${match.homeTeam.color || "#dc2626"} 0%, transparent 70%)` }}
        ></div>
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${match.awayTeam.color || "#1e3a8a"} 0%, transparent 70%)` }}
        ></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/images/stadium-hero.jpg')" }}
        ></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Status Badge: LIVE / REZULTAT FINAL / MECIUL ETAPEI */}
          <div>
            {isLive ? (
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider font-label shadow-xl shadow-red-600/50 border border-red-400 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>🔴 LIVE MECH • {champName}</span>
              </div>
            ) : isFinished ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider font-label shadow-lg border border-emerald-300">
                <span>✓</span> REZULTAT FINAL • {champName}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-lg">
                <span>🔥</span> MECIUL ETAPEI • {champName}
              </div>
            )}
          </div>

          {/* Versus Header with Team Logos & Score Overlay — Row Layout Side-By-Side On Mobile & Desktop */}
          <div className="flex flex-row items-center justify-between sm:justify-center gap-2 xs:gap-4 sm:gap-16 py-4 w-full max-w-4xl mx-auto">
            {/* Home Team */}
            <div className="flex flex-col items-center space-y-2 group min-w-0 flex-1 sm:flex-none sm:max-w-[200px] text-center">
              <TeamLogoCrest team={match.homeTeam} fallbackShort={homeShort} />
              <h2 className="text-xs xs:text-sm sm:text-3xl font-black font-headline uppercase tracking-tight text-white drop-shadow leading-tight line-clamp-2">
                {match.homeTeam.name}
              </h2>
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-lime-400">
                Gazde (Home)
              </span>
            </div>

            {/* Score or VS Divider */}
            <div className="flex flex-col items-center shrink-0 my-0">
              {isLive || isFinished || hasScore ? (
                <div className="flex items-center gap-1.5 sm:gap-6 bg-slate-900/90 border-2 border-white/20 px-2.5 sm:px-8 py-2 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md">
                  <span className={`text-2xl xs:text-3xl sm:text-6xl font-black font-mono tracking-tight ${isLive ? "text-red-400" : "text-white"}`}>
                    {match.homeScore ?? 0}
                  </span>
                  <span className="text-base sm:text-4xl font-black font-headline text-slate-500">-</span>
                  <span className={`text-2xl xs:text-3xl sm:text-6xl font-black font-mono tracking-tight ${isLive ? "text-red-400" : "text-white"}`}>
                    {match.awayScore ?? 0}
                  </span>
                </div>
              ) : (
                <span className="text-2xl xs:text-3xl sm:text-6xl font-black italic font-headline text-lime-400 animate-pulse">
                  VS
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] font-label uppercase tracking-widest text-slate-400 font-bold mt-1 sm:mt-2">
                {match.stage ? match.stage.toUpperCase() : `Etapa ${match.round}`}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center space-y-2 group min-w-0 flex-1 sm:flex-none sm:max-w-[200px] text-center">
              <TeamLogoCrest team={match.awayTeam} fallbackShort={awayShort} />
              <h2 className="text-xs xs:text-sm sm:text-3xl font-black font-headline uppercase tracking-tight text-white drop-shadow leading-tight line-clamp-2">
                {match.awayTeam.name}
              </h2>
              <span className="text-[10px] sm:text-xs font-label uppercase font-bold text-lime-400">
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

          {/* Countdown Clock (only if match is upcoming) */}
          {!isFinished && (
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
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 max-w-md mx-auto">
            {isSalesClosed ? (
              <div
                className="flex-1 min-w-[200px] py-4 bg-slate-900/90 border border-slate-700/80 text-slate-400 font-bold font-headline text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-inner cursor-not-allowed select-none"
                title="Vânzarea online a biletelor este închisă (ziua meciului sau meci încheiat)"
              >
                <span className="text-amber-400">🔒</span> Vânzare Închisă
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPurchasedTicket(null);
                  setShowTicketModal(true);
                }}
                className="flex-1 min-w-[200px] py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🎟️</span> Cumpără Bilet Online ({unitPrice} RON)
              </button>
            )}

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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="w-3 h-7 bg-lime-400 rounded-full"></span>
              <h3 className="text-lg font-bold font-headline uppercase text-slate-900 dark:text-white">
                🏟️ Locație &amp; Acces Stadion
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-body leading-relaxed">
              Meciul se dispută pe <strong>{match.venue || "Arena Oficială"}</strong>. Accesul suporterilor este permis cu 90 de minute înainte de fluierul de start.
            </p>

            <div className="space-y-2 text-xs font-label text-slate-500 dark:text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Parcare suporteri:</span>
                <span className="text-lime-600 dark:text-lime-400 font-bold">Asigurată în incinta arenei</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Porți de acces:</span>
                <span className="text-slate-900 dark:text-white font-bold">Poarta A (Nord) &amp; Poarta B (Sud)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span>Transmisie Live:</span>
                <span className="text-lime-600 dark:text-lime-400 font-bold">Ligue Pro TV HD Stream</span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(match.venue || "Arena Nationala Bucuresti")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-lime-400 font-bold font-label text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition border border-slate-200 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-sm">navigation</span>
              Deschide Navigație GPS Google Maps ↗
            </a>
          </div>

          {/* Card: Match Details & Official Sheet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="w-3 h-7 bg-blue-500 rounded-full"></span>
              <h3 className="text-lg font-bold font-headline uppercase text-slate-900 dark:text-white">
                📄 Documente &amp; Rapoarte Meci
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-body leading-relaxed">
              Descărcați raportul oficial de meci și foaia tehnică de arbitraj omologată.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href={`/matches/${match.id}/report`}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold font-headline text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition border border-slate-200 dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                Descarcă Fișă Joc Oficială PDF
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Official Regulations Section */}
        <MatchRegulationsSection championshipName={champName} />

        {/* Exclusive Organizer Sponsor Section */}
        <MatchSponsorsSection matchId={match.id} />
      </main>

      {/* Multi-Gateway Ticket Purchase Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-lime-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase font-label text-lime-600 dark:text-lime-400">
                  ACHIZIȚIE BILETE ONLINE • EMITERE INSTANTANEE
                </span>
                <h3 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white mt-0.5">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {purchasedTicket ? (
              <div className="p-6 rounded-3xl bg-lime-400/10 border-2 border-lime-400 text-center space-y-4">
                <span className="text-5xl block animate-bounce">🎟️</span>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-lime-600 dark:text-lime-400">
                    PLATĂ CONFIRMATĂ CU SUCCES
                  </span>
                  <h4 className="font-headline font-black text-xl text-slate-900 dark:text-white uppercase mt-1">
                    Biletul tău este Gata!
                  </h4>
                  <p className="text-xs font-mono font-bold text-lime-600 dark:text-lime-300 mt-1">
                    Cod Bilet: #{purchasedTicket.ticketCode}
                  </p>
                </div>

                <div className="pt-2 space-y-2.5">
                  <Link
                    href={`/tickets/${purchasedTicket.id}/print`}
                    target="_blank"
                    className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
                  >
                    <span>📄</span> Descarcă / Imprimă Bilet A4 PDF ↗
                  </Link>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🎟️ Iată biletul meu la meciul ${match.homeTeam.name} vs ${match.awayTeam.name}: https://sp.tscquantum.ro/tickets/${purchasedTicket.id}/print`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-label text-xs uppercase rounded-2xl flex items-center justify-center gap-2 transition"
                  >
                    <span>💬</span> Trimite Bilet pe WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBuyTicket} className="space-y-5">
                {/* Sector & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Sector / Categorie Bilet
                    </label>
                    <select
                      value={ticketSector}
                      onChange={(e) => setTicketSector(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-lime-400 shadow-sm transition"
                    >
                      <option value="Tribuna 1 Central">Tribuna 1 Central ({priceMap["Tribuna 1 Central"]} RON)</option>
                      <option value="Tribuna 2">Tribuna 2 ({priceMap["Tribuna 2"]} RON)</option>
                      <option value="Peluza Gazde">Peluza Gazde ({priceMap["Peluza Gazde"]} RON)</option>
                      <option value="Loja VIP Executive">Loja VIP Executive ({priceMap["Loja VIP Executive"]} RON)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold font-label text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Număr de Bilete
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-black font-mono text-sm text-slate-900 dark:text-white">{ticketCount}</span>
                      <button
                        type="button"
                        onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                        className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Buyer Details */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 font-label block">
                    Date Spectator (Titular Bilet)
                  </span>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Nume și Prenume Spectator *"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-lime-400 shadow-sm transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Adresă Email *"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-lime-400 shadow-sm transition"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon (Opțional)"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-lime-400 shadow-sm transition"
                    />
                  </div>
                </div>

                {/* Payment Gateway Selector */}
                <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 font-label block">
                    Alege Metoda de Plată
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 shadow-sm ${
                        paymentMethod === "card"
                          ? "border-2 border-lime-500 bg-lime-500/15 text-slate-950 dark:text-white font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl">💳</span>
                      <span className="text-[10px] font-label font-bold">Card Stripe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_pay")}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 shadow-sm ${
                        paymentMethod === "apple_pay"
                          ? "border-2 border-lime-500 bg-lime-500/15 text-slate-950 dark:text-white font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl">🍎</span>
                      <span className="text-[10px] font-label font-bold">Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("google_pay")}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 shadow-sm ${
                        paymentMethod === "google_pay"
                          ? "border-2 border-lime-500 bg-lime-500/15 text-slate-950 dark:text-white font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl">🟢</span>
                      <span className="text-[10px] font-label font-bold">Google Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 shadow-sm ${
                        paymentMethod === "paypal"
                          ? "border-2 border-lime-500 bg-lime-500/15 text-slate-950 dark:text-white font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl">🅿️</span>
                      <span className="text-[10px] font-label font-bold">PayPal</span>
                    </button>
                  </div>
                </div>

                {/* Total & Checkout Button */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-label text-slate-600 dark:text-slate-400 uppercase">
                      Total de Plată ({ticketCount} bilet{ticketCount > 1 ? "e" : ""}):
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-lime-400">
                      {totalPrice} RON
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-slate-950 font-black font-headline text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>🔒</span> {processing ? "Procesare Plată..." : `Plătește ${totalPrice} RON & Emite Bilet`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
