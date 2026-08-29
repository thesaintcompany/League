"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NotFoundClientProps {
  initialTitle?: string;
  initialMessage?: string;
  initialCountdown?: number;
  initialRedirectEnabled?: boolean;
  initialButtonText?: string;
  initialRedirectUrl?: string;
  initialLogoUrl?: string;
}

export function NotFoundClient({
  initialTitle = "Pagina nu a fost găsită",
  initialMessage = "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit.",
  initialCountdown = 10,
  initialRedirectEnabled = true,
  initialButtonText = "Mergi la Pagina Principală",
  initialRedirectUrl = "/",
  initialLogoUrl,
}: NotFoundClientProps) {
  const router = useRouter();

  // Settings state (with fallback to client API if needed)
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);
  const [totalSeconds, setTotalSeconds] = useState(
    initialCountdown > 0 ? initialCountdown : 10
  );
  const [redirectEnabled, setRedirectEnabled] = useState(initialRedirectEnabled);
  const [buttonText, setButtonText] = useState(initialButtonText);
  const [redirectUrl, setRedirectUrl] = useState(initialRedirectUrl);

  // Countdown & navigation state
  const [secondsLeft, setSecondsLeft] = useState(
    initialCountdown > 0 ? initialCountdown : 10
  );
  const [isPaused, setIsPaused] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with real-time settings if changed
  useEffect(() => {
    async function loadLatestSettings() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          if (data.notFoundTitle) setTitle(data.notFoundTitle);
          if (data.notFoundMessage) setMessage(data.notFoundMessage);
          if (typeof data.notFoundCountdown === "number" && data.notFoundCountdown > 0) {
            setTotalSeconds(data.notFoundCountdown);
            setSecondsLeft((prev) => (prev > data.notFoundCountdown ? data.notFoundCountdown : prev));
          }
          if (typeof data.notFoundRedirectEnabled === "boolean") {
            setRedirectEnabled(data.notFoundRedirectEnabled);
          }
          if (data.notFoundButtonText) setButtonText(data.notFoundButtonText);
          if (data.notFoundRedirectUrl) setRedirectUrl(data.notFoundRedirectUrl);
        }
      } catch (err) {
        // use initial props
      }
    }
    loadLatestSettings();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!redirectEnabled || isPaused || hasRedirected) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setHasRedirected(true);
          router.push(redirectUrl || "/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [redirectEnabled, isPaused, hasRedirected, redirectUrl, router]);

  // Handle immediate navigation
  const handleImmediateRedirect = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHasRedirected(true);
    router.push(redirectUrl || "/");
  };

  // Handle back navigation
  const handleGoBack = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Progress percentage (0% to 100%)
  const progressPercent =
    totalSeconds > 0 ? Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950 relative overflow-hidden font-body">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <BrandLogo href="/" size="md" showSubtitle subtitleText="ROMÂNIA" />
        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold font-label transition"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>Acasă</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl text-center space-y-8 overflow-hidden">
            {/* Top Glowing Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent" />

            {/* Error Badge & Stylized 404 Visual */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase font-label tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>EROARE 404 • PAGINĂ INEXISTENTĂ</span>
              </div>

              {/* Big 404 with sports badge icon */}
              <div className="relative inline-flex items-center justify-center my-2">
                <span className="text-7xl sm:text-9xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 select-none drop-shadow-lg">
                  404
                </span>
                <div className="absolute -bottom-2 sm:-bottom-3 px-4 py-1 rounded-2xl bg-lime-400 text-slate-950 font-black text-xs sm:text-sm uppercase font-headline tracking-wider shadow-lg flex items-center gap-1.5 border border-lime-300/40">
                  <span className="material-symbols-outlined text-base sm:text-lg">explore_off</span>
                  <span>RUTĂ INVALIDĂ</span>
                </div>
              </div>
            </div>

            {/* Title & Message */}
            <div className="space-y-3 max-w-xl mx-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-headline tracking-tight text-white uppercase">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-body leading-relaxed">
                {message}
              </p>
            </div>

            {/* Auto-Redirect Timer Box (if enabled) */}
            {redirectEnabled && (
              <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-label">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <span className="material-symbols-outlined text-lime-400 text-lg">
                      {isPaused ? "pause_circle" : "timer"}
                    </span>
                    <span>
                      {isPaused ? (
                        <span className="text-amber-400">Redirecționare pusă pe pauză</span>
                      ) : (
                        <span>
                          Redirecționare automată în{" "}
                          <strong className="text-lime-400 font-mono text-sm px-1.5 py-0.5 rounded bg-lime-400/10 border border-lime-400/30">
                            {secondsLeft}s
                          </strong>
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white underline underline-offset-2 transition"
                  >
                    {isPaused ? "Reia cronometrul" : "Oprește"}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      isPaused
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleImmediateRedirect}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black font-headline text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-lime-400/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">home</span>
                <span>{buttonText}</span>
              </button>

              <button
                type="button"
                onClick={handleGoBack}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-headline text-xs sm:text-sm uppercase tracking-wider border border-slate-700 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Pagina Anterioară</span>
              </button>
            </div>

            {/* Useful Quick Links Hub */}
            <div className="pt-6 border-t border-slate-800/80">
              <p className="text-[11px] font-label font-bold uppercase tracking-widest text-slate-500 mb-4">
                Sau explorează secțiunile principale ale platformei:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <Link
                  href="/harta-romaniei"
                  className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-lime-400/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-base">map</span>
                  </div>
                  <h4 className="text-xs font-black font-headline text-white group-hover:text-lime-400 transition-colors">
                    Harta României
                  </h4>
                  <p className="text-[10px] text-slate-400 font-label line-clamp-1">
                    Arene &amp; Competiții
                  </p>
                </Link>

                <Link
                  href="/campionat"
                  className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-lime-400/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-base">emoji_events</span>
                  </div>
                  <h4 className="text-xs font-black font-headline text-white group-hover:text-blue-400 transition-colors">
                    Campionate
                  </h4>
                  <p className="text-[10px] text-slate-400 font-label line-clamp-1">
                    Ligi Oficiale
                  </p>
                </Link>

                <Link
                  href="/clasamente"
                  className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-lime-400/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-base">leaderboard</span>
                  </div>
                  <h4 className="text-xs font-black font-headline text-white group-hover:text-purple-400 transition-colors">
                    Clasamente
                  </h4>
                  <p className="text-[10px] text-slate-400 font-label line-clamp-1">
                    Statistici &amp; Puncte
                  </p>
                </Link>

                <Link
                  href="/contact"
                  className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-lime-400/40 transition group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-base">support_agent</span>
                  </div>
                  <h4 className="text-xs font-black font-headline text-white group-hover:text-emerald-400 transition-colors">
                    Suport &amp; Contact
                  </h4>
                  <p className="text-[10px] text-slate-400 font-label line-clamp-1">
                    Asistență Tehnică
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-500 font-label flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900">
        <div>
          <span>&copy; {new Date().getFullYear()} PRO LIGUE ROMÂNIA. Toate drepturile rezervate.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/termeni" className="hover:text-lime-400 transition">
            Termeni și Condiții
          </Link>
          <span>&bull;</span>
          <Link href="/confidentialitate" className="hover:text-lime-400 transition">
            Confidențialitate
          </Link>
          <span>&bull;</span>
          <Link href="/contact" className="hover:text-lime-400 transition">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
