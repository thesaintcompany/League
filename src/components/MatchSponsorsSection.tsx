"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl?: string;
  category?: string;
  tagline?: string;
}

// Preset database with top Romanian companies and national brands across all key sectors
const DEFAULT_ROMANIAN_SPONSORS: SponsorItem[] = [
  { id: "sp-1", name: "Banca Transilvania", category: "Bănci & Servicii Financiare", tagline: "Banca Oamenilor Întreprinzători" },
  { id: "sp-2", name: "Dedeman", category: "Bricolaj & Construcții", tagline: "Dedicat planurilor tale" },
  { id: "sp-3", name: "eMAG", category: "E-Commerce & Tehnologie", tagline: "Căutarea nu se oprește niciodată" },
  { id: "sp-4", name: "Bitdefender", category: "Securitate Cibernetică", tagline: "Global Cyber Security Leader" },
  { id: "sp-5", name: "Dacia", category: "Automotive Național", tagline: "Performanță & Aventură" },
  { id: "sp-6", name: "Hidroelectrica", category: "Energie 100% Verde", tagline: "Liderul Energiei Verzi" },
  { id: "sp-7", name: "OMV Petrom", category: "Energie & Resurse", tagline: "Energie pentru o viață mai bună" },
  { id: "sp-8", name: "Rompetrol", category: "Carburanți & Rafinărie", tagline: "Pasiune pentru Performanță" },
  { id: "sp-9", name: "CEC Bank", category: "Bănci & Tradiție Românească", tagline: "Tradiție din 1864" },
  { id: "sp-10", name: "BRD Groupe Société Générale", category: "Servicii Bancare", tagline: "Tu ești viitorul" },
  { id: "sp-11", name: "Banca Comercială Română (BCR)", category: "Grup Financiar & Tech", tagline: "Școala de Bani" },
  { id: "sp-12", name: "Digi | RCS & RDS", category: "Telecomunicații & Fibră", tagline: "Conectivitate Națională" },
  { id: "sp-13", name: "Mobexpert", category: "Design Interior & Mobilier", tagline: "Fabricat în România" },
  { id: "sp-14", name: "Altex România", category: "Electrocasnice & IT", tagline: "Cel mai mic preț din România" },
  { id: "sp-15", name: "FAN Courier", category: "Curierat Rapid & Logistică", tagline: "Oriunde, cu plăcere" },
  { id: "sp-16", name: "Aqua Carpatica", category: "Ape Minerale Premium", tagline: "Puritate din Munții Carpați" },
  { id: "sp-17", name: "Borsec", category: "Ape Minerale Naturale", tagline: "Regina Apelor Minerale" },
  { id: "sp-18", name: "Napolact", category: "Lactate Tradiționale", tagline: "Ca odinioară în Ardeal" },
  { id: "sp-19", name: "Cris-Tim", category: "Industrie Alimentară", tagline: "Calitate & Familie" },
  { id: "sp-20", name: "Transavia", category: "Producție Alimentară", tagline: "Well made in Romania" },
  { id: "sp-21", name: "Farmec & Gerovital", category: "Cosmetice & Îngrijire", tagline: "Tradiție & Inovație" },
  { id: "sp-22", name: "MedLife", category: "Sănătate & Servicii Medicale", tagline: "Medicină Privată Românească" },
  { id: "sp-23", name: "Regina Maria", category: "Rețea Privată de Sănătate", tagline: "Pasiune pentru sănătate" },
  { id: "sp-24", name: "Romgaz", category: "Energie & Gaze Naturale", tagline: "Performanță Românească" },
  { id: "sp-25", name: "Electrica", category: "Distribuție Energie", tagline: "Tradiție în energie" },
  { id: "sp-26", name: "Arabesque", category: "Materiale de Construcții", tagline: "Partenerul profesioniștilor" },
  { id: "sp-27", name: "Timișoreana", category: "Berărie din 1718", tagline: "Povestea merge mai departe" },
  { id: "sp-28", name: "Ursus Breweries", category: "Berării & Sponsor Sport", tagline: "Regele Berii în România" },
  { id: "sp-29", name: "Covalact de Țară", category: "Lactate Tradiționale", tagline: "Prea bun, prea ca la țară" },
  { id: "sp-30", name: "Autonom", category: "Mobilitate & Rent a Car", tagline: "Soluții de Mobilitate" },
  { id: "sp-31", name: "Terapia Cluj", category: "Industrie Farmaceutică", tagline: "Sănătate pentru România" },
  { id: "sp-32", name: "Betty Ice", category: "Înghețată Premium", tagline: "Pasiune din Bucovina" },
  { id: "sp-33", name: "Kandia Dulce", category: "Dulciuri & Ciocolată", tagline: "Ciocolată cu tradiție din 1890" },
  { id: "sp-34", name: "Cărturești", category: "Cultură & Carte", tagline: "Librării cu sens" },
  { id: "sp-35", name: "Sameday Courier", category: "Curierat & Rețea Easybox", tagline: "Livrare rapidă la Easybox" },
  { id: "sp-36", name: "UiPath", category: "Robotic Process Automation", tagline: "Inovație Tehnologică Globală" },
];

