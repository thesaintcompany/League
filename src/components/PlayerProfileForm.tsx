"use client";

import React, { useState } from "react";
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
  ];

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

      setMessage({ text: "Profilul de jucător a fost salvat cu succes! ✓", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

          {/* 9:16 Full-Body Cover Photo */}
          <div className="aspect-[9/14] w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhotoUrl}
              alt="Poză în picioare jucător"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
              <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest">
                Poză în picioare (9:16)
              </span>
              <p className="font-headline font-bold text-white text-lg leading-tight">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-slate-300 font-label">
                #{jerseyNumber} • {position}
              </p>
            </div>
          </div>

          {/* Face Headshot Overlay */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-lg -mt-10 z-20 relative bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Poză față portret"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-blue-950 dark:text-white leading-tight">
                {firstName} {lastName}
              </h3>
              <p className="font-label text-[11px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-wider">
                {position}
              </p>
            </div>
          </div>

          {/* Quick Photo Presets / Selectors */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1">
                Alege Poză în Picioare (Full-Body)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {COVER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverPhotoUrl(p.url)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-lime-50 dark:hover:bg-slate-800 hover:border-lime-400 text-center truncate transition"
                  >
                    Foto #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1">
                Alege Poză Portret Față (Headshot)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
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

        {/* 1. Identity & Contact */}
        <section className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-headline font-extrabold text-xl text-blue-950 dark:text-white">
                Identitate &amp; Date de Contact
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Informații oficiale înregistrate în baza de date Ligue
              </p>
            </div>
            <span className="w-10 h-1 bg-lime-400 rounded-full"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Prenume (First Name)
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input text-sm"
                placeholder="ex: Radu"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Nume de Familie (Surname)
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input text-sm"
                placeholder="ex: Drăgușin"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                  Adresă Email Oficială
                </label>
                <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
              </div>
              <input
                type="email"
                disabled
                value={email}
                className="input text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                  Număr de Telefon
                </label>
                <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input text-sm"
                placeholder="+40 722 000 111"
              />
            </div>
          </div>
        </section>

        {/* 2. Football Attributes & Telemetry */}
        <section className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-headline font-extrabold text-xl text-blue-950 dark:text-white">
                Fișă Tehnică &amp; Poziționare Fotbal
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Parametri sportivi vizibili pe foaia oficială de joc și profilul public
              </p>
            </div>
            <span className="w-10 h-1 bg-lime-400 rounded-full"></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Poziție în Teren
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="input text-sm"
              >
                <option value="Portar">Portar (GK)</option>
                <option value="Fundaș Central">Fundaș Central (CB)</option>
                <option value="Fundaș Lateral Dreapta">Fundaș Lateral Dreapta (RB)</option>
                <option value="Fundaș Lateral Stânga">Fundaș Lateral Stânga (LB)</option>
                <option value="Mijlocaș Defensiv">Mijlocaș Defensiv (CDM)</option>
                <option value="Mijlocaș Central">Mijlocaș Central (CM)</option>
                <option value="Mijlocaș Ofensiv">Mijlocaș Ofensiv (CAM)</option>
                <option value="Extremă Dreapta">Extremă Dreapta (RW)</option>
                <option value="Extremă Stânga">Extremă Stânga (LW)</option>
                <option value="Atacant Central">Atacant Central (ST/CF)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Număr pe Tricou
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 1)}
                className="input text-sm font-bold data-font"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Picior de Bază
              </label>
              <select
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value)}
                className="input text-sm"
              >
                <option value="Drept">Drept (Right)</option>
                <option value="Stâng">Stâng (Left)</option>
                <option value="Ambele">Ambele (Both)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Înălțime (cm)
              </label>
              <input
                type="number"
                min={120}
                max={220}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 180)}
                className="input text-sm font-bold data-font"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">
                Greutate (kg)
              </label>
              <input
                type="number"
                min={40}
                max={140}
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 75)}
                className="input text-sm font-bold data-font"
              />
            </div>
          </div>
        </section>

        {/* 3. Fan Connectivity & Social Links */}
        <section className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-headline font-extrabold text-xl text-blue-950 dark:text-white">
                Fan Connectivity &amp; Rețele Sociale
              </h3>
              <p className="text-xs text-slate-500 font-label">
                Conectează conturile pentru comunitatea de suporteri
              </p>
            </div>
            <span className="w-10 h-1 bg-lime-400 rounded-full"></span>
          </div>

          <div className="space-y-4">
            {/* Instagram */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center font-bold">
                📷
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Instagram Handle / Link
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="input text-xs"
                  placeholder="instagram.com/player"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black">
                𝕏
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Twitter / X
                </label>
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="input text-xs"
                  placeholder="x.com/player"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                📘
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-label font-bold text-slate-400 uppercase">
                  Facebook
                </label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="input text-xs"
                  placeholder="facebook.com/player"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <Link
            href="/players"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-label font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center border border-slate-200 dark:border-slate-800"
          >
            Vezi Catalog Jucători ↗
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-headline font-black text-xs uppercase tracking-wider bg-lime-400 hover:bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {saving ? "Se salvează..." : "Salvează Modificările ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
