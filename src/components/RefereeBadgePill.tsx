import React from "react";

/**
 * Smart Badge Component:
 * - If badge has <= 2 words: Renders compact stylish badge
 * - If badge has > 2 words: Renders a glowing dot + 2 words, and full text on hover tooltip!
 */
export function RefereeBadgePill({ badge }: { badge?: string | null }) {
  if (!badge) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-bold font-label uppercase border border-slate-700">
        FRF
      </span>
    );
  }

  const words = badge.trim().split(/\s+/);
  const isLong = words.length > 2;

  if (!isLong) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label shadow-sm">
        {badge}
      </span>
    );
  }

  // Long badge (> 2 words): Show a sleek glowing dot + 2-word preview, and full text tooltip on mouseover!
  const shortText = `${words[0]} ${words[1]}`;

  return (
    <div className="group/badge relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md text-lime-400 text-[10px] font-black uppercase font-label border border-lime-400/40 cursor-help shadow-lg">
      <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shrink-0"></span>
      <span className="truncate max-w-[90px]">{shortText}</span>

      {/* Hover Floating Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/badge:flex flex-col items-center z-50 pointer-events-none min-w-[180px] animate-in fade-in zoom-in-95">
        <span className="bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl border border-lime-400/50 shadow-2xl text-center leading-tight whitespace-nowrap">
          {badge}
        </span>
        <span className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-lime-400/50"></span>
      </div>
    </div>
  );
}
