"use client";

import React from "react";

interface SportsBackgroundSilhouetteProps {
  variant?: "striker" | "running" | "hero";
  className?: string;
}

export function SportsBackgroundSilhouette({
  variant = "striker",
  className = "",
}: SportsBackgroundSilhouetteProps) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
    >
      {/* Dynamic Stadium Light Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 sm:w-[550px] sm:h-[550px] bg-lime-400/10 dark:bg-lime-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 sm:w-[480px] sm:h-[480px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 sm:w-[400px] sm:h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Subtle Geometric Sport Pitch Grid & Speed Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="sports-mesh-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(25)"
          >
            <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sports-mesh-pattern)" />
      </svg>

      {/* Dynamic Player Silhouette Watermark (Right-aligned, athletic motion) */}
      <div className="absolute right-0 bottom-0 top-12 w-full max-w-xl sm:max-w-2xl lg:max-w-3xl flex items-end justify-end opacity-[0.06] dark:opacity-[0.11] transition-opacity duration-700">
        <svg
          viewBox="0 0 800 1000"
          className="w-full h-auto max-h-[88vh] text-slate-900 dark:text-lime-300 drop-shadow-[0_20px_40px_rgba(132,204,22,0.15)]"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dynamic Action Speed Streaks */}
          <g opacity="0.4" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
            <line x1="120" y1="620" x2="320" y2="580" strokeDasharray="15 10" />
            <line x1="80" y1="680" x2="280" y2="650" strokeDasharray="25 15" />
            <line x1="150" y1="740" x2="350" y2="720" strokeDasharray="30 20" />
            <line x1="200" y1="420" x2="380" y2="390" strokeDasharray="12 8" />
          </g>

          {/* Athletic Football Striker Silhouette in Dynamic Kick & Volley Pose */}
          <g transform="translate(100, 40)">
            {/* Head and dynamic focus */}
            <circle cx="430" cy="180" r="42" />

            {/* Torso in athletic forward lean */}
            <path d="M400,230 L470,245 L450,450 L360,430 Z" />

            {/* Powerful Left Leg planted/drawn back */}
            <path d="M375,420 L300,560 L240,680 L280,700 L350,600 L415,445 Z" />
            {/* Planted Foot / Cleat */}
            <path d="M235,675 L180,720 L240,735 L285,700 Z" />

            {/* Powerful Right Leg striking forward into the air */}
            <path d="M440,430 L550,520 L660,480 L670,440 L560,470 L460,410 Z" />
            {/* Striking Foot & Cleat with motion angle */}
            <path d="M660,480 L730,460 L720,420 L665,438 Z" />

            {/* Right Arm balancing in high athletic tension */}
            <path d="M465,245 L570,290 L630,240 L605,210 L550,260 L455,235 Z" />

            {/* Left Arm driving forward for kinetic balance */}
            <path d="M395,240 L310,310 L250,270 L230,295 L295,350 L385,265 Z" />

            {/* Ball in kinetic trajectory with speed arcs */}
            <circle cx="755" cy="380" r="38" />
            <path
              d="M725,360 A38,38 0 0,1 775,365 M735,395 A38,38 0 0,1 785,390"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            {/* Energy burst lines behind the ball */}
            <path
              d="M795,360 L835,340 M800,380 L850,380 M795,400 L840,420"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Dynamic Ground Horizon Slanted Vector */}
          <polygon
            points="0,880 800,760 800,920 0,980"
            opacity="0.15"
          />
        </svg>
      </div>
    </div>
  );
}
