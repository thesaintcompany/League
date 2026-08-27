"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

interface AmenityItem {
  key: string;
  label: string;
  detail: string;
  icon: string;
  enabled: boolean;
}

interface VenueData {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  specs?: string | null;
  amenities?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  pricePerHour?: number | null;
  imageUrl?: string | null;
  galleryImages?: string | null;
  ads?: string | null;
  announcements?: string | null;
  tickerText?: string | null;
  tickerActive?: boolean;
  tickerSpeed?: number;
  calendarSyncUrl?: string | null;
}

export const ARENA_SPORTS_OPTIONS = [
  { id: "fotbal", label: "Fotbal & Minifotbal", icon: "sports_soccer" },
  { id: "tenis", label: "Tenis de Câmp", icon: "sports_tennis" },
  { id: "padel", label: "Padel  ", icon: "sports_tennis" },
  { id: "pingpong", label: "Tenis de Masă (Ping-Pong)", icon: " " },
  { id: "baschet", label: "Baschet 5x5 & 3x3", icon: "sports_basketball" },
  { id: "volei", label: "Volei / Beach Volley", icon: "sports_volleyball" },
  { id: "handbal", label: "Handbal", icon: "sports_handball" },
  { id: "multifunctional", label: "Multifuncțional / Mixt", icon: "stadium" },
];

export function parseVenueSports(val?: string | null): string[] {
  if (!val) return ["fotbal"];
  const list = val
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.length > 0 ? list : ["fotbal"];
}

