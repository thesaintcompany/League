"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";

interface TicketData {
  id: string;
  ticketCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  seatSector: string;
  seatRow?: string | null;
  seatNumber?: string | null;
  price: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  match: {
    id: string;
    stage?: string | null;
    round: number;
    scheduledAt: string;
    venue?: string | null;
    sponsorName?: string | null;
    sponsorTagline?: string | null;
    championship?: { name: string; season?: string | null; sport: string } | null;
    homeTeam: { name: string; shortName?: string | null; color?: string | null };
    awayTeam: { name: string; shortName?: string | null; color?: string | null };
  };
}

export function A4TicketPrintView({ ticket }: { ticket: TicketData }) {
  const [layoutMode, setLayoutMode] = useState<"1_per_page" | "2_per_page">("1_per_page");
  const [accessQrUrl, setAccessQrUrl] = useState<string>("");
  const [promoQrUrl, setPromoQrUrl] = useState<string>("");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://sp.tscquantum.ro";
  const promoUrl = `${origin}/matches/${ticket.match.id}/promo`;

  useEffect(() => {
    // 1. Generate Gate Access QR Code
    QRCode.toDataURL(
      JSON.stringify({
        code: ticket.ticketCode,
        matchId: ticket.match.id,
        name: ticket.buyerName,
        sector: ticket.seatSector,
      }),
      { width: 260, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } }
    ).then(setAccessQrUrl);

    // 2. Generate Match Promo QR Code
    QRCode.toDataURL(promoUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    }).then(setPromoQrUrl);
  }, [ticket, promoUrl]);

  const matchDate = new Date(ticket.match.scheduledAt);
  const formattedDate = matchDate.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = matchDate.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 font-body print:p-0 print:bg-white text-slate-900 print:text-black">
      {/* Non-Print Control Toolbar */}
      <header className="max-w-4xl mx-auto mb-8 p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/matches/${ticket.match.id}/promo`}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold font-label"
          >
            ← Înapoi la Meci
          </Link>
          <div>
            <h1 className="text-sm font-bold font-headline uppercase text-white">
              Bilet   Acces • #{ticket.ticketCode}
            </h1>
            <p className="text-[11px] text-lime-400 font-label">
              Format A4 Standard (1 sau 2 bilete / coală)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-label">
            <button
              type="button"
              onClick={() => setLayoutMode("1_per_page")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${layoutMode === "1_per_page"
                ? "bg-lime-400 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
                }`}
            >
              1 Bilet / A4
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("2_per_page")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${layoutMode === "2_per_page"
                ? "bg-lime-400 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
                }`}
            >
              2 Bilete / A4 (Duble)
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Imprimă A4 / PDF
          </button>
        </div>
      </header>

      {/* A4 Printable Sheet Container */}
      <main className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-3xl print:rounded-none print:shadow-none print:max-w-none print:m-0 overflow-hidden border border-slate-300 print:border-none">
        {/* Ticket 1 */}
        <SingleTicketCard
          ticket={ticket}
          accessQrUrl={accessQrUrl}
          promoQrUrl={promoQrUrl}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          ticketIndex={1}
        />

        {/* If 2 per page selected, render second ticket copy or tear-off coupon */}
        {layoutMode === "2_per_page" && (
          <div>
            {/* Cut Line */}
            <div className="relative py-4 text-center select-none print:py-6">
              <div className="border-t-2 border-dashed border-slate-400 w-full absolute top-1/2 -translate-y-1/2"></div>
              <span className="relative z-10 px-4 py-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold font-mono uppercase tracking-widest print:bg-white print:border print:border-slate-300">
                ✂️ TAIE AICI PENTRU AL DOILEA BILET / EXEMPLAR COPIE
              </span>
            </div>

            <SingleTicketCard
              ticket={ticket}
              accessQrUrl={accessQrUrl}
              promoQrUrl={promoQrUrl}
              formattedDate={formattedDate}
              formattedTime={formattedTime}
              ticketIndex={2}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function SingleTicketCard({
  ticket,
  accessQrUrl,
  promoQrUrl,
  formattedDate,
  formattedTime,
  ticketIndex,
}: {
  ticket: TicketData;
  accessQrUrl: string;
  promoQrUrl: string;
  formattedDate: string;
  formattedTime: string;
  ticketIndex: number;
}) {
  const champName = ticket.match.championship?.name || "Ligue Pro România";
  const homeShort = ticket.match.homeTeam.shortName || ticket.match.homeTeam.name.substring(0, 3).toUpperCase();
  const awayShort = ticket.match.awayTeam.shortName || ticket.match.awayTeam.name.substring(0, 3).toUpperCase();

  return (
    <div className="p-8 sm:p-10 border-b-2 border-slate-200 print:border-none print:p-8 space-y-6 relative overflow-hidden bg-white text-slate-900">
      {/* Decorative Gold Header Ribbon */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-2xl">
            ⚡
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label block">
              BILET   DE ACCES STADION • {champName.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black italic font-headline uppercase text-slate-900 tracking-tight leading-none">
              LIGUE PRO ACCESS PASS
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-label font-bold uppercase text-slate-400 block">COD BILET</span>
          <span className="text-sm font-mono font-black text-slate-950 bg-slate-100 px-3 py-1 rounded-xl border border-slate-300">
            #{ticket.ticketCode} {ticketIndex > 1 ? `(Copie #${ticketIndex})` : ""}
          </span>
        </div>
      </div>

      {/* Match Matchup Box */}
      <div className="grid grid-cols-12 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200 items-center">
        {/* Teams & Scoreboard (8 cols) */}
        <div className="col-span-12 sm:col-span-8 space-y-4">
          <div className="flex items-center gap-4">
            {/* Home */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md border-2 border-white shrink-0"
                style={{ backgroundColor: ticket.match.homeTeam.color || "#dc2626" }}
              >
                {homeShort}
              </div>
              <div className="truncate">
                <span className="text-[9px] uppercase font-label font-bold text-slate-400 block">Gazde</span>
                <p className="font-headline font-bold text-sm text-slate-900 truncate">
                  {ticket.match.homeTeam.name}
                </p>
              </div>
            </div>

            <span className="font-black italic font-headline text-lg text-slate-400 px-2 shrink-0 whitespace-nowrap">VS</span>

            {/* Away */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md border-2 border-white shrink-0"
                style={{ backgroundColor: ticket.match.awayTeam.color || "#1e3a8a" }}
              >
                {awayShort}
              </div>
              <div className="truncate">
                <span className="text-[9px] uppercase font-label font-bold text-slate-400 block">Oaspeți</span>
                <p className="font-headline font-bold text-sm text-slate-900 truncate">
                  {ticket.match.awayTeam.name}
                </p>
              </div>
            </div>
          </div>

          {/* Match Schedule & Venue Info */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs font-label">
            <div>
              <span className="text-[9px] uppercase text-slate-400 font-bold block">📅 Data &amp; Ora Meciului</span>
              <p className="font-bold text-slate-900 capitalize">{formattedDate}</p>
              <p className="text-lime-700 font-black text-sm">{formattedTime} (Ora României)</p>
            </div>

            <div>
              <span className="text-[9px] uppercase text-slate-400 font-bold block">  Arenă &amp; Locație</span>
              <p className="font-bold text-slate-900">{ticket.match.venue || "Arena  ă"}</p>
              <p className="text-slate-500 text-[10px]">Porțile se deschid cu 90 min înainte</p>
            </div>
          </div>
        </div>

        {/* Primary Access QR Code (4 cols) */}
        <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-center text-center p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {accessQrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accessQrUrl} alt="QR Code Acces" className="w-36 h-36 object-contain" />
          ) : (
            <div className="w-36 h-36 bg-slate-100 flex items-center justify-center font-mono text-xs">
              Generare QR...
            </div>
          )}
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 font-mono mt-1">
            SCAN PENTRU ACCES
          </span>
          <span className="text-[8px] text-slate-500">Valabil pentru 1 persoană</span>
        </div>
      </div>

      {/* Seat & Sector Bento Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-[9px] uppercase text-slate-400 font-bold font-label block">Sector / Zonă</span>
          <span className="text-sm font-black font-headline text-slate-900 block">{ticket.seatSector}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-[9px] uppercase text-slate-400 font-bold font-label block">Rând</span>
          <span className="text-sm font-black font-headline text-slate-900 block">{ticket.seatRow || "Rând 5"}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-[9px] uppercase text-slate-400 font-bold font-label block">Loc</span>
          <span className="text-sm font-black font-headline text-slate-900 block">{ticket.seatNumber || "Loc 12"}</span>
        </div>
        <div className="bg-lime-50 p-3 rounded-2xl border border-lime-300">
          <span className="text-[9px] uppercase text-lime-800 font-bold font-label block">Preț Achitat</span>
          <span className="text-base font-black font-mono text-lime-900 block">{ticket.price} RON</span>
        </div>
      </div>

      {/* Bottom Row: Spectator Info & Secondary Promo QR Code */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 text-xs font-label">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-slate-800">
            Titular Bilet: <strong className="text-slate-950 font-bold">{ticket.buyerName}</strong> ({ticket.buyerEmail})
          </p>
          <p className="text-[10px] text-slate-500">
            Partener   &amp; Sponsor: <strong>{ticket.match.sponsorName || "Ligue Pro Energy"}</strong> • {ticket.match.sponsorTagline || "Performanță Sportivă"}
          </p>
          <p className="text-[9px] text-slate-400 font-mono">
            Platformă securizată operată de <strong>tscquantum.ro</strong> • Toate drepturile aparțin <strong>tscquantum.ro</strong> • Asistență: <strong>contact@buu.ro</strong>
          </p>
        </div>

        {/* Secondary Small QR Code for Match Promo / Mobile Telemetry */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
          {promoQrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={promoQrUrl} alt="QR Promo" className="w-14 h-14 object-contain" />
          )}
          <div className="text-left">
            <span className="text-[8px] font-black uppercase text-slate-400 block">PAGINĂ PROMO</span>
            <span className="text-[10px] font-bold text-slate-900 block">Scanează cu telefonul</span>
            <span className="text-[8px] text-slate-500">tscquantum.ro • Live Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
