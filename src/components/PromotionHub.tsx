"use client";

import React, { useState } from "react";
import { MatchData } from "./MatchCard";

interface PromotionHubProps {
  matches: MatchData[];
  championshipName: string;
}

export function PromotionHub({ matches, championshipName }: PromotionHubProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches[0]?.id || ""
  );
  const [format, setFormat] = useState<"story" | "post">("story");
  const [template, setTemplate] = useState<"kinetic" | "hyper" | "minimal">("kinetic");
  const [ticketPrice, setTicketPrice] = useState<number>(25);
  const [ticketUrl, setTicketUrl] = useState<string>("https://sp.buu.ro/tickets");
  const [sponsorName, setSponsorName] = useState<string>("Banca Transilvania / Dedeman");
  const [sponsorTagline, setSponsorTagline] = useState<string>(
    "Partener Principal al Sportului Românesc"
  );
  const [copied, setCopied] = useState(false);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  if (!selectedMatch) {
    return (
      <div className="card p-12 text-center text-slate-500 font-label">
        Nu există meciuri disponibile pentru generarea de materiale promoționale.
      </div>
    );
  }

  const promoUrl = typeof window !== "undefined"
    ? `${window.location.origin}/matches/${selectedMatch.id}/promo`
    : `https://sp.buu.ro/matches/${selectedMatch.id}/promo`;

  const shareText = `🔥 MECIUL ETAPEI în ${championshipName}!\n⚽ ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}\n📍 Stadion: ${selectedMatch.venue || "Arena Oficială"}\n📅 Data: ${new Date(selectedMatch.scheduledAt || Date.now()).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}\n🎟️ Bilete (${ticketPrice} RON): ${promoUrl}`;

  function copyPromoLink() {
    navigator.clipboard.writeText(promoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareWhatsApp() {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(promoUrl)}`, "_blank");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                📢
              </div>
              <h2 className="text-2xl font-black italic tracking-tight font-headline uppercase text-blue-950 dark:text-white">
                Promotion Hub &amp; Social Media Generator
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-label">
              Generează automat bannere grafice, linkuri de promovare, prețuri bilete și spații de reclame pentru sponsori.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyPromoLink}
              className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-slate-800 flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              {copied ? "Link Copiat! ✓" : "Copiază Link Promo"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Promotion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Match Selection & Sponsor Ads Config (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Match Selection */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
              1. Alege Meciul de Promovat
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {matches.map((m) => {
                const isSelected = m.id === selectedMatch.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition border text-xs ${
                      isSelected
                        ? "bg-slate-900 text-white border-lime-400 shadow-md font-bold"
                        : "bg-surface-container-low dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                      <span>Etapa {m.round}</span>
                      <span>
                        {new Date(m.scheduledAt || Date.now()).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-headline text-xs font-bold">
                      <span className="truncate">{m.homeTeam.name}</span>
                      <span className="text-[10px] text-lime-400 px-1.5">VS</span>
                      <span className="truncate">{m.awayTeam.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tickets & Ads Settings */}
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
              2. Bilete &amp; Spațiu Reclame Sponsori
            </h3>

            <div>
              <label className="label">Preț Bilet Acces (RON)</label>
              <input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(parseInt(e.target.value) || 0)}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="label">Link Cumpărare Bilete</label>
              <input
                type="url"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                className="input text-xs"
                placeholder="https://sp.buu.ro/tickets"
              />
            </div>

            <div>
              <label className="label">Sponsor Oficial / Reclame Cluburi</label>
              <input
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                className="input text-xs"
                placeholder="ex: Banca Transilvania, Dedeman, eMAG, Bitdefender..."
              />
            </div>

            <div>
              <label className="label">Slogan Sponsor / Partener</label>
              <input
                type="text"
                value={sponsorTagline}
                onChange={(e) => setSponsorTagline(e.target.value)}
                className="input text-xs"
                placeholder="Partener Principal al Sportului Românesc"
              />
            </div>
          </div>
        </div>

        {/* Middle Column: Live Realistic Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Format Selector Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
            <button
              type="button"
              onClick={() => setFormat("story")}
              className={`px-6 py-2 rounded-full font-bold text-xs transition ${
                format === "story"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              📱 Story (9:16)
            </button>
            <button
              type="button"
              onClick={() => setFormat("post")}
              className={`px-6 py-2 rounded-full font-bold text-xs transition ${
                format === "post"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              🖼️ Post Pătrat (1:1)
            </button>
          </div>

          {/* Smartphone Frame */}
          <div
            className={`relative w-full max-w-[340px] rounded-[3rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-slate-950 ring-8 ring-slate-200 dark:ring-slate-800 text-white ${
              format === "story" ? "aspect-[9/16]" : "aspect-square"
            }`}
          >
            {/* Background Texture with Stadium glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary to-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Story Top Header */}
              <div className="relative z-10 flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xs">
                    ⚡
                  </div>
                  <span className="text-[11px] font-bold tracking-tight font-headline text-white uppercase">
                    {championshipName}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-lime-400 text-slate-950 font-label">
                  PRO LEAGUE
                </span>
              </div>

              {/* Match Versus Central Art */}
              <div className="relative z-10 text-center space-y-4 my-auto">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400 block animate-pulse">
                  ⚔️ MECIUL ETAPEI ⚔️
                </span>

                <div className="flex items-center justify-around">
                  {/* Home */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg border-2 border-white/20"
                      style={{ backgroundColor: selectedMatch.homeTeam.color || "#dc2626" }}
                    >
                      {selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="text-xs font-black font-headline mt-2 text-white truncate max-w-[90px]">
                      {selectedMatch.homeTeam.name}
                    </span>
                  </div>

                  <span className="text-2xl font-black italic font-headline text-lime-400">
                    VS
                  </span>

                  {/* Away */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg border-2 border-white/20"
                      style={{ backgroundColor: selectedMatch.awayTeam.color || "#1e3a8a" }}
                    >
                      {selectedMatch.awayTeam.shortName || selectedMatch.awayTeam.name.substring(0, 3).toUpperCase()}
                    </div>
                    <span className="text-xs font-black font-headline mt-2 text-white truncate max-w-[90px]">
                      {selectedMatch.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Match Info Pills */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
                    <p className="text-[8px] font-label text-slate-300 uppercase font-bold">
                      🏟️ ARENĂ
                    </p>
                    <p className="text-[10px] font-bold text-white truncate">
                      {selectedMatch.venue || "Arena Națională"}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
                    <p className="text-[8px] font-label text-slate-300 uppercase font-bold">
                      ⏰ ORA &amp; DATA
                    </p>
                    <p className="text-[10px] font-bold text-white truncate">
                      {new Date(selectedMatch.scheduledAt || Date.now()).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Ticket Price Box */}
                <div className="bg-lime-400 text-slate-950 p-2.5 rounded-xl text-center shadow-md font-black font-label text-xs">
                  🎟️ BILETE: {ticketPrice} RON • INTRARE LIVE
                </div>
              </div>

              {/* Sponsor & Ads Footer */}
              <div className="relative z-10 pt-2 border-t border-white/10 text-center">
                <p className="text-[8px] font-label text-slate-400 uppercase tracking-wider">
                  SPONSOR OFICIAL
                </p>
                <p className="text-[10px] font-black text-lime-400 uppercase font-headline">
                  {sponsorName}
                </p>
                <p className="text-[8px] text-slate-400 font-label">{sponsorTagline}</p>
              </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-slate-900 rounded-b-xl z-20"></div>
          </div>
        </div>

        {/* Right Column: Publish & Social Media Triggers (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
              3. Distribuie Direct pe Rețele
            </h3>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={shareWhatsApp}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs font-label transition shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">💬</span>
                <span>Trimite pe WhatsApp</span>
              </div>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={shareFacebook}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-label transition shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📘</span>
                <span>Postează pe Facebook</span>
              </div>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            {/* Copy Promo Link */}
            <button
              type="button"
              onClick={copyPromoLink}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs font-label transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>{copied ? "Link Copiat! ✓" : "Copiază Link Promo"}</span>
              </div>
            </button>
          </div>

          <div className="card p-6 bg-surface-container-low dark:bg-slate-800/40 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold font-headline text-blue-950 dark:text-white">
              💡 Sfaturi de Promovare
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Distribuie linkul în grupurile de suporteri cu 24h înainte de meci pentru a maximiza vânzarea de bilete și prezența spectatorilor în tribune!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
