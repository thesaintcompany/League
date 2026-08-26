"use client";

import React, { useEffect, useState } from "react";
import { MatchData } from "./MatchCard";

interface PromotionHubProps {
  matches: MatchData[];
  championshipName: string;
}

type FreeTicketCode = {
  code: string;
  maxRedemptions: number;
  redeemedCount: number;
};

export function PromotionHub({ matches, championshipName }: PromotionHubProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches[0]?.id || ""
  );
  const [format, setFormat] = useState<"story" | "post">("story");
  const [template, setTemplate] = useState<"kinetic" | "hyper" | "minimal">("kinetic");
  const [ticketPrice, setTicketPrice] = useState<number>(25);
  const [ticketUrl, setTicketUrl] = useState<string>("/tickets");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [arenaImage, setArenaImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [freeTicketCode, setFreeTicketCode] = useState<FreeTicketCode | null>(null);
  const [freeTicketLimit, setFreeTicketLimit] = useState(5);
  const [creatingFreeTicketCode, setCreatingFreeTicketCode] = useState(false);
  const [copiedFreeTicketCode, setCopiedFreeTicketCode] = useState(false);
  const [sponsorName, setSponsorName] = useState<string>("Banca Transilvania / Dedeman");
  const [sponsorTagline, setSponsorTagline] = useState<string>(
    "Partener Principal al Sportului Românesc"
  );
  const [copied, setCopied] = useState(false);

  // Linkurile promoționale folosesc mereu domeniul pe care este deschisă aplicația.
  useEffect(() => {
    setTicketUrl(`${window.location.origin}/tickets`);
  }, []);

  useEffect(() => {
    if (!selectedMatchId) return;
    fetch(`/api/matches/${selectedMatchId}/promo-codes`)
      .then((response) => response.json())
      .then((data) => {
        setFreeTicketCode(data.promoCode || null);
        if (data.promoCode?.maxRedemptions) setFreeTicketLimit(data.promoCode.maxRedemptions);
      })
      .catch(() => setFreeTicketCode(null));
  }, [selectedMatchId]);

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
    : `/matches/${selectedMatch.id}/promo`;

  const shareText = `🔥 MECIUL ETAPEI în ${championshipName}!\n⚽ ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}\n📍 Stadion: ${selectedMatch.venue || "Arena Oficială"}\n📅 Data: ${new Date(selectedMatch.scheduledAt || Date.now()).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}\n🎟️ Bilete (${ticketPrice} RON): ${ticketUrl}`;

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

  function shareX() {
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(`🔥 ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name} în ${championshipName}`)}&url=${encodeURIComponent(promoUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(promoUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareInstagram() {
    navigator.clipboard.writeText(promoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function generateFreeTicketCode() {
    if (!selectedMatch) return;
    setCreatingFreeTicketCode(true);
    try {
      const response = await fetch(`/api/matches/${selectedMatch.id}/promo-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxRedemptions: freeTicketLimit }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nu am putut genera codul.");
      setFreeTicketCode(data.promoCode);
    } catch (error: any) {
      setImageError(error.message || "Nu am putut genera codul pentru bilete gratuite.");
    } finally {
      setCreatingFreeTicketCode(false);
    }
  }

  function copyFreeTicketCode() {
    if (!freeTicketCode) return;
    navigator.clipboard.writeText(freeTicketCode.code);
    setCopiedFreeTicketCode(true);
    setTimeout(() => setCopiedFreeTicketCode(false), 2500);
  }

  function loadImage(file: File | undefined, target: "background" | "arena") {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Alege un fișier imagine (PNG, JPG, WebP sau SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Imaginea poate avea cel mult 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : null;
      if (target === "background") setBackgroundImage(image);
      else setArenaImage(image);
      setImageError(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <span className="material-symbols-outlined text-2xl">campaign</span>
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
                placeholder="https://domeniul-tau.ro/tickets"
              />
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 space-y-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-lg text-amber-600 dark:text-amber-300">confirmation_number</span>
                <div>
                  <p className="text-xs font-black font-headline text-amber-950 dark:text-amber-100">Bilete gratuite pentru influenceri</p>
                  <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-200">Codul se validează direct în pagina de bilete și emite bilete cu preț 0 RON.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Număr bilete</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={freeTicketLimit}
                  onChange={(event) => setFreeTicketLimit(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                  className="w-16 rounded-lg border border-amber-300 bg-white px-2 py-1.5 text-center text-xs font-black text-slate-900 outline-none focus:border-amber-500 dark:border-amber-500/40 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={generateFreeTicketCode}
                  disabled={creatingFreeTicketCode}
                  className="ml-auto rounded-lg bg-amber-400 px-2.5 py-1.5 text-[10px] font-black uppercase text-amber-950 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {creatingFreeTicketCode ? "Se creează..." : freeTicketCode ? "Regenerează" : "Generează"}
                </button>
              </div>

              {freeTicketCode && (
                <div className="flex items-center gap-2 rounded-xl bg-white p-2 dark:bg-slate-950">
                  <code className="min-w-0 flex-1 truncate text-xs font-black tracking-wider text-slate-900 dark:text-lime-400">{freeTicketCode.code}</code>
                  <button
                    type="button"
                    onClick={copyFreeTicketCode}
                    title="Copiază codul"
                    className="rounded-lg bg-slate-100 p-1.5 text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined text-base">{copiedFreeTicketCode ? "check" : "content_copy"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="label">Imagine de Fundal pentru Cartonaș</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-lime-400 hover:bg-lime-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-lime-400/10">
                <span className="material-symbols-outlined text-lg text-lime-600 dark:text-lime-400">add_photo_alternate</span>
                {backgroundImage ? "Înlocuiește fundalul" : "Încarcă fundalul"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(event) => loadImage(event.target.files?.[0], "background")}
                />
              </label>
              {backgroundImage && (
                <button
                  type="button"
                  onClick={() => setBackgroundImage(null)}
                  className="text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
                >
                  Elimină fundalul
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="label">Fotografie Arenă / Locație</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-cyan-400/10">
                <span className="material-symbols-outlined text-lg text-cyan-600 dark:text-cyan-400">stadium</span>
                {arenaImage ? "Înlocuiește fotografia arenei" : "Încarcă fotografia arenei"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(event) => loadImage(event.target.files?.[0], "arena")}
                />
              </label>
              {arenaImage && (
                <button
                  type="button"
                  onClick={() => setArenaImage(null)}
                  className="text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
                >
                  Elimină fotografia arenei
                </button>
              )}
            </div>

            {imageError && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                {imageError}
              </p>
            )}

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
            {backgroundImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImage}
                alt="Fundal cartonaș promoțional"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Background Texture with Stadium glow */}
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/90 via-primary/80 to-slate-950/90 p-6 flex flex-col justify-between overflow-hidden">
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
                  <div className="relative overflow-hidden bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/15">
                    {arenaImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={arenaImage}
                        alt={selectedMatch.venue || "Arena meciului"}
                        className="absolute inset-0 h-full w-full object-cover opacity-40"
                      />
                    )}
                    <div className="relative z-10">
                      <p className="text-[8px] font-label text-slate-300 uppercase font-bold">
                      🏟️ ARENĂ
                      </p>
                      <p className="text-[10px] font-bold text-white truncate">
                        {selectedMatch.venue || "Arena Națională"}
                      </p>
                    </div>
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

            <div className="grid grid-cols-3 gap-2.5">
              <button type="button" onClick={shareWhatsApp} title="Trimite pe WhatsApp" aria-label="Trimite pe WhatsApp" className="aspect-square rounded-2xl bg-emerald-500 text-xl text-white shadow-sm transition hover:bg-emerald-600 hover:scale-105 active:scale-95">💬</button>
              <button type="button" onClick={shareFacebook} title="Postează pe Facebook" aria-label="Postează pe Facebook" className="aspect-square rounded-2xl bg-blue-600 text-xl text-white shadow-sm transition hover:bg-blue-700 hover:scale-105 active:scale-95">f</button>
              <button type="button" onClick={shareX} title="Publică pe X" aria-label="Publică pe X" className="aspect-square rounded-2xl bg-slate-950 text-xl text-white shadow-sm transition hover:bg-slate-800 hover:scale-105 active:scale-95">𝕏</button>
              <button type="button" onClick={shareLinkedIn} title="Distribuie pe LinkedIn" aria-label="Distribuie pe LinkedIn" className="aspect-square rounded-2xl bg-sky-700 text-sm font-black text-white shadow-sm transition hover:bg-sky-800 hover:scale-105 active:scale-95">in</button>
              <button type="button" onClick={shareInstagram} title="Copiază linkul și deschide Instagram" aria-label="Copiază linkul și deschide Instagram" className="aspect-square rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-violet-600 text-xl text-white shadow-sm transition hover:brightness-110 hover:scale-105 active:scale-95"><span className="material-symbols-outlined">photo_camera</span></button>
              <button type="button" onClick={copyPromoLink} title={copied ? "Link copiat" : "Copiază linkul promo"} aria-label="Copiază linkul promo" className="aspect-square rounded-2xl bg-slate-100 text-slate-800 shadow-sm transition hover:bg-slate-200 hover:scale-105 active:scale-95 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"><span className="material-symbols-outlined">{copied ? "check" : "share"}</span></button>
            </div>
            <p className="text-center text-[10px] font-label text-slate-400">
              Pentru Instagram, linkul se copiază automat și se deschide aplicația web.
            </p>
          </div>

          <div className="card p-6 bg-surface-container-low dark:bg-slate-800/40 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold font-headline text-blue-950 dark:text-white">
              💡 Sfaturi de Promovare
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Distribuie linkul în grupurile de suporteri cu 48–24h înainte de meci. Apelează și la influenceri locali: oferă-le codul de bilete gratuite generat mai sus, pentru a-și putea imprima biletele direct din pagina meciului.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
