"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  image?: string | null;
  coverPhotoUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  position?: string | null;
  jerseyNumber?: number | null;
  preferredFoot?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  facebookUrl?: string | null;
}

interface PlayerProfileFormProps {
  initialUser: UserProfile;
}

export function PlayerProfileForm({ initialUser }: PlayerProfileFormProps) {
  // Split name into first and last name if possible
  const nameParts = (initialUser.name || "").split(" ");
  const [firstName, setFirstName] = useState<string>(nameParts[0] || "");
  const [lastName, setLastName] = useState<string>(nameParts.slice(1).join(" ") || "");
  const [email] = useState<string>(initialUser.email || "");
  const [phone, setPhone] = useState<string>(initialUser.phone || "+40 722 000 111");

  // Visual Assets
  const [image, setImage] = useState<string>(
    initialUser.image ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(
    initialUser.coverPhotoUrl ||
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
  );

  // Modal State for Photo Change on Double Click
  const [activePhotoModal, setActivePhotoModal] = useState<"cover" | "avatar" | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>("");

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Player telemetry
  const [position, setPosition] = useState<string>(initialUser.position || "Atacant Central");
  const [jerseyNumber, setJerseyNumber] = useState<number>(initialUser.jerseyNumber || 10);
  const [preferredFoot, setPreferredFoot] = useState<string>(initialUser.preferredFoot || "Drept");
  const [heightCm, setHeightCm] = useState<number>(initialUser.heightCm || 185);
  const [weightKg, setWeightKg] = useState<number>(initialUser.weightKg || 78);

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState<string>(
    initialUser.instagramUrl || "instagram.com/player"
  );
  const [twitterUrl, setTwitterUrl] = useState<string>(
    initialUser.twitterUrl || "x.com/player"
  );
  const [facebookUrl, setFacebookUrl] = useState<string>(
    initialUser.facebookUrl || "facebook.com/player"
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Preset photos for quick demonstration
  const COVER_PRESETS = [
    {
      label: "Echipament Teren Nocturnă",
      url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Sală & Condiționare Fizică",
      url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Meci pe Stadion Oficial",
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Pregătire & Warm-up",
      url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const AVATAR_PRESETS = [
    {
      label: "Portret Studio Oficial",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Portret Atletic",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Portret Căpitan",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      label: "Portret Număr 10",
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    },
  ];

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "avatar") {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        if (target === "cover") {
          setCoverPhotoUrl(result);
        } else {
          setImage(result);
        }
        setActivePhotoModal(null);
        setMessage({
          text: `Fotografia ${target === "cover" ? "în picioare" : "de profil"} a fost actualizată! Apasă pe Salvează Profil pentru a o păstra permanent. ✓`,
          type: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleApplyCustomUrl(target: "cover" | "avatar") {
    if (!customUrlInput.trim()) return;
    if (target === "cover") {
      setCoverPhotoUrl(customUrlInput.trim());
    } else {
      setImage(customUrlInput.trim());
    }
    setCustomUrlInput("");
    setActivePhotoModal(null);
    setMessage({
      text: "Imaginea a fost încărcată cu succes! Nu uita să apeși Salvează Profil. ✓",
      type: "success",
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone,
          image,
          coverPhotoUrl,
          position,
          jerseyNumber,
          preferredFoot,
          heightCm,
          weightKg,
          instagramUrl,
          twitterUrl,
          facebookUrl,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Eroare la salvarea profilului");
      }

      setMessage({ text: "Profilul de jucător a fost salvat cu succes în baza de date! ✓", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      {/* Hidden File Inputs for Direct File Selection */}
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "cover")}
      />
      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "avatar")}
      />

      {/* Left Column: Visual Assets (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Profile Visual Card */}
        <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden relative group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Card de Prezentare Jucător
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label">
              PRO ATLET
            </span>
          </div>

          {/* 9:16 Full-Body Cover Photo (Interactive Double-Click) */}
          <div
            onDoubleClick={() => setActivePhotoModal("cover")}
            title="Dublu-click pentru a schimba poza în picioare (9:16)"
            className="aspect-[9/14] w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer group/cover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhotoUrl}
              alt="Poză în picioare jucător"
              className="w-full h-full object-cover object-center group-hover/cover:scale-105 transition-transform duration-500"
            />
            {/* Double-Click Hover Indicator */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4 text-white z-10">
              <span className="w-12 h-12 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mb-2 shadow-lg scale-90 group-hover/cover:scale-100 transition-transform">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
              </span>
              <p className="font-headline font-black text-xs uppercase tracking-wider text-white">
                Dublu-click pe poză
              </p>
              <p className="text-[11px] text-lime-300 font-label">
                pentru a schimba poza în picioare (9:16)
              </p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5 pointer-events-none">
              <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest">
                Poză în picioare (9:16)
              </span>
              <p className="font-headline font-bold text-white text-lg leading-tight">
                {firstName || "Nume"} {lastName || "Jucător"}
              </p>
              <p className="text-xs text-slate-300 font-label">
                #{jerseyNumber} • {position}
              </p>
            </div>
          </div>

          {/* Face Headshot Overlay (Interactive Double-Click) */}
          <div className="flex items-center gap-4 pt-2">
            <div
              onDoubleClick={() => setActivePhotoModal("avatar")}
              title="Dublu-click pentru a schimba poza portret"
              className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-xl -mt-12 z-20 relative bg-slate-900 cursor-pointer group/avatar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Poză față portret"
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-lime-400">
                <span className="material-symbols-outlined text-xl">edit</span>
              </div>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-blue-950 dark:text-white leading-tight">
                {firstName || "Nume"} {lastName || "Jucător"}
              </h3>
              <p className="font-label text-[11px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider">
                {position}
              </p>
              <span className="text-[10px] text-slate-400 font-label block mt-0.5">
                💡 Dublu-click pe portret pentru schimbare
              </span>
            </div>
          </div>

          {/* Quick Photo Presets / Selectors */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Poză în Picioare (Full-Body 9:16)
                </label>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="text-[10px] font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                >
                  Încarcă fișier 📁
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {COVER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverPhotoUrl(p.url)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-lime-50 dark:hover:bg-slate-800 hover:border-lime-400 text-center truncate transition"
                  >
                    Preset #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Poză Portret Față (Headshot)
                </label>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="text-[10px] font-bold text-lime-600 dark:text-lime-400 hover:underline font-label"
                >
                  Încarcă fișier 📁
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-lime-50 dark:hover:bg-slate-800 hover:border-lime-400 text-center truncate transition"
                  >
                    Portret #{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Information Card */}
        <div className="card p-6 bg-surface-container-low dark:bg-slate-800/40 border-l-4 border-lime-500 rounded-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-600 text-lg">lock</span>
            <h4 className="font-headline font-bold text-xs text-blue-950 dark:text-white uppercase tracking-wider">
              Confidențialitate Date Contact
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-body">
            Numărul de telefon și adresa de email sunt securizate și vizibile doar Liderului de Echipă și Organizatorilor Oficiali.
          </p>
        </div>
      </div>

      {/* Right Column: Form Data (8 cols) */}
      <div className="lg:col-span-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold font-label flex items-center gap-2 shadow-sm ${
              message.type === "success"
                ? "bg-lime-100 text-lime-900 border border-lime-300"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            {message.text}
          </div>
        )}

        {/* Section 1: Date Personale & Identitate */}
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
                1. Date Personale &amp; Identitate Sportivă
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Informații afișate pe foaia oficială de joc și cartonașul de meci
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Prenume *</label>
              <input
                type="text"
                required
                className="input text-xs"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ex: Florin"
              />
            </div>

            <div>
              <label className="label">Nume de Familie *</label>
              <input
                type="text"
                required
                className="input text-xs"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ex: Tănase"
              />
            </div>

            <div>
              <label className="label">Adresă Email (Conectare)</label>
              <input
                type="email"
                disabled
                className="input text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                value={email}
              />
            </div>

            <div>
              <label className="label">Număr Telefon Mobil</label>
              <input
                type="tel"
                className="input text-xs"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+40 722 123 456"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fișă Tehnică Jucător */}
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">sports_soccer</span>
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
                2. Poziție &amp; Parametri Fizici
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Statistici tehnice pentru delegarea tactică în teren
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Poziție în Teren</label>
              <select
                className="input text-xs"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="Portar">Portar (GK)</option>
                <option value="Fundaș Central">Fundaș Central (CB)</option>
                <option value="Fundaș Lateral">Fundaș Lateral (LB/RB)</option>
                <option value="Mijlocaș Defensiv">Mijlocaș Defensiv (CDM)</option>
                <option value="Mijlocaș Central">Mijlocaș Central (CM)</option>
                <option value="Mijlocaș Ofensiv">Mijlocaș Ofensiv (CAM)</option>
                <option value="Extremă">Extremă (LW/RW)</option>
                <option value="Atacant Central">Atacant Central (ST/CF)</option>
              </select>
            </div>

            <div>
              <label className="label">Număr pe Tricou</label>
              <input
                type="number"
                min={1}
                max={99}
                className="input text-xs font-bold"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 10)}
              />
            </div>

            <div>
              <label className="label">Picior Preferat</label>
              <select
                className="input text-xs"
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value)}
              >
                <option value="Drept">Drept (Right)</option>
                <option value="Stâng">Stâng (Left)</option>
                <option value="Ambidextru">Ambidextru (Both)</option>
              </select>
            </div>

            <div>
              <label className="label">Înălțime (cm)</label>
              <input
                type="number"
                min={140}
                max={220}
                className="input text-xs"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 180)}
              />
            </div>

            <div>
              <label className="label">Greutate (kg)</label>
              <input
                type="number"
                min={40}
                max={140}
                className="input text-xs"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 75)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rețele Sociale */}
        <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container text-slate-950 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">share</span>
            </div>
            <div>
              <h3 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
                3. Profiluri Social Media
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Linkurile afișate public pe cartonașul de golgheter și fișa de meci
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Instagram</label>
              <input
                type="text"
                className="input text-xs"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="instagram.com/cont"
              />
            </div>

            <div>
              <label className="label">X / Twitter</label>
              <input
                type="text"
                className="input text-xs"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="x.com/cont"
              />
            </div>

            <div>
              <label className="label">Facebook</label>
              <input
                type="text"
                className="input text-xs"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="facebook.com/cont"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex justify-between items-center pt-4">
          <Link
            href="/campionat"
            className="text-xs font-label font-bold text-slate-500 hover:text-blue-950 dark:hover:text-white"
          >
            ← Înapoi la Campionat
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-xl shadow-lime-400/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {saving ? "Se salvează..." : "Salvează Profilul de Jucător ✓"}
          </button>
        </div>
      </div>

      {/* Double-Click Interactive Photo Change Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400 block mb-1">
                  Schimbă Fotografia Rapid
                </span>
                <h3 className="font-headline font-black text-xl uppercase tracking-tight text-white">
                  {activePhotoModal === "cover"
                    ? "Poză în Picioare (Full-Body 9:16)"
                    : "Poză Portret Față (Headshot)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Option 1: File Upload from Device */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 1: Încarcă din Telefon / Calculator
              </span>
              <button
                type="button"
                onClick={() => {
                  if (activePhotoModal === "cover") coverFileInputRef.current?.click();
                  else avatarFileInputRef.current?.click();
                }}
                className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">upload_file</span>
                Selectează Fișier Imagine de pe Dispozitiv
              </button>
            </div>

            {/* Option 2: Direct Image URL */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 2: Introdu URL Imagine Direct
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 w-full focus:outline-none focus:border-lime-400"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCustomUrl(activePhotoModal)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase font-label transition"
                >
                  Aplică
                </button>
              </div>
            </div>

            {/* Option 3: Presets Gallery */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-label font-bold text-slate-300 uppercase tracking-wider block">
                Opțiunea 3: Alege din Galeria Oficială Preset
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(activePhotoModal === "cover" ? COVER_PRESETS : AVATAR_PRESETS).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (activePhotoModal === "cover") setCoverPhotoUrl(p.url);
                      else setImage(p.url);
                      setActivePhotoModal(null);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-lime-400 text-left text-xs font-bold text-slate-300 transition flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm text-lime-400">check</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold font-label uppercase"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
