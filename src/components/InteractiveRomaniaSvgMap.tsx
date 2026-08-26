"use client";

import React, { useState } from "react";
import { ROMANIA_COUNTIES_SVG, CountySvgData } from "@/lib/romaniaSvgPaths";

interface InteractiveRomaniaSvgMapProps {
  selectedCounty: string;
  onSelectCounty: (countyName: string) => void;
  getCountyStats?: (countyName: string) => { championshipsCount: number; venuesCount: number };
  className?: string;
}

export function InteractiveRomaniaSvgMap({
  selectedCounty,
  onSelectCounty,
  getCountyStats,
  className = "",
}: InteractiveRomaniaSvgMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<CountySvgData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div className={`relative w-full aspect-[613/433] max-w-full overflow-hidden rounded-3xl bg-slate-950 p-2 sm:p-4 border-2 border-slate-800 shadow-2xl ${className}`}>
      {/* Background Ambient Radar & Contour Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-lime-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Map Header Controls */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-3 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-[11px] font-bold font-label uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
          <span>🇷🇴 Harta Interactivă Teritorială</span>
        </div>
        <span className="text-[10px] text-slate-400 font-label hidden sm:inline">
          Apasă pe orice județ pentru a deschide competițiile locale
        </span>
      </div>

      {/* SVG Canvas with All 42 Romanian Counties */}
      <svg
        viewBox="0 0 613 433"
        className="w-full h-full select-none cursor-pointer filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCounty(null)}
      >
        <defs>
          <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Each County Polygon */}
        <g className="transition-all duration-300">
          {ROMANIA_COUNTIES_SVG.map((c) => {
            const isSelected = selectedCounty.toLowerCase() === c.name.toLowerCase();
            const isHovered = hoveredCounty?.id === c.id;
            const stats = getCountyStats ? getCountyStats(c.name) : { championshipsCount: 0, venuesCount: 0 };
            const hasEvents = stats.championshipsCount > 0;

            return (
              <g
                key={c.id}
                onClick={() => onSelectCounty(c.name)}
                onMouseEnter={() => setHoveredCounty(c)}
                className="group focus:outline-none"
              >
                {/* County Territory Path */}
                <path
                  d={c.path}
                  className={`transition-all duration-200 ease-out stroke-[2.5] stroke-slate-900 ${
                    isSelected
                      ? "fill-lime-400 stroke-white scale-[1.01] drop-shadow-[0_0_15px_rgba(163,230,53,0.8)] z-30"
                      : isHovered
                        ? "fill-lime-300/80 stroke-lime-400 z-20"
                        : hasEvents
                          ? "fill-slate-800/95 hover:fill-lime-500/30"
                          : "fill-slate-900/90 hover:fill-slate-800"
                  }`}
                  style={{
                    transformOrigin: `${c.center[0]}px ${c.center[1]}px`,
                  }}
                />

                {/* County Code Label & Pulse Indicator */}
                <text
                  x={c.center[0]}
                  y={c.center[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-[11px] font-black font-headline tracking-tighter transition-all pointer-events-none ${
                    isSelected
                      ? "fill-slate-950 text-[13px] font-black"
                      : isHovered
                        ? "fill-slate-950 font-black text-[12px]"
                        : hasEvents
                          ? "fill-lime-400 font-extrabold"
                          : "fill-slate-400 font-bold"
                  }`}
                >
                  {c.id}
                </text>

                {/* Tiny Activity Dot if County has Local Tournaments */}
                {hasEvents && !isSelected && (
                  <circle
                    cx={c.center[0] + 12}
                    cy={c.center[1] - 8}
                    r={3}
                    className="fill-lime-400 animate-pulse pointer-events-none"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredCounty && (
        <div
          className="absolute pointer-events-none z-50 bg-slate-900/95 border-2 border-lime-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-75 flex items-center gap-3 animate-in fade-in zoom-in-90"
          style={{
            left: `${Math.min(mousePos.x + 15, 750)}px`,
            top: `${Math.min(mousePos.y + 15, 520)}px`,
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
            {hoveredCounty.id}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-lime-400 font-label block leading-none">
              Județul {hoveredCounty.name} ({hoveredCounty.region})
            </span>
            <p className="text-xs font-bold font-headline text-white mt-0.5">
              Apasă pentru a deschide selectorul din dreapta ↗
            </p>
          </div>
        </div>
      )}

      {/* Map Legend Overlay at Bottom */}
      <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl text-[11px] font-label text-slate-300 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-lime-400 border border-white"></span>
            <span className="font-bold text-white">Județ Selectat ({selectedCounty})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-800 border border-lime-400/40"></span>
            <span>Are Competiții Locale</span>
          </div>
        </div>

        <div className="text-[11px] font-mono font-bold text-lime-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl pointer-events-auto">
          📍 {selectedCounty.toUpperCase()} ACTIVAT
        </div>
      </div>
    </div>
  );
}
