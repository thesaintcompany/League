"use client";

import React, { useState, useMemo } from "react";

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

export function TeamsTab({
  championshipId,
  teams,
  onChanged,
}: {
  championshipId: string;
  teams: Team[];
  onChanged: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customShortName, setCustomShortName] = useState("");
  const [customColor, setCustomColor] = useState("#84cc16"); // neon lime default
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check if a club is already added
  const isEnrolled = (clubName: string) => {
    return teams.some(
      (t) => t.name.toLowerCase() === clubName.toLowerCase() || (t.shortName && t.shortName.toLowerCase() === clubName.toLowerCase())
    );
  };

  // Filtered preset clubs
  const filteredPresets = useMemo(() => {
    return PRESET_ROMANIAN_CLUBS.filter((club) => {
      const matchesCat = activeCategory === "all" || club.category === activeCategory;
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.shortName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchFilter]);

  // Add a preset or custom team
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
        setStatusMessage(`✓ Clubul "${teamData.name}" a fost înscris cu succes!`);
        setCustomName("");
        setCustomShortName("");
        setShowCustomForm(false);
        onChanged();
      } else {
        const err = await res.json();
        setStatusMessage(`⚠️ ${err.error || "Eroare la adăugarea echipei"}`);
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
    setStatusMessage(`Se înscriu primele ${count} cluburi...`);
    const availableToSeed = PRESET_ROMANIAN_CLUBS.filter((c) => !isEnrolled(c.name)).slice(0, count);

    for (const club of availableToSeed) {
      await fetch(`/api/championships/${championshipId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: club.name,
          shortName: club.shortName,
          color: club.color,
        }),
      });
    }

    setBusy(false);
    setStatusMessage(`✓ ${availableToSeed.length} cluburi au fost înscrise automat în competiție!`);
    onChanged();
    setTimeout(() => setStatusMessage(null), 3500);
  }

  // Delete team
  async function deleteTeam(teamId: string, teamName: string) {
    if (!confirm(`Sigur dorești să elimini clubul "${teamName}" din acest campionat?`)) return;
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
      {/* SECTION 1: Header with Design Competition Aesthetics */}
      <div className="card p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-lime-400/30 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
                🛡️ GESTIUNE CLUBURI &amp; ECHIPE
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-lime-400 font-bold text-xs font-label">
                {teams.length} Echipe Înscrise
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase tracking-tight">
              Echipe Înscrise în Competiție
            </h2>
            <p className="text-xs text-slate-300 font-body max-w-2xl leading-relaxed">
              În calitate de organizator, selectezi cluburile participante din baza de date sau adaugi cluburi noi cu un singur click. 
              <strong> Lotul și jucătorii sunt gestionați direct de căpitani și fotbaliști</strong> prin conturile lor.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleBulkSeed(4)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center gap-1.5"
            >
              <span>⚡</span> Înscrie Top 4 Echipe
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleBulkSeed(8)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-lime-400 font-label font-bold text-xs uppercase tracking-wider transition border border-lime-400/30 flex items-center gap-1.5"
            >
              <span>🎲</span> Înscrie Top 8 (Brackets)
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm((s) => !s)}
              className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Club Personalizat Nou
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold font-label animate-in fade-in">
            {statusMessage}
          </div>
        )}
      </div>

      {/* SECTION 2: Custom Team Drawer / Modal */}
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
              <span className="material-symbols-outlined text-lime-400">shield</span>
              Adaugă un Club Nou în Competiție
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
            {/* Live Shield Preview */}
            <div className="sm:col-span-3 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl border-2 border-white/20 transition-all duration-300"
                style={{ backgroundColor: customColor }}
              >
                {customShortName || (customName ? customName.substring(0, 3).toUpperCase() : "FC")}
              </div>
              <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                Previzualizare Siglă
              </span>
            </div>

            {/* Inputs */}
            <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Nume Oficial Club *
                </label>
                <input
                  required
                  placeholder="ex: FC Victoria Timișoara"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Prescurtare (3-5 litere)
                </label>
                <input
                  maxLength={5}
                  placeholder="ex: VIC"
                  value={customShortName}
                  onChange={(e) => setCustomShortName(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-lime-400 uppercase"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Culoare Reprezentativă Club
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-slate-700 cursor-pointer bg-slate-950 p-1"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["#84cc16", "#dc2626", "#2563eb", "#eab308", "#7c3aed", "#06b6d4", "#ea580c", "#1e293b"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomColor(c)}
                        className="w-7 h-7 rounded-lg border border-white/20 transition hover:scale-110"
                        style={{ backgroundColor: c }}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={busy || !customName.trim()}
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg"
            >
              {busy ? "Se înscrie..." : "Înscrie Clubul"}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: 1-Click Database & Preset Clubs Picker */}
      <section className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-white uppercase tracking-tight">
                Selecție Rapidă Cluburi din Baza de Date
              </h3>
              <p className="text-xs text-slate-400 font-label">
                Apasă pe un club pentru a-l înscrie instantaneu cu siglă și culori oficiale
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: "all", label: "Toate Cluburile" },
              { id: "superliga", label: "🏆 SuperLiga" },
              { id: "regional", label: "⚽ Liga 2 / Regional" },
              { id: "multisport", label: "🏀 Săli / Multisport" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-label transition ${
                  activeCategory === cat.id
                    ? "bg-lime-400 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search for Clubs */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Caută club din baza de date (ex: Steaua, Craiova, Dinamo, Timișoara, Cluj, Blaj)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
          />
        </div>

        {/* Preset Clubs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredPresets.map((club) => {
            const alreadyIn = isEnrolled(club.name);

            return (
              <button
                key={club.name}
                type="button"
                disabled={busy || alreadyIn}
                onClick={() => handleAddTeam(club)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-3 group relative overflow-hidden ${
                  alreadyIn
                    ? "bg-slate-950/40 border-lime-400/40 opacity-70 cursor-not-allowed"
                    : "bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-lime-400/60 shadow-sm hover:shadow-lg"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-sm text-white shadow-md border border-white/20"
                    style={{ backgroundColor: club.color }}
                  >
                    {club.shortName}
                  </div>
                  {alreadyIn ? (
                    <span className="px-2 py-0.5 rounded-md bg-lime-400/20 text-lime-400 text-[10px] font-black font-label border border-lime-400/30">
                      ✓ Înscris
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold font-label group-hover:bg-lime-400 group-hover:text-slate-950 transition">
                      + Înscrie
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-headline font-bold text-xs text-white leading-tight group-hover:text-lime-400 transition">
                    {club.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-label uppercase mt-0.5 block">
                    {club.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Grid of Enrolled Teams in this Championship */}
      <section className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-lime-400 rounded-full"></span>
            <h3 className="text-xl font-bold font-headline text-white uppercase tracking-tight">
              Cluburi Înscrise în acest Campionat ({teams.length})
            </h3>
          </div>
          <span className="text-xs font-label font-bold text-slate-400 uppercase">
            {teams.length >= 4 ? "✓ Condiții minime brackets îndeplinite" : "Necesită minim 4 echipe"}
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-500 block">
              shield
            </span>
            <p className="font-bold text-white text-sm">
              Niciun club nu este înscris încă în această competiție.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Folosește selecția rapidă de mai sus sau apasă pe &quot;Înscrie Top 4 / Top 8&quot; pentru a popula campionatul cu echipe oficiale.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {teams.map((t, idx) => (
              <div
                key={t.id}
                className="card p-5 bg-slate-900 border border-slate-800 hover:border-lime-400/50 rounded-3xl shadow-md space-y-4 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-black text-base text-white shadow-lg border border-white/20"
                        style={{ backgroundColor: t.color || "#1e293b" }}
                      >
                        {t.shortName || t.name.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest block">
                          Slot #{idx + 1}
                        </span>
                        <h4 className="font-headline font-black text-white text-base leading-tight">
                          {t.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTeam(t.id, t.name)}
                      title="Elimină clubul din campionat"
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-label text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-lime-400"></span>
                      <span>Club Confirmat ✓</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {t.shortName || "OFICIAL"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-label text-slate-400">
                  <span>Lot jucători: Gestionat de căpitan</span>
                  <span className="text-lime-400 font-bold">Activ</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
