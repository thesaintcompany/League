"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  className?: string;
  imgClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitleText?: string;
  variant?: "header" | "sidebar" | "footer" | "hero";
  onClick?: () => void;
}

export function BrandLogo({
  href = "/campionat",
  className = "",
  imgClassName = "",
  size = "md",
  showSubtitle = false,
  subtitleText,
  variant = "header",
  onClick,
}: BrandLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/images/logos/logo-1.png");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // 1. Fetch current active logo from public settings
    async function fetchLogo() {
      try {
        const res = await fetch("/api/settings/public");
        const data = await res.json();
        if (data.activeLogoUrl) {
          setLogoUrl(data.activeLogoUrl);
        }
      } catch (err) {
        // Fallback default
      }
    }

    fetchLogo();

    // 2. Listen for real-time logo change events from SuperAdmin panel
    function onLogoChanged(e: any) {
      if (e.detail?.logoUrl) {
        setLogoUrl(e.detail.logoUrl);
        setImgError(false);
      }
    }

    window.addEventListener("app-logo-updated", onLogoChanged as EventListener);
    return () => window.removeEventListener("app-logo-updated", onLogoChanged as EventListener);
  }, []);

  const sizeClasses = {
    sm: "h-7 max-w-[150px]",
    md: "h-9 sm:h-10 max-w-[190px] sm:max-w-[220px]",
    lg: "h-11 sm:h-12 max-w-[240px] sm:max-w-[280px]",
    xl: "h-14 sm:h-16 max-w-[320px] sm:max-w-[380px]",
  };

  const content = (
    <div className={`flex items-center gap-2 group ${className}`}>
      {!imgError ? (
        <div className="relative flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Pro Ligue România"
            className={`${sizeClasses[size]} w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200 ${imgClassName}`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Fallback if image path fails */
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black italic tracking-tight uppercase font-headline block leading-none text-slate-950 dark:text-white">
              PRO LIGUE
            </span>
            <span className="text-[8px] sm:text-[9px] font-label font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">
              {subtitleText || "ROMÂNIA"}
            </span>
          </div>
        </div>
      )}

      {showSubtitle && subtitleText && (
        <span className="text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-l border-slate-200 dark:border-slate-800 pl-2.5 ml-1 hidden sm:inline">
          {subtitleText}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
