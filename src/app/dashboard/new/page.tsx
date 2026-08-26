"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
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
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/championships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setLoading(false);
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
      setError("Eroare de rețea. Te rugăm să reîncerci.");
    }
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
                <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 text-xs font-semibold rounded-2xl border border-red-300 dark:border-red-500/50">
                  {error}
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
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95"
                >
                  {loading ? "Se creează..." : "Lansează Campionatul 🚀"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
