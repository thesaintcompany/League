"use client";

import { useState, useEffect } from "react";
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
    isPublished: true,
    silentDice: false,
    refereeEnabled: true,
    singleVenueEnabled: false,
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
    pingpong_singles: ["Turneu Ping-Pong", "Cupa Tenis de Masă", "Open Ping-Pong", "Amatur Ping-Pong", "Liga Tenis de Masă"],
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

  // Quick preset templates with shorter, random names
  function applyPreset(type: "national" | "judetean" | "knockout" | "friendly" | "tennis_singles" | "tennis_doubles" | "padel_tour" | "pingpong_singles") {
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
        description: "Campionat oficial de Padel pe terenuri panoramice.",
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
        description: "Campionat oficial arondat județului Timiș.",
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

        <main className="w-full max-w-4xl space-y-5 sm:space-y-8 p-3 sm:p-6 lg:p-10 mx-auto">
          {/* Quota & Pricing Status Banner */}
          {existingCount === 0 ? (
            <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-label flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-500 text-xl shrink-0">card_giftcard</span>
                <div>
                  <p className="font-headline font-black uppercase text-xs">Plan Gratuit Activ • 1 Campionat Inclus</p>
                  <p className="opacity-90 text-[11px]">Primul tău campionat pe platformă este 100% GRATUIT fără niciun cost ascuns.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase font-mono border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                0 € (GRATUIT)
              </span>
            </div>
          ) : (
            <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-label flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-500 text-xl shrink-0">workspace_premium</span>
                <div>
                  <p className="font-headline font-black uppercase text-xs">Cota Gratuită Atinsă ({existingCount}/1 Campionat)</p>
                  <p className="opacity-90 text-[11px]">Ai un campionat activ. Campionatul suplimentar se achită cu <strong>280 € / competiție</strong> (~1.395 RON).</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase font-mono border border-amber-500/30 shrink-0 self-start sm:self-auto">
                280 € / Campionat
              </span>
            </div>
          )}

          {/* Quick Presets Tray */}
          <div className="w-full p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm space-y-3">
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              ⚡ Șabloane Rapide (1-Click Fill)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 w-full">
              <button
                type="button"
                onClick={() => applyPreset("tennis_singles")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition w-full"
              >
                <div className="text-base">🎾</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Tenis Simplu</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Jucători direcți & Seeds</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("padel_tour")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 text-left transition w-full"
              >
                <div className="text-base">🎾</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Padel Oficial</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Terenuri & Perechi</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("pingpong_singles")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-400 text-left transition w-full"
              >
                <div className="text-base">🏓</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Ping-Pong</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Tenis de Masă Amatur</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("national")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition w-full"
              >
                <div className="text-base">🏆</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Ligă Națională</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Vizibilă pe toată harta</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("judetean")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition w-full"
              >
                <div className="text-base">📍</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Ligă Județeană</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Arondată unui județ</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("knockout")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition w-full"
              >
                <div className="text-base">🎲</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Turneu Zaruri</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Arbore eliminatoriu</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("friendly")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition w-full"
              >
                <div className="text-base">🤝</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Meciuri Amicale</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Partide demonstrative</div>
              </button>
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
                    <span>🎲 Nume Scurt Aleatoriu</span>
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
                    <span>🎲</span>
                  </button>
                </div>
              </div>

              {/* Siglă Rotundă Campionat & Live Preview */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                    Siglă Oficială Campionat (Rotundă)
                  </label>
                  <span className="text-[10px] text-slate-400 font-label uppercase">Opțional</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Live Badge Preview */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <ChampionshipLogoBadge
                      name={form.name || "Campionat Pro"}
                      logoUrl={form.logoUrl}
                      size="xl"
                    />
                    <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                      {form.logoUrl?.trim() ? "Siglă Imagine" : "Inițiale pe Fond Colorat"}
                    </span>
                  </div>

                  {/* Logo URL Input & Presets */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-500"
                        value={form.logoUrl}
                        onChange={(e) => update("logoUrl", e.target.value)}
                        placeholder="https://domeniu.ro/sigla-campionat.png (sau lasă gol pentru inițiale)"
                      />
                      {form.logoUrl && (
                        <button
                          type="button"
                          onClick={() => update("logoUrl", "")}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500"
                          title="Șterge sigla"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-label font-semibold text-slate-500 dark:text-slate-400">
                      <span>💡 Opțiuni:</span>
                      <button
                        type="button"
                        onClick={() => update("logoUrl", "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=80")}
                        className="text-lime-600 dark:text-lime-400 hover:underline"
                      >
                        Model 1
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => update("logoUrl", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80")}
                        className="text-lime-600 dark:text-lime-400 hover:underline"
                      >
                        Model 2
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => update("logoUrl", "")}
                        className="text-slate-600 dark:text-slate-300 hover:underline font-bold"
                      >
                        Utilizează Fond Colorat cu Inițiale
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope Selection: Național vs Județean vs Local */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block">
                  Arie de Acoperire Teritorială (Amploare) *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CHAMPIONSHIP_SCOPES.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => update("scope", sc.value as any)}
                      className={`p-3 rounded-xl border text-xs font-headline font-bold text-left transition flex flex-col justify-between gap-1.5 ${form.scope === sc.value
                        ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400"
                        }`}
                    >
                      <span className="text-xs">{sc.label}</span>
                      <span className="text-[10px] font-label font-normal opacity-80">
                        {sc.value === "national"
                          ? "Vizibil pe toată Nationale (în toate județele)"
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
                        className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
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
                          className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                          value={form.city}
                          onChange={(e) => update("city", e.target.value)}
                          placeholder="ex: Timișoara"
                        />
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
                    <span className="text-sm">⚽</span>
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
                const sportTitle = isPadel ? "Padel Oficial" : isPingPong ? "Ping-Pong (Tenis de Masă)" : "Tenis de Câmp";
                const sportIcon = isPadel ? "🎾" : isPingPong ? "🏓" : "🎾";

                return (
                  <div className={`p-4 rounded-2xl ${isPadel ? "bg-teal-500/10 border-teal-500/30" : isPingPong ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"} border space-y-4`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sportIcon}</span>
                      <div>
                        <label className={`text-xs font-bold font-headline ${isPadel ? "text-teal-900 dark:text-teal-300" : isPingPong ? "text-rose-900 dark:text-rose-300" : "text-emerald-900 dark:text-emerald-300"} uppercase block`}>
                          Configurare Specifică {sportTitle} (Competitori Individuali &amp; Perechi)
                        </label>
                        <p className={`text-[11px] ${isPadel ? "text-teal-700 dark:text-teal-400" : isPingPong ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"} font-label`}>
                          În această competiție poți înscrie și invita direct competitori pe tablou (fără a fi obligatorie o echipă de fotbal).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block">
                        Tablou &amp; Categorie de Concurs
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {activeCatList.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => update("category", cat.value)}
                            className={`p-2.5 rounded-xl border text-xs font-headline font-bold text-center transition ${form.category === cat.value
                                ? isPadel ? "bg-teal-600 text-white border-teal-600 shadow-sm font-black" : isPingPong ? "bg-rose-600 text-white border-rose-600 shadow-sm font-black" : "bg-emerald-600 text-white border-emerald-600 shadow-sm font-black"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                              }`}
                          >
                            <span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20">
                    <div>
                      <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block mb-1">
                        Suprafață de Joc Teren
                      </label>
                      <select
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
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
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.silentDice ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      role="switch"
                      aria-checked={form.silentDice}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.silentDice ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2. Toggle Refereeing Module */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚖️</span>
                        <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                          Activare Modul Arbitraj &amp; Delegare Arbitri
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                        {form.refereeEnabled
                          ? "✓ Arbitraj Oficial Activ: Se pot delega arbitri oficiali, întocmi rapoarte de joc și cartonașe."
                          : "✕ Fără Arbitraj Oficial: Turneu amical / meciuri autogestionate (fără delegare de arbitri)."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => update("refereeEnabled", !form.refereeEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.refereeEnabled ? "bg-lime-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      role="switch"
                      aria-checked={form.refereeEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.refereeEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3. Toggle Single Unified Venue */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📍</span>
                          <span className="text-xs font-bold font-headline uppercase text-slate-900 dark:text-white">
                            Toate Meciurile se Dispută în Aceeași Locație / Arenă
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                          {form.singleVenueEnabled
                            ? "✓ Locație Unică Activă: Toate meciurile vor fi programate automat pe arena aleasă."
                            : "🏟️ Locații Multiple: Meciurile se joacă pe terenul fiecărei echipe sau arene atribuite individual."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => update("singleVenueEnabled", !form.singleVenueEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          form.singleVenueEnabled ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        role="switch"
                        aria-checked={form.singleVenueEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            form.singleVenueEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {form.singleVenueEnabled && (
                      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in">
                        <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 shrink-0">
                          Locație Centralizată:
                        </label>
                        <input
                          type="text"
                          value={form.defaultVenue}
                          onChange={(e) => update("defaultVenue", e.target.value)}
                          placeholder="ex: Baza Sportivă Sport Arena / Sala Polivalentă Timișoara"
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-400"
                        />
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
                  <span>{loading ? "Se creează..." : existingCount >= 1 ? "Continuă la Plată (280 €) 💳" : "Lansează Campionatul (Gratuit) 🚀"}</span>
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
                  Operator: <strong>TSC QUANTUM S.R.L.</strong> • CUI: 53063735
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
