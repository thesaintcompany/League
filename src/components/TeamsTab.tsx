"use client";

import React, { useState, useMemo } from "react";
import { isIndividualSport } from "@/lib/constants";

type Player = { id: string; name: string; number: number | null; position: string | null };
export type Team = {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  logoUrl?: string | null;
  players: Player[];
};

// Preset database of popular Romanian clubs & regional teams across sports
const PRESET_ROMANIAN_CLUBS = [
  // SuperLiga & Liga 1 Top Clubs
  { name: "FCSB București", shortName: "FCSB", color: "#dc2626", category: "superliga" },
  { name: "CFR 1907 Cluj", shortName: "CFR", color: "#831843", category: "superliga" },
  { name: "Universitatea Craiova", shortName: "UCV", color: "#1d4ed8", category: "superliga" },
  { name: "FC Rapid 1923", shortName: "RAP", color: "#7f1d1d", category: "superliga" },
  { name: "Dinamo București", shortName: "DIN", color: "#b91c1c", category: "superliga" },
  { name: "Farul Constanța", shortName: "FAR", color: "#0369a1", category: "superliga" },
  { name: "Sepsi OSK Sf. Gheorghe", shortName: "SEP", color: "#be123c", category: "superliga" },
  { name: "Universitatea Cluj", shortName: "UCL", color: "#0f172a", category: "superliga" },
  { name: "UTA Arad", shortName: "UTA", color: "#e11d48", category: "superliga" },
  { name: "FC Hermannstadt", shortName: "FCH", color: "#475569", category: "superliga" },
  { name: "Petrolul Ploiești", shortName: "PET", color: "#eab308", category: "superliga" },
  { name: "FC Oțelul Galați", shortName: "OTE", color: "#1e3a8a", category: "superliga" },
  { name: "FC Botoșani", shortName: "BOT", color: "#1e40af", category: "superliga" },
  { name: "Politehnica Iași", shortName: "IAS", color: "#2563eb", category: "superliga" },

  // Liga 2, Banat & Regional Clubs
  { name: "Politehnica Timișoara", shortName: "POL", color: "#581c87", category: "regional" },
  { name: "Ripensia Timișoara", shortName: "RIP", color: "#ca8a04", category: "regional" },
  { name: "CSC Dumbrăvița", shortName: "DUM", color: "#15803d", category: "regional" },
  { name: "CSM Reșița", shortName: "RES", color: "#991b1b", category: "regional" },
  { name: "Corvinul Hunedoara", shortName: "COR", color: "#1d4ed8", category: "regional" },
  { name: "FC Argeș Pitești", shortName: "ARG", color: "#6b21a8", category: "regional" },
  { name: "Chindia Târgoviște", shortName: "CHI", color: "#dc2626", category: "regional" },
  { name: "Gloria Buzău", shortName: "GBZ", color: "#047857", category: "regional" },

  // Multisport, Baschet & Handbal
  { name: "U-BT Cluj-Napoca (Baschet)", shortName: "UBT", color: "#000000", category: "multisport" },
  { name: "CSM Oradea (Baschet)", shortName: "ORA", color: "#0284c7", category: "multisport" },
  { name: "Dinamo București (Handbal)", shortName: "DIN-H", color: "#b91c1c", category: "multisport" },
  { name: "Potaissa Turda (Handbal)", shortName: "TUR", color: "#2563eb", category: "multisport" },
  { name: "Volei Alba Blaj", shortName: "BLA", color: "#e11d48", category: "multisport" },
  { name: "CSM Târgoviște (Volei)", shortName: "TRG", color: "#059669", category: "multisport" },
];

const PRESET_TENNIS_PLAYERS = [
  { name: "Simona Halep (Cap Serie #1)", shortName: "HAL", color: "#16a34a", category: "wta" },
  { name: "Sorana Cîrstea (Cap Serie #2)", shortName: "CIR", color: "#2563eb", category: "wta" },
  { name: "Ana Bogdan", shortName: "BOG", color: "#7c3aed", category: "wta" },
  { name: "Jaqueline Cristian", shortName: "CRI", color: "#db2777", category: "wta" },
  { name: "Horia Tecău (Cap Serie #1 Dublu)", shortName: "TEC", color: "#dc2626", category: "atp" },
  { name: "Ilie Năstase (Legend)", shortName: "NAS", color: "#ca8a04", category: "atp" },
  { name: "Carlos Alcaraz", shortName: "ALC", color: "#ea580c", category: "atp" },
  { name: "Jannik Sinner", shortName: "SIN", color: "#0284c7", category: "atp" },
  { name: "Novak Djokovic", shortName: "DJO", color: "#15803d", category: "atp" },
  { name: "Rafael Nadal", shortName: "NAD", color: "#b91c1c", category: "atp" },
  { name: "Andrei Pavel (CS Dinamo)", shortName: "PAV", color: "#4f46e5", category: "atp" },
  { name: "Victor Hănescu (FRT)", shortName: "HAN", color: "#0891b2", category: "atp" },
];

