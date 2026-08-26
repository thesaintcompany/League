"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { VenueCalendar } from "./VenueCalendar";

interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isActive: boolean;
}

interface VenueData {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  specs?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  pricePerHour?: number | null;
  imageUrl?: string | null;
  ads?: string | null;
  announcements?: string | null;
  tickerText?: string | null;
  tickerActive?: boolean;
  tickerSpeed?: number;
  calendarSyncUrl?: string | null;
}

export function ArenaOwnerPanel({ initialVenue, initialMatches = [] }: { initialVenue: VenueData | null, initialMatches?: any[] }) {
  const [activeTab, setActiveTab] = useState<"config" | "ads" | "announcements" | "ticker" | "calendar">("config");

  const [matches, setMatches] = useState(initialMatches);

  // Arena Config State
  const [name, setName] = useState(initialVenue?.name || "");
  const [location, setLocation] = useState(initialVenue?.location || "");
  const [address, setAddress] = useState(initialVenue?.address || "");
  const [specs, setSpecs] = useState(initialVenue?.specs || "");
  const [sport, setSport] = useState(initialVenue?.sport || "fotbal");
  const [surface, setSurface] = useState(initialVenue?.surface || "Sintetic");
  const [capacity, setCapacity] = useState(initialVenue?.capacity || 0);
  const [floodlights, setFloodlights] = useState(initialVenue?.floodlights ?? true);
  const [pricePerHour, setPricePerHour] = useState(initialVenue?.pricePerHour || 0);
  const [imageUrl, setImageUrl] = useState(
    initialVenue?.imageUrl || "/images/stadium-hero.jpg"
  );

  // Advertising / Sponsor Banners State
  let parsedAds: AdItem[] = [];
  try {
    if (initialVenue?.ads) parsedAds = JSON.parse(initialVenue.ads);
  } catch {
    parsedAds = [];
  }
  const [ads, setAds] = useState<AdItem[]>(parsedAds);

  // New Ad Form Modal State
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState("");
  const [newAdImageUrl, setNewAdImageUrl] = useState("");
  const [newAdLinkUrl, setNewAdLinkUrl] = useState("");

  // Written Announcements State
  let parsedAnnouncements: AnnouncementItem[] = [];
  try {
    if (initialVenue?.announcements) parsedAnnouncements = JSON.parse(initialVenue.announcements);
  } catch {
    parsedAnnouncements = [];
  }
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(parsedAnnouncements);

  // New Announcement Form State
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");

  // Ticker Marquee State
  const [tickerText, setTickerText] = useState(
    initialVenue?.tickerText || ""
  );
  const [tickerActive, setTickerActive] = useState(initialVenue?.tickerActive ?? false);
  const [tickerSpeed, setTickerSpeed] = useState(initialVenue?.tickerSpeed || 18);

  // Calendar Sync State
  const [calendarSyncUrl, setCalendarSyncUrl] = useState(initialVenue?.calendarSyncUrl || "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Double Click Photo Change Modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ARENA_PRESETS = [
    {
      label: "Teren Sintetic Nocturnă",
      url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Stadion Mare Luminat",
      url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Sală Sport & Parchet",
      url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Complex Modern Timiș",
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
  ];

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const res = uploadEvent.target?.result as string;
      if (res) {
        setImageUrl(res);
        setShowPhotoModal(false);
        setMessage({
          text: "Fotografia arenei a fost actualizată! Apasă pe Salvează Modificările pentru a păstra modificările. ✓",
          type: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddAd(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdImageUrl.trim()) return;
    const newAd: AdItem = {
      id: `ad-${Date.now()}`,
      title: newAdTitle.trim(),
      imageUrl: newAdImageUrl.trim(),
      linkUrl: newAdLinkUrl.trim() || "#",
      isActive: true,
    };
    setAds([newAd, ...ads]);
    setNewAdTitle("");
    setNewAdImageUrl("");
    setNewAdLinkUrl("");
    setShowAddAdModal(false);
    setMessage({ text: "Reclama / Bannerul sponsorului a fost adăugată! ✓", type: "success" });
  }

  function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      date: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    setAnnouncements([newAnn, ...announcements]);
    setNewAnnTitle("");
    setNewAnnContent("");
    setShowAddAnnModal(false);
    setMessage({ text: "Anunțul scris a fost publicat cu succes! ✓", type: "success" });
  }

  async function handleSaveAll() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/arena", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          address,
          specs,
          sport,
          surface,
          capacity,
          floodlights,
          pricePerHour,
          imageUrl,
          ads,
          announcements,
          tickerText,
          tickerActive,
          tickerSpeed,
          calendarSyncUrl,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Eroare la salvare");
      }

      setMessage({
        text: "Configurația arenei, reclamele și ticker-ul au fost salvate cu succes! ✓",
        type: "success",
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMatch(id: string) {
    try {
      const res = await fetch(`/api/arena/matches/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Eroare la ștergerea evenimentului");
      
      setMatches((prev) => prev.filter((m) => m.id !== id));
      setMessage({ text: "Evenimentul a fost eliminat din calendarul arenei! ✓", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "A apărut o eroare", type: "error" });
    }
  }

  return (
    <div className="space-y-8 font-body">
      {/* Hidden File Input for Double Click Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Banner */}
      <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg">
            🏟️
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
                PROPRIETAR ARENĂ
              </span>
              <span className="text-xs text-slate-400 font-label">
                Panou Oficial de Gestiune
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-headline text-blue-950 dark:text-white leading-tight">
              {name}
            </h1>
            <p className="text-xs text-slate-500 font-label mt-0.5">
              📍 {location} {address ? `• ${address}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {initialVenue?.id && (
            <Link
              href={`/venues/${initialVenue.id}`}
              target="_blank"
              className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-3 px-5 rounded-2xl"
            >
              Vezi Pagina Publică a Arenei ↗
            </Link>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-400/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? "Se salvează..." : "Salvează Toate Modificările ✓"}
          </button>
        </div>
      </div>

      {/* Live Scrolling Ticker Banner Preview */}
      {tickerActive && tickerText && (
        <div className="bg-primary text-white rounded-2xl p-3.5 shadow-md flex items-center gap-3 overflow-hidden border border-lime-400/40">
          <div className="px-3 py-1 rounded-xl bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label flex items-center gap-1.5 shrink-0 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            TICKER LIVE
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div
              className="inline-block font-headline font-bold text-xs text-lime-300 animate-marquee"
              style={{ animationDuration: `${tickerSpeed}s` }}
            >
              {tickerText} • {name} • Tarif: {pricePerHour} RON/oră • Nocturnă LED: {floodlights ? "Disponibilă ✓" : "Indisponibilă"}
            </div>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold font-label flex items-center gap-2 shadow-sm ${
            message.type === "success"
              ? "bg-lime-100 text-lime-900 border border-lime-300"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          {message.text}
        </div>
      )}

      {/* Tab Navigation Navigation */}
      <div className="flex border-b border-slate-200/60 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`px-5 py-3 rounded-t-2xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "config"
              ? "bg-surface-container-lowest text-blue-950 dark:text-lime-400 border-t-2 border-lime-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          1. Configurare Bază Sportivă
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ads")}
          className={`px-5 py-3 rounded-t-2xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "ads"
              ? "bg-surface-container-lowest text-blue-950 dark:text-lime-400 border-t-2 border-lime-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">ad_units</span>
          2. Loc de Reclame &amp; Bannere ({ads.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`px-5 py-3 rounded-t-2xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "announcements"
              ? "bg-surface-container-lowest text-blue-950 dark:text-lime-400 border-t-2 border-lime-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">campaign</span>
          3. Anunțuri Scrise ({announcements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticker")}
          className={`px-5 py-3 rounded-t-2xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "ticker"
              ? "bg-surface-container-lowest text-blue-950 dark:text-lime-400 border-t-2 border-lime-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">rss_feed</span>
          4. Ticker Marquee Defilant
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-3 rounded-t-2xl font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "calendar"
              ? "bg-surface-container-lowest text-blue-950 dark:text-lime-400 border-t-2 border-lime-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          5. Calendar Google Sync 📅
        </button>
      </div>

      {/* TAB 5: CALENDAR ARENĂ GOOGLE SYNC */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 max-w-3xl">
            <div>
              <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Sincronizare Calendar Extern (.ics)
              </h3>
              <p className="text-xs text-slate-500 font-label mt-1">
                Adaugă un link `.ics` (ex: din Google Calendar) pentru a bloca automat sloturile ocupate din alte surse. Sincronizarea se face automat o dată la o oră.
              </p>
            </div>
            
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="label">URL Calendar Extern (.ics)</label>
                <input
                  type="url"
                  className="input text-xs"
                  value={calendarSyncUrl}
                  onChange={(e) => setCalendarSyncUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-3.5 rounded-xl bg-slate-900 dark:bg-lime-400 text-white dark:text-slate-950 font-headline font-bold text-xs uppercase transition active:scale-95 whitespace-nowrap h-[46px]"
              >
                Salvează Link-ul
              </button>
            </div>
          </div>

          <VenueCalendar 
            venueId={initialVenue?.id}
            venueName={name} 
            county={location} 
            surface={surface} 
            matches={matches} 
            onDeleteMatch={handleDeleteMatch}
          />
        </div>
      )}

      {/* TAB 1: CONFIGURARE ARENĂ */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Visual Photo with Double Click */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                Imagine Principală Arenă
              </span>

              {/* Double-Click Photo Container */}
              <div
                onDoubleClick={() => setShowPhotoModal(true)}
                title="Dublu-click pentru a schimba poza arenei"
                className="h-64 rounded-2xl overflow-hidden relative bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4 text-white">
                  <span className="w-12 h-12 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mb-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    <span className="material-symbols-outlined text-2xl">photo_camera</span>
                  </span>
                  <p className="font-headline font-black text-xs uppercase text-white">
                    Dublu-click pe poză
                  </p>
                  <p className="text-[11px] text-lime-300 font-label">
                    pentru a încărca o poză nouă
                  </p>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[10px] font-black uppercase px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white font-label">
                  <span>{sport} • {surface}</span>
                  <span className="text-lime-400">{capacity} Locuri</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500 font-label">
                  💡 Dublu-click pe imagine pentru schimbare rapidă
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                >
                  Încarcă Fișier 📁
                </button>
              </div>
            </div>
          </div>

          {/* Right Parameters Form */}
          <div className="lg:col-span-7 card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Parametri Tehnici Arenă
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Denumire Arenă / Bază Sportivă *</label>
                <input
                  type="text"
                  required
                  className="input text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Baza Sportivă Vasport"
                />
              </div>

              <div>
                <label className="label">Oraș / Localitate *</label>
                <input
                  type="text"
                  required
                  className="input text-xs"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex: Timișoara"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Adresă Detaliată</label>
                <input
                  type="text"
                  className="input text-xs"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Calea Șagului nr. 175, Timișoara"
                />
              </div>

              <div>
                <label className="label">Sport Principal</label>
                <select
                  className="input text-xs"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                >
                  <option value="fotbal">⚽ Fotbal / Minifotbal</option>
                  <option value="baschet">🏀 Baschet</option>
                  <option value="volei">🏐 Volei / Volei pe Nisip</option>
                  <option value="multifunctional">🏟️ Multifuncțional / Bază Mixtă</option>
                </select>
              </div>

              <div>
                <label className="label">Tip Suprafață Joc</label>
                <select
                  className="input text-xs"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                >
                  <option value="Sintetic">Gazon Sintetic Profesional</option>
                  <option value="Gazon Natural">Gazon Natural</option>
                  <option value="Parchet">Parchet Indoor</option>
                  <option value="Tartan">Tartan / Cauciucat</option>
                  <option value="Nisip">Nisip Fin</option>
                </select>
              </div>

              <div>
                <label className="label">Capacitate Spectatori</label>
                <input
                  type="number"
                  min={0}
                  className="input text-xs font-bold"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label">Tarif Închiriere (RON / Oră)</label>
                <input
                  type="number"
                  min={0}
                  className="input text-xs font-bold"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Specificații Tehnice &amp; Dotări</label>
                <textarea
                  rows={2}
                  className="input text-xs"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="ex: Teren acoperit iarna cu balon presostatic, încălzire, vestiare cu dușuri calde, parcare proprie..."
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
                <div>
                  <span className="font-headline font-bold text-xs text-blue-950 dark:text-white block">
                    Nocturnă LED Omologată
                  </span>
                  <span className="text-[11px] text-slate-500 font-label">
                    Permite desfășurarea meciurilor oficiale în nocturnă
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFloodlights(!floodlights)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-label transition ${
                    floodlights
                      ? "bg-lime-400 text-slate-950 shadow-sm"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {floodlights ? "Activată ✓" : "Dezactivată"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOC DE RECLAME (BANNERE SPONSORI) */}
      {activeTab === "ads" && (
        <div className="space-y-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Bannere Reclame &amp; Sponsori Arenă
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Adaugă afișe, bannere sau reclame ale partenerilor comerciali care vor apărea pe pagina oficială a arenei tale.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAdModal(true)}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Adaugă Reclamă Nouă
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-label ${
                          ad.isActive
                            ? "bg-lime-400 text-slate-950"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {ad.isActive ? "Activă ✓" : "Inactivă"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-headline font-bold text-base text-blue-950 dark:text-white leading-tight">
                      {ad.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-label truncate">
                      Link: {ad.linkUrl}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAds(
                        ads.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a))
                      );
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-lime-600 font-label"
                  >
                    {ad.isActive ? "Dezactivează" : "Activează"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAds(ads.filter((a) => a.id !== ad.id));
                    }}
                    className="text-xs font-bold text-red-500 hover:underline font-label"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANUNȚURI SCRISE */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Anunțuri &amp; Notificări Scrise
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Publică comunicate, modificări de orar, turnee de weekend sau anunțuri pentru echipe și spectatori.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAnnModal(true)}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Scrie Anunț Nou
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                      📅 {ann.date}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-label ${
                        ann.isActive
                          ? "bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {ann.isActive ? "Publicat ✓" : "Ciornă"}
                    </span>
                  </div>

                  <h4 className="font-headline font-bold text-lg text-blue-950 dark:text-white leading-tight">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed mt-2">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncements(
                        announcements.map((a) =>
                          a.id === ann.id ? { ...a, isActive: !a.isActive } : a
                        )
                      );
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-lime-600 font-label"
                  >
                    {ann.isActive ? "Ascunde Anunțul" : "Publică Anunțul"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncements(announcements.filter((a) => a.id !== ann.id));
                    }}
                    className="text-xs font-bold text-red-500 hover:underline font-label"
                  >
                    Șterge Anunț
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TICKER DEFILANT MARQUEE */}
      {activeTab === "ticker" && (
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6 max-w-3xl">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                Bandă Text Defilantă (Ticker Marquee)
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Mesaj dinamic care defilează continuu în partea de sus a paginii arenei tale.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTickerActive(!tickerActive)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-label transition ${
                tickerActive
                  ? "bg-lime-400 text-slate-950 shadow-md"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {tickerActive ? "Ticker Activat ✓" : "Ticker Oprit"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Mesaj Text Ticker *</label>
              <textarea
                rows={3}
                required
                className="input text-xs font-medium"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="ex: 🔥 Rezervă acum terenul de fotbal cu nocturnă! Locuri libere în fiecare seară..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label">Viteză de Defilare: {tickerSpeed} secunde</label>
                <span className="text-[10px] text-slate-400 font-label">
                  (Mai puține secunde = defilare mai rapidă)
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={40}
                step={2}
                value={tickerSpeed}
                onChange={(e) => setTickerSpeed(parseInt(e.target.value))}
                className="w-full accent-lime-400"
              />
            </div>

            {/* Live Ticker Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
                Previzualizare Live Bandă Defilantă
              </span>
              <div className="overflow-hidden whitespace-nowrap py-2 bg-slate-950 rounded-xl px-4 border border-lime-400/30">
                <div
                  className="inline-block font-headline font-bold text-xs text-lime-400 animate-marquee"
                  style={{ animationDuration: `${tickerSpeed}s` }}
                >
                  {tickerText || "Introdu un mesaj pentru ticker..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adaugă Reclamă Nouă */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAd}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-white"
          >
            <h3 className="font-headline font-black text-xl uppercase tracking-tight text-white">
              Adaugă Banner Sponsor / Reclamă
            </h3>

            <div>
              <label className="block text-[10px] font-label font-bold text-slate-400 uppercase mb-1">
                Titlu Sponsor / Partener *
              </label>
              <input
                type="text"
                required
                className="input text-xs bg-slate-950 border-slate-700 text-white w-full"
                value={newAdTitle}
                onChange={(e) => setNewAdTitle(e.target.value)}
                placeholder="ex: Echipamente Sportive Timiș"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold text-slate-400 uppercase mb-1">
                URL Imagine Banner *
              </label>
              <input
                type="url"
                required
                className="input text-xs bg-slate-950 border-slate-700 text-white w-full"
                value={newAdImageUrl}
                onChange={(e) => setNewAdImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold text-slate-400 uppercase mb-1">
                Link Redirecționare (Click)
              </label>
              <input
                type="url"
                className="input text-xs bg-slate-950 border-slate-700 text-white w-full"
                value={newAdLinkUrl}
                onChange={(e) => setNewAdLinkUrl(e.target.value)}
                placeholder="https://sponsor.ro"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddAdModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-label uppercase"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-black text-xs font-headline uppercase shadow-md"
              >
                Adaugă Reclama ✓
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Adaugă Anunț Scris */}
      {showAddAnnModal && (
        <form
          onSubmit={handleAddAnnouncement}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-white">
            <h3 className="font-headline font-black text-xl uppercase tracking-tight text-white">
              Publică Anunț Scris
            </h3>

            <div>
              <label className="block text-[10px] font-label font-bold text-slate-400 uppercase mb-1">
                Titlu Anunț *
              </label>
              <input
                type="text"
                required
                className="input text-xs bg-slate-950 border-slate-700 text-white w-full"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                placeholder="ex: Program Nocturnă și Tarife Speciale"
              />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold text-slate-400 uppercase mb-1">
                Conținut Anunț *
              </label>
              <textarea
                rows={4}
                required
                className="input text-xs bg-slate-950 border-slate-700 text-white w-full"
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                placeholder="Scrie textul detaliat al comunicatului..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddAnnModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-label uppercase"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-black text-xs font-headline uppercase shadow-md"
              >
                Publică Anunțul ✓
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal: Schimbă Poză Arenă (Double-Click) */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400 block mb-1">
                  Schimbă Fotografia Arenei
                </span>
                <h3 className="font-headline font-black text-xl uppercase tracking-tight text-white">
                  Poză Principală Bază Sportivă
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Option 1: File Upload */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 1: Încarcă din Dispozitiv
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">upload_file</span>
                Selectează Fișier Poză de pe PC / Telefon
              </button>
            </div>

            {/* Option 2: Direct URL */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 2: Introdu URL Direct
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 w-full focus:outline-none focus:border-lime-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoInput.trim()) {
                      setImageUrl(customPhotoInput.trim());
                      setCustomPhotoInput("");
                      setShowPhotoModal(false);
                      setMessage({ text: "Poza arenei a fost actualizată! ✓", type: "success" });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase font-label transition"
                >
                  Aplică
                </button>
              </div>
            </div>

            {/* Option 3: Presets */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 3: Alege din Preseturi
              </span>
              <div className="grid grid-cols-2 gap-2">
                {ARENA_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(p.url);
                      setShowPhotoModal(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-lime-400 text-left text-xs font-bold text-slate-300 transition flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-lime-400">check</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
