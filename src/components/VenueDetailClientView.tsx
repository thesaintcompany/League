"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VenueClaimModal } from "./VenueClaimModal";
import { isTicketSalesClosed } from "@/lib/tickets";
import { translateMatchStage } from "@/lib/constants";

export interface VenueData {
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
  tickerText?: string | null;
  tickerActive?: boolean;
  tickerSpeed?: number;
  ads?: string | null;
  announcements?: string | null;
  phone?: string | null;
  website?: string | null;
  googleMapsUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  crmStatus?: string | null;
  owner?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface VenueMatchItem {
  id: string;
  round?: number;
  stage?: string | null;
  scheduledAt?: string | null;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  referee?: string | null;
  ticketPrice?: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  championship?: { id: string; name: string; sport: string; season?: string | null } | null;
}

export interface VenueCompetitionItem {
  id: string;
  name: string;
  sport: string;
  season?: string | null;
}

interface VenueDetailClientViewProps {
  venue: VenueData;
  upcomingMatches: VenueMatchItem[];
  finishedMatches: VenueMatchItem[];
  competitions: VenueCompetitionItem[];
}

export function VenueDetailClientView({
  venue,
  upcomingMatches,
  finishedMatches,
  competitions,
}: VenueDetailClientViewProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Parse Ads and Announcements
  let activeAds: Array<{ id: string; title: string; imageUrl: string; linkUrl: string; isActive: boolean }> = [];
  try {
    if (venue.ads) {
      const parsed = JSON.parse(venue.ads);
      activeAds = Array.isArray(parsed) ? parsed.filter((a: any) => a.isActive) : [];
    }
  } catch {
    activeAds = [];
  }

  let activeAnnouncements: Array<{ id: string; title: string; content: string; date: string; isActive: boolean }> = [];
  try {
    if (venue.announcements) {
      const parsed = JSON.parse(venue.announcements);
      activeAnnouncements = parsed.filter((a: any) => a.isActive);
    }
  } catch {
    activeAnnouncements = [];
  }

  let amenities: Array<{ key: string; label: string; detail?: string; icon: string }> = [];
  try {
    const parsedAmenities = venue.amenities ? JSON.parse(venue.amenities) : [];
    if (Array.isArray(parsedAmenities)) {
      amenities = parsedAmenities.filter((amenity) => amenity.enabled && amenity.label);
    }
  } catch {
    amenities = [];
  }

  // Group finished matches by league
  const groupedResults: Record<string, VenueMatchItem[]> = {};
  finishedMatches.forEach((m) => {
    const champName = m.championship?.name || "Ligue Pro Turneu";
    const round = m.round || 1;
    const key = `${champName} • Etapa ${round}`;
    if (!groupedResults[key]) groupedResults[key] = [];
    groupedResults[key].push(m);
  });

  // Dynamic Curated Photo Gallery based on Sport & Type
  const isHall = venue.sport === "baschet" || venue.sport === "volei" || venue.sport === "handbal" || venue.surface === "Parchet" || venue.name.toLowerCase().includes("sala") || venue.name.toLowerCase().includes("arena cluj");
  const configuredGalleryImages = React.useMemo(() => {
    try {
      const parsed = venue.galleryImages ? JSON.parse(venue.galleryImages) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [venue.galleryImages]);

  const galleryPhotos = React.useMemo(() => {
    if (isHall) {
      return [
        {
          title: "Vedere Panoramică Sală & Tribune",
          subtitle: "Parchet de nivel mondial omologat FIBA & EHF",
          url: configuredGalleryImages[0] || venue.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80",
        },
        {
          title: "Zonă Scaune Ergonomice & Tribuna  ă",
          subtitle: "Vizibilitate optimă 360° din orice sector",
          url: configuredGalleryImages[1] || "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80",
        },
        {
          title: "Vedere Nocturnă & Iluminat Arhitectural",
          subtitle: "Show de lumini LED dinamic și climatizare centralizată",
          url: configuredGalleryImages[2] || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        },
        {
          title: "Esplanada & Acces Public Suporteri",
          subtitle: "Turnicheți digitali cu scanare QR cod și ticketing mobil",
          url: configuredGalleryImages[3] || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80",
        },
      ];
    }

    return [
      {
        title: "Vedere Panoramică din Tribuna 1",
        subtitle: "Perspectivă completă peste suprafața de joc și nocturnă",
        url: configuredGalleryImages[0] || venue.imageUrl || "/images/stadium-hero.jpg",
      },
      {
        title: "Sectoare Tribune & Scaune Premium",
        subtitle: "Scaune moderne rabatabile în culorile arenei",
        url: configuredGalleryImages[1] || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: "Spectacol Nocturn & Atmosferă Suporteri",
        subtitle: "Instalație de nocturnă de peste 2000 Lux conform UEFA",
        url: configuredGalleryImages[2] || "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      },
      {
        title: "Piațeta Arenei & Porți de Intrare",
        subtitle: "Zonă pietonală largă, parcare AI și puncte de acces",
        url: configuredGalleryImages[3] || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80",
      },
    ];
  }, [isHall, venue.imageUrl, configuredGalleryImages]);

  return (
    <div className="space-y-12 font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Live Scrolling Ticker Marquee if active */}
      {venue.tickerActive && venue.tickerText && (
        <div className="bg-slate-900 text-white py-2.5 px-4 flex items-center gap-3 overflow-hidden border-b border-lime-400/30">
          <div className="px-2.5 py-0.5 rounded-lg bg-lime-400 text-slate-950 font-black text-[9px] uppercase font-label shrink-0 shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
            TICKER ARENĂ
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div
              className="inline-block font-headline font-bold text-xs text-lime-300 animate-marquee"
              style={{ animationDuration: `${venue.tickerSpeed || 20}s` }}
            >
              {venue.tickerText}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Kinetic Stadium Backdrop */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-lime-400/30 shadow-2xl min-h-[420px] flex items-center">
        {/* Arena cover photo remains visible beneath the legibility overlays. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl || "/images/stadium-hero.jpg"}
          alt={`Vedere de ansamblu ${venue.name}`}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90 scale-105 transition-transform duration-1000"
        />

        {/* Cinematic Gradient Overlays for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/90 md:via-slate-950/60 md:to-slate-950/15 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-semibold uppercase tracking-wider font-label shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">stadium</span> ARENĂ  Ă LIGUE PRO
              </span>
              {(venue.sport || "Fotbal").split(",").map((s, idx) => {
                const spTrimmed = s.trim();
                const spLower = spTrimmed.toLowerCase();
                const iconName =
                  spLower === "fotbal"
                    ? "sports_soccer"
                    : spLower === "tenis"
                      ? "sports_tennis"
                      : spLower === "padel"
                        ? "sports_tennis"
                        : spLower === "pingpong"
                          ? " "
                          : spLower === "baschet"
                            ? "sports_basketball"
                            : spLower === "volei"
                              ? "sports_volleyball"
                              : spLower === "handbal"
                                ? "sports_handball"
                                : "stadium";
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium font-label uppercase border border-slate-700 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px] text-slate-300">{iconName}</span>
                    <span>{spTrimmed}</span>
                  </span>
                );
              })}
              <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs font-medium font-label uppercase border border-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">grass</span>
                <span>{venue.surface || "Gazon Natural"}</span>
              </span>
              {venue.floodlights && (
                <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 font-medium text-xs font-label border border-lime-400/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">light_mode</span>
                  <span>Nocturnă Omologată</span>
                </span>
              )}
              {venue.rating && (
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs font-label border border-amber-400/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-400 fill-current">star</span>
                  <span>{venue.rating.toFixed(1)} {venue.reviewCount ? `(${venue.reviewCount} recenzii)` : ""}</span>
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight font-headline uppercase leading-none text-white drop-shadow-2xl">
              {venue.name}
            </h1>

            <p className="text-slate-200 text-sm sm:text-base flex items-center gap-2 font-label drop-shadow">
              <span className="material-symbols-outlined text-lime-400">location_on</span>
              {venue.location} {venue.address ? `• ${venue.address}` : ""}
            </p>

            {venue.specs && (
              <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed max-w-2xl">
                {venue.specs}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {venue.phone && (
              <a
                href={`tel:${venue.phone.replace(/\s+/g, "")}`}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                <span>{venue.phone}</span>
              </a>
            )}

            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">language</span>
                <span>Website Oficial</span>
              </a>
            )}

            <a
              href={venue.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(venue.name + " " + (venue.address || venue.location))}`}
              target="_blank"
              rel="noreferrer"
              className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">navigation</span>
              <span>Indicații Rutiere GPS</span>
            </a>

            {upcomingMatches.length > 0 && (
              <a
                href="#upcoming-matches"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">confirmation_number</span>
                <span>Bilete Meciuri ({upcomingMatches.length})</span>
              </a>
            )}

            {activeAds.length > 0 && (
              <a
                href="#arena-sponsors"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">campaign</span>
                <span>Reclame &amp; Sponsori ({activeAds.length})</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Deliberately quiet ownership route, inspired by Google Business profiles. */}
        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={() => setShowClaimModal(true)}
            className="text-right text-[10px] font-label text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            Administrezi această arenă? <span className="underline underline-offset-2">Solicită acces  </span>
          </button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-lime-600 dark:text-lime-400">badge</span>
              <div>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 block">
                  Administrare arenă
                </span>
                <h2 className="text-xl font-black font-headline uppercase text-slate-900 dark:text-white">
                  Date proprietar
                </h2>
              </div>
            </div>
            {venue.owner ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-sm">
                <div>
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Nume</span>
                  <p className="font-bold text-slate-900 dark:text-white">{venue.owner.name || "Proprietar"}</p>
                </div>
                {venue.owner.email && (
                  <div>
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Email</span>
                    <a href={`mailto:${venue.owner.email}`} className="font-bold text-lime-700 dark:text-lime-400 break-all hover:underline">{venue.owner.email}</a>
                  </div>
                )}
                {venue.owner.phone && (
                  <div>
                    <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Telefon</span>
                    <a href={`tel:${venue.owner.phone}`} className="font-bold text-lime-700 dark:text-lime-400 hover:underline">{venue.owner.phone}</a>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-5 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.phone && (
                    <div>
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Telefon Recepție</span>
                      <a href={`tel:${venue.phone.replace(/\s+/g, "")}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{venue.phone}</a>
                    </div>
                  )}
                  {venue.website && (
                    <div>
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Website Oficial</span>
                      <a href={venue.website} target="_blank" rel="noreferrer" className="font-bold text-lime-700 dark:text-lime-400 break-all hover:underline">{venue.website}</a>
                    </div>
                  )}
                  {venue.rating && (
                    <div>
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Rating Google</span>
                      <p className="font-bold text-amber-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span>{venue.rating.toFixed(1)} / 5.0 ({venue.reviewCount} recenzii)</span>
                      </p>
                    </div>
                  )}
                  {venue.crmStatus && (
                    <div>
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Status înregistrare</span>
                      <p className="font-bold text-slate-900 dark:text-white">{venue.crmStatus}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  Informații verificate din profilul public oficial al bazei sportive.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">emoji_events</span>
                <div>
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">Locație confirmată</span>
                  <h2 className="text-xl font-black font-headline uppercase text-slate-900 dark:text-white">Competiții pe arenă</h2>
                </div>
              </div>
              <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400">{competitions.length}</span>
            </div>
            {competitions.length > 0 ? (
              <div className="space-y-3 pt-5">
                {competitions.map((competition) => (
                  <div key={competition.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{competition.name}</span>
                    {competition.season && <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{competition.season}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="pt-5 text-sm text-slate-500 dark:text-slate-400">Nu există competiții programate pe această arenă.</p>
            )}
          </div>
        </section>

        {/* Venue facts only: no match or goal telemetry on an arena profile. */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-1">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Capacitate Spectatori
            </span>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              {venue.capacity ? venue.capacity.toLocaleString() : "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-label">Locuri pe scaune în tribune</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-1">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Suprafață de Joc
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-headline uppercase">
              {venue.surface || "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-label">{venue.sport || "Sport"} • bază omologată</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-1">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Iluminat &amp; Acces
            </span>
            <p className="text-2xl sm:text-3xl font-black text-lime-600 dark:text-lime-400 font-headline uppercase">
              {venue.floodlights ? "Nocturnă" : "Program de zi"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-label">Acces public și facilități de arenă</p>
          </div>
        </section>

        {/* SECTION: Visual Discovery - Interactive Venue Photo Gallery */}
        <section className="space-y-6">
          <div className="flex justify-between items-end pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-label text-lime-600 dark:text-lime-400 font-bold uppercase tracking-widest text-xs">
                Descoperire Vizuală
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase text-slate-900 dark:text-white">
                Galerie Foto &amp; Facilități Arenă
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
              4 Cadre Configurabile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {galleryPhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-95 group-hover:brightness-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[9px] uppercase font-label">
                      Foto #{idx + 1}
                    </span>
                    <span className="material-symbols-outlined text-sm text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      zoom_in
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-white leading-tight">
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-body line-clamp-1 mt-0.5">
                    {photo.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: Elite Amenities Showcase */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="w-3 h-7 bg-lime-400 rounded-full"></span>
            <div>
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 block">
                Standarde de Performanță
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-headline uppercase text-slate-900 dark:text-white">
                Dotări &amp; Facilități  e ale Arenei
              </h2>
            </div>
          </div>

          {amenities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {amenities.map((amenity) => (
                <div key={amenity.key} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">{amenity.icon}</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white">{amenity.label}</h4>
                  {amenity.detail && <p className="text-xs text-slate-600 dark:text-slate-400 font-body leading-relaxed">{amenity.detail}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Facilitățile acestei arene nu au fost configurate încă.</p>
          )}
        </section>

        {/* SECTION: Next on the Turf / Upcoming Matches with DIRECT TICKET LINK */}
        <section id="upcoming-matches" className="space-y-6 scroll-mt-24">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-black font-headline uppercase text-slate-900 dark:text-white">
                Următoarele Meciuri pe Arenă &amp; Vânzare Bilete
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
              {upcomingMatches.length} Partide Programate
            </span>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-400 block">
                sports_soccer
              </span>
              <h3 className="font-headline font-bold text-slate-900 dark:text-white text-base">
                Nu sunt meciuri programate momentan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Organizatorii ligilor vor programa în curând următoarele confruntări  e pe această arenă.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMatches.map((m) => {
                const matchDate = m.scheduledAt ? new Date(m.scheduledAt) : null;
                const formattedDate = matchDate
                  ? matchDate.toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                  : "Data urmează a fi stabilită";
                const formattedTime = matchDate
                  ? matchDate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
                  : "18:00";

                return (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-lime-500 dark:hover:border-lime-400/60 transition-all duration-300 flex flex-col justify-between space-y-6 group"
                  >
                    {/* Header: League & Kickoff */}
                    <div className="flex justify-between items-center text-xs font-label pb-4 border-b border-slate-100 dark:border-slate-800">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-lime-400 font-black text-[10px] uppercase">
                        {m.championship?.name || "Ligue Pro"} • Etapa {m.round || 1}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">
                        ⏰ Ora {formattedTime}
                      </span>
                    </div>

                    {/* Team Clash Display */}
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div className="flex-1 text-center space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-black font-headline text-slate-900 dark:text-white shadow-sm">
                          {m.homeTeam?.name?.substring(0, 2).toUpperCase() || "GA"}
                        </div>
                        <h4 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                          {m.homeTeam?.name || "Gazde"}
                        </h4>
                      </div>

                      <div className="shrink-0 flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-black italic font-headline text-lime-600 dark:text-lime-400">
                          VS
                        </span>
                        <span className="text-[10px] font-label font-bold text-slate-400 uppercase mt-0.5">
                          {translateMatchStage(m.stage)}
                        </span>
                      </div>

                      <div className="flex-1 text-center space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl font-black font-headline text-slate-900 dark:text-white shadow-sm">
                          {m.awayTeam?.name?.substring(0, 2).toUpperCase() || "OA"}
                        </div>
                        <h4 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                          {m.awayTeam?.name || "Oaspeți"}
                        </h4>
                      </div>
                    </div>

                    {/* Footer Date & Direct Ticket Link */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">calendar_month</span>
                        <span className="capitalize">{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isTicketSalesClosed(m) ? (
                          <Link
                            href={`/matches/${m.id}/promo`}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                            <span>Cumpără Bilet ({m.ticketPrice || 30} RON)</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/matches/${m.id}/promo`}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Vânzarea online a biletelor este închisă (ziua meciului sau meci finalizat)"
                          >
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            <span>Vânzare Închisă</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Written Announcements from Arena Owner */}
        {activeAnnouncements.length > 0 && (
          <section id="arena-sponsors" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
              <h2 className="text-xl font-bold font-headline uppercase text-slate-900 dark:text-white">
                Comunicate &amp; Anunțuri  e ale Arenei
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-md space-y-2 border-l-4 border-l-lime-400"
                >
                  <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span> {ann.date}</span>
                  </span>
                  <h4 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-body leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sponsor Banners & Advertising Space */}
        {activeAds.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
              <h2 className="text-xl font-bold font-headline uppercase text-slate-900 dark:text-white">
                Sponsori &amp; Parteneri  i Arenă
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAds.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition group block"
                >
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] font-label font-bold uppercase text-lime-400">
                        Partener
                      </span>
                      <h4 className="font-headline font-bold text-base text-white">
                        {ad.title}
                      </h4>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: Historical Match Results Archive */}
        <section className="space-y-6 pb-8">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-blue-500 rounded-full"></span>
              <h2 className="text-xl font-bold font-headline uppercase text-slate-900 dark:text-white">
                Istoric Meciuri &amp; Rezultate pe Arenă
              </h2>
            </div>
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
              {finishedMatches.length} Partide Jucate
            </span>
          </div>

          {finishedMatches.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-label shadow-sm">
              Nu există încă meciuri finalizate pe această arenă.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([groupTitle, groupMatches]) => (
                <div key={groupTitle} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-lime-400 text-xs font-bold font-label uppercase">
                      {groupTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupMatches.map((m) => (
                      <div
                        key={m.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl space-y-4 transition"
                      >
                        <div className="flex justify-between items-center text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase">
                          <span>
                            {m.scheduledAt
                              ? new Date(m.scheduledAt).toLocaleDateString("ro-RO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                              : "FINALIZAT"}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Finalizat</span>
                          </span>
                        </div>

                        {/* Score Banner */}
                        <div className="flex items-center justify-between gap-2 py-1">
                          <span className="font-bold text-base text-slate-900 dark:text-white font-headline truncate flex-1 min-w-0">{m.homeTeam?.name || "Gazde"}</span>
                          <span className="shrink-0 whitespace-nowrap text-center text-lg font-black font-mono px-3 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-lime-600 dark:text-lime-400 border border-slate-200 dark:border-slate-800">
                            {m.homeScore ?? 0} - {m.awayScore ?? 0}
                          </span>
                          <span className="font-bold text-base text-slate-900 dark:text-white font-headline truncate flex-1 min-w-0 text-right">{m.awayTeam?.name || "Oaspeți"}</span>
                        </div>

                        {m.referee && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">sports</span>
                            Arbitru: {m.referee}
                          </p>
                        )}

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <Link
                            href={`/matches/${m.id}/report`}
                            target="_blank"
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[11px] font-bold font-label uppercase tracking-wider text-center block transition border border-slate-200 dark:border-slate-700"
                          >
                            <span className="material-symbols-outlined text-[14px] mr-1">description</span>
                            Raport Meci PDF
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Lightbox Photo Zoom Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] font-black uppercase font-label text-lime-400">
                  FOTO ARENĂ #{selectedPhotoIndex + 1} DIN {galleryPhotos.length}
                </span>
                <h3 className="text-lg font-headline font-bold text-white">
                  {galleryPhotos[selectedPhotoIndex].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 font-bold"
              >
                <span className="material-symbols-outlined align-middle text-sm">close</span>
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-video max-h-[70vh] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryPhotos[selectedPhotoIndex].url}
                alt={galleryPhotos[selectedPhotoIndex].title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer with Navigation */}
            <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-white">
              <p className="text-xs text-slate-300 font-body">
                {galleryPhotos[selectedPhotoIndex].subtitle}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex(
                      (selectedPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-label"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((selectedPhotoIndex + 1) % galleryPhotos.length)
                  }
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black font-label"
                >
                  Următor →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Arena Claim Modal */}
      <VenueClaimModal
        venueId={venue.id}
        venueName={venue.name}
        venueLocation={venue.location}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </div>
  );
}
