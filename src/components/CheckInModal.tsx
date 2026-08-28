"use client";

import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  isStarter: boolean;
}

interface Match {
  id: string;
  scheduledAt: string;
  venue?: string | null;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}

interface TeamData {
  id: string;
  name: string;
  shortName: string | null;
  homeArena: string | null;
  lastCheckInAt?: string | Date | null;
  checkInVenue?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInVerified?: boolean;
  attendanceReport?: string | null;
  players: Player[];
  homeMatches: Match[];
  awayMatches: Match[];
}

interface CheckInModalProps {
  team: TeamData;
  onClose: () => void;
  onCheckInSuccess?: (updatedTeam: any) => void;
}

export function CheckInModal({ team, onClose, onCheckInSuccess }: CheckInModalProps) {
  const allUpcoming = [...(team.homeMatches || []), ...(team.awayMatches || [])].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const defaultMatch = allUpcoming.length > 0 ? allUpcoming[0] : null;
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(defaultMatch);

  // Geolocation State
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(
    team.checkInLatitude && team.checkInLongitude
      ? { latitude: team.checkInLatitude, longitude: team.checkInLongitude }
      : null
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [venueName, setVenueName] = useState(
    selectedMatch?.venue || team.checkInVenue || team.homeArena || "Stadionul Oficial"
  );
  const [notes, setNotes] = useState("Toți sportivii prezenți au efectuat încălzirea oficială pe teren.");

  // Attendance map: player.id -> boolean (true = present)
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    team.players.forEach((p) => {
      map[p.id] = true; // default all present
    });
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [successReport, setSuccessReport] = useState<any | null>(null);
  const [shareToast, setShareToast] = useState(false);

  // Request GPS position on mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocația nu este suportată de browserul tău.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError("Permisiunea de geolocație a fost refuzată. Activează locația în browser.");
        } else {
          setGeoError("Nu s-a putut obține locația GPS exactă.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function togglePlayerPresence(id: string) {
    setAttendance((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function markAllPresent() {
    setAttendance((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }

  const presentCount = team.players.filter((p) => attendance[p.id]).length;

  async function handleConfirmCheckIn() {
    setSaving(true);
    try {
      const presentPlayersData = team.players.map((p) => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        isStarter: p.isStarter,
        present: Boolean(attendance[p.id]),
        checkedAt: new Date().toISOString(),
      }));

      const res = await fetch("/api/team/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          matchId: selectedMatch?.id || null,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
          venueName,
          notes,
          presentPlayers: presentPlayersData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessReport(data.attendanceReport);
        if (onCheckInSuccess) {
          onCheckInSuccess(data.team);
        }
      } else {
        alert(data.error || "Eroare la check-in");
      }
    } catch {
      alert("Eroare de rețea la realizarea check-in-ului.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShareReport() {
    const reportText = `Raport Prezență Teren — ${team.name}\nStadion: ${venueName}\nData & Ora: ${new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}\nCopii Prezenți: ${presentCount} din ${team.players.length}\nCheck-in GPS Confirmat!`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/teams/${team.id}` : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Raport Prezență Stadion — ${team.name}`,
          text: reportText,
          url,
        });
        return;
      } catch {
        // cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(`${reportText}\n${url}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black shadow-md">
              <span className="material-symbols-outlined text-xl">where_to_vote</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-[10px] font-black uppercase font-mono tracking-wider">
                  Check-in la Stadion (GPS)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                  Bifă Albastră Activabilă
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-headline uppercase tracking-tight text-white mt-0.5">
                Check-in Teren &amp; Raport de Prezență
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Success Banner if Check-in already made */}
          {successReport ? (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-3xl font-black">verified</span>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase font-mono tracking-wider">
                  Check-in Confirmat cu Succes!
                </span>
                <h3 className="text-xl font-headline font-black uppercase text-slate-900 dark:text-white mt-2">
                  Echipa a primit Bifa Albastră de Verificare Oficială
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                  Locația GPS la <strong>{venueName}</strong> a fost înregistrată. Raportul de prezență cuprinde <strong>{presentCount} sportivi prezenți</strong>.
                </p>
              </div>

              {/* Attendance Summary Grid */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                <div className="flex justify-between items-center text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Timestamp:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {new Date(successReport.checkedAt).toLocaleString("ro-RO")}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Arenă / Stadion:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{venueName}</strong>
                </div>
                {coords && (
                  <div className="flex justify-between items-center text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-400">Coordonate GPS:</span>
                    <strong className="text-sky-600 dark:text-sky-400">
                      {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-mono pt-1">
                  <span className="text-slate-400">Copii Prezenți Confirmați:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {presentCount} din {team.players.length}
                  </strong>
                </div>
              </div>

              {/* Actions for parents */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleShareReport}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-black text-xs uppercase tracking-wider transition shadow flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Trimite Raportul la Părinți (WhatsApp)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase transition"
                >
                  Listare A4 Raport
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* GPS Geolocation Detection Box */}
              <div className="p-4 sm:p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sky-500 text-2xl">my_location</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase">
                        Detectare Geolocație pe Stadion
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {coords
                          ? `GPS conectat: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} (Precizie: ${coords.accuracy ? Math.round(coords.accuracy) : 10}m)`
                          : "Obține coordonatele exacte de pe terenul de joc"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={geoLoading}
                    onClick={handleGetLocation}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase transition shadow flex items-center gap-1.5 shrink-0 self-start sm:self-auto disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {geoLoading ? "sync" : "refresh"}
                    </span>
                    <span>{geoLoading ? "Se localizează..." : "Actualizează GPS"}</span>
                  </button>
                </div>

                {geoError && (
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs font-medium">
                    {geoError}
                  </div>
                )}
              </div>

              {/* Match & Venue Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400">
                    Meciul Zilei
                  </label>
                  {allUpcoming.length > 0 ? (
                    <select
                      value={selectedMatch?.id || ""}
                      onChange={(e) => {
                        const m = allUpcoming.find((x) => x.id === e.target.value);
                        if (m) {
                          setSelectedMatch(m);
                          if (m.venue) setVenueName(m.venue);
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {allUpcoming.map((m) => {
                        const isHome = m.homeTeam.id === team.id;
                        const opp = isHome ? m.awayTeam.name : m.homeTeam.name;
                        return (
                          <option key={m.id} value={m.id}>
                            {new Date(m.scheduledAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })} vs {opp}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value="Meci Amical / Eveniment Club"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-400"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400">
                    Arenă / Stadion Teren
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="ex: Arena Națională / Baza Sportivă"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Attendance Checklist for Kids / Players */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-headline font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lime-500 text-base">checklist</span>
                      Prezența la Teren a Copiilor ({presentCount}/{team.players.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Bifează sportivii ajunși la stadion pentru generarea raportului oficial de prezență
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={markAllPresent}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    Toți Prezenți
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {team.players.map((p) => {
                    const isPresent = attendance[p.id] !== false;
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlayerPresence(p.id)}
                        className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 select-none ${
                          isPresent
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60"
                            : "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isPresent
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isPresent ? "check" : "close"}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {p.number ? `#${p.number} • ` : ""}{p.position || "Jucător"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono ${
                            isPresent
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {isPresent ? "Prezent" : "Absent"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400">
                  Observații Raport Prezență
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex: Încălzire completă, echipament conform..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {shareToast && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs animate-in fade-in">
                Raportul a fost copiat! Trimite-l pe WhatsApp.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!successReport && (
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmCheckIn}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">where_to_vote</span>
                <span>{saving ? "Se validează..." : "Confirmă Check-in Teren & Bifă Albastră"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase transition"
            >
              Închide
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
