"use client";

import React, { useState } from "react";

interface ChampionshipLogoBadgeProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
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
  logoUrl,
  size = "md",
  className = "",
}: ChampionshipLogoBadgeProps) {
  const [imageError, setImageError] = useState(false);

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

  const hasValidLogo = Boolean(logoUrl && logoUrl.trim() && !imageError);

  if (hasValidLogo) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-lime-400/60 bg-slate-900 ${sizeClasses} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl!}
          alt={`Siglă ${name}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center rounded-full"
        />
      </div>
    );
  }

  // Fallback: Round Badge with Initials on Vibrant Gradient Background
  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-headline uppercase tracking-tight shadow-md select-none ring-2 ring-white/10 ${gradientClass} ${sizeClasses} ${className}`}
      title={`Campionat: ${name}`}
    >
      <span className="leading-none drop-shadow-sm">{initials}</span>
    </div>
  );
}
