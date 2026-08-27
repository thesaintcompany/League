"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { ChampionshipLogoBadge } from "@/components/ChampionshipLogoBadge";
import {
  SPORTS,
  FORMATS,
  CHAMPIONSHIP_SCOPES,
  ROMANIAN_COUNTIES,
  FOOTBALL_CATEGORIES,
  TENNIS_CATEGORIES,
  PADEL_CATEGORIES,
  PINGPONG_CATEGORIES,
  TENNIS_SURFACES,
  TENNIS_SETS_RULES,
  isIndividualSport,
} from "@/lib/constants";

export default function NewChampionshipPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "Fotbal",
    category: "masculin",
    format: "round_robin" as "round_robin" | "knockout" | "groups_knockout",
    season: "2026",
    scope: "national" as "national" | "judetean" | "oras",
    county: "Timiș",
    city: "Timișoara",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "",
    logoUrl: "",
    isPublished: false,
    silentDice: true,
    refereeEnabled: false,
    singleVenueEnabled: true,
    defaultVenue: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quota & Fee State
  const [existingCount, setExistingCount] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "invoice">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    async function loadChampionshipCount() {
      try {
        const res = await fetch("/api/championships");
        if (res.ok) {
          const data = await res.json();
          setExistingCount(data.count ?? data.championships?.length ?? 0);
        }
      } catch (err) {
        console.error("Error fetching championships count:", err);
      }
    }
    loadChampionshipCount();
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Shorter, clean suggested names
  const SHORT_PRESET_NAMES = {
    friendly: ["Meciuri Amicale", "Turneu Demonstrativ", "Cupa Amicală", "Meciuri de Pregătire", "Liga Amatorilor"],
    tennis_singles: ["Tenis Simplu", "Turneu Tenis", "Cupa la Simplu", "Open Tenis", "Master Tenis"],
    padel_tour: ["Turneu Padel", "Cupa Padel Pro", "Open Padel Arena", "Padel League", "Padel Master"],
    pingpong_singles: ["Turneu Ping-Pong", "Cupa Tenis de Masă", "Open Ping-Pong", "Amatori Ping-Pong", "Liga Tenis de Masă"],
    tennis_doubles: ["Tenis Dublu", "Turneu Dublu", "Cupa la Dublu", "Tenis & Dublu", "Open Dublu"],
    national: ["SuperLiga Națională", "Cupa României", "Liga Națională", "Campionatul Național", "Liga Pro"],
    judetean: ["Liga Județeană", "Cupa Județeană", "Liga Locală", "Campionat Județean", "SuperLiga Locală"],
    knockout: ["Cupa Eliminatorie", "Turneu cu Zaruri", "Cupa Knockout", "Liga Eliminatorie", "Turneu Flash"],
  };

  function getRandomShortName(type?: keyof typeof SHORT_PRESET_NAMES) {
    if (type && SHORT_PRESET_NAMES[type]) {
      const list = SHORT_PRESET_NAMES[type];
      return list[Math.floor(Math.random() * list.length)];
    }
    const allLists = Object.values(SHORT_PRESET_NAMES).flat();
    return allLists[Math.floor(Math.random() * allLists.length)];
  }

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [brandingScopeSlide, setBrandingScopeSlide] = useState<0 | 1>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  function handleLogoFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Imaginea selectată depășește limita de 5MB. Te rugăm să alegi o imagine mai mică.");
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        update("logoUrl", result);
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert("A apărut o eroare la citirea imaginii.");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  }

  const [venueOwnerEmail, setVenueOwnerEmail] = useState("");
  const [venueOwnerPhone, setVenueOwnerPhone] = useState("");
  const [venueInviteSent, setVenueInviteSent] = useState(false);
  const [showVenueOwnerInvite, setShowVenueOwnerInvite] = useState(false);

  function handleSendVenueInviteEmail() {
    if (!venueOwnerEmail || !venueOwnerEmail.includes("@")) {
      alert("Te rugăm să introduci o adresă de email validă a proprietarului arenei.");
      return;
    }
    const subject = encodeURIComponent(`Invitație de colaborare pentru găzduire campionat: ${form.name || "Campionat  "}`);
    const body = encodeURIComponent(
      `Bună ziua,\n\nVă contactăm în legătură cu campionatul "${form.name || "Campionat  "}" (${form.sport || "Sport"}).\nDorim să disputăm meciurile  e la baza dumneavoastră sportivă ("${form.defaultVenue}").\n\nPentru a vă valida și lista gratuit arena pe platformă cu tarife, poze și facilități, vă invităm să accesați:\nhttps://sp.buu.ro/venues\n\nCu stimă,\nOrganizator ${form.name || "Campionat"}`
    );
    window.open(`mailto:${venueOwnerEmail}?subject=${subject}&body=${body}`, "_blank");
    setVenueInviteSent(true);
  }

  function handleSendVenueInviteWhatsApp() {
    const text = encodeURIComponent(
      `  Salut! Organizăm campionatul "${form.name || "Campionat  "}" (${form.sport || "Sport"}) și dorim să programăm meciurile la baza sportivă "${form.defaultVenue}".\n\nTe invităm să îți listezi și să îți revendici gratuit arena pe platforma  ă la: https://sp.buu.ro/venues`
    );
    const cleanPhone = venueOwnerPhone.replace(/\D/g, "");
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone.startsWith("0") ? "4" + cleanPhone : cleanPhone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
    setVenueInviteSent(true);
  }

  // Quick preset templates with shorter, random names
  function applyPreset(type: "national" | "judetean" | "knockout" | "friendly" | "tennis_singles" | "tennis_doubles" | "padel_tour" | "pingpong_singles") {
    setSelectedPreset(type);
    const name = getRandomShortName(type);
    if (type === "tennis_singles") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Tenis",
        category: "simplu_masculin",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Turneu de tenis simplu cu tablou eliminatoriu direct între jucători.",
      }));
    } else if (type === "padel_tour") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Padel",
        category: "padel_masculin",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Campionat   de Padel pe terenuri panoramice.",
      }));
    } else if (type === "pingpong_singles") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Tenis de Masă (Ping-Pong)",
        category: "pingpong_open",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Turneu de tenis de masă (ping-pong) pe categorii de nivel cu tablou eliminatoriu.",
      }));
    } else if (type === "tennis_doubles") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Padel",
        category: "padel_masculin",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Competiție pe perechi cu meciuri în sistem de 3 seturi.",
      }));
    } else if (type === "national") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Fotbal",
        format: "round_robin",
        scope: "national",
        season: "2026",
        description: "Campionat național de elită cu meciuri în sistem tur-retur.",
      }));
    } else if (type === "judetean") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Fotbal",
        format: "round_robin",
        scope: "judetean",
        county: "Timiș",
        season: "2026",
        description: "Campionat   arondat județului Timiș.",
      }));
    } else if (type === "knockout") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Fotbal",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Turneu eliminatoriu direct cu tragere la sorți prin zaruri.",
      }));
    } else if (type === "friendly") {
      setForm((f) => ({
        ...f,
        name,
        sport: "Fotbal",
        format: "round_robin",
        scope: "national",
        season: "2026",
        description: "Partide amicale de verificare și jocuri demonstrative.",
      }));
    }
  }

  async function createChampionship(isPaid: boolean = false) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/championships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isPaid }),
      });
      setLoading(false);
      setIsProcessingPayment(false);

      if (res.status === 402) {
        // Payment required
        setShowPaymentModal(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Eroare la crearea campionatului.");
        return;
      }

      const data = await res.json();
      const newId = data.id || data.championship?.id;
      if (newId) {
        router.push(`/dashboard/championships/${newId}`);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setLoading(false);
      setIsProcessingPayment(false);
      setError("Eroare de rețea. Te rugăm să reîncerci.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // If existingCount >= 1, show payment modal before submitting, or attempt submission directly
    if (existingCount >= 1) {
      setShowPaymentModal(true);
      return;
    }
    await createChampionship(false);
  }

  async function handleConfirmPaymentAndCreate() {
    setIsProcessingPayment(true);
    // Simulate brief payment gateway authorization
    setTimeout(async () => {
      await createChampionship(true);
      setShowPaymentModal(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Creează o Ligă / Campionat Nou"
          subtitle="Configurează o competiție nouă, un turneu eliminatoriu sau o cupă de jocuri amicale"
        />

        <main className="w-full max-w-5xl space-y-6 sm:space-y-8 p-3 sm:p-6 lg:p-10 mx-auto">
          {/* Quota & Pricing Status Banner */}
          {existingCount === 0 ? (
            <div className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-label flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">card_giftcard</span>
                </div>
                <div>
                  <p className="font-headline font-black uppercase text-xs sm:text-sm">Plan Gratuit Activ • 1 Campionat Inclus</p>
                  <p className="opacity-90 text-[11px] sm:text-xs">Primul tău campionat pe platformă este 100% GRATUIT fără niciun cost ascuns.</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase font-mono border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                0 € (GRATUIT)
              </span>
            </div>
          ) : (
            <div className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-label flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <div>
                  <p className="font-headline font-black uppercase text-xs sm:text-sm">Cota Gratuită Atinsă ({existingCount}/1 Campionat)</p>
                  <p className="opacity-90 text-[11px] sm:text-xs">Ai un campionat activ. Campionatul suplimentar se achită cu <strong>280 € / competiție</strong> (~1.395 RON).</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase font-mono border border-amber-500/30 shrink-0 self-start sm:self-auto">
                280 € / Campionat
              </span>
            </div>
          )}

          {/* Quick Presets Tray */}
          <div className="w-full p-5 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-label font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  ⚡ Șabloane Rapide (1-Click Fill)
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-label">
                  Alege un tip de competiție pentru a pre-completa automat setările optime
                </p>
              </div>
              {selectedPreset && (
                <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 text-xs font-black font-label uppercase border border-lime-400/30 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
                  Șablon Activ
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
              {[
                {
                  id: "tennis_singles" as const,
                  icon: "sports_tennis",
                  title: "Tenis Simplu",
                  desc: "Jucători direcți & Seeds",
                },
                {
                  id: "padel_tour" as const,
                  icon: "sports_tennis",
                  title: "Padel  ",
                  desc: "Terenuri & Perechi",
                },
                {
                  id: "pingpong_singles" as const,
                  icon: "circle",
                  title: "Ping-Pong",
                  desc: "Tenis de Masă Amatori",
                },
                {
                  id: "national" as const,
                  icon: " ",
                  title: "Ligă Națională",
                  desc: "Vizibilă pe toată harta",
                },
                {
                  id: "judetean" as const,
                  icon: "location_on",
                  title: "Ligă Județeană",
                  desc: "Arondată unui județ",
                },
                {
                  id: "knockout" as const,
                  icon: "casino",
                  title: "Turneu Zaruri",
                  desc: "Arbore eliminatoriu",
                },
                {
                  id: "friendly" as const,
                  icon: "handshake",
                  title: "Meciuri Amicale",
                  desc: "Partide demonstrative",
                },
              ].map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 relative w-full active:scale-[0.98] ${isSelected
                      ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md ring-2 ring-lime-400/40 scale-[1.01]"
                      : "bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-lime-500/60 dark:hover:border-lime-400/60"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0 material-symbols-outlined">
                        {preset.icon}
                      </div>
                      {/* Checkmark indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${isSelected
                          ? "bg-slate-950 text-lime-400 shadow-sm"
                          : "border-2 border-slate-300 dark:border-slate-700 text-transparent"
                          }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs sm:text-sm font-headline font-black uppercase tracking-tight ${isSelected ? "text-slate-950 font-black" : "text-slate-900 dark:text-white"}`}>
                        {preset.title}
                      </div>
                      <div className={`text-[11px] sm:text-xs font-label mt-0.5 ${isSelected ? "text-slate-900/90 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                        {preset.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Form */}
          <div className="w-full p-4 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
                  Configurare Competiție
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                  Campionatul va fi salvat instantaneu în baza de date și va apărea în selectorul public de ligi și campionate.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block" htmlFor="name">
                    Nume Campionat / Ligă *
                  </label>
                  <button
                    type="button"
                    onClick={() => update("name", getRandomShortName())}
                    className="text-[11px] font-label font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">casino</span> Nume Scurt Aleatoriu
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    id="name"
                    required
                    minLength={2}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="ex: Meciuri Amicale sau Turneu Demonstrativ"
                  />
                  <button
                    type="button"
                    onClick={() => update("name", getRandomShortName())}
                    className="px-3.5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1"
                    title="Generează alt nume scurt aleatoriu"
                  >
                    <span class="material-symbols-outlined">gl<</span>
                  </button>
                </div>
              </div>

              {/* Carousel Container for Siglă  ă & Arie Teritorială */}
              <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm overflow-hidden">
                {/* Carousel Header with Slide Tabs & Next/Prev Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBrandingScopeSlide(0)}
                      className={`px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${brandingScopeSlide === 0
                        ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      <span>1. <span className="material-symbols-outlined text-xs align-middle">image</span> Siglă  ă</span>
                      {form.logoUrl && <span className="text-[10px]">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandingScopeSlide(1)}
                      className={`px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${brandingScopeSlide === 1
                        ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">map</span> 2. Arie Teritorială
                      <span className="text-[10px] uppercase font-mono">({form.scope})</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Pasul {brandingScopeSlide + 1} din 2
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBrandingScopeSlide(0)}
                        disabled={brandingScopeSlide === 0}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold disabled:opacity-30 hover:border-slate-400 transition shadow-sm"
                        title="Pasul Anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrandingScopeSlide(1)}
                        disabled={brandingScopeSlide === 1}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold disabled:opacity-30 hover:border-slate-400 transition shadow-sm"
                        title="Pasul Următor"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>

                {/* SLIDE 0: Siglă  ă Campionat (Rotundă) & Upload Foto */}
                {brandingScopeSlide === 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                        Siglă  ă Campionat (Rotundă)
                      </label>
                      <span className="text-[10px] text-slate-400 font-label uppercase">Opțional</span>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Live Round Badge Preview */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                        title="Click pentru a încărca o fotografie/siglă din telefon sau calculator"
                      >
                        <div className="relative">
                          <ChampionshipLogoBadge
                            name={form.name || "Campionat Pro"}
                            logoUrl={form.logoUrl}
                            size="xl"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <span className="material-symbols-outlined text-lg text-lime-400">photo_camera</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-label font-bold text-slate-400 uppercase group-hover:text-lime-600 dark:group-hover:text-lime-400 transition">
                          {form.logoUrl?.trim() ? "Siglă Imagine" : "Inițiale pe Fond Colorat"}
                        </span>
                      </div>

                      {/* Upload Controls & Actions */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95 border border-lime-300 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              {isUploadingLogo ? "progress_activity" : "upload"}
                            </span>
                            <span>
                              {isUploadingLogo
                                ? "Se procesează..."
                                : form.logoUrl
                                  ? "Schimbă Fotografia / Sigla"
                                  : "Încarcă Foto din Dispozitiv"}
                            </span>
                          </button>

                          {form.logoUrl && (
                            <button
                              type="button"
                              onClick={() => update("logoUrl", "")}
                              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-label font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 transition active:scale-95"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                              <span>Șterge Sigla</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                          Formate acceptate: PNG, JPG, WebP sau SVG (max. 5 MB). Va fi decupată automat în formă rotundă.
                        </p>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          <input
                            type="url"
                            className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-500"
                            value={form.logoUrl?.startsWith("data:") ? "" : form.logoUrl}
                            onChange={(e) => update("logoUrl", e.target.value)}
                            placeholder="Sau introdu direct un link web (URL) către imagine..."
                          />
                          <button
                            type="button"
                            onClick={() => setBrandingScopeSlide(1)}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 font-headline font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm transition active:scale-95"
                          >
                            <span>Pasul 2 (Arie)</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 1: Scope Selection: Național vs Județean vs Local */}
                {brandingScopeSlide === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                        Arie de Acoperire Teritorială (Amploare) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setBrandingScopeSlide(0)}
                        className="text-[11px] font-label font-bold text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>← Înapoi la Siglă</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {CHAMPIONSHIP_SCOPES.map((sc) => (
                        <button
                          key={sc.value}
                          type="button"
                          onClick={() => update("scope", sc.value as any)}
                          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${form.scope === sc.value
                            ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md scale-[1.01]"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400"
                            }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-headline font-bold uppercase">{sc.label}</span>
                            <span className="text-xs font-bold">{form.scope === sc.value ? "✓" : ""}</span>
                          </div>
                          <span className="text-[11px] font-label font-normal opacity-80">
                            {sc.value === "national"
                              ? "Vizibil la nivel național (toate județele)"
                              : sc.value === "judetean"
                                ? "Asociat unui județ specific"
                                : "Asociat unui municipiu / oraș"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Conditional County & City Selectors */}
                    {form.scope !== "national" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="county">
                            Județ Arondat *
                          </label>
                          <select
                            id="county"
                            className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400 font-bold"
                            value={form.county}
                            onChange={(e) => update("county", e.target.value)}
                          >
                            {ROMANIAN_COUNTIES.map((c) => (
                              <option key={c} value={c}>
                                Județul {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        {form.scope === "oras" && (
                          <div>
                            <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="city">
                              Oraș / Municipiu *
                            </label>
                            <input
                              id="city"
                              required
                              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400 font-bold"
                              value={form.city}
                              onChange={(e) => update("city", e.target.value)}
                              placeholder="ex: Timișoara"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="sport">
                    Sport
                  </label>
                  <select
                    id="sport"
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                    value={form.sport}
                    onChange={(e) => update("sport", e.target.value)}
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="format">
                    Format Competiție
                  </label>
                  <select
                    id="format"
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                    value={form.format}
                    onChange={(e) => update("format", e.target.value as any)}
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Football Category Selector */}
              {form.sport.toLowerCase().includes("fotbal") && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm material-symbols-outlined">sports_soccer</span>
                    <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                      Categorie Fotbal
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FOOTBALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => update("category", cat.value)}
                        className={`p-2.5 rounded-xl border text-xs font-headline font-bold text-center transition flex items-center justify-center gap-1.5 ${form.category === cat.value
                          ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 border-slate-950 dark:border-lime-400 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                          }`}
                      >
                        <span>{cat.label.split(" (")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tennis, Padel & Ping-Pong Category & Surface Selector */}
              {isIndividualSport(form.sport) && (() => {
                const isPadel = form.sport.toLowerCase().includes("padel");
                const isPingPong = form.sport.toLowerCase().includes("ping") || form.sport.toLowerCase().includes("pong") || form.sport.toLowerCase().includes("masă") || form.sport.toLowerCase().includes("masa");
                const activeCatList = isPadel ? PADEL_CATEGORIES : isPingPong ? PINGPONG_CATEGORIES : TENNIS_CATEGORIES;
                const sportTitle = isPadel ? "Padel  " : isPingPong ? "Ping-Pong (Tenis de Masă)" : "Tenis de Câmp";
                const sportIcon = isPadel ? "sports_tennis" : isPingPong ? "circle" : "sports_tennis";

                // Default to amateur / entry level if none chosen or category does not match active sport
                const defaultCategoryForSport = isPadel ? "padel_amatori" : isPingPong ? "pingpong_amatori" : "simplu_masculin";
                const isCurrentCatInList = activeCatList.some((c) => c.value === form.category);
                const currentCat = isCurrentCatInList ? form.category : defaultCategoryForSport;

                return (
                  <div className={`p-4 sm:p-5 rounded-2xl ${isPadel ? "bg-teal-500/10 border-teal-500/30" : isPingPong ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"} border space-y-4`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl sm:text-2xl material-symbols-outlined">{sportIcon}</span>
                      <div>
                        <label className={`text-xs sm:text-sm font-bold font-headline ${isPadel ? "text-teal-950 dark:text-teal-300" : isPingPong ? "text-rose-950 dark:text-rose-300" : "text-emerald-950 dark:text-emerald-300"} uppercase block`}>
                          Configurare Specifică {sportTitle} (Competitori Individuali &amp; Perechi)
                        </label>
                        <p className={`text-[11px] ${isPadel ? "text-teal-700 dark:text-teal-400" : isPingPong ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"} font-label`}>
                          În această competiție poți înscrie și invita direct competitori pe tablou (fără a fi obligatorie o echipă de fotbal).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold font-label uppercase text-slate-700 dark:text-slate-300 block">
                          Tablou &amp; Categorie de Concurs *
                        </label>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          Preselectat: Nivel Amatori / Start
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {activeCatList.map((cat) => {
                          const isSelected = currentCat === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => update("category", cat.value)}
                              className={`p-3 rounded-2xl border text-xs font-headline font-bold text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-sm active:scale-[0.98] ${isSelected
                                ? isPadel
                                  ? "bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-400/40 font-black scale-[1.01]"
                                  : isPingPong
                                    ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40 font-black scale-[1.01]"
                                    : "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40 font-black scale-[1.01]"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                                }`}
                            >
                              <span className="leading-snug">{cat.label}</span>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${isSelected
                                  ? "bg-white text-slate-950 shadow-sm"
                                  : "border-2 border-slate-300 dark:border-slate-700 text-transparent"
                                  }`}
                              >
                                {isSelected ? "✓" : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block mb-1">
                          Suprafață de Joc Teren
                        </label>
                        <select
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          defaultValue={isPadel ? "Sticlă Panoramică & Gazon Padel" : isPingPong ? "Suprafață ITTF Lemn / Sintetic" : "Zgură (Clay)"}
                          onChange={(e) => update("description", `${form.description ? form.description + " • " : ""}Suprafață: ${e.target.value}`)}
                        >
                          {TENNIS_SURFACES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block mb-1">
                          Format Seturi &amp; Regulament
                        </label>
                        <select
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          defaultValue={isPingPong ? "best_of_5_pingpong" : "best_of_3"}
                          onChange={(e) => update("description", `${form.description ? form.description + " • " : ""}Regulament: ${e.target.value}`)}
                        >
                          {TENNIS_SETS_RULES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3 Configurable ON/OFF Switches with Interactive State Refresh */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-500 text-lg">tune</span>
                  <div>
                    <h3 className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                      Opțiuni &amp; Automatizări Meciuri
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label">
                      Personalizează comportamentul tragerilor la sorți, arbitrajului și locațiilor de joc.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* 1. Toggle Silent Dice Announcements */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚡</span>
                        <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                          Dezactivează Anunțurile cu Zaruri (Tragere Silent)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                        {form.silentDice
                          ? "✓ Tragere Silent: Rezultatul tragerii se generează discret, fără notificări pe WhatsApp/Email către cluburi."
                          : "📢 Anunțuri Active: Echipele primesc notificare automată despre stabilirea meciurilor."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => update("silentDice", !form.silentDice)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.silentDice ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      role="switch"
                      aria-checked={form.silentDice}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.silentDice ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  {/* 2. Toggle Refereeing Module */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm material-symbols-outlined">gavel</span>
                        <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                          Activare Modul Arbitraj &amp; Delegare Arbitri
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                        {form.refereeEnabled
                          ? "✓ Arbitraj   Activ: Se pot delega arbitri  i, întocmi rapoarte de joc și cartonașe."
                          : "✕ Fără Arbitraj  : Turneu amical / meciuri autogestionate (fără delegare de arbitri)."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => update("refereeEnabled", !form.refereeEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.refereeEnabled ? "bg-lime-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      role="switch"
                      aria-checked={form.refereeEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.refereeEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  {/* 3. Toggle Single Unified Venue */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm material-symbols-outlined">location_on</span>
                          <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                            Toate Meciurile se Dispută în Aceeași Locație / Arenă
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                          {form.singleVenueEnabled
                            ? "Locație Unică Activă: Toate meciurile vor fi programate automat pe arena aleasă."
                            : "Locații Multiple: Meciurile se joacă pe terenul fiecărei echipe sau arene atribuite individual."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => update("singleVenueEnabled", !form.singleVenueEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.singleVenueEnabled ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        role="switch"
                        aria-checked={form.singleVenueEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.singleVenueEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>

                    {form.singleVenueEnabled && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 shrink-0">
                            Locație Centralizată:
                          </label>
                          <input
                            type="text"
                            value={form.defaultVenue}
                            onChange={(e) => update("defaultVenue", e.target.value)}
                            placeholder="ex: Baza Sportivă Sport Arena / Sala Polivalentă Timișoara"
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-400 font-bold"
                          />
                        </div>

                        {/* Compact Trigger Button to Invite Venue Owner */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setShowVenueOwnerInvite((prev) => !prev)}
                            className="text-xs font-headline font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline flex items-center gap-1.5 transition"
                          >
                            <span className="text-sm"> </span>
                            <span>{showVenueOwnerInvite ? "Ascunde formularul de invitație" : "Invită Proprietarul Arenei în platformă"}</span>
                            <span className="text-[10px] font-mono">{showVenueOwnerInvite ? "▲" : "▼"}</span>
                          </button>
                        </div>

                        {/* Expandable Invitation Module for Arena Owner */}
                        {showVenueOwnerInvite && (
                          <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm"> </span>
                                <span className="text-xs font-bold font-headline uppercase text-teal-950 dark:text-teal-300">
                                  Invită Proprietarul Arenei să se Listeze pe Platformă
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowVenueOwnerInvite(false)}
                                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                              >
                                ✕
                              </button>
                            </div>

                            <p className="text-[11px] text-teal-800 dark:text-teal-300 font-label">
                              Dacă ai adresa de email sau contactul administratorului bazei sportive {form.defaultVenue ? <strong>&ldquo;{form.defaultVenue}&rdquo;</strong> : ""}, îi poți trimite o invitație pentru a-și revendica sau lista arena   în catalog.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="email"
                                value={venueOwnerEmail}
                                onChange={(e) => setVenueOwnerEmail(e.target.value)}
                                placeholder="Email proprietar (ex: contact@arena.ro)"
                                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                              />
                              <input
                                type="text"
                                value={venueOwnerPhone}
                                onChange={(e) => setVenueOwnerPhone(e.target.value)}
                                placeholder="Telefon / WhatsApp (ex: 0722123456)"
                                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleSendVenueInviteEmail}
                                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition active:scale-95"
                              >
                                <span className="material-symbols-outlined text-base">mail</span>
                                <span>Trimite Invitație pe Email</span>
                              </button>

                              {/* Icon-only WhatsApp button placed right next to email button */}
                              <button
                                type="button"
                                onClick={handleSendVenueInviteWhatsApp}
                                title="Trimite Invitație pe WhatsApp"
                                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-lg shadow-sm transition active:scale-95 shrink-0"
                              >
                                <span>💬</span>
                              </button>

                              {venueInviteSent && (
                                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 font-label flex items-center gap-1">
                                  ✓ Invitație pregătită!
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="season">
                    Sezon
                  </label>
                  <input
                    id="season"
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                    placeholder="2026"
                    value={form.season}
                    onChange={(e) => update("season", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="startDate">
                    Data Începerii *
                  </label>
                  <input
                    id="startDate"
                    required
                    type="date"
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="description">
                  Descriere Competiție
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                  placeholder="Regulament scurt, detalii locație sau organizator..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-semibold rounded-2xl border border-red-300 dark:border-red-500/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-label font-bold text-xs uppercase"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <span>{loading ? "Se creează..." : existingCount >= 1 ? "Continuă la Plată (280 €) 💳" : "Lansează Campionatul (Gratuit)  "}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* 280 EUR Payment Modal for Extra Championship */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px] uppercase tracking-wider border border-amber-400/30">
                  Campionat Suplimentar # {existingCount + 1}
                </span>
                <h3 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white mt-1">
                  Plată Licență Competiție
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                  Operator: <strong>TSC Q - BUU.RO</strong> • CUI: 53063735
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Price Tag Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold font-headline text-slate-900 dark:text-white uppercase">
                  {form.name || "Campionat Nou"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Licență organizator nelimitată pe sezon
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black font-headline text-lime-600 dark:text-lime-400">
                  280 €
                </p>
                <p className="text-[10px] font-mono text-slate-400">~1.395 RON</p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                Alege Metoda de Plată:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${paymentMethod === "card"
                    ? "bg-lime-400/10 border-lime-500 text-slate-900 dark:text-white font-bold ring-1 ring-lime-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg text-lime-500">credit_card</span>
                  <span className="text-xs">Card Bancar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("apple_pay")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${paymentMethod === "apple_pay"
                    ? "bg-lime-400/10 border-lime-500 text-slate-900 dark:text-white font-bold ring-1 ring-lime-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg text-lime-500">phone_iphone</span>
                  <span className="text-xs">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("google_pay")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${paymentMethod === "google_pay"
                    ? "bg-lime-400/10 border-lime-500 text-slate-900 dark:text-white font-bold ring-1 ring-lime-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg text-lime-500">contactless</span>
                  <span className="text-xs">Google Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${paymentMethod === "invoice"
                    ? "bg-lime-400/10 border-lime-500 text-slate-900 dark:text-white font-bold ring-1 ring-lime-400"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg text-lime-500">receipt_long</span>
                  <span className="text-xs">Factură Fiscală</span>
                </button>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Număr Card (4532 •••• •••• 8892)"
                  defaultValue="4532 8912 3456 8892"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    defaultValue="882"
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "invoice" && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 font-body">
                <p>Factura se emite pe numele entității organizatoare. Plata se înregistrează instant prin IBAN bancar sau procesator.</p>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-label font-bold text-xs uppercase"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirmPaymentAndCreate}
                disabled={isProcessingPayment}
                className="w-2/3 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>{isProcessingPayment ? "Se procesează..." : "Achită & Lansează (280 €) ✓"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