export function TeamsTab({
  championshipId,
  sport = "Fotbal",
  teams,
  onChanged,
}: {
  championshipId: string;
  sport?: string;
  teams: Team[];
  onChanged: () => void;
}) {
  const isIndividual = isIndividualSport(sport);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customShortName, setCustomShortName] = useState("");
  const [customColor, setCustomColor] = useState(isIndividual ? "#16a34a" : "#84cc16");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const presetList = isIndividual ? PRESET_TENNIS_PLAYERS : PRESET_ROMANIAN_CLUBS;

  // Check if a participant is already added
  const isEnrolled = (name: string) => {
    return teams.some(
      (t) => t.name.toLowerCase() === name.toLowerCase() || (t.shortName && t.shortName.toLowerCase() === name.toLowerCase())
    );
  };

  // Filtered presets
  const filteredPresets = useMemo(() => {
    return presetList.filter((item) => {
      const matchesCat = activeCategory === "all" || item.category === activeCategory;
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [presetList, activeCategory, searchFilter]);

  // Add participant
  async function handleAddTeam(teamData: { name: string; shortName: string; color: string }) {
    setBusy(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/championships/${championshipId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamData.name,
          shortName: teamData.shortName || null,
          color: teamData.color || "#1e293b",
        }),
      });

      if (res.ok) {
        setStatusMessage(`✓ ${isIndividual ? "Jucătorul" : "Clubul"} "${teamData.name}" a fost înscris cu succes!`);
        setCustomName("");
        setCustomShortName("");
        setShowCustomForm(false);
        onChanged();
      } else {
        const err = await res.json();
        setStatusMessage(`⚠️ ${err.error || "Eroare la adăugare"}`);
      }
    } catch {
      setStatusMessage("⚠️ Eroare de rețea.");
    } finally {
      setBusy(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }

  // Quick Seed Top 4 or Top 8
  async function handleBulkSeed(count: number) {
    setBusy(true);
    setStatusMessage(`Se înscriu primii ${count} ${isIndividual ? "jucători" : "participanți"}...`);
    const availableToSeed = presetList.filter((c) => !isEnrolled(c.name)).slice(0, count);

    for (const item of availableToSeed) {
      await fetch(`/api/championships/${championshipId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          shortName: item.shortName,
          color: item.color,
        }),
      });
    }

    setBusy(false);
    setStatusMessage(`✓ ${availableToSeed.length} ${isIndividual ? "jucători au fost adăugați pe tablou" : "cluburi au fost înscrise"}!`);
    onChanged();
    setTimeout(() => setStatusMessage(null), 3000);
  }

  // Delete participant
  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Sigur dorești să elimini ${isIndividual ? "jucătorul" : "echipa"} "${teamName}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/championships/${championshipId}/teams/${teamId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) {
      onChanged();
    }
  }

  return (
    <div className="space-y-8 font-body">
      {/* SECTION 1: Header */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-lime-400/30 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
                {isIndividual ? "🎾 TABLOU JUCĂTORI TENIS" : "🛡️ GESTIUNE CLUBURI & ECHIPE"}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-bold text-xs font-label">
                {teams.length} {isIndividual ? "Jucători Înscriși" : "Echipe Înscrise"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase tracking-tight">
              {isIndividual ? "Tablou Jucători Tenis Înscriși" : "Echipe Înscrise în Competiție"}
            </h2>
            <p className="text-xs text-slate-300 font-body max-w-2xl leading-relaxed">
              {isIndividual
                ? "Înscrie direct jucătorii de tenis pe tablou (capi de serie sau trageri libere) sau trimite-le link de WhatsApp pentru confirmarea prezenței."
                : "În calitate de organizator, selectezi cluburile participante din baza de date sau adaugi cluburi noi cu un singur click."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleBulkSeed(4)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-1.5"
            >
              <span>⚡</span> {isIndividual ? "Înscrie Top 4 Jucători" : "Înscrie Top 4 Echipe"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleBulkSeed(8)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lime-400 font-label font-bold text-xs uppercase tracking-wider transition border border-lime-400/30 flex items-center gap-1.5"
            >
              <span>🎲</span> {isIndividual ? "Înscrie Top 8 pe Tablou" : "Înscrie Top 8 (Brackets)"}
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm((s) => !s)}
              className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              {isIndividual ? "Adaugă Jucător Nou" : "Club Personalizat Nou"}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold font-label animate-in fade-in">
            {statusMessage}
          </div>
        )}
      </div>

      {/* SECTION 2: Custom Drawer */}
      {showCustomForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTeam({
              name: customName,
              shortName: customShortName || customName.substring(0, 3).toUpperCase(),
              color: customColor,
            });
          }}
          className="card p-6 sm:p-8 bg-slate-900 border-2 border-lime-400/60 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold font-headline text-white uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">{isIndividual ? "person" : "shield"}</span>
              {isIndividual ? "Adaugă Jucător de Tenis pe Tablou" : "Adaugă un Club Nou în Competiție"}
            </h3>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Live Preview */}
            <div className="sm:col-span-3 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl border-2 border-white/20 transition-all duration-300"
                style={{ backgroundColor: customColor }}
              >
                {customShortName || customName.substring(0, 3).toUpperCase() || (isIndividual ? "TEN" : "FC")}
              </div>
              <span className="text-xs font-bold text-white font-headline truncate max-w-full">
                {customName || (isIndividual ? "Nume Jucător" : "Nume Club")}
              </span>
              <span className="text-[10px] font-label text-slate-400">Previzualizare Tablou</span>
            </div>

            {/* Inputs */}
            <div className="sm:col-span-9 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-label font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    {isIndividual ? "Nume Complet Jucător *" : "Nume Club / Echipă *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={isIndividual ? "ex: Andrei Popescu (CS Dinamo)" : "ex: AS Victoria Timișoara"}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-label font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    {isIndividual ? "Cod / Prescurtare Tabela (3-4 Litere) *" : "Prescurtare Tabela *"}
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={customShortName}
                    onChange={(e) => setCustomShortName(e.target.value.toUpperCase())}
                    placeholder="ex: POP sau HAL"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-lime-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-label font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Culoare Reprezentativă Echipament
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={busy || !customName}
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                >
                  Salvează &amp; Înscrie 🚀
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SECTION 3: Enrolled List Table */}
      <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
            {isIndividual ? `Tablou Oficial (${teams.length} Jucători Înscriși)` : `Cluburi Înscrise (${teams.length})`}
          </h3>
          <span className="text-xs font-label text-slate-500">
            {teams.length === 8 ? "✓ Tablou complet de 8 participanți" : `${teams.length} / 8 recomandați`}
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center space-y-2 border border-slate-200 dark:border-slate-800">
            <span className="text-3xl">{isIndividual ? "🎾" : "🛡️"}</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isIndividual ? "Nu există jucători înscriși încă pe tablou." : "Nu există echipe înscrise încă în acest campionat."}
            </p>
            <p className="text-xs text-slate-500">
              Folosește butoanele de mai sus pentru înscriere rapidă sau trimite linkul de invitație.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {teams.map((t, idx) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-lime-400/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow shrink-0"
                    style={{ backgroundColor: t.color || "#1e293b" }}
                  >
                    {t.shortName || `#${idx + 1}`}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      Cap Serie #{idx + 1}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTeam(t.id, t.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                  title="Elimină din tablou"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: Preset Selection Catalog */}
      <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold font-headline text-slate-900 dark:text-white uppercase tracking-tight">
              {isIndividual ? "Catalog Jucători de Tenis & Vedete FRT" : "Catalog Cluburi Populare din România"}
            </h3>
            <p className="text-xs text-slate-500 font-label">
              Apasă &quot;+ Înscrie&quot; pentru a adăuga instant un participant pe tablou.
            </p>
          </div>

          <input
            type="text"
            placeholder={isIndividual ? "Caută jucător tenis..." : "Caută club..."}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="input text-xs w-full sm:w-60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredPresets.map((item) => {
            const enrolled = isEnrolled(item.name);
            return (
              <div
                key={item.name}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 transition ${
                  enrolled
                    ? "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-60"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-lime-500 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] text-white shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.shortName}
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={enrolled || busy}
                  onClick={() => handleAddTeam(item)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-label uppercase tracking-wider shrink-0 transition ${
                    enrolled
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-sm active:scale-95"
                  }`}
                >
                  {enrolled ? "✓ Înscris" : "+ Înscrie"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
