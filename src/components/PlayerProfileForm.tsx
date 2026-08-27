"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  primarySport?: string | null;
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
  isEditable?: boolean;
}

const SPORT_OPTIONS = [
  { id: "fotbal", label: "Fotbal", icon: "sports_soccer" },
  { id: "tenis", label: "Tenis", icon: "sports_tennis" },
  { id: "padel", label: "Padel", icon: "🏓" },
  { id: "pingpong", label: "Ping-Pong", icon: "circle" },
  { id: "baschet", label: "Baschet", icon: "sports_basketball" },
  { id: "volei", label: "Volei", icon: "sports_volleyball" },
  { id: "handbal", label: "Handbal", icon: "sports_handball" },
];

const SPORT_POSITIONS: Record<string, { label: string; value: string }[]> = {
  fotbal: [
    { label: "Portar (GK)", value: "Portar" },
    { label: "Fundaș Central (CB)", value: "Fundaș Central" },
    { label: "Fundaș Lateral (LB/RB)", value: "Fundaș Lateral" },
    { label: "Mijlocaș Defensiv (CDM)", value: "Mijlocaș Defensiv" },
    { label: "Mijlocaș Central (CM)", value: "Mijlocaș Central" },
    { label: "Mijlocaș Ofensiv (CAM)", value: "Mijlocaș Ofensiv" },
    { label: "Extremă (LW/RW)", value: "Extremă" },
    { label: "Atacant Central (ST/CF)", value: "Atacant Central" },
  ],
  tenis: [
    { label: "Jucător Simplu (Singles)", value: "Jucător Simplu" },
    { label: "Jucător Dublu (Doubles)", value: "Jucător Dublu" },
    { label: "Jucător Mixt (Mixed Doubles)", value: "Jucător Mixt" },
  ],
  padel: [
    { label: "Jucător Partea Dreaptă (Drive)", value: "Jucător Partea Dreaptă (Drive)" },
    { label: "Jucător Partea Stângă (Reves)", value: "Jucător Partea Stângă (Reves)" },
    { label: "Jucător Polivalent (Dreapta & Stânga)", value: "Jucător Polivalent" },
  ],
  pingpong: [
    { label: "Jucător Ofensiv (Attacker)", value: "Jucător Ofensiv" },
    { label: "Jucător Defensiv (Defender)", value: "Jucător Defensiv" },
    { label: "Jucător Allround", value: "Jucător Allround" },
  ],
  baschet: [
    { label: "Conducător de Joc (Point Guard - PG)", value: "Point Guard (PG)" },
    { label: "Aruncător (Shooting Guard - SG)", value: "Shooting Guard (SG)" },
    { label: "Extremă Mică (Small Forward - SF)", value: "Small Forward (SF)" },
    { label: "Extremă Mare (Power Forward - PF)", value: "Power Forward (PF)" },
    { label: "Pivot (Center - C)", value: "Center (C)" },
  ],
  volei: [
    { label: "Ridicător (Setter)", value: "Ridicător (Setter)" },
    { label: "Trăgător Secund (Outside Hitter)", value: "Trăgător Secund" },
    { label: "Universal (Opposite Hitter)", value: "Universal" },
    { label: "Centru (Middle Blocker)", value: "Centru" },
    { label: "Libero (Defensive Specialist)", value: "Libero" },
  ],
  handbal: [
    { label: "Portar (GK)", value: "Portar" },
    { label: "Extremă Stânga (LW)", value: "Extremă Stânga" },
    { label: "Inter Stânga (LB)", value: "Inter Stânga" },
    { label: "Centru Coordonator (CB)", value: "Centru Coordonator" },
    { label: "Inter Dreapta (RB)", value: "Inter Dreapta" },
    { label: "Extremă Dreapta (RW)", value: "Extremă Dreapta" },
    { label: "Pivot (P)", value: "Pivot" },
  ],
};