export function MatchSponsorsSection({ matchId }: { matchId: string }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isOrganizerOrAdmin = Boolean(
    session?.user && (userRole === "organizer" || userRole === "super_admin" || userRole === "superadmin")
  );

  const [sponsors, setSponsors] = useState<SponsorItem[]>(DEFAULT_ROMANIAN_SPONSORS);
  const [isOrganizerMode, setIsOrganizerMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New sponsor form states
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorCategory, setNewSponsorCategory] = useState("Sponsor  ");
  const [newSponsorLogoUrl, setNewSponsorLogoUrl] = useState("");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load persisted custom sponsors from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`match_sponsors_${matchId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSponsors(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading sponsors:", e);
    }
  }, [matchId]);

  // Save to localStorage whenever sponsors change in Organizer mode
  function saveSponsorsList(updated: SponsorItem[]) {
    setSponsors(updated);
    try {
      localStorage.setItem(`match_sponsors_${matchId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving sponsors:", e);
    }
  }

  // Handle local file upload
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Dimensiunea imaginii nu poate depăși 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setPreviewDataUrl(result);
      setNewSponsorLogoUrl(result);
    };
    reader.readAsDataURL(file);
  }

  // Submit new sponsor
  function handleAddSponsor(e: React.FormEvent) {
    e.preventDefault();
    if (!newSponsorName.trim()) return;

    const newItem: SponsorItem = {
      id: `custom-sp-${Date.now()}`,
      name: newSponsorName.trim(),
      category: newSponsorCategory,
      logoUrl: previewDataUrl || newSponsorLogoUrl || undefined,
      tagline: newSponsorName.trim(),
    };

    const updated = [newItem, ...sponsors];
    saveSponsorsList(updated);

    setStatusMsg(`✓ Logoul pentru "${newSponsorName}" a fost adăugat cu succes!`);
    setNewSponsorName("");
    setNewSponsorLogoUrl("");
    setPreviewDataUrl(null);
    setShowAddModal(false);

    setTimeout(() => setStatusMsg(null), 3000);
  }

  // Delete a sponsor
  function handleDeleteSponsor(id: string, name: string) {
    if (!confirm(`Sigur eliminați logoul sponsorului "${name}"?`)) return;
    const updated = sponsors.filter((s) => s.id !== id);
    saveSponsorsList(updated);
  }

  // Reset to default preset list
  function handleResetDefault() {
    if (!confirm("Restabiliți lista implicită de 32 de sponsori  i?")) return;
    saveSponsorsList(DEFAULT_ROMANIAN_SPONSORS);
  }

  return (
    <section className="card p-6 sm:p-10 bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden font-body">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800/80 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-widest shadow-md">
              🛡️ PARTENERI &amp; SPONSORI  I
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 text-lime-400 font-bold text-xs font-label border border-lime-400/20">
              {sponsors.length} Branduri Partenere
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-headline text-white uppercase tracking-tight">
            Sponsorii Meciului &amp; Competiției
          </h2>
          <p className="text-xs text-slate-400 font-body max-w-2xl leading-relaxed">
            Grilă  ă de prezentare a sponsorilor parteneri. <strong>Organizatorul exclusiv</strong> poate adăuga, edita sau actualiza logourile de pe tabelul competițional.
          </p>
        </div>

        {/* Organizer Exclusive Controls (Visible ONLY for Authenticated Organizers / Admins) */}
        {isOrganizerOrAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOrganizerMode((v) => !v)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-label font-black uppercase tracking-wider transition border shadow-md flex items-center gap-2 ${isOrganizerMode
                  ? "bg-amber-400 text-slate-950 border-amber-400 scale-105"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
            >
              <span className="material-symbols-outlined text-base">
                {isOrganizerMode ? "admin_panel_settings" : "lock"}
              </span>
              {isOrganizerMode ? "Mod Organizator Activ ✓" : "Panou Exclusiv Organizator"}
            </button>

            {isOrganizerMode && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95 animate-in fade-in"
              >
                <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                + Încarcă Logo Sponsor
              </button>
            )}
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-lime-950/90 border border-lime-400 text-lime-300 text-xs font-bold font-label animate-in fade-in">
          {statusMsg}
        </div>
      )}

      {/* Grid of White Rounded Logo Cards Matching Reference Image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 relative z-10">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="group relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center h-24 sm:h-28 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-slate-100/80 cursor-pointer overflow-hidden"
          >
            {/* Delete button when Organizer Mode is ON */}
            {isOrganizerMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSponsor(sponsor.id, sponsor.name);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md z-20 transition"
                title="Şterge Logo Sponsor"
              >
                ✕
              </button>
            )}

            {sponsor.logoUrl ? (
              /* Uploaded Image or Custom URL */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="max-h-16 sm:max-h-18 max-w-[85%] object-contain filter group-hover:contrast-125 transition"
              />
            ) : (
              /* Styled Brand Typography Logo Card for Default Presets */
              <div className="flex flex-col items-center justify-center text-center space-y-1 w-full">
                <span className="font-headline font-black text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-amber-600 transition leading-tight line-clamp-2">
                  {sponsor.name}
                </span>
                <span className="text-[9px] font-label font-bold text-slate-400 uppercase tracking-widest truncate max-w-full">
                  {sponsor.category || "Partener  "}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Placeholder "+ Adaugă" Card in Organizer Mode */}
        {isOrganizerMode && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 hover:bg-slate-850 border-2 border-dashed border-lime-400/60 hover:border-lime-400 rounded-2xl p-4 flex flex-col items-center justify-center h-24 sm:h-28 text-lime-400 transition-all duration-300 group shadow-md"
          >
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition">
              add_circle
            </span>
            <span className="text-xs font-headline font-black uppercase tracking-wider mt-1">
              Încarcă Logo Nou
            </span>
          </button>
        )}
      </div>

      {/* Footer info for Organizer reset */}
      {isOrganizerMode && (
        <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-xs font-label text-slate-400">
          <span>Modificările sunt salvate automat pentru această pagină.</span>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-amber-400 hover:underline font-bold"
          >
            ↻ Resetează la Sponsorii Naționali Impliciti (36 Branduri Românești)
          </button>
        </div>
      )}

      {/* Organizer Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSponsor}
            className="bg-slate-900 border-2 border-lime-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-white animate-in fade-in zoom-in-95"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">add_photo_alternate</span>
                <h3 className="text-lg font-bold font-headline uppercase tracking-tight text-white">
                  Panou Organizator: Adaugă Logo Sponsor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Live White Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                Previzualizare Card Alb Sponsor (așa cum va apărea pe pagină):
              </span>

              <div className="mx-auto w-48 h-24 bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg border border-slate-200">
                {previewDataUrl || newSponsorLogoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewDataUrl || newSponsorLogoUrl}
                    alt="Preview"
                    className="max-h-16 max-w-[85%] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="font-headline font-black text-sm text-slate-900 block">
                      {newSponsorName || "Nume Sponsor"}
                    </span>
                    <span className="text-[9px] font-label font-bold text-slate-400 uppercase">
                      {newSponsorCategory}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Nume Sponsor / Firma *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Banca Transilvania, Dedeman, eMAG, Bitdefender, Aqua Carpatica..."
                  value={newSponsorName}
                  onChange={(e) => setNewSponsorName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Categorie Parteneriat
                </label>
                <select
                  value={newSponsorCategory}
                  onChange={(e) => setNewSponsorCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-lime-400"
                >
                  <option value="Sponsor Principal">🏆 Sponsor Principal</option>
                  <option value="Sponsor  ">⭐ Sponsor  </option>
                  <option value="Partener Tehnic">⚙️ Partener Tehnic</option>
                  <option value="Partener Media">📺 Partener Media &amp; TV</option>
                  <option value="Partener Local">📍 Partener Local</option>
                </select>
              </div>

              {/* Upload File Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-label text-slate-300 uppercase block">
                  1. Încarcă Fișier Imagine Logo (PNG / JPG / SVG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-lime-400 file:text-slate-950 hover:file:bg-lime-300 cursor-pointer"
                />
              </div>

              {/* OR Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-label text-slate-300 uppercase block">
                  2. Sau Introdu Adresă Link Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://domeniu.ro/logo-sponsor.png"
                  value={newSponsorLogoUrl}
                  onChange={(e) => {
                    setNewSponsorLogoUrl(e.target.value);
                    if (e.target.value) setPreviewDataUrl(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={!newSponsorName.trim()}
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
              >
                Salvează Logo Sponsor
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
