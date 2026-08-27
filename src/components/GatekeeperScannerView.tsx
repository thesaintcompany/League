"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ScanResult {
  valid: boolean;
  status: "access_granted" | "already_used" | "invalid" | "cancelled";
  message?: string;
  error?: string;
  ticket?: {
    id?: string;
    ticketCode: string;
    buyerName?: string;
    seatSector?: string;
    seatRow?: string;
    seatNumber?: string;
    price?: number;
    checkedInAt?: string;
    checkedInBy?: string;
    match?: {
      teams: string;
      venue: string;
      stage: string;
    };
  };
}

export function GatekeeperScannerView({
  matchId,
  token,
  stewardInitialName = "Steward Poarta 1",
}: {
  matchId?: string;
  token?: string;
  stewardInitialName?: string;
}) {
  const [stewardName, setStewardName] = useState(stewardInitialName);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scannedHistory, setScannedHistory] = useState<Array<{ code: string; name: string; sector: string; time: string; status: string }>>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stats, setStats] = useState({ checkedIn: 0, total: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio sound feedback
  function playAudioFeedback(type: "success" | "error") {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6 note
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // AudioContext unavailable
    }
  }

  async function validateTicket(codeToValidate: string) {
    if (!codeToValidate || loading) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToValidate,
          stewardName,
          token,
        }),
      });
      const data: ScanResult = await res.json();
      setScanResult(data);

      if (data.valid) {
        playAudioFeedback("success");
        setStats((prev) => ({ ...prev, checkedIn: prev.checkedIn + 1 }));
        setScannedHistory((prev) => [
          {
            code: data.ticket?.ticketCode || codeToValidate,
            name: data.ticket?.buyerName || "Spectator",
            sector: data.ticket?.seatSector || "Tribuna",
            time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: "VALID",
          },
          ...prev.slice(0, 19),
        ]);
      } else {
        playAudioFeedback("error");
        setScannedHistory((prev) => [
          {
            code: codeToValidate,
            name: data.ticket?.buyerName || "Necunoscut",
            sector: data.ticket?.seatSector || "—",
            time: new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            status: data.status === "already_used" ? "DEJA FOLOSIT" : "INVALID",
          },
          ...prev.slice(0, 19),
        ]);
      }
    } catch (e: any) {
      setScanResult({
        valid: false,
        status: "invalid",
        error: "Eroare de conexiune la serverul de verificare.",
      });
      playAudioFeedback("error");
    } finally {
      setLoading(false);
      setManualCode("");
    }
  }

  // Camera start / stop
  async function startCamera() {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError("Camera nu a putut fi accesată. Folosiți introducerea manuală a codului.");
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body p-4 sm:p-6 flex flex-col max-w-lg mx-auto">
      {/* Top Gate Header */}
      <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
            <span className="material-symbols-outlined align-middle text-sm">phone_iphone</span>
          </div>
          <div>
            <h1 className="text-base font-black font-headline uppercase text-white tracking-tight leading-none">
              Scanner Acces Porți
            </h1>
            <p className="text-[10px] text-lime-400 font-mono font-bold mt-0.5">
              LIGUE PRO LIVE GATEKEEPER
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
        >
           Ieșire
        </Link>
      </header>

      {/* Steward Name & Gate Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl mb-6 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-lime-400 text-base">badge</span>
          <input
            type="text"
            value={stewardName}
            onChange={(e) => setStewardName(e.target.value)}
            className="bg-transparent text-xs font-bold text-white border-none focus:outline-none focus:ring-0 truncate"
            placeholder="Nume Steward / Poartă"
          />
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-950 text-lime-400 font-mono text-[10px] font-bold border border-slate-800 shrink-0">
           ONLINE
        </span>
      </div>

      {/* Live Scanner Result Banner */}
      {scanResult && (
        <div
          className={`p-5 rounded-3xl mb-6 border-2 shadow-2xl animate-in zoom-in-95 space-y-2 ${
            scanResult.valid
              ? "bg-emerald-950/90 border-emerald-400 text-emerald-100"
              : scanResult.status === "already_used"
              ? "bg-amber-950/90 border-amber-400 text-amber-100"
              : "bg-red-950/90 border-red-500 text-red-100"
          }`}
        >
          <div className="flex items-center gap-3">
              <span className="text-3xl material-symbols-outlined">
                {scanResult.valid ? "check_circle" : scanResult.status === "already_used" ? "warning" : "cancel"}
            </span>
            <div>
              <h3 className="font-headline font-black text-sm uppercase tracking-wide">
                {scanResult.valid
                  ? "ACCES PERMIS (VALID)"
                  : scanResult.status === "already_used"
                  ? "BILET DEJA SCANAT!"
                  : "BILET INVALID"}
              </h3>
              <p className="text-xs leading-tight">
                {scanResult.valid ? scanResult.message : scanResult.error}
              </p>
            </div>
          </div>

          {scanResult.ticket && (
            <div className="pt-3 mt-2 border-t border-white/10 text-xs font-label grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] uppercase text-white/60 block">Spectator</span>
                <strong className="text-white block truncate">{scanResult.ticket.buyerName || "—"}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase text-white/60 block">Sector / Zonă</span>
                <strong className="text-lime-300 block">{scanResult.ticket.seatSector || "—"}</strong>
              </div>
              {scanResult.ticket.seatRow && (
                <div>
                  <span className="text-[9px] uppercase text-white/60 block">Rând / Loc</span>
                  <span className="text-white">{scanResult.ticket.seatRow} • {scanResult.ticket.seatNumber}</span>
                </div>
              )}
              {scanResult.ticket.checkedInAt && (
                <div>
                  <span className="text-[9px] uppercase text-white/60 block">Ora Scanării</span>
                  <span className="text-white font-mono">
                    {new Date(scanResult.ticket.checkedInAt).toLocaleTimeString("ro-RO")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Camera Live Viewfinder */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-6 relative overflow-hidden text-center space-y-4">
        {cameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Viewfinder Target Box Overlay */}
            <div className="absolute inset-8 border-2 border-lime-400/80 rounded-2xl pointer-events-none animate-pulse flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-4 h-4 border-t-4 border-l-4 border-lime-400"></span>
                <span className="w-4 h-4 border-t-4 border-r-4 border-lime-400"></span>
              </div>
              <div className="text-[10px] font-mono font-bold text-lime-400 bg-slate-950/80 px-2 py-0.5 rounded-full mx-auto">
                POZIȚIONEAZĂ QR CODE ÎN CADRU
              </div>
              <div className="flex justify-between">
                <span className="w-4 h-4 border-b-4 border-l-4 border-lime-400"></span>
                <span className="w-4 h-4 border-b-4 border-r-4 border-lime-400"></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-500">photo_camera</span>
            <p className="text-xs text-slate-400 font-label">
              Camera este oprită. Puteți activa camera video pentru scanare continuă sau introduce codul manual.
            </p>
          </div>
        )}

        {cameraError && (
          <p className="text-xs text-amber-400 font-label">{cameraError}</p>
        )}

        <div className="flex gap-2">
          {cameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase rounded-2xl transition"
            >
              Oprește Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
            >
              <span className="material-symbols-outlined text-sm">camera_alt</span> Pornește Camera Scanner
            </button>
          )}
        </div>
      </div>

      {/* Manual Code Input & Test Fast Keys */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          validateTicket(manualCode);
        }}
        className="space-y-3 mb-6"
      >
        <label className="text-xs font-bold font-label text-slate-300 uppercase block">
          Scanare / Introducere Cod Bilet
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="ex: TCK-2026-98FA"
            className="flex-1 p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-lime-400 uppercase tracking-widest focus:outline-none focus:border-lime-400"
          />
          <button
            type="submit"
            disabled={loading || !manualCode.trim()}
            className="px-5 py-3.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-slate-950 font-headline font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
          >
            {loading ? "..." : "Validează"}
          </button>
        </div>
      </form>

      {/* Recent Scans Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 mt-auto">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <span className="text-[11px] font-black uppercase font-headline text-white flex items-center gap-1.5">
            <span><span className="material-symbols-outlined align-middle text-sm">clipboard</span></span> Istoric Scanări Recente
          </span>
          <span className="text-[10px] font-mono text-lime-400 font-bold">
            {stats.checkedIn} Intrări Înregistrate
          </span>
        </div>

        {scannedHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Niciun bilet scanat în această sesiune.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scannedHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800"
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-white block truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    #{item.code} • {item.sector}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                      item.status === "VALID"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-red-950 text-red-400 border border-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
