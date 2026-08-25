"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { SPORTS, FORMATS, CHAMPIONSHIP_SCOPES, ROMANIAN_COUNTIES } from "@/lib/constants";

export default function NewChampionshipPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "Fotbal",
    format: "round_robin" as const,
    season: "2025-2026",
    scope: "national" as "national" | "judetean" | "oras",
    county: "Timiș",
    city: "Timișoara",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/championships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Eroare la creare.");
      return;
    }
    const data = await res.json();
    router.push(`/dashboard/championships/${data.id || data.championship?.id}`);
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Turneu Nou"
          subtitle="Configurează o competiție nouă cu arie de acoperire națională, județeană sau locală"
        />

        <main className="p-6 lg:p-10 max-w-3xl">
          <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-950/50 text-lime-800 dark:text-lime-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                  Detalii Competiție
                </h2>
                <p className="text-xs text-slate-500 font-label">
                  Poți adăuga echipele și programa meciurile imediat după creare.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="label" htmlFor="name">
                  Nume Campionat / Turneu *
                </label>
                <input
                  id="name"
                  required
                  minLength={2}
                  className="input text-xs"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="ex: Liga Pro România 2026"
                />
              </div>

              {/* Scope Selection: Național vs Județean vs Local */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-slate-200/60 dark:border-slate-800 space-y-4">
                <label className="label block font-headline font-bold text-xs uppercase text-blue-950 dark:text-white">
                  Arie de Acoperire Teritorială (Amploare) *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CHAMPIONSHIP_SCOPES.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => update("scope", sc.value as any)}
                      className={`p-3 rounded-xl border text-xs font-headline font-bold text-left transition flex flex-col justify-between gap-1.5 ${
                        form.scope === sc.value
                          ? "bg-lime-400 text-slate-950 border-lime-500 shadow-md scale-[1.02]"
                          : "bg-surface-container-lowest text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-lime-400"
                      }`}
                    >
                      <span className="text-xs">{sc.label}</span>
                      <span className="text-[10px] font-label font-normal opacity-80">
                        {sc.value === "national"
                          ? "Vizibil pe toată harta României (în toate județele)"
                          : sc.value === "judetean"
                          ? "Asociat unui județ specific"
                          : "Asociat unui municipiu / oraș"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Conditional County & City Selectors */}
                {form.scope !== "national" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                    <div>
                      <label className="label text-[11px]" htmlFor="county">
                        Județ Arondat *
                      </label>
                      <select
                        id="county"
                        className="input text-xs"
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
                        <label className="label text-[11px]" htmlFor="city">
                          Oraș / Municipiu *
                        </label>
                        <input
                          id="city"
                          required
                          className="input text-xs"
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
                  <label className="label" htmlFor="sport">
                    Sport
                  </label>
                  <select
                    id="sport"
                    className="input text-xs"
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
                  <label className="label" htmlFor="format">
                    Format Competiție
                  </label>
                  <select
                    id="format"
                    className="input text-xs"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="season">
                    Sezon
                  </label>
                  <input
                    id="season"
                    className="input text-xs"
                    placeholder="2025-2026"
                    value={form.season}
                    onChange={(e) => update("season", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="startDate">
                    Data Începerii *
                  </label>
                  <input
                    id="startDate"
                    required
                    type="date"
                    className="input text-xs"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Descriere Competiție
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="input text-xs"
                  placeholder="Regulament scurt, detalii locație sau organizator..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary text-xs uppercase tracking-wider font-bold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6 bg-lime-400 hover:bg-lime-500 text-slate-950"
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
