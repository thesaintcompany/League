"use client";

import React, { useState, useRef } from "react";

interface ChampionshipLogoBadgeProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  editable?: boolean;
  championshipId?: string;
  onLogoChange?: (newLogoUrl: string) => void;
}

/**
 * Extract up to 3 uppercase initials from a championship name.
 * e.g. "Campionatul Județean Timiș" -> "CJT"
 * "SuperLiga 2026" -> "SL"
 * "Liga 4 Vest" -> "L4V"
 */
export function getChampionshipInitials(name: string): string {
  if (!name || !name.trim()) return "CP";
  const clean = name.trim().replace(/\b(202\d|203\d)\b/g, "").trim(); // remove year
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  const initials = words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");

  return initials || "CP";
}

/**
 * Generate a deterministic harmonious gradient background based on championship name.
 */
export function getChampionshipGradient(name: string): string {
  const gradients = [
    "bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-700 text-slate-950 border-lime-300/80 shadow-lime-500/20",
    "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-800 text-white border-blue-400/50 shadow-blue-500/20",
    "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-slate-950 border-amber-300/80 shadow-amber-500/20",
    "bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-700 text-slate-950 border-cyan-300/80 shadow-cyan-500/20",
    "bg-gradient-to-br from-purple-500 via-fuchsia-600 to-pink-600 text-white border-purple-400/50 shadow-purple-500/20",
    "bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800 text-slate-950 border-emerald-300/80 shadow-emerald-500/20",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function ChampionshipLogoBadge({
  name,
  logoUrl: initialLogoUrl,
  size = "md",
  className = "",
  editable = false,
  championshipId,
  onLogoChange,
}: ChampionshipLogoBadgeProps) {
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null | undefined>(initialLogoUrl);
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentLogoUrl(initialLogoUrl);
    setImageError(false);
  }, [initialLogoUrl]);

  // Size mapping
  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-black border",
    md: "w-11 h-11 text-sm font-black border-2",
    lg: "w-16 h-16 text-xl font-black border-2",
    xl: "w-20 h-20 text-2xl font-black border-2",
    "2xl": "w-24 h-24 text-3xl font-black border-4",
  }[size];

  const initials = getChampionshipInitials(name);
  const gradientClass = getChampionshipGradient(name);

  const hasValidLogo = Boolean(currentLogoUrl && currentLogoUrl.trim() && !imageError);

  function handleDoubleClick(e: React.MouseEvent) {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Imaginea este prea mare. Dimensiunea maximă admisă este de 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) {
          setUploading(false);
          return;
        }

        // If championshipId is provided, save via PATCH
        if (championshipId) {
          const res = await fetch(`/api/championships/${championshipId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logoUrl: dataUrl }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            alert(errData.error || "Eroare la salvarea siglei campionatului.");
            setUploading(false);
            return;
          }
        }

        setCurrentLogoUrl(dataUrl);
        setImageError(false);
        setUploading(false);
        if (onLogoChange) onLogoChange(dataUrl);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Error uploading championship logo:", err);
      alert("Eroare la încărcarea imaginii.");
      setUploading(false);
    }
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`group relative select-none shrink-0 ${editable ? "cursor-pointer" : ""} ${className}`}
      title={editable ? `Dublu-click pe siglă pentru a încărca imaginea oficială a campionatului (${name})` : `Campionat: ${name}`}
    >
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
        />
      )}

      {hasValidLogo ? (
        <div
          className={`relative rounded-full overflow-hidden shadow-lg border-2 border-lime-400/60 bg-slate-900 transition-transform ${editable ? "group-hover:scale-105" : ""} ${sizeClasses}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLogoUrl!}
            alt={`Siglă ${name}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center rounded-full"
          />
        </div>
      ) : (
        <div
          className={`rounded-full flex items-center justify-center font-headline uppercase tracking-tight shadow-md ring-2 ring-white/10 transition-transform ${editable ? "group-hover:scale-105" : ""} ${gradientClass} ${sizeClasses}`}
        >
          <span className="leading-none drop-shadow-sm">{initials}</span>
        </div>
      )}

      {/* Editable Overlay Icon on Hover */}
      {editable && (
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 pointer-events-none">
          {uploading ? (
            <span className="material-symbols-outlined text-lg sm:text-xl animate-spin text-lime-400">
              progress_activity
            </span>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm sm:text-lg text-lime-400">
                photo_camera
              </span>
              <span className="text-[7px] sm:text-[8px] font-black uppercase font-label tracking-tighter text-lime-300">
                2x Click
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
