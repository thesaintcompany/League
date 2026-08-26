"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { ChampionshipLogoBadge } from "@/components/ChampionshipLogoBadge";
import { SPORTS, FORMATS, CHAMPIONSHIP_SCOPES, ROMANIAN_COUNTIES, FOOTBALL_CATEGORIES } from "@/lib/constants";

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

  // Quick preset templates
  function applyPreset(type: "national" | "judetean" | "knockout" | "friendly") {
    if (type === "national") {
      setForm((f) => ({
        ...f,
        name: "SuperLiga Națională România 2026",
        sport: "Fotbal",
        format: "round_robin",
        scope: "national",
        season: "2026",
        description: "Campionat național de elită cu vizibilitate în toate județele României.",
      }));
    } else if (type === "judetean") {
      setForm((f) => ({
        ...f,
        name: "Liga Județeană Timiș 2026",
        sport: "Fotbal",
        format: "round_robin",
        scope: "judetean",
        county: "Timiș",
        season: "2026",
        description: "Campionat oficial arondat Județului Timiș și arenelor sportive locale.",
      }));
    } else if (type === "knockout") {
      setForm((f) => ({
        ...f,
        name: "Cupa Eliminatorie cu Zaruri 2026",
        sport: "Fotbal",
        format: "knockout",
        scope: "national",
        season: "2026",
        description: "Turneu eliminatoriu direct cu tragere la sorți algoritmică prin zaruri (Sferturi -> Semifinale -> Finală).",
      }));
    } else if (type === "friendly") {
      setForm((f) => ({
        ...f,
        name: "Turneu Demonstrativ & Meciuri Amicale Inter-Ligi",
        sport: "Fotbal",
        format: "round_robin",
        scope: "national",
        season: "2026",
        description: "Partide amicale de verificare și jocuri demonstrative între cluburi din ligi diferite.",
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

        <main className="p-4 sm:p-6 lg:p-10 max-w-4xl space-y-6 sm:space-y-8">
          {/* Quota & Pricing Status Banner */}
          {existingCount === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-label flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-500 text-xl">card_giftcard</span>
                <div>
                  <p className="font-headline font-black uppercase text-xs">Plan Gratuit Activ • 1 Campionat Inclus</p>
                  <p className="opacity-90 text-[11px]">Primul tău campionat pe platformă este 100% GRATUIT fara niciun cost ascuns.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase font-mono border border-emerald-500/30 shrink-0">
                0 € (GRATUIT)
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-label flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
                <div>
                  <p className="font-headline font-black uppercase text-xs">Cota Gratuită Atinsă ({existingCount}/1 Campionat)</p>
                  <p className="opacity-90 text-[11px]">Ai un campionat activ. Campionatul suplimentar se achită cu <strong>280 € / competiție</strong> (~1.395 RON).</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase font-mono border border-amber-500/30 shrink-0">
                280 € / Campionat
              </span>
            </div>
          )}

          {/* Quick Presets Tray */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
            <span className="text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              ⚡ Șabloane Rapide (1-Click Fill)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset("national")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition"
              >
                <div className="text-base">🏆</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Ligă Națională</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Vizibilă pe toată harta</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("judetean")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition"
              >
                <div className="text-base">📍</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Ligă Județeană</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Arondată unui județ (ex: Timiș)</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("knockout")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition"
              >
                <div className="text-base">🎲</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Turneu cu Zaruri</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Arbore eliminatoriu direct</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("friendly")}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-400 text-left transition"
              >
                <div className="text-base">🤝</div>
                <div className="text-xs font-headline font-bold text-slate-900 dark:text-white mt-1">Meciuri Amicale</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Jocuri demonstrative inter-ligi</div>
              </button>
            </div>
          </div>

          {/* Main Form */}
          <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
                  Configurare Competiție
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                  Campionatul va fi salvat instantaneu în baza de date și va apărea în selectorul public de ligi.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold font-label text-slate-700 dark:text-slate-300 uppercase block mb-1.5" htmlFor="name">
                  Nume Campionat / Ligă *
                </label>
                <input
                  id="name"
                  required
                  minLength={2}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-lime-500 dark:focus:border-lime-400"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="ex: Liga Pro România 2026 sau Cupa Timișoarei"
                />
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
                        className={`p-2.5 rounded-xl border text-xs font-headline font-bold text-center transition flex items-center justify-center gap-1.5 ${
                          form.category === cat.value
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
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    paymentMethod === "card"
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
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    paymentMethod === "apple_pay"
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
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    paymentMethod === "google_pay"
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
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    paymentMethod === "invoice"
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
