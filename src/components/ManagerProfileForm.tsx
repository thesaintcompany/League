"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getBadgeForXp, getBadgeColor } from "@/lib/managerXp";

interface ManagedTeam {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  championship?: { name: string } | null;
  players?: { id: string }[];
}

interface ManagerProfileFormProps {
  initialUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    image?: string | null;
    coverPhotoUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    facebookUrl?: string | null;
    managerXp?: number | null;
    managerBadge?: string | null;
    coachingLicense?: string | null;
    experienceYears?: number | null;
    companyName?: string | null;
    companyCui?: string | null;
    billingAddress?: string | null;
    managedTeams?: ManagedTeam[];
  };
}

export function ManagerProfileForm({ initialUser }: ManagerProfileFormProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [bio, setBio] = useState(initialUser.bio || "");
  const [image, setImage] = useState(initialUser.image || "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(initialUser.coverPhotoUrl || "");
  const [coachingLicense, setCoachingLicense] = useState(initialUser.coachingLicense || "Manager / Delegat Club");
  const [experienceYears, setExperienceYears] = useState<number | "">(initialUser.experienceYears ?? 3);
  const [instagramUrl, setInstagramUrl] = useState(initialUser.instagramUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(initialUser.twitterUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(initialUser.facebookUrl || "");

  // Billing Fields
  const [companyName, setCompanyName] = useState(initialUser.companyName || "");
  const [companyCui, setCompanyCui] = useState(initialUser.companyCui || "");
  const [billingAddress, setBillingAddress] = useState(initialUser.billingAddress || "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const xp = initialUser.managerXp || 0;
  const currentBadge = initialUser.managerBadge || getBadgeForXp(xp);
  const badgeStyle = getBadgeColor(currentBadge);

  // Targets
  let nextTargetXp = 30;
  let nextBadgeName = "Manager de Bronz";
  if (xp >= 150) {
    nextTargetXp = 250;
    nextBadgeName = "Manager de Aur Suprem";
  } else if (xp >= 80) {
    nextTargetXp = 150;
    nextBadgeName = "Manager de Aur";
  } else if (xp >= 30) {
    nextTargetXp = 80;
    nextBadgeName = "Manager de Argint";
  }
  const progressPercent = Math.min(100, Math.round((xp / nextTargetXp) * 100));

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCoverPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          image: image || null,
          coverPhotoUrl: coverPhotoUrl || null,
          coachingLicense: coachingLicense || null,
          experienceYears: experienceYears === "" ? null : Number(experienceYears),
          instagramUrl: instagramUrl.trim() || null,
          twitterUrl: twitterUrl.trim() || null,
          facebookUrl: facebookUrl.trim() || null,
          companyName: companyName.trim() || null,
          companyCui: companyCui.trim() || null,
          billingAddress: billingAddress.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Profilul de manager și datele de facturare au fost salvate cu succes!", type: "success" });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ text: data.error || "Eroare la salvarea profilului", type: "error" });
      }
    } catch {
      setMessage({ text: "Eroare de conexiune cu serverul", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold font-label flex items-center justify-between shadow-lg animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
              : "bg-red-950/80 border-red-500 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="font-mono text-sm">
            ×
          </button>
        </div>
      )}

      {/* 1. GAMIFICATION & MANAGER XP CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 shadow-2xl text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400/60 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
              <span className="material-symbols-outlined text-4xl">{badgeStyle.icon}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Statut Carieră Manager
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {currentBadge}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-headline font-black uppercase tracking-tight text-white mt-1">
                {xp} Puncte XP Acumulate
              </h2>
            </div>
          </div>

          <Link
            href="/dashboard/team"
            className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Consolă Echipă ↗</span>
          </Link>
        </div>

        {/* Progress bar to next Badge */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Progres către următorul prag: <strong className="text-white">{nextBadgeName}</strong></span>
            <span className="text-amber-400 font-bold">{xp} / {nextTargetXp} XP ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-lime-400 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* XP Rules Grid for Manager */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-lime-400 font-mono font-bold block text-sm">+10 XP</span>
            <span className="text-slate-300 font-bold text-[11px] block mt-0.5">Lot Complet</span>
            <span className="text-[10px] text-slate-500">Minim 11 sportivi înscriși</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-sky-400 font-mono font-bold block text-sm">+5 XP</span>
            <span className="text-slate-300 font-bold text-[11px] block mt-0.5">Check-in Teren</span>
            <span className="text-[10px] text-slate-500">Validare prezență GPS</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-emerald-400 font-mono font-bold block text-sm">+20 XP</span>
            <span className="text-slate-300 font-bold text-[11px] block mt-0.5">Rezultat Rapid</span>
            <span className="text-[10px] text-slate-500">Scor la fluierul final</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-amber-300 font-mono font-bold block text-sm">+50 XP</span>
            <span className="text-amber-200 font-bold text-[11px] block mt-0.5">Raport Arbitraj</span>
            <span className="text-[10px] text-amber-400/80">Fair-play &amp; conduită</span>
          </div>
        </div>
      </div>

      {/* 2. MANAGER PROFILE & CREDENTIALS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">manage_accounts</span>
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white">
              Informații Manager &amp; Calificare
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datele tale de contact, licența de conducere tehnică și prezentarea clubului
            </p>
          </div>
        </div>

        {/* Avatar & Cover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block">
              Poză de Profil (Avatar)
            </label>
            <div className="flex items-center gap-3">
              {image ? (
                <img src={image} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border border-slate-300 dark:border-slate-700" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg font-headline">
                  {name.substring(0, 2).toUpperCase() || "MG"}
                </div>
              )}
              <label className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:border-lime-400 transition flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">upload</span>
                {image ? "Schimbă Poza" : "Încarcă Poză"}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-[10px] font-bold font-label uppercase text-slate-500 dark:text-slate-400 block">
              Poză de Fundal (Banner Club)
            </label>
            <div className="flex items-center gap-3">
              {coverPhotoUrl ? (
                <img src={coverPhotoUrl} alt="Cover" className="w-20 h-14 rounded-2xl object-cover border border-slate-300 dark:border-slate-700" />
              ) : (
                <div className="w-20 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-mono">
                  Fără Banner
                </div>
              )}
              <label className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:border-lime-400 transition flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                {coverPhotoUrl ? "Schimbă Banner" : "Încarcă Banner"}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Nume &amp; Prenume Manager *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Adresă de Email (Cont)
            </label>
            <input
              type="email"
              readOnly
              value={initialUser.email || ""}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Telefon de Contact
            </label>
            <input
              type="tel"
              placeholder="+40 7xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Calificare / Licență Managerială
            </label>
            <select
              value={coachingLicense}
              onChange={(e) => setCoachingLicense(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            >
              <option value="Manager / Delegat Club">Manager / Delegat Club</option>
              <option value="Director Sportiv Club">Director Sportiv Club</option>
              <option value="Licență UEFA C">Licență UEFA C</option>
              <option value="Licență UEFA B">Licență UEFA B</option>
              <option value="Licență UEFA A / PRO">Licență UEFA A / PRO</option>
              <option value="Instructor Sportiv Certificat">Instructor Sportiv Certificat</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Ani de Experiență în Conducere Sportivă
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Instagram
            </label>
            <input
              type="text"
              placeholder="@username"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
            Descriere / Prezentare Club &amp; Viziune Managerială
          </label>
          <textarea
            rows={3}
            placeholder="Prezintă pe scurt experiența ta, obiectivele clubului și proiectele sportive pe care le coordonezi..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 leading-relaxed"
          />
        </div>
      </div>

      {/* 3. INFORMAȚII DE FACTURARE ALE CONTULUI */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white">
              Informații de Facturare ale Contului
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datele fiscale ale persoanei juridice sau fizice pentru emiterea facturilor de abonament
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Nume Companie / PFA / Club Sportiv
            </label>
            <input
              type="text"
              placeholder="ex: ACS Vulturii Fotbal S.R.L. sau Asociația Clubul Sportiv..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Cod Fiscal / CUI / CIF
            </label>
            <input
              type="text"
              placeholder="ex: RO12345678"
              value={companyCui}
              onChange={(e) => setCompanyCui(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 font-mono"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
              Adresă Sediu Social &amp; Facturare
            </label>
            <input
              type="text"
              placeholder="ex: Str. Stadionului Nr. 12, Timișoara, Județul Timiș"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-xl disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">save</span>
          <span>{saving ? "Se salvează modificările..." : "Salvează Profilul de Manager"}</span>
        </button>
      </div>
    </form>
  );
}
