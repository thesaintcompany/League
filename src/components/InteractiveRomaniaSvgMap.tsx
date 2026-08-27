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

  function handleCountyClick(countyName: string) {
    onSelectCounty(countyName);
  }

  return (
    <div className={`relative w-full rounded-3xl bg-slate-950 p-2 sm:p-4 border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Background Ambient Radar & Contour Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[400px] h-[250px] sm:h-[300px] bg-lime-400/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Top Map Header Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-2 px-2 pt-1">
        <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-white text-[10px] sm:text-[11px] font-bold font-label uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
          <span><span className="material-symbols-outlined text-xs align-middle">flag</span> Harta Teritorial</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-mono font-bold text-lime-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-xl">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {selectedCounty.toUpperCase()} ACTIVAT</span>
        </span>
      </div>

      {/* SVG Canvas with All 42 Romanian Counties */}
      <div className="relative w-full aspect-[613/433] my-auto">
        <svg
          viewBox="0 0 613 433"
          className="w-full h-full select-none cursor-pointer filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] touch-manipulation"
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
                  onClick={() => handleCountyClick(c.name)}
                  onTouchStart={() => {
                    handleCountyClick(c.name);
                    setHoveredCounty(c);
                  }}
                  onMouseEnter={() => setHoveredCounty(c)}
                  className="group focus:outline-none"
                >
                  {/* County Territory Path */}
                  <path
                    d={c.path}
                    className={`transition-all duration-200 ease-out stroke-[2] sm:stroke-[2.5] stroke-slate-900 ${
                      isSelected
                        ? "fill-lime-400 stroke-white scale-[1.015] drop-shadow-[0_0_15px_rgba(163,230,53,0.9)] z-30"
                        : isHovered
                        ? "fill-lime-300/80 stroke-lime-400 z-20"
                        : hasEvents
                        ? "fill-slate-800/95 hover:fill-lime-500/30 active:fill-lime-400"
                        : "fill-slate-900/90 hover:fill-slate-800 active:fill-lime-400"
                    }`}
                    style={{
                      transformOrigin: `${c.center[0]}px ${c.center[1]}px`,
                    }}
                  />

                  {/* County Code Label */}
                  <text
                    x={c.center[0]}
                    y={c.center[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-[10px] sm:text-[11px] font-black font-headline tracking-tighter transition-all pointer-events-none ${
                      isSelected
                        ? "fill-slate-950 text-[12px] sm:text-[13px] font-black"
                        : isHovered
                        ? "fill-slate-950 font-black text-[11px] sm:text-[12px]"
                        : hasEvents
                        ? "fill-lime-400 font-extrabold"
                        : "fill-slate-400 font-bold"
                    }`}
                  >
                    {c.id}
                  </text>

                  {/* Activity Indicator Dot */}
                  {hasEvents && !isSelected && (
                    <circle
                      cx={c.center[0] + 10}
                      cy={c.center[1] - 7}
                      r={2.5}
                      className="fill-lime-400 animate-pulse pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Hover Tooltip (Hidden on touch devices, shown on desktop hover) */}
        {hoveredCounty && (
          <div
            className="hidden sm:flex absolute pointer-events-none z-50 bg-slate-900/95 border-2 border-lime-400 text-white px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-75 items-center gap-2.5 animate-in fade-in zoom-in-90"
            style={{
              left: `${Math.min(Math.max(mousePos.x - 20, 10), 460)}px`,
              top: `${Math.min(Math.max(mousePos.y - 60, 10), 360)}px`,
            }}
          >
            <div className="w-7 h-7 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
              {hoveredCounty.id}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-lime-400 font-label block leading-none">
                Județul {hoveredCounty.name}
              </span>
              <p className="text-[11px] font-bold font-headline text-white mt-0.5">
                Apasă pentru detalii ↗
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend (Bottom responsive bar) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-900/80 text-[10px] sm:text-[11px] font-label text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-lime-400 border border-white"></span>
            <span className="font-bold text-white">Selectat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-800 border border-lime-400/40"></span>
            <span>Are Turnee</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 italic">
          Atinge orice județ pentru a schimba selecția
        </span>
      </div>
    </div>
  );
}
