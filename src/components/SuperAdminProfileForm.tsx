"use client";

import React, { useState } from "react";
import { appSignOut } from "@/lib/logout";

interface SuperAdminProfileFormProps {
  initialUser: {
    id: string;
    name?: string | null;
    email: string;
    role?: string | null;
    createdAt?: string | Date;
  };
  initialSettings?: any;
}

export function SuperAdminProfileForm({ initialUser, initialSettings }: SuperAdminProfileFormProps) {
  const [userName, setUserName] = useState(initialUser.name || "Super Administrator");
  const [savingUser, setSavingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState(false);

  // System Legal & Payment Settings State
  const [settings, setSettings] = useState({
    companyName: initialSettings?.companyName || "TSC Q - BUU.RO",
    companyCui: initialSettings?.companyCui || "53063735",
    companyRegCom: initialSettings?.companyRegCom || "J2025095153006",
    companyAddress: initialSettings?.companyAddress || "Timișoara, Județul Timiș, România",
    companyEmail: initialSettings?.companyEmail || "contact@buu.ro",
    companyPhone: initialSettings?.companyPhone || "+40 700 000 000",
    platformFeePercent: initialSettings?.platformFeePercent ?? 10.0,
    stripePublishableKey: initialSettings?.stripePublishableKey || "",
    stripeSecretKey: initialSettings?.stripeSecretKey || "",
    stripeWebhookSecret: initialSettings?.stripeWebhookSecret || "",
    paypalClientId: initialSettings?.paypalClientId || "",
    applePayMerchantId: initialSettings?.applePayMerchantId || "merchant.ro.buu.league",
    applePayDomainVerified: initialSettings?.applePayDomainVerified ?? true,
    applePayEnabled: initialSettings?.applePayEnabled ?? true,
    googlePayMerchantId: initialSettings?.googlePayMerchantId || "buu-ro-league-pay",
    googlePayEnvironment: initialSettings?.googlePayEnvironment || "PRODUCTION",
    googlePayEnabled: initialSettings?.googlePayEnabled ?? true,
    payoutMinThreshold: initialSettings?.payoutMinThreshold ?? 100,
    teamSubscriptionPrice: initialSettings?.teamSubscriptionPrice ?? 60.0,
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  async function handleSaveUserName(e: React.FormEvent) {
    e.preventDefault();
    setSavingUser(true);
    setUserSuccess(false);
    try {
      const res = await fetch(`/api/users/${initialUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
      if (res.ok) {
        setUserSuccess(true);
        setTimeout(() => setUserSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Account Details Card (Only Name & Email) */}
      <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-lime-400 dark:bg-lime-400 dark:text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div>
              <h2 className="text-lg font-black font-headline uppercase text-slate-900 dark:text-white">
                Cont Super Administrator (Master)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                Super Administratorul are acces total pe platformă fără profil sportiv sau atribute de jucător.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => appSignOut("/")}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white font-headline font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-red-500/20"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Deconectare</span>
          </button>
        </div>

        <form onSubmit={handleSaveUserName} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block">
              Nume Administrator
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="input text-xs font-bold"
              placeholder="Super Administrator"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block">
              Email Master (Login)
            </label>
            <input
              type="email"
              value={initialUser.email}
              disabled
              className="input text-xs font-mono font-bold bg-slate-100 dark:bg-slate-950 opacity-80 cursor-not-allowed text-slate-600 dark:text-slate-300"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end items-center gap-3 pt-2">
            {userSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-label">
                Nume actualizat cu succes! ✓
              </span>
            )}
            <button
              type="submit"
              disabled={savingUser}
              className="px-5 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {savingUser ? "Se salvează..." : "Actualizează Nume"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Date Legale & Identitate Fiscală Operator (  buu.ro) */}
      <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
              🏢
            </div>
            <div>
              <h3 className="font-headline font-black text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                Date Legale &amp; Identitate Fiscală (  buu.ro)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                Datele entității juridice care operează platforma, facturile de ticketing și termenii legali.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase border border-blue-500/20">
            Operator:   buu.ro
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Denumire Societate / Operator *
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="input text-xs font-bold"
              placeholder="TSC Q - BUU.RO"
            />
          </div>

          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Cod Unic Înregistrare (CUI / CIF) *
            </label>
            <input
              type="text"
              value={settings.companyCui}
              onChange={(e) => setSettings({ ...settings, companyCui: e.target.value })}
              className="input text-xs font-mono font-bold"
              placeholder="53063735"
            />
          </div>

          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Nr. Înreg. Reg. Comerțului
            </label>
            <input
              type="text"
              value={settings.companyRegCom}
              onChange={(e) => setSettings({ ...settings, companyRegCom: e.target.value })}
              className="input text-xs font-mono"
              placeholder="J2025095153006"
            />
          </div>

          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Email Suport &amp; DPO *
            </label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              className="input text-xs font-mono"
              placeholder="contact@buu.ro"
            />
          </div>

          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Telefon Asistență
            </label>
            <input
              type="tel"
              value={settings.companyPhone}
              onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              className="input text-xs font-mono"
              placeholder="+40 700 000 000"
            />
          </div>

          <div>
            <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
              Sediu Social / Adresă Juridică
            </label>
            <input
              type="text"
              value={settings.companyAddress}
              onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              className="input text-xs font-medium"
              placeholder="Timișoara, Județul Timiș, România"
            />
          </div>
        </div>
      </div>

      {/* 3. Module de Plată (Stripe, Apple Pay, Google Pay, PayPal) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">💳</span>
          <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white uppercase">
            Module de Plată &amp; Gateways Integrate
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modul Stripe */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                  Modul Stripe (Carduri Bancare)
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold font-mono">
                PSD2 Compliant
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  placeholder="pk_live_51..."
                  value={settings.stripePublishableKey}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400">
                    Stripe Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="text-[10px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showSecretKey ? "Ascunde" : "Arată Cheia"}
                  </button>
                </div>
                <input
                  type={showSecretKey ? "text" : "password"}
                  placeholder="sk_live_51..."
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Stripe Webhook Secret
                </label>
                <input
                  type="text"
                  placeholder="whsec_..."
                  value={settings.stripeWebhookSecret}
                  onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modul Apple Pay */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍎</span>
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                  Modul Apple Pay (iOS &amp; Safari)
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applePayEnabled}
                  onChange={(e) => setSettings({ ...settings, applePayEnabled: e.target.checked })}
                  className="rounded text-lime-500 focus:ring-lime-400"
                />
                <span className="text-xs font-bold font-label">Activat</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Apple Merchant Identifier
                </label>
                <input
                  type="text"
                  placeholder="merchant.ro.buu.league"
                  value={settings.applePayMerchantId}
                  onChange={(e) => setSettings({ ...settings, applePayMerchantId: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-slate-700 dark:text-slate-300">
                    Domeniu Web Verificat:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                    sp.  buu.ro (Verificat ✓)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-body">
                  Fișierul <code>/.well-known/apple-developer-merchantid-domain-association</code> este configurat automat.
                </p>
              </div>
            </div>
          </div>

          {/* Modul Google Pay */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🟢</span>
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                  Modul Google Pay (Android &amp; Chrome)
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.googlePayEnabled}
                  onChange={(e) => setSettings({ ...settings, googlePayEnabled: e.target.checked })}
                  className="rounded text-lime-500 focus:ring-lime-400"
                />
                <span className="text-xs font-bold font-label">Activat</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Google Pay Merchant ID
                  </label>
                  <input
                    type="text"
                    placeholder="buu-ro-league-pay"
                    value={settings.googlePayMerchantId}
                    onChange={(e) => setSettings({ ...settings, googlePayMerchantId: e.target.value })}
                    className="input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Mediu Tranzacții
                  </label>
                  <select
                    value={settings.googlePayEnvironment}
                    onChange={(e) => setSettings({ ...settings, googlePayEnvironment: e.target.value })}
                    className="input text-xs font-bold"
                  >
                    <option value="PRODUCTION">PRODUCTION (Live)</option>
                    <option value="TEST">TEST (Sandbox)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-body">
                Plata cu 1 singur click este disponibilă pe toate telefoanele Android și browserul Chrome.
              </p>
            </div>
          </div>

          {/* Modul PayPal & Comisioane */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-2xl material-symbols-outlined">payments</span>
              <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                PayPal &amp; Comisioane Platformă
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  PayPal Client ID
                </label>
                <input
                  type="text"
                  placeholder="client_id_..."
                  value={settings.paypalClientId}
                  onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Comision Platformă (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={settings.platformFeePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platformFeePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Prag Minim Retragere (RON)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={settings.payoutMinThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payoutMinThreshold: parseInt(e.target.value) || 100,
                      })
                    }
                    className="input text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Abonamente Echipe */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-2xl material-symbols-outlined">badge</span>
              <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-white uppercase">
                Abonamente Echipe
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Preț Abonament Anual / Echipă Suplimentară (EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settings.teamSubscriptionPrice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      teamSubscriptionPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input text-xs font-bold"
                />
                <p className="text-[11px] text-slate-500 font-body mt-1">
                  Primul echipe creată de un manager este gratuită. Următoarele necesită abonament activ la acest preț anual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <div>
            {settingsSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-label flex items-center gap-1.5">
                <span>✓</span> Datele legale și setările de plată au fost salvate cu succes!
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-400/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>{savingSettings ? "Se salvează..." : "Salvează Date Legale & Module de Plată ✓"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