export function ArenaOwnerPanel({
  initialVenue,
  initialMatches = [],
  initialTab,
}: {
  initialVenue: VenueData | null;
  initialMatches?: any[];
  initialTab?: "config" | "championships" | "ads" | "announcements" | "ticker" | "calendar";
}) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const queryTab =
    requestedTab === "championships" ||
      requestedTab === "ads" ||
      requestedTab === "announcements" ||
      requestedTab === "ticker" ||
      requestedTab === "calendar"
      ? requestedTab
      : "config";
  const [activeTab, setActiveTab] = useState<
    "config" | "championships" | "ads" | "announcements" | "ticker" | "calendar"
  >(initialTab || queryTab);

  const [venueId, setVenueId] = useState<string>(initialVenue?.id || "");
  const [matches, setMatches] = useState(initialMatches);

  // Arena Config State
  const [name, setName] = useState(initialVenue?.name || "");
  const [location, setLocation] = useState(initialVenue?.location || "");
  const [address, setAddress] = useState(initialVenue?.address || "");
  const [specs, setSpecs] = useState(initialVenue?.specs || "");
  const [selectedSports, setSelectedSports] = useState<string[]>(() =>
    parseVenueSports(initialVenue?.sport)
  );
  const [sport, setSport] = useState(initialVenue?.sport || "fotbal");
  const [surface, setSurface] = useState(initialVenue?.surface || "Sintetic");
  const [capacity, setCapacity] = useState(initialVenue?.capacity || 0);
  const [floodlights, setFloodlights] = useState(initialVenue?.floodlights ?? true);
  const [pricePerHour, setPricePerHour] = useState(initialVenue?.pricePerHour || 0);
  const [imageUrl, setImageUrl] = useState(
    initialVenue?.imageUrl || "/images/stadium-hero.jpg"
  );
  const defaultGalleryImages = [
    imageUrl,
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80",
  ];
  let savedGalleryImages = defaultGalleryImages;
  try {
    const parsedGalleryImages = initialVenue?.galleryImages
      ? JSON.parse(initialVenue.galleryImages)
      : [];
    if (Array.isArray(parsedGalleryImages)) {
      savedGalleryImages = defaultGalleryImages.map(
        (fallback, index) => parsedGalleryImages[index] || fallback
      );
    }
  } catch {
    savedGalleryImages = defaultGalleryImages;
  }
  const [galleryImages, setGalleryImages] = useState(savedGalleryImages);

  const amenityDefaults: AmenityItem[] = [
    { key: "parking", label: "Parcare", detail: "", icon: "local_parking", enabled: false },
    { key: "vip", label: "Loje VIP / Lounge", detail: "", icon: "workspace_premium", enabled: false },
    { key: "video", label: "Sistem video", detail: "Camere video pentru securitate", icon: "videocam", enabled: false },
    { key: "wifi", label: "Wi-Fi spectatori", detail: "", icon: "wifi", enabled: false },
    { key: "changing_rooms", label: "Vestiare și dușuri", detail: "", icon: "meeting_room", enabled: false },
    { key: "medical", label: "Punct medical", detail: "", icon: "medical_services", enabled: false },
    { key: "accessibility", label: "Accesibilitate dizabilități", detail: "", icon: "accessible", enabled: false },
    { key: "catering", label: "Catering și alimentație", detail: "", icon: "restaurant", enabled: false },
    { key: "press", label: "Zonă presă și transmisie", detail: "", icon: "podcasts", enabled: false },
    { key: "heating", label: "Climatizare / încălzire", detail: "", icon: "thermostat", enabled: false },
  ];
  let savedAmenities: AmenityItem[] = amenityDefaults;
  try {
    const parsedAmenities = initialVenue?.amenities ? JSON.parse(initialVenue.amenities) : [];
    if (Array.isArray(parsedAmenities)) {
      savedAmenities = amenityDefaults.map((defaultAmenity) => {
        const saved = parsedAmenities.find((amenity: AmenityItem) => amenity.key === defaultAmenity.key);
        return saved ? { ...defaultAmenity, ...saved } : defaultAmenity;
      });
      parsedAmenities
        .filter((amenity: AmenityItem) => !amenityDefaults.some((item) => item.key === amenity.key))
        .forEach((amenity: AmenityItem) => savedAmenities.push(amenity));
    }
  } catch {
    savedAmenities = amenityDefaults;
  }
  const [amenities, setAmenities] = useState<AmenityItem[]>(savedAmenities);
  const [parkingSpaces, setParkingSpaces] = useState("");

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
  const [tickerText, setTickerText] = useState(initialVenue?.tickerText || "");
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
        setGalleryImages((current) => [res, ...current.slice(1)]);
        setShowPhotoModal(false);
        setMessage({
          text: "Fotografia arenei a fost actualizată.",
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
    setMessage({ text: "Bannerul sponsorului a fost adăugat.", type: "success" });
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
    setMessage({ text: "Anunțul a fost publicat cu succes.", type: "success" });
  }

  function toggleSport(sportId: string) {
    let updated: string[];
    if (selectedSports.includes(sportId)) {
      if (selectedSports.length === 1) {
        updated = [sportId];
      } else {
        updated = selectedSports.filter((s) => s !== sportId);
      }
    } else {
      updated = [...selectedSports, sportId];
    }
    setSelectedSports(updated);
    setSport(updated.join(", "));
  }

  async function handleSaveAll() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/arena", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: venueId || initialVenue?.id,
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
          galleryImages,
          amenities,
          ads,
          announcements,
          tickerText,
          tickerActive,
          tickerSpeed,
          calendarSyncUrl,
        }),
      });

      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(d.error || "Eroare la salvare");
      }

      if (d.venue?.id) {
        setVenueId(d.venue.id);
      }

      setMessage({
        text: "Configurația arenei a fost salvată cu succes.",
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
      setMessage({ text: "Evenimentul a fost eliminat din calendar.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "A apărut o eroare", type: "error" });
    }
  }

  const arenaChampionships = Array.from(
    new Map(
      matches
        .filter((match) => match.championshipId)
        .map((match) => [match.championshipId, match])
    ).values()
  );

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Hidden File Input for Double Click Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Banner - Refined & Sleek */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-lime-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl font-light">stadium</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold tracking-wider uppercase">
                Proprietar
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                Panou de gestiune
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white truncate">
              {name || "Configurare Arenă"}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
              <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
              <span className="truncate">{location || "Locație nesetată"}</span>
              {address && <span className="truncate text-slate-400">• {address}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {(venueId || initialVenue?.id) ? (
            <Link
              href={`/venues/${venueId || initialVenue?.id}`}
              target="_blank"
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              title="Deschide pagina publică a arenei într-un tab nou"
            >
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              <span>Vezi Pagina Publică</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-medium text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>{saving ? "Se salvează..." : "Salvează Modificările"}</span>
          </button>
        </div>
      </div>

      {/* Live Scrolling Ticker Banner Preview */}
      {tickerActive && tickerText && (
        <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-sm flex items-center gap-3 overflow-hidden border border-slate-800">
          <div className="px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
            Ticker Live
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div
              className="inline-block text-xs font-normal text-slate-200 animate-marquee"
              style={{ animationDuration: `${tickerSpeed}s` }}
            >
              {tickerText} • {name} • Tarif: {pricePerHour} RON/oră • Nocturnă: {floodlights ? "Disponibilă" : "Indisponibilă"}
            </div>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm ${message.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
            : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50"
            }`}
        >
          <span className="material-symbols-outlined text-base">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Navigation - Slim Segment Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "config"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Configurare</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("championships")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "championships"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">emoji_events</span>
          <span>Campionate ({arenaChampionships.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ads")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "ads"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">ad_units</span>
          <span>Reclame ({ads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcements")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "announcements"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          <span>Anunțuri ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticker")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "ticker"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">rss_feed</span>
          <span>Ticker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${activeTab === "calendar"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          <span>Calendar</span>
        </button>
      </div>

      {activeTab === "championships" && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Campionate programate pe arena ta</h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">Lista include meciurile care aparțin calendarului acestei arene.</p>
          </div>

          {arenaChampionships.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm text-xs text-slate-500">
              Nu există campionate cu meciuri programate pe această arenă.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {arenaChampionships.map((championship) => (
                <div key={championship.championshipId} className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Campionat pe arenă</span>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">{championship.championshipName}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/campionat?id=${championship.championshipId}`} target="_blank" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Vezi Campionatul</Link>
                    <Link href={`/brackets?id=${championship.championshipId}`} target="_blank" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Bracket</Link>
                    <Link href={`/matches/${championship.id}/promo`} target="_blank" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 dark:bg-lime-400 text-white dark:text-slate-950">Promo Meci</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CALENDAR ARENĂ GOOGLE SYNC */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 max-w-3xl">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Sincronizare Calendar Extern (.ics)
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Adaugă un link .ics (ex: Google Calendar) pentru blocarea automată a sloturilor ocupate extern.
              </p>
            </div>

            <div className="flex items-end gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">URL Calendar Extern (.ics)</label>
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
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-lime-400 text-white dark:text-slate-950 font-medium text-xs transition active:scale-95 whitespace-nowrap h-[40px]"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Visual Photo with Double Click */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Imagine Principală
                </span>
                <span className="text-[11px] text-slate-400">Dublu-click pentru schimbare</span>
              </div>

              {/* Double-Click Photo Container */}
              <div
                onDoubleClick={() => setShowPhotoModal(true)}
                title="Dublu-click pentru a schimba poza arenei"
                className="h-60 rounded-xl overflow-hidden relative bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4 text-white">
                  <span className="w-10 h-10 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mb-1.5 shadow-md">
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                  </span>
                  <p className="font-medium text-xs text-white">
                    Schimbă fotografia
                  </p>
                  <p className="text-[11px] text-lime-300">
                    Dublu-click pe imagine
                  </p>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-medium px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white">
                  <span className="truncate mr-2">{sport} • {surface}</span>
                  <span className="text-lime-400 shrink-0">{capacity} Locuri</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-400">
                  Selectează un fișier din calculator:
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-slate-700 dark:text-lime-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">upload_file</span>
                  <span>Încarcă Fișier</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Galerie Foto Publică</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cele patru imagini afișate pe pagina de prezentare a arenei.</p>
                </div>
                {galleryImages.map((galleryImage, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-10 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={galleryImage} alt={`Cadru galerie ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <input
                      type="url"
                      className="input text-xs flex-1"
                      value={galleryImage}
                      onChange={(event) =>
                        setGalleryImages(
                          galleryImages.map((image, imageIndex) =>
                            imageIndex === index ? event.target.value : image
                          )
                        )
                      }
                      placeholder={`URL imagine ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Parameters Form */}
          <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Parametri Tehnici Arenă
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Denumire Arenă / Bază Sportivă *</label>
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
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Oraș / Localitate *</label>
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
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Adresă Detaliată</label>
                <input
                  type="text"
                  className="input text-xs"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Calea Șagului nr. 175, Timișoara"
                />
              </div>

              {/* Sporturi Suportate - Selectare Multiplă / Bife (Fără Emoji) */}
              <div className="sm:col-span-2 space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Discipline Sportive Suportate (Selectare multiplă) *
                    </label>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Bifează toate sporturile pe care baza le poate găzdui (ex: Tenis, Padel, Fotbal etc.)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSports.map((sId) => {
                      const item = ARENA_SPORTS_OPTIONS.find((opt) => opt.id === sId);
                      return (
                        <span
                          key={sId}
                          className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">{item?.icon || "sports"}</span>
                          <span>{item?.label.split(" ")[0] || sId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {ARENA_SPORTS_OPTIONS.map((sportOpt) => {
                    const isChecked = selectedSports.includes(sportOpt.id);
                    return (
                      <label
                        key={sportOpt.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer select-none ${isChecked
                          ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-slate-900 dark:border-slate-700 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSport(sportOpt.id)}
                          className="w-3.5 h-3.5 rounded text-lime-500 accent-lime-400 focus:ring-0"
                        />
                        <span className="material-symbols-outlined text-[16px] opacity-80">{sportOpt.icon}</span>
                        <span className="text-xs truncate font-medium">{sportOpt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Tip Suprafață Principală</label>
                <select
                  className="input text-xs"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                >
                  <option value="Sintetic">Gazon Sintetic Profesional</option>
                  <option value="Zgură">Zgură (Tenis)</option>
                  <option value="Hard / Acrilic">Hard / Acrilic / Ciment (Tenis / Padel)</option>
                  <option value="Gazon Natural">Gazon Natural</option>
                  <option value="Parchet">Parchet Indoor</option>
                  <option value="Tartan">Tartan / Cauciucat</option>
                  <option value="Nisip">Nisip Fin (Beach Volley / Tenis)</option>
                  <option value="Mixt">Mixt / Polivalent</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Capacitate Spectatori</label>
                <input
                  type="number"
                  min={0}
                  className="input text-xs"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Tarif Închiriere (RON / Oră)</label>
                <input
                  type="number"
                  min={0}
                  className="input text-xs"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Specificații Tehnice &amp; Dotări</label>
                <textarea
                  rows={2}
                  className="input text-xs"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="ex: Teren acoperit iarna cu balon presostatic, încălzire, vestiare cu dușuri, parcare proprie..."
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    Nocturnă LED Omologată
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Permite desfășurarea meciurilor  e în nocturnă
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFloodlights(!floodlights)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${floodlights
                    ? "bg-lime-400 text-slate-950 font-semibold shadow-sm"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                >
                  {floodlights ? "Activată" : "Dezactivată"}
                </button>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Dotări &amp; Facilități Publice</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bifează facilitățile disponibile la această arenă.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {amenities.map((amenity, index) => (
                    <label key={amenity.key} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={amenity.enabled}
                        onChange={(event) =>
                          setAmenities(
                            amenities.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, enabled: event.target.checked } : item
                            )
                          )
                        }
                        className="mt-0.5 h-3.5 w-3.5 accent-lime-400 rounded"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-900 dark:text-white truncate">
                          <span className="material-symbols-outlined text-[15px] text-slate-500 dark:text-slate-400">{amenity.icon}</span>
                          <span>{amenity.label}</span>
                        </span>
                        {amenity.key === "parking" && amenity.enabled && (
                          <input
                            type="number"
                            min={0}
                            value={parkingSpaces}
                            onChange={(event) => {
                              setParkingSpaces(event.target.value);
                              setAmenities(
                                amenities.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, detail: event.target.value ? `${event.target.value} locuri disponibile` : "" }
                                    : item
                                )
                              );
                            }}
                            placeholder="Număr locuri"
                            className="input mt-1.5 text-xs"
                          />
                        )}
                        {amenity.key !== "parking" && amenity.enabled && (
                          <input
                            type="text"
                            value={amenity.detail}
                            onChange={(event) =>
                              setAmenities(
                                amenities.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, detail: event.target.value } : item
                                )
                              )
                            }
                            placeholder="Detalii (opțional)"
                            className="input mt-1.5 text-xs"
                          />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOC DE RECLAME (BANNERE SPONSORI) */}
      {activeTab === "ads" && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Bannere Reclame &amp; Sponsori Arenă
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Afișează bannere ale partenerilor comerciali pe pagina  ă a arenei tale.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAdModal(true)}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Adaugă Reclamă</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-slate-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${ad.isActive
                          ? "bg-emerald-500/90 text-white"
                          : "bg-slate-800 text-slate-300"
                          }`}
                      >
                        {ad.isActive ? "Activă" : "Inactivă"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {ad.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {ad.linkUrl}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAds(
                        ads.map((a) => (a.id === ad.id ? { ...a, isActive: !a.isActive } : a))
                      );
                    }}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {ad.isActive ? "Dezactivează" : "Activează"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAds(ads.filter((a) => a.id !== ad.id));
                    }}
                    className="text-xs font-medium text-red-500 hover:underline"
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
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Anunțuri &amp; Notificări Scrise
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Publică comunicate, modificări de orar sau anunțuri pentru echipe și spectatori.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAnnModal(true)}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Scrie Anunț</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-medium text-slate-400">
                      {ann.date}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${ann.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                    >
                      {ann.isActive ? "Publicat" : "Ciornă"}
                    </span>
                  </div>

                  <h4 className="font-semibold text-base text-slate-900 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal leading-relaxed mt-1">
                    {ann.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncements(
                        announcements.map((a) =>
                          a.id === ann.id ? { ...a, isActive: !a.isActive } : a
                        )
                      );
                    }}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {ann.isActive ? "Ascunde" : "Publică"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncements(announcements.filter((a) => a.id !== ann.id));
                    }}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TICKER DEFILANT */}
      {activeTab === "ticker" && (
        <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-5 max-w-3xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Bandă Text Defilantă (Ticker Marquee)
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Mesaj dinamic care defilează în partea de sus a paginii arenei tale.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTickerActive(!tickerActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${tickerActive
                ? "bg-lime-400 text-slate-950 font-semibold shadow-sm"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
            >
              {tickerActive ? "Ticker Activat" : "Ticker Oprit"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Mesaj Text Ticker *</label>
              <textarea
                rows={3}
                required
                className="input text-xs font-normal"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="ex: Rezervă acum terenul de tenis sau padel cu nocturnă. Programul de weekend este deschis."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Viteză de Defilare: {tickerSpeed} secunde</label>
                <span className="text-[10px] text-slate-400">
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
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Previzualizare Live Ticker
              </span>
              <div className="overflow-hidden whitespace-nowrap py-1.5 bg-slate-950 rounded-lg px-3 border border-slate-800">
                <div
                  className="inline-block text-xs font-normal text-slate-200 animate-marquee"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAd}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white"
          >
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              Adaugă Banner Sponsor / Reclamă
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Titlu Sponsor / Partener *
              </label>
              <input
                type="text"
                required
                className="input text-xs w-full"
                value={newAdTitle}
                onChange={(e) => setNewAdTitle(e.target.value)}
                placeholder="ex: Echipamente Sportive Pro"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                URL Imagine Banner *
              </label>
              <input
                type="url"
                required
                className="input text-xs w-full"
                value={newAdImageUrl}
                onChange={(e) => setNewAdImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Link Redirecționare
              </label>
              <input
                type="url"
                className="input text-xs w-full"
                value={newAdLinkUrl}
                onChange={(e) => setNewAdLinkUrl(e.target.value)}
                placeholder="https://sponsor.ro"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddAdModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs shadow-sm"
              >
                Adaugă Reclama
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Adaugă Anunț Scris */}
      {showAddAnnModal && (
        <form
          onSubmit={handleAddAnnouncement}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              Publică Anunț Scris
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Titlu Anunț *
              </label>
              <input
                type="text"
                required
                className="input text-xs w-full"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                placeholder="ex: Program Nocturnă și Tarife Speciale"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Conținut Anunț *
              </label>
              <textarea
                rows={4}
                required
                className="input text-xs w-full"
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                placeholder="Scrie textul detaliat al comunicatului..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddAnnModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs shadow-sm"
              >
                Publică Anunțul
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal: Schimbă Poză Arenă */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Schimbă Fotografia
                </span>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Poză Principală Arenă
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Option 1: File Upload */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                Opțiunea 1: Încarcă din Dispozitiv
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-lime-400 dark:hover:bg-lime-300 text-white dark:text-slate-950 font-medium text-xs transition flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Selectează fișier din calculator</span>
              </button>
            </div>

            {/* Option 2: Direct URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                Opțiunea 2: Introdu URL Imagine
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="input text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoInput.trim()) {
                      setImageUrl(customPhotoInput.trim());
                      setCustomPhotoInput("");
                      setShowPhotoModal(false);
                      setMessage({ text: "Poza arenei a fost actualizată.", type: "success" });
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs transition"
                >
                  Aplică
                </button>
              </div>
            </div>

            {/* Option 3: Presets */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block">
                Opțiunea 3: Preseturi de calitate
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
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-left text-xs text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 truncate"
                  >
                    <span className="material-symbols-outlined text-[14px] text-slate-400">image</span>
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