export function PlayerProfileForm({ initialUser, isEditable = true }: PlayerProfileFormProps) {
  const nameParts = (initialUser.name || "").split(" ");
  const [firstName, setFirstName] = useState<string>(nameParts[0] || "");
  const [lastName, setLastName] = useState<string>(nameParts.slice(1).join(" ") || "");
  const [email] = useState<string>(initialUser.email || "");
  const [phone, setPhone] = useState<string>(initialUser.phone || "+40 722 000 111");

  // Sport selection (Single-choice)
  const [primarySport, setPrimarySport] = useState<string>(initialUser.primarySport || "fotbal");

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

  const currentPositions = SPORT_POSITIONS[primarySport] || SPORT_POSITIONS.fotbal;

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
      label: "Teren Tenis & Padel",
      url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
    },
    {
      label: "Meci pe Stadion  ",
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const AVATAR_PRESETS = [
    {
      label: "Portret Studio  ",
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
          text: `Fotografia a fost actualizată. Apasă pe Salvează Profil pentru a o păstra permanent.`,
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
      text: "Imaginea a fost actualizată. Nu uita să apeși Salvează Profil.",
      type: "success",
    });
  }

  function handleSportChange(newSport: string) {
    setPrimarySport(newSport);
    const newPositions = SPORT_POSITIONS[newSport] || SPORT_POSITIONS.fotbal;
    if (newPositions.length > 0) {
      setPosition(newPositions[0].value);
    }
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
          primarySport,
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

      setMessage({ text: "Profilul de sportiv a fost salvat cu succes în baza de date.", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative">
      {!isEditable && (
        <div className="lg:col-span-12 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-base text-amber-400">lock</span>
          <span>
            <strong>Mod Vizualizare:</strong> Acest profil poate fi editat doar de către sportivul însuși sau de managerul său de echipă.
          </span>
        </div>
      )}

      {/* Hidden File Inputs */}
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
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Card Prezentare
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-semibold uppercase tracking-wider">
              {isEditable ? "Sportiv Înregistrat" : "Vizualizare"}
            </span>
          </div>

          {/* 9:14 Full-Body Cover Photo */}
          <div
            onDoubleClick={() => isEditable && setActivePhotoModal("cover")}
            title={isEditable ? "Dublu-click pentru a schimba poza în picioare (9:16)" : "Profil în mod vizualizare"}
            className="aspect-[9/14] w-full rounded-xl overflow-hidden relative mb-4 bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group/cover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPhotoUrl}
              alt="Poză în picioare jucător"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";
              }}
              className="w-full h-full object-cover object-center group-hover/cover:scale-105 transition-transform duration-500"
            />
            {/* Double-Click Hover Indicator */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4 text-white z-10">
              <span className="w-10 h-10 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center mb-2 shadow-md scale-90 group-hover/cover:scale-100 transition-transform">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </span>
              <p className="font-semibold text-xs text-white">
                Dublu-click pe imagine
              </p>
              <p className="text-[11px] text-lime-300 font-normal">
                pentru a schimba fotografia în picioare
              </p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
              <span className="text-[10px] font-medium text-lime-400 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  {SPORT_OPTIONS.find((s) => s.id === primarySport)?.icon || "sports_soccer"}
                </span>
                <span>{SPORT_OPTIONS.find((s) => s.id === primarySport)?.label || "Fotbal"}</span>
              </span>
              <p className="font-semibold text-white text-base leading-tight mt-0.5">
                {firstName || "Nume"} {lastName || "Jucător"}
              </p>
              <p className="text-xs text-slate-300">
                #{jerseyNumber} • {position}
              </p>
            </div>
          </div>

          {/* Face Headshot Overlay */}
          <div className="flex items-center gap-3.5 pt-1">
            <div
              onDoubleClick={() => setActivePhotoModal("avatar")}
              title="Dublu-click pentru a schimba poza portret"
              className="w-16 h-16 rounded-xl border-2 border-white dark:border-slate-900 overflow-hidden shadow-md -mt-10 z-20 relative bg-slate-900 cursor-pointer group/avatar shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Poză față portret"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
                }}
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-lime-400">
                <span className="material-symbols-outlined text-lg">edit</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate">
                {firstName || "Nume"} {lastName || "Sportiv"}
              </h3>
              <p className="text-xs text-lime-600 dark:text-lime-400 font-medium truncate mt-0.5">
                {position}
              </p>
            </div>
          </div>

          {/* Quick Photo Presets / Selectors */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Poză în Picioare (Full-Body)
                </label>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="text-[11px] font-medium text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">upload_file</span>
                  <span>Încarcă fișier</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {COVER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverPhotoUrl(p.url)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-lime-400 text-center truncate transition"
                  >
                    Preset #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Poză Portret Față
                </label>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="text-[11px] font-medium text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">upload_file</span>
                  <span>Încarcă fișier</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-lime-400 text-center truncate transition"
                  >
                    Portret #{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-slate-100/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm text-lime-500">lock</span>
            <span>Confidențialitate Date Contact</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Numărul de telefon și adresa de email sunt protejate și vizibile doar managerului de echipă și organizatorilor competiției.
          </p>
        </div>
      </div>

      {/* Right Column: Form Data (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm ${message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
              }`}
          >
            <span className="material-symbols-outlined text-base">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Section 0: Selecție Sport Principal (Single-Choice) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">sports</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  1. Sport Principal Practicat
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  Selectează sportul tău de bază (formularul și pozițiile se adaptează automat)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Alegere Unică
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
            {SPORT_OPTIONS.map((sp) => {
              const isSelected = primarySport === sp.id;
              return (
                <button
                  key={sp.id}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => handleSportChange(sp.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${isSelected
                    ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 border-slate-900 dark:border-lime-400 font-semibold shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-400"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {sp.icon}
                  </span>
                  <span className="text-xs font-medium">{sp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Date Personale & Identitate */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                2. Date Personale &amp; Identitate
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Informații afișate pe foaia  ă de joc și în catalogul de sportivi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Prenume *
              </label>
              <input
                type="text"
                required
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ex: Florin"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Nume de Familie *
              </label>
              <input
                type="text"
                required
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ex: Popescu"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Adresă Email (Conectare)
              </label>
              <input
                type="email"
                disabled
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-not-allowed"
                value={email}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Număr Telefon Mobil
              </label>
              <input
                type="tel"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+40 722 123 456"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fișă Tehnică & Poziție adaptată sportului */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">tune</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                3. Poziție &amp; Parametri Fizici ({SPORT_OPTIONS.find((s) => s.id === primarySport)?.label || "Fotbal"})
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Poziționare tactică și atribute sportive
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Poziție / Specializare
              </label>
              <select
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {currentPositions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Număr Tricou
              </label>
              <input
                type="number"
                min={1}
                max={99}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 10)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Braț / Picior Preferat
              </label>
              <select
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value)}
              >
                <option value="Drept">Drept (Right)</option>
                <option value="Stâng">Stâng (Left)</option>
                <option value="Ambele">Ambele / Ambidextru</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Înălțime (cm)
              </label>
              <input
                type="number"
                min={140}
                max={220}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 180)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Greutate (kg)
              </label>
              <input
                type="number"
                min={40}
                max={140}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 75)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rețele Sociale */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                4. Profiluri Social Media
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Link-uri afișate public pe fișa de meci și cartonașul de prezentare
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Instagram
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="instagram.com/cont"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                X / Twitter
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="x.com/cont"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Facebook
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="facebook.com/cont"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex justify-between items-center pt-2">
          <Link
            href="/campionat"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Înapoi la Campionat</span>
          </Link>

          {isEditable && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs uppercase tracking-wider shadow-sm active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{saving ? "Se salvează..." : "Salvează Profilul"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Double-Click Interactive Photo Change Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-600 dark:text-lime-400 block mb-0.5">
                  Actualizare Fotografie
                </span>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  {activePhotoModal === "cover"
                    ? "Poză în Picioare (Full-Body)"
                    : "Poză Portret Față (Headshot)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Option 1: File Upload */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Opțiunea 1: Încarcă din Dispozitiv
              </span>
              <button
                type="button"
                onClick={() => {
                  if (activePhotoModal === "cover") coverFileInputRef.current?.click();
                  else avatarFileInputRef.current?.click();
                }}
                className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Selectează Fișier</span>
              </button>
            </div>

            {/* Option 2: Direct Image URL */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Opțiunea 2: Introdu URL Imagine Direct
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCustomUrl(activePhotoModal)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 text-xs font-medium transition"
                >
                  Aplică
                </button>
              </div>
            </div>

            {/* Option 3: Presets Gallery */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Opțiunea 3: Galerie Preset
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
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-lime-400 text-left text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center gap-2 truncate"
                  >
                    <span className="material-symbols-outlined text-sm text-lime-500">check</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium"
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
