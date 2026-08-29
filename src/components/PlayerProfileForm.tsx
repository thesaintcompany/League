"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  primarySport?: string | null;
  image?: string | null;
  coverPhotoUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  position?: string | null;
  jerseyNumber?: number | null;
  preferredFoot?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  facebookUrl?: string | null;
}

interface PlayerProfileFormProps {
  initialUser: UserProfile;
  isEditable?: boolean;
}

const SPORT_OPTIONS = [
  { id: "fotbal", label: "Fotbal", icon: "sports_soccer" },
  { id: "tenis", label: "Tenis", icon: "sports_tennis" },
  { id: "padel", label: "Padel", icon: "sports_tennis" },
  { id: "pingpong", label: "Ping-Pong", icon: "circle" },
  { id: "baschet", label: "Baschet", icon: "sports_basketball" },
  { id: "volei", label: "Volei", icon: "sports_volleyball" },
  { id: "handbal", label: "Handbal", icon: "sports_handball" },
];

const SPORT_POSITIONS: Record<string, { label: string; value: string }[]> = {
  fotbal: [
    { label: "Portar (GK)", value: "Portar" },
    { label: "Fundaș Central (CB)", value: "Fundaș Central" },
    { label: "Fundaș Lateral (LB/RB)", value: "Fundaș Lateral" },
    { label: "Mijlocaș Defensiv (CDM)", value: "Mijlocaș Defensiv" },
    { label: "Mijlocaș Central (CM)", value: "Mijlocaș Central" },
    { label: "Mijlocaș Ofensiv (CAM)", value: "Mijlocaș Ofensiv" },
    { label: "Extremă (LW/RW)", value: "Extremă" },
    { label: "Atacant Central (ST/CF)", value: "Atacant Central" },
  ],
  tenis: [
    { label: "Jucător Simplu (Singles)", value: "Jucător Simplu" },
    { label: "Jucător Dublu (Doubles)", value: "Jucător Dublu" },
    { label: "Jucător Mixt (Mixed Doubles)", value: "Jucător Mixt" },
  ],
  padel: [
    { label: "Jucător Partea Dreaptă (Drive)", value: "Jucător Partea Dreaptă (Drive)" },
    { label: "Jucător Partea Stângă (Reves)", value: "Jucător Partea Stângă (Reves)" },
    { label: "Jucător Polivalent (Dreapta & Stânga)", value: "Jucător Polivalent" },
  ],
  pingpong: [
    { label: "Jucător Ofensiv (Attacker)", value: "Jucător Ofensiv" },
    { label: "Jucător Defensiv (Defender)", value: "Jucător Defensiv" },
    { label: "Jucător Allround", value: "Jucător Allround" },
  ],
  baschet: [
    { label: "Conducător de Joc (Point Guard - PG)", value: "Point Guard (PG)" },
    { label: "Aruncător (Shooting Guard - SG)", value: "Shooting Guard (SG)" },
    { label: "Extremă Mică (Small Forward - SF)", value: "Small Forward (SF)" },
    { label: "Extremă Mare (Power Forward - PF)", value: "Power Forward (PF)" },
    { label: "Pivot (Center - C)", value: "Center (C)" },
  ],
  volei: [
    { label: "Ridicător (Setter)", value: "Ridicător (Setter)" },
    { label: "Trăgător Secund (Outside Hitter)", value: "Trăgător Secund" },
    { label: "Universal (Opposite Hitter)", value: "Universal" },
    { label: "Centru (Middle Blocker)", value: "Centru" },
    { label: "Libero (Defensive Specialist)", value: "Libero" },
  ],
  handbal: [
    { label: "Portar (GK)", value: "Portar" },
    { label: "Extremă Stânga (LW)", value: "Extremă Stânga" },
    { label: "Inter Stânga (LB)", value: "Inter Stânga" },
    { label: "Centru Coordonator (CB)", value: "Centru Coordonator" },
    { label: "Inter Dreapta (RB)", value: "Inter Dreapta" },
    { label: "Extremă Dreapta (RW)", value: "Extremă Dreapta" },
    { label: "Pivot (P)", value: "Pivot" },
  ],
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

export function PlayerProfileForm({ initialUser, isEditable = true }: PlayerProfileFormProps) {
  const nameParts = (initialUser.name || "").split(" ");
  const [firstName, setFirstName] = useState<string>(nameParts[0] || "");
  const [lastName, setLastName] = useState<string>(nameParts.slice(1).join(" ") || "");
  const [email] = useState<string>(initialUser.email || "");
  const [phone, setPhone] = useState<string>(initialUser.phone || "+40 722 000 111");

  // Sport selection (Single-choice)
  const [primarySport, setPrimarySport] = useState<string>(initialUser.primarySport || "fotbal");

  // Visual Assets
  const [image, setImage] = useState<string>(
    initialUser.image || DEFAULT_AVATAR
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(
    initialUser.coverPhotoUrl || DEFAULT_COVER
  );

  // Modal State for Photo Change
  const [activePhotoModal, setActivePhotoModal] = useState<"cover" | "avatar" | null>(null);
  const [photoModalTab, setPhotoModalTab] = useState<"upload" | "url">("upload");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Player telemetry
  const [position, setPosition] = useState<string>(initialUser.position || "Atacant Central");
  const [jerseyNumber, setJerseyNumber] = useState<number>(initialUser.jerseyNumber || 10);
  const [preferredFoot, setPreferredFoot] = useState<string>(initialUser.preferredFoot || "Drept");
  const [heightCm, setHeightCm] = useState<number>(initialUser.heightCm || 185);
  const [weightKg, setWeightKg] = useState<number>(initialUser.weightKg || 78);

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState<string>(
    initialUser.instagramUrl || "instagram.com/player"
  );
  const [twitterUrl, setTwitterUrl] = useState<string>(
    initialUser.twitterUrl || "x.com/player"
  );
  const [facebookUrl, setFacebookUrl] = useState<string>(
    initialUser.facebookUrl || "facebook.com/player"
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Tab & Notifications State
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">(
    searchParams?.get("tab") === "notifications" ? "notifications" : "profile"
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams?.get("tab") === "notifications") {
      setActiveTab("notifications");
    }
  }, [searchParams]);

  async function loadNotifications() {
    setLoadingNotifications(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  async function handleDeleteNotification(id: string) {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      const target = notifications.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silent
    }
  }

  const currentPositions = SPORT_POSITIONS[primarySport] || SPORT_POSITIONS.fotbal;

  function processFile(file: File, target: "cover" | "avatar") {
    if (!file.type.startsWith("image/")) {
      setMessage({
        text: "Format de fișier neacceptat. Te rugăm să încarci o imagine validă (JPG, PNG, WEBP).",
        type: "error",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        text: "Dimensiunea fișierului depășește limita de 10 MB. Te rugăm să alegi o imagine mai mică.",
        type: "error",
      });
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        if (target === "cover") {
          setCoverPhotoUrl(result);
        } else {
          setImage(result);
        }
        setActivePhotoModal(null);
        setCustomUrlInput("");
        setMessage({
          text:
            target === "cover"
              ? "Fotografia în picioare (Full-Body) a fost actualizată. Apasă pe Salvează Profilul."
              : "Fotografia portret față (Headshot) a fost actualizată. Apasă pe Salvează Profilul.",
          type: "success",
        });
      }
      setIsProcessingPhoto(false);
    };
    reader.onerror = () => {
      setIsProcessingPhoto(false);
      setMessage({
        text: "A apărut o eroare la procesarea imaginii. Te rugăm să încerci din nou.",
        type: "error",
      });
    };
    reader.readAsDataURL(file);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "avatar") {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, target);
    e.target.value = "";
  }

  function handleDropFile(e: React.DragEvent, target: "cover" | "avatar") {
    e.preventDefault();
    e.stopPropagation();
    if (target === "cover") setIsDraggingCover(false);
    else setIsDraggingAvatar(false);

    if (!isEditable) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, target);
    }
  }

  function handleDragOver(e: React.DragEvent, target: "cover" | "avatar") {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditable) return;
    if (target === "cover") setIsDraggingCover(true);
    else setIsDraggingAvatar(true);
  }

  function handleDragLeave(e: React.DragEvent, target: "cover" | "avatar") {
    e.preventDefault();
    e.stopPropagation();
    if (target === "cover") setIsDraggingCover(false);
    else setIsDraggingAvatar(false);
  }

  function handleResetPhoto(target: "cover" | "avatar") {
    if (!isEditable) return;
    if (target === "cover") {
      setCoverPhotoUrl(DEFAULT_COVER);
      setMessage({
        text: "Fotografia în picioare a fost resetată la imaginea implicită.",
        type: "success",
      });
    } else {
      setImage(DEFAULT_AVATAR);
      setMessage({
        text: "Fotografia portret față a fost resetată la imaginea implicită.",
        type: "success",
      });
    }
  }

  function handleApplyCustomUrl(target: "cover" | "avatar") {
    if (!customUrlInput.trim()) return;
    if (target === "cover") {
      setCoverPhotoUrl(customUrlInput.trim());
    } else {
      setImage(customUrlInput.trim());
    }
    setCustomUrlInput("");
    setActivePhotoModal(null);
    setMessage({
      text: "Imaginea a fost actualizată. Nu uita să apeși Salvează Profilul.",
      type: "success",
    });
  }

  function handleSportChange(newSport: string) {
    setPrimarySport(newSport);
    const newPositions = SPORT_POSITIONS[newSport] || SPORT_POSITIONS.fotbal;
    if (newPositions.length > 0) {
      setPosition(newPositions[0].value);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone,
          image,
          coverPhotoUrl,
          primarySport,
          position,
          jerseyNumber,
          preferredFoot,
          heightCm,
          weightKg,
          instagramUrl,
          twitterUrl,
          facebookUrl,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Eroare la salvarea profilului");
      }

      setMessage({ text: "Profilul de sportiv a fost salvat cu succes în baza de date.", type: "success" });
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative">
      {/* Top Tab Switcher for Player Profile & Notifications */}
      <div className="lg:col-span-12 flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-base">account_circle</span>
          <span>Fișă Jucător &amp; Date Personale</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("notifications");
            loadNotifications();
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "notifications"
              ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-base">notifications</span>
          <span>Notificări &amp; Invitații Echipă</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "notifications" ? (
        <div className="lg:col-span-12 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <div>
              <h3 className="text-lg font-bold font-headline uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-600 dark:text-lime-400">mark_email_unread</span>
                Centru de Notificări &amp; Invitații Echipă
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-label">
                Aici primești invitații de transfer în echipe noi și ești înștiințat dacă ești adăugat sau eliminat dintr-un lot
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  Marchează toate citite
                </button>
              )}
              <button
                type="button"
                onClick={loadNotifications}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                title="Reîmprospătează"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>
          </div>

          {loadingNotifications ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <span className="material-symbols-outlined animate-spin text-3xl text-lime-500 block mb-2">progress_activity</span>
              Se încarcă notificările...
            </div>
          ) : notifications.length === 0 ? (
            <div className="card p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">notifications_off</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Nu ai nicio notificare în acest moment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Când un manager de echipă îți trimite o invitație pe platformă sau ești adăugat/eliminat dintr-o echipă, vei primi o alertă instantă aici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                let icon = "info";
                let borderColor = "border-slate-200 dark:border-slate-800";

                if (n.type === "team_invite") {
                  badgeClass = "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300 border border-lime-300 dark:border-lime-700/50";
                  icon = "mail";
                  borderColor = "border-lime-300 dark:border-lime-500/30";
                } else if (n.type === "team_removed") {
                  badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50";
                  icon = "person_remove";
                  borderColor = "border-rose-300 dark:border-rose-500/30";
                } else if (n.type === "team_joined") {
                  badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50";
                  icon = "how_to_reg";
                  borderColor = "border-emerald-300 dark:border-emerald-500/30";
                }

                return (
                  <div
                    key={n.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border ${borderColor} shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !n.read ? "ring-2 ring-lime-400/20" : "opacity-90"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${badgeClass}`}>
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {n.title}
                          </h4>
                          {!n.read && (
                            <span className="px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[9px] uppercase">
                              Nou
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleDateString("ro-RO", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {n.message}
                        </p>

                        {n.teamName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                            <span className="material-symbols-outlined text-sm text-lime-500">shield</span>
                            <span>Echipă: <strong>{n.teamName}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {n.link && (
                        <Link
                          href={n.link}
                          className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs uppercase shadow-sm transition flex items-center gap-1"
                        >
                          <span>Răspunde / Vezi</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}

                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                          title="Marchează ca citit"
                        >
                          <span className="material-symbols-outlined text-sm">done</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(n.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Șterge notificare"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {!isEditable && (
            <div className="lg:col-span-12 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-base text-amber-400">lock</span>
              <span>
                <strong>Mod Vizualizare:</strong> Acest profil poate fi editat doar de către sportivul însuși sau de managerul său de echipă.
              </span>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={coverFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "cover")}
          />
          <input
            type="file"
            ref={avatarFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "avatar")}
          />

          {/* Left Column: Visual Assets (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Card Prezentare Oficial
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-semibold uppercase tracking-wider">
                  {isEditable ? "Sportiv Înregistrat" : "Vizualizare"}
                </span>
              </div>

              {/* 9:14 Full-Body Cover Photo with Drag & Drop */}
              <div
                onDragOver={(e) => handleDragOver(e, "cover")}
                onDragLeave={(e) => handleDragLeave(e, "cover")}
                onDrop={(e) => handleDropFile(e, "cover")}
                onClick={() => isEditable && coverFileInputRef.current?.click()}
                title={isEditable ? "Apasă sau trage fișierul pentru a încărca poza în picioare (9:16)" : "Profil în mod vizualizare"}
                className={`aspect-[9/14] w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-900 border transition-all duration-300 shadow-sm cursor-pointer group/cover ${
                  isDraggingCover
                    ? "border-2 border-dashed border-lime-400 ring-4 ring-lime-400/20 scale-[0.99]"
                    : "border-slate-200 dark:border-slate-800 hover:border-lime-400/80"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPhotoUrl}
                  alt="Poză în picioare jucător"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER;
                  }}
                  className="w-full h-full object-cover object-center group-hover/cover:scale-105 transition-transform duration-500"
                />

                {/* Badge 9:16 Aspect */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md border border-white/10 text-[10px] font-medium text-slate-200 uppercase tracking-wider">
                    9:16 Full-Body
                  </span>
                </div>

                {/* Drag Active Indicator */}
                {isDraggingCover && (
                  <div className="absolute inset-0 bg-lime-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 text-lime-300">
                    <span className="w-14 h-14 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center mb-2 shadow-lg animate-bounce">
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </span>
                    <p className="font-bold text-sm text-white">Plasează fișierul aici</p>
                    <p className="text-xs text-lime-300 mt-0.5">pentru poza în picioare</p>
                  </div>
                )}

                {/* Hover Action Overlay (when not dragging) */}
                {!isDraggingCover && isEditable && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover/cover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4 text-white z-10">
                    <span className="w-11 h-11 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center mb-2 shadow-md scale-95 group-hover/cover:scale-100 transition-transform">
                      <span className="material-symbols-outlined text-xl">upload_file</span>
                    </span>
                    <p className="font-bold text-xs text-white">Apasă sau trage fișierul aici</p>
                    <p className="text-[11px] text-lime-300 font-normal mt-0.5">
                      pentru a încărca poza în picioare (9:16)
                    </p>
                  </div>
                )}

                {/* Bottom Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                  <span className="text-[10px] font-medium text-lime-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">
                      {SPORT_OPTIONS.find((s) => s.id === primarySport)?.icon || "sports_soccer"}
                    </span>
                    <span>{SPORT_OPTIONS.find((s) => s.id === primarySport)?.label || "Fotbal"}</span>
                  </span>
                  <p className="font-semibold text-white text-base leading-tight mt-0.5">
                    {firstName || "Nume"} {lastName || "Jucător"}
                  </p>
                  <p className="text-xs text-slate-300">
                    #{jerseyNumber} • {position}
                  </p>
                </div>
              </div>

              {/* Face Headshot Overlay with Drag & Drop */}
              <div className="flex items-center gap-3.5 pt-1">
                <div
                  onDragOver={(e) => handleDragOver(e, "avatar")}
                  onDragLeave={(e) => handleDragLeave(e, "avatar")}
                  onDrop={(e) => handleDropFile(e, "avatar")}
                  onClick={() => isEditable && avatarFileInputRef.current?.click()}
                  title={isEditable ? "Apasă sau trage pentru a schimba poza portret (1:1)" : "Poză portret"}
                  className={`w-16 h-16 rounded-2xl border-2 overflow-hidden shadow-lg -mt-10 z-20 relative bg-slate-900 cursor-pointer group/avatar shrink-0 transition-all ${
                    isDraggingAvatar
                      ? "border-lime-400 ring-4 ring-lime-400/30 scale-105"
                      : "border-white dark:border-slate-900"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Poză față portret"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
                  />
                  {isDraggingAvatar ? (
                    <div className="absolute inset-0 bg-lime-950/80 backdrop-blur-[1px] flex items-center justify-center text-lime-400">
                      <span className="material-symbols-outlined text-xl animate-pulse">cloud_upload</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-lime-400">
                      <span className="material-symbols-outlined text-lg">photo_camera</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight truncate">
                      {firstName || "Nume"} {lastName || "Sportiv"}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-medium text-slate-500">
                      1:1
                    </span>
                  </div>
                  <p className="text-xs text-lime-600 dark:text-lime-400 font-medium truncate mt-0.5">
                    {position}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Photo Upload Center */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Centru Încărcare Fotografii
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Formate oficiale pentru transmisiuni &amp; arbitraj
                    </p>
                  </div>
                </div>
                {isProcessingPhoto && (
                  <span className="text-[10px] text-lime-600 dark:text-lime-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    <span>Procesare...</span>
                  </span>
                )}
              </div>

              {/* SECTION 1: Poză Corp Întreg (Full-Body) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-slate-600 dark:text-slate-400">
                      accessibility_new
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Poză în Picioare (Full-Body)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    Format 9:16
                  </span>
                </div>

                {/* Upload Zone / Interactive Drop Area */}
                <div
                  onDragOver={(e) => handleDragOver(e, "cover")}
                  onDragLeave={(e) => handleDragLeave(e, "cover")}
                  onDrop={(e) => handleDropFile(e, "cover")}
                  onClick={() => isEditable && coverFileInputRef.current?.click()}
                  className={`p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                    isDraggingCover
                      ? "border-lime-400 bg-lime-400/10 text-lime-400 ring-2 ring-lime-400/20"
                      : "border-slate-300 dark:border-slate-700/80 hover:border-lime-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-lime-600 dark:text-lime-400">
                    cloud_upload
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Trage fișierul aici sau apasă pentru selecție
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Recomandat vertical în echipament • JPG, PNG, WEBP (max 10MB)
                    </p>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-semibold text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Încarcă Fișier</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => {
                      setActivePhotoModal("cover");
                      setPhotoModalTab("url");
                    }}
                    className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition flex items-center gap-1 disabled:opacity-50"
                    title="Introdu link URL direct"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span>Link URL</span>
                  </button>

                  {coverPhotoUrl !== DEFAULT_COVER && isEditable && (
                    <button
                      type="button"
                      onClick={() => handleResetPhoto("cover")}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Resetează la poza implicită"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 2: Poză Portret Față (Headshot) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-slate-600 dark:text-slate-400">
                      face
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Poză Portret Față (Headshot)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    Format 1:1
                  </span>
                </div>

                {/* Upload Zone / Interactive Drop Area */}
                <div
                  onDragOver={(e) => handleDragOver(e, "avatar")}
                  onDragLeave={(e) => handleDragLeave(e, "avatar")}
                  onDrop={(e) => handleDropFile(e, "avatar")}
                  onClick={() => isEditable && avatarFileInputRef.current?.click()}
                  className={`p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 ${
                    isDraggingAvatar
                      ? "border-lime-400 bg-lime-400/10 text-lime-400 ring-2 ring-lime-400/20"
                      : "border-slate-300 dark:border-slate-700/80 hover:border-lime-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-lime-600 dark:text-lime-400">
                    add_photo_alternate
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      Trage portretul aici sau apasă pentru selecție
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Format pătrat prim-plan • JPG, PNG, WEBP (max 10MB)
                    </p>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-semibold text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Încarcă Portret</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => {
                      setActivePhotoModal("avatar");
                      setPhotoModalTab("url");
                    }}
                    className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition flex items-center gap-1 disabled:opacity-50"
                    title="Introdu link URL direct"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span>Link URL</span>
                  </button>

                  {image !== DEFAULT_AVATAR && isEditable && (
                    <button
                      type="button"
                      onClick={() => handleResetPhoto("avatar")}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Resetează la portretul implicit"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Helper guidelines */}
              <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-sm text-lime-500">verified</span>
                  <span>Ghid Fotografii Oficiale</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Platforma optimizează și comprimă automat imaginile pentru încărcare ultra-rapidă în rapoartele de meci și pe transmisiunile live.
                </p>
              </div>
            </div>

        {/* Privacy Note */}
        <div className="p-4 bg-slate-100/60 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm text-lime-500">lock</span>
            <span>Confidențialitate Date Contact</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Numărul de telefon și adresa de email sunt protejate și vizibile doar managerului de echipă și organizatorilor competiției.
          </p>
        </div>
      </div>

      {/* Right Column: Form Data (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 shadow-sm ${message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
              }`}
          >
            <span className="material-symbols-outlined text-base">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Section 0: Selecție Sport Principal (Single-Choice) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">sports</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  1. Sport Principal Practicat
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  Selectează sportul tău de bază (formularul și pozițiile se adaptează automat)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Alegere Unică
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
            {SPORT_OPTIONS.map((sp) => {
              const isSelected = primarySport === sp.id;
              return (
                <button
                  key={sp.id}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => handleSportChange(sp.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${isSelected
                    ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 border-slate-900 dark:border-lime-400 font-semibold shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-400"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {sp.icon}
                  </span>
                  <span className="text-xs font-medium">{sp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Date Personale & Identitate */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                2. Date Personale &amp; Identitate
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Informații afișate pe foaia  ă de joc și în catalogul de sportivi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Prenume *
              </label>
              <input
                type="text"
                required
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ex: Florin"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Nume de Familie *
              </label>
              <input
                type="text"
                required
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ex: Popescu"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Adresă Email (Conectare)
              </label>
              <input
                type="email"
                disabled
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-not-allowed"
                value={email}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Număr Telefon Mobil
              </label>
              <input
                type="tel"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+40 722 123 456"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fișă Tehnică & Poziție adaptată sportului */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">tune</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                3. Poziție &amp; Parametri Fizici ({SPORT_OPTIONS.find((s) => s.id === primarySport)?.label || "Fotbal"})
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Poziționare tactică și atribute sportive
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Poziție / Specializare
              </label>
              <select
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {currentPositions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Număr Tricou
              </label>
              <input
                type="number"
                min={1}
                max={99}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(parseInt(e.target.value) || 10)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Braț / Picior Preferat
              </label>
              <select
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value)}
              >
                <option value="Drept">Drept (Right)</option>
                <option value="Stâng">Stâng (Left)</option>
                <option value="Ambele">Ambele / Ambidextru</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Înălțime (cm)
              </label>
              <input
                type="number"
                min={140}
                max={220}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 180)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Greutate (kg)
              </label>
              <input
                type="number"
                min={40}
                max={140}
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 75)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rețele Sociale */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                4. Profiluri Social Media
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Link-uri afișate public pe fișa de meci și cartonașul de prezentare
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Instagram
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="instagram.com/cont"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                X / Twitter
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="x.com/cont"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Facebook
              </label>
              <input
                type="text"
                disabled={!isEditable}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="facebook.com/cont"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex justify-between items-center pt-2">
          <Link
            href="/clasamente"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Înapoi la Clasamente</span>
          </Link>

          {isEditable && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-medium text-xs uppercase tracking-wider shadow-sm active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{saving ? "Se salvează..." : "Salvează Profilul"}</span>
            </button>
          )}
        </div>
      </div>
    </>
  )}

      {/* Interactive Photo Upload Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-600 dark:text-lime-400 block mb-0.5">
                  Încărcare Fotografie Oficială
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {activePhotoModal === "cover"
                    ? "Poză în Picioare (Full-Body 9:16)"
                    : "Poză Portret Față (Headshot 1:1)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivePhotoModal(null);
                  setCustomUrlInput("");
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Target Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActivePhotoModal("cover")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  activePhotoModal === "cover"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-sm">accessibility_new</span>
                <span>Full-Body (9:16)</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoModal("avatar")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  activePhotoModal === "avatar"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-sm">face</span>
                <span>Portret Față (1:1)</span>
              </button>
            </div>

            {/* Method Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 gap-4">
              <button
                type="button"
                onClick={() => setPhotoModalTab("upload")}
                className={`pb-2 text-xs font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  photoModalTab === "upload"
                    ? "border-lime-500 text-lime-600 dark:text-lime-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Încarcă din Dispozitiv</span>
              </button>
              <button
                type="button"
                onClick={() => setPhotoModalTab("url")}
                className={`pb-2 text-xs font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  photoModalTab === "url"
                    ? "border-lime-500 text-lime-600 dark:text-lime-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">link</span>
                <span>Link URL Imagine</span>
              </button>
            </div>

            {photoModalTab === "upload" ? (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => handleDragOver(e, activePhotoModal)}
                  onDragLeave={(e) => handleDragLeave(e, activePhotoModal)}
                  onDrop={(e) => handleDropFile(e, activePhotoModal)}
                  onClick={() => {
                    if (activePhotoModal === "cover") coverFileInputRef.current?.click();
                    else avatarFileInputRef.current?.click();
                  }}
                  className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-lime-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer text-center flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Trage fișierul aici sau apasă pentru a răsfoi
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Fișiere acceptate: JPG, PNG, WEBP • Dimensiune maximă: 10 MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activePhotoModal === "cover") coverFileInputRef.current?.click();
                      else avatarFileInputRef.current?.click();
                    }}
                    className="mt-2 py-2 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-semibold text-xs uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    <span>Selectează Fișier</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    URL Imagine Publică
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplu.ro/fotografie.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full focus:outline-none focus:border-slate-900 dark:focus:border-lime-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCustomUrl(activePhotoModal)}
                      className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap"
                    >
                      Aplică
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Asigură-te că link-ul este direct către fișierul imaginii (se termină în .jpg, .png sau .webp).
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActivePhotoModal(null);
                  setCustomUrlInput("");
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
