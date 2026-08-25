"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { SPORTS, FORMATS } from "@/lib/constants";

export default function NewChampionshipPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "Fotbal",
    format: "round_robin" as const,
    season: "2025-2026",
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
    router.push(`/dashboard/championships/${data.championship.id}`);
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Turneu Nou"
          subtitle="Configurează o competiție nouă în câteva secunde"
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
                  className="input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="ex: Liga Pro România 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="sport">
                    Sport
                  </label>
                  <select
                    id="sport"
                    className="input"
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
                    className="input"
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
                    className="input"
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
                    className="input"
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
                  className="input"
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
                  className="btn btn-primary text-xs uppercase tracking-wider font-bold py-3 px-6 bg-primary text-white hover:bg-slate-800"
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
