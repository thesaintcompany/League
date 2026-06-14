"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SPORTS, FORMATS } from "@/lib/constants";

export default function NewChampionshipPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    sport: "Fotbal",
    format: "round_robin" as const,
    season: "",
    startDate: "",
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
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Campionat nou</h1>
        <p className="mt-1 text-sm text-slate-600">Completează detaliile de bază. Poți adăuga echipe și meciuri imediat.</p>

        <form onSubmit={onSubmit} className="mt-8 card p-6 space-y-5">
          <div>
            <label className="label" htmlFor="name">Nume campionat *</label>
            <input id="name" required minLength={2} className="input"
              value={form.name} onChange={(e) => update("name", e.target.value)}
              placeholder="Liga Studențească 2026" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="sport">Sport</label>
              <select id="sport" className="input" value={form.sport}
                onChange={(e) => update("sport", e.target.value)}>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="format">Format</label>
              <select id="format" className="input" value={form.format}
                onChange={(e) => update("format", e.target.value as any)}>
                {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="season">Sezon</label>
              <input id="season" className="input" placeholder="2025-2026"
                value={form.season} onChange={(e) => update("season", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="startDate">Data start *</label>
              <input id="startDate" required type="date" className="input"
                value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="endDate">Data sfârșit (opțional)</label>
            <input id="endDate" type="date" className="input"
              value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="description">Descriere</label>
            <textarea id="description" rows={3} className="input"
              value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Anulează</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Se creează..." : "Creează campionat"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
