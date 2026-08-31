"use client";

import React, { useState, useEffect } from "react";

export interface EditablePlayerData {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  number?: number | string | null;
  position?: string | null;
  isStarter?: boolean;
  status?: string;
  image?: string | null;
  preferredFoot?: string | null;
  birthDate?: string | null;
  heightCm?: number | string | null;
  weightKg?: number | string | null;
  bio?: string | null;
  rating?: number | string | null;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  suspensions?: number;
  userId?: string | null;
  invitationToken?: string | null;
}

interface PlayerProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: EditablePlayerData | null;
  teamId: string;
  teamName?: string;
  teamColor?: string;
  onSave: (data: EditablePlayerData) => Promise<void>;
  onSendInvite?: (player: EditablePlayerData) => Promise<{ acceptLink?: string; directSignupLink?: string } | void>;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

const POSITIONS = [
  "Portar",
  "Fundaș Central",
  "Fundaș Lateral Stânga",
  "Fundaș Lateral Dreapta",
  "Mijlocaș Defensiv",
  "Mijlocaș Central",
  "Mijlocaș Ofensiv",
  "Extremă Stânga",
  "Extremă Dreapta",
  "Atacant Central",
  "Vârf Împins",
];

export function PlayerProfileEditorModal({
  isOpen,
  onClose,
  player,
  teamId,
  teamName = "Echipă",
  teamColor = "#84cc16",
  onSave,
  onSendInvite,
}: PlayerProfileEditorModalProps) {
  const isEditing = Boolean(player?.id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [number, setNumber] = useState<number | string>("");
  const [position, setPosition] = useState("Mijlocaș Central");
  const [isStarter, setIsStarter] = useState(true);
  const [image, setImage] = useState("");
  const [preferredFoot, setPreferredFoot] = useState("Drept");
  const [birthDate, setBirthDate] = useState("");
  const [heightCm, setHeightCm] = useState<number | string>("");
  const [weightKg, setWeightKg] = useState<number | string>("");
  const [bio, setBio] = useState("");
  const [rating, setRating] = useState<number | string>(8.5);

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "photo" | "attributes">("general");

  useEffect(() => {
    if (player) {
      setName(player.name || "");
      setEmail(player.email || "");
      setPhone(player.phone || "");
      setNumber(player.number ?? "");
      setPosition(player.position || "Mijlocaș Central");
      setIsStarter(player.isStarter ?? true);
      setImage(player.image || "");
      setPreferredFoot(player.preferredFoot || "Drept");
      setBirthDate(player.birthDate || "");
      setHeightCm(player.heightCm ?? "");
      setWeightKg(player.weightKg ?? "");
      setBio(player.bio || "");
      setRating(player.rating ?? 8.5);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setNumber("");
      setPosition("Mijlocaș Central");
      setIsStarter(true);
      setImage("");
      setPreferredFoot("Drept");
      setBirthDate("");
      setHeightCm("");
      setWeightKg("");
      setBio("");
      setRating(8.5);
    }
    setErrorMsg(null);
    setInviteSuccessMsg(null);
    setGeneratedInviteLink(null);
  }, [player, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Numele jucătorului este obligatoriu.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    try {
      await onSave({
        id: player?.id,
        name: name.trim(),
        email: email.trim() ? email.trim().toLowerCase() : null,
        phone: phone.trim() ? phone.trim() : null,
        number: number !== "" ? Number(number) : null,
        position: position.trim(),
        isStarter,
        image: image.trim() ? image.trim() : null,
        preferredFoot,
        birthDate: birthDate.trim() ? birthDate.trim() : null,
        heightCm: heightCm !== "" ? Number(heightCm) : null,
        weightKg: weightKg !== "" ? Number(weightKg) : null,
        bio: bio.trim() ? bio.trim() : null,
        rating: rating !== "" ? Number(rating) : 8.5,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "A apărut o eroare la salvare.");
    } finally {
      setBusy(false);
    }
  }

  async function handleTriggerInvite() {
    if (!email.trim()) {
      setErrorMsg("Introdu o adresă de email validă pentru a genera și trimite invitația.");
      return;
    }
    if (!onSendInvite) return;

    setBusy(true);
    setErrorMsg(null);

    try {
      const res = await onSendInvite({
        id: player?.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        number: number !== "" ? Number(number) : null,
        position,
        image: image.trim() || null,
        isStarter,
      });

      if (res && res.directSignupLink) {
        setGeneratedInviteLink(res.directSignupLink);
      } else if (res && res.acceptLink) {
        setGeneratedInviteLink(res.acceptLink);
      }
      setInviteSuccessMsg(`Invitația a fost generată cu succes pentru ${email.trim()}!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Eroare la generarea invitației.");
    } finally {
      setBusy(false);
    }
  }

  const initials = (name || "Jucator")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "J";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-md shrink-0"
              style={{ backgroundColor: teamColor }}
            >
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
                {isEditing ? `Editare Profil: ${player?.name}` : "Adăugare & Configurare Profil Jucător"}
              </h3>
              <p className="text-xs text-slate-400 font-label">
                Setează poza, numărul, poziția și detaliile. Jucătorul le va avea presetate la crearea contului!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Live Profile Card Preview */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-lime-400/50 overflow-hidden flex items-center justify-center text-white font-black text-lg shadow-lg">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-lime-400 text-slate-950 font-mono font-black text-[10px] shadow">
                #{number || "?"}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-headline font-black text-base text-white">
                  {name || "Nume Jucător"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-lime-400 border border-lime-400/30 text-[10px] font-bold uppercase">
                  {isStarter ? "Titular" : "Rezervă"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-label">
                {position} • {teamName} • Picior: {preferredFoot}
              </p>
              {email && (
                <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">mail</span>
                  <span>{email}</span>
                  {player?.userId ? (
                    <span className="text-emerald-400 font-bold ml-1">• Cont Conectat</span>
                  ) : (
                    <span className="text-amber-400 font-bold ml-1">• Profil În Așteptare Înrolare</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                activeTab === "general"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Date Joc
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("photo")}
              className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                activeTab === "photo"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Poză / Avatar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attributes")}
              className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                activeTab === "attributes"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fizic &amp; Bio
            </button>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {inviteSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{inviteSuccessMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Nume &amp; Prenume Jucător *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Andrei Popescu"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Email Jucător (pentru creare cont presetat)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: andrei.popescu@gmail.com"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Număr Tricou (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="ex: 10"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Poziție pe Teren
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Telefon Contact
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ex: 0722123456"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="font-headline font-bold text-xs uppercase text-white block">
                    Statut în Lot
                  </span>
                  <span className="text-[11px] text-slate-400 font-label">
                    Stabilește dacă este titular în primul 11 sau pe banca de rezerve
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStarter(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                      isStarter
                        ? "bg-lime-400 text-slate-950 font-black shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Titular
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStarter(false)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition ${
                      !isStarter
                        ? "bg-amber-400 text-slate-950 font-black shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Rezervă
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Photo & Avatar */}
          {activeTab === "photo" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                  URL Poză / Avatar Jucător
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://exemplu.ro/poza-jucator.jpg"
                    className="flex-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-white"
                    >
                      Șterge
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold font-label text-slate-400 uppercase block mb-2">
                  Sau alege un avatar preset stilizat:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(url)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition active:scale-95 ${
                        image === url
                          ? "border-lime-400 ring-2 ring-lime-400/30 scale-105"
                          : "border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Attributes & Bio */}
          {activeTab === "attributes" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Picior Preferat
                  </label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  >
                    <option value="Drept">Drept (Right)</option>
                    <option value="Stâng">Stâng (Left)</option>
                    <option value="Ambele">Ambele (Both)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Data Nașterii
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Rating Inițial (1.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="8.5"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Înălțime (cm)
                  </label>
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="ex: 182"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Greutate (kg)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={150}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="ex: 78"
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Bio / Descriere &amp; Note Tehnice
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Scurtă caracterizare a jucătorului: viteză, dribling, execuții faze fixe..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400 transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Invitation Section Callout */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-headline font-bold text-xs uppercase text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-lime-400">forward_to_inbox</span>
                  <span>Înrolare Jucător pe acest Profil</span>
                </span>
                <p className="text-[11px] text-slate-400 font-label">
                  Trimite invitație directă pe email sau generează link unic de creare cont.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerInvite}
                disabled={busy || !email.trim()}
                className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-40 flex items-center gap-1.5 shrink-0 self-start sm:self-auto active:scale-95"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Generează Invitație</span>
              </button>
            </div>

            {generatedInviteLink && (
              <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in">
                <span className="text-[10px] font-mono text-lime-400 uppercase font-bold block">
                  Link Unic Direct de Înrolare (Toate datele sunt presetate):
                </span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-lime-300 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    {copiedLink ? "Copiat!" : "Copiază"}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Salut ${name || "jucător"}! Ți-am pregătit profilul de joc pentru echipa ${teamName}. Activează-ți contul aici: ${generatedInviteLink}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-headline font-bold text-xs uppercase transition"
            >
              Anulează
            </button>

            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="px-6 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{busy ? "Se salvează..." : isEditing ? "Salvează Modificările" : "Salvează Profilul"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
