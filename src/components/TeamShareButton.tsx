"use client";

import React, { useState } from "react";

interface TeamShareButtonProps {
  teamName: string;
}

export function TeamShareButton({ teamName }: TeamShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${teamName} — Pagina Oficială a Echipei`,
          text: `Urmărește echipa ${teamName} pe platforma oficială: clasamente, meciuri live, lotul de jucători și istoric meciuri!`,
          url,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-headline font-bold text-xs uppercase tracking-wider transition border border-white/20 flex items-center gap-2 shadow-lg active:scale-95"
      title="Distribuie pagina echipei"
    >
      <span className="material-symbols-outlined text-base">
        {copied ? "check" : "share"}
      </span>
      <span>{copied ? "Link Copiat!" : "Distribuie Echipa"}</span>
    </button>
  );
}
