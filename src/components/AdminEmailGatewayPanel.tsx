"use client";

import React, { useState, useEffect } from "react";

export interface EmailGatewaySettings {
  emailGatewayEnabled: boolean;
  emailProvider: "smtp" | "zeptomail" | "sendmail" | "resend" | "mock";
  emailSenderEmail: string;
  emailSenderName: string;
  emailReplyTo: string;
  emailSmtpHost: string;
  emailSmtpPort: number;
  emailSmtpSecure: boolean;
  emailSmtpUser: string;
  emailSmtpPass: string;
  emailZeptoToken: string;
  emailZeptoRegion: string;
  emailSendmailPath: string;
}

interface EmailLogItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string | null;
  status: "sent" | "failed" | "dev_logged" | "queued";
  error?: string | null;
  provider?: string | null;
  createdAt: string;
}

interface AdminEmailGatewayPanelProps {
  initialSettings: EmailGatewaySettings;
  onSaved?: (newSettings: EmailGatewaySettings) => void;
  currentUserEmail?: string;
}

export function AdminEmailGatewayPanel({
  initialSettings,
  onSaved,
  currentUserEmail = "contact@ligue.ro",
}: AdminEmailGatewayPanelProps) {
  const [settings, setSettings] = useState<EmailGatewaySettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Visibility toggles for secrets
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showZeptoToken, setShowZeptoToken] = useState(false);

  // Test Email state
  const [testEmailTarget, setTestEmailTarget] = useState(currentUserEmail);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message?: string;
    messageId?: string;
    error?: string;
    latencyMs?: number;
    details?: any;
  } | null>(null);

  // Email Logs state
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");
  const [logCounts, setLogCounts] = useState({ total: 0, sent: 0, failed: 0, dev_logged: 0 });
  const [previewLog, setPreviewLog] = useState<EmailLogItem | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    loadLogs();
  }, [logFilter]);

  async function loadLogs() {
    setLoadingLogs(true);
    try {
      const url = logFilter && logFilter !== "all" ? `/api/admin/email/logs?status=${logFilter}` : "/api/admin/email/logs";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        if (data.counts) setLogCounts(data.counts);
      }
    } catch (err) {
      console.error("[EmailGateway] Failed to load logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function handleClearLogs() {
    if (!confirm("Sigur dorești să ștergi întregul istoric de emailuri tranzacționale din sistem?")) return;
    try {
      const res = await fetch("/api/admin/email/logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
        setLogCounts({ total: 0, sent: 0, failed: 0, dev_logged: 0 });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedFeedback("Setările Gateway Email au fost salvate cu succes în baza de date!");
        setTimeout(() => setSavedFeedback(null), 4000);
        if (onSaved) onSaved(settings);
      } else {
        alert(data.error || "Eroare la salvarea setărilor de email.");
      }
    } catch {
      alert("Eroare de rețea la salvarea setărilor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    if (!testEmailTarget || !testEmailTarget.includes("@")) {
      alert("Te rugăm să introduci o adresă de email validă pentru test.");
      return;
    }
    setTestingEmail(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetEmail: testEmailTarget,
          config: settings,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (res.ok) {
        loadLogs();
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        error: err.message || "Eroare la apelarea endpoint-ului de test.",
      });
    } finally {
      setTestingEmail(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in font-body text-slate-100">
      {/* 1. MASTER BANNER & GATEWAY STATUS */}
      <div className="card p-6 sm:p-8 bg-slate-900 border-2 border-lime-400/40 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  settings.emailGatewayEnabled ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                SERVICIU EMAILURI TRANZACȚIONALE • SUPERADMIN GATEWAY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-tight text-white">
              Gateway Emailuri Tranzacționale &amp; Notificări
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed">
              Activează și configurează serverul prin care se transmit automat <strong>invitațiile către jucători</strong>, 
              reminderele de meci, rapoartele de arbitraj și notificările oficiale ale cluburilor și campionatelor.
            </p>
          </div>

          {/* Master Enable/Disable Switch Card */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Stare Livrare Emailuri
                </span>
                <span
                  className={`text-sm font-headline font-black uppercase ${
                    settings.emailGatewayEnabled ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {settings.emailGatewayEnabled ? "GATEWAY ACTIV (LIVE)" : "SIMULATOR (DEV LOG)"}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, emailGatewayEnabled: !prev.emailGatewayEnabled }))
                }
                className={`w-14 h-8 rounded-full transition-colors relative p-1 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                  settings.emailGatewayEnabled ? "bg-lime-400" : "bg-slate-700"
                }`}
                title="Comută activare/dezactivare gateway email"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-slate-950 transition-transform ${
                    settings.emailGatewayEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {settings.emailGatewayEnabled
                ? "Mesajele se trimit către serverul SMTP / ZeptoMail"
                : "Mesajele se salvează local în EmailLog pentru inspecție"}
            </span>
          </div>
        </div>

        {/* 2. PROVIDER SELECTOR CARDS */}
        <div className="space-y-3">
          <label className="text-xs font-headline font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400 text-sm">hub</span>
            Selectează Providerul de Email (Gateway):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Option 1: Custom SMTP */}
            <div
              onClick={() => setSettings((prev) => ({ ...prev, emailProvider: "smtp" }))}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.emailProvider === "smtp"
                  ? "bg-slate-950 border-lime-400 ring-2 ring-lime-400/30 shadow-lg"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">dns</span>
                </div>
                <input
                  type="radio"
                  name="emailProvider"
                  checked={settings.emailProvider === "smtp"}
                  onChange={() => setSettings((prev) => ({ ...prev, emailProvider: "smtp" }))}
                  className="accent-lime-400 mt-1"
                />
              </div>
              <div>
                <h4 className="font-headline font-black text-sm uppercase text-white">Server SMTP Propriu</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  cPanel, Postfix, Gmail App Passwords, Amazon SES sau orice server SMTP dedicat.
                </p>
              </div>
            </div>

            {/* Option 2: ZeptoMail by Zoho */}
            <div
              onClick={() => setSettings((prev) => ({ ...prev, emailProvider: "zeptomail" }))}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.emailProvider === "zeptomail"
                  ? "bg-slate-950 border-lime-400 ring-2 ring-lime-400/30 shadow-lg"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">mark_email_read</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[9px] font-bold uppercase">
                  Recomandat
                </span>
              </div>
              <div>
                <h4 className="font-headline font-black text-sm uppercase text-white">ZeptoMail (Zoho)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Specializat pe emailuri tranzacționale ultra-rapide. Livrare garantată în inbox cu token API.
                </p>
              </div>
            </div>

            {/* Option 3: Sendmail / Local Linux */}
            <div
              onClick={() => setSettings((prev) => ({ ...prev, emailProvider: "sendmail" }))}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.emailProvider === "sendmail"
                  ? "bg-slate-950 border-lime-400 ring-2 ring-lime-400/30 shadow-lg"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/30 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">terminal</span>
                </div>
                <input
                  type="radio"
                  name="emailProvider"
                  checked={settings.emailProvider === "sendmail"}
                  onChange={() => setSettings((prev) => ({ ...prev, emailProvider: "sendmail" }))}
                  className="accent-lime-400 mt-1"
                />
              </div>
              <div>
                <h4 className="font-headline font-black text-sm uppercase text-white">Sendmail (Local)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Executabilul nativ Sendmail / Postfix pe Linux VPS (fără date de autentificare externe).
                </p>
              </div>
            </div>

            {/* Option 4: Resend */}
            <div
              onClick={() => setSettings((prev) => ({ ...prev, emailProvider: "resend" }))}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                settings.emailProvider === "resend"
                  ? "bg-slate-950 border-lime-400 ring-2 ring-lime-400/30 shadow-lg"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">send</span>
                </div>
                <input
                  type="radio"
                  name="emailProvider"
                  checked={settings.emailProvider === "resend"}
                  onChange={() => setSettings((prev) => ({ ...prev, emailProvider: "resend" }))}
                  className="accent-lime-400 mt-1"
                />
              </div>
              <div>
                <h4 className="font-headline font-black text-sm uppercase text-white">Resend</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Serviciu modern de email pentru dezvoltatori prin SMTP / API.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONFIGURATION FIELDS FORM */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Server Connection Credentials */}
          <div className="card p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-black">
                <span className="material-symbols-outlined text-lg">vpn_key</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-base uppercase text-white">
                  Parametri Conexiune {settings.emailProvider.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">
                  {settings.emailProvider === "zeptomail"
                    ? "Configurație dedicată pentru Zoho ZeptoMail API / SMTP"
                    : settings.emailProvider === "sendmail"
                    ? "Calea executabilului de pe serverul Linux"
                    : "Parametrii de autentificare SMTP ai serverului tău"}
                </p>
              </div>
            </div>

            {/* Provider: ZeptoMail Specific Fields */}
            {settings.emailProvider === "zeptomail" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-sky-400 shrink-0 text-base mt-0.5">info</span>
                  <div className="space-y-1">
                    <p className="font-bold text-sky-100">Cum funcționează ZeptoMail:</p>
                    <p className="text-[11px] text-sky-200/90 leading-relaxed">
                      Sistemul utilizează automat adresa <strong>smtp.zeptomail.{settings.emailZeptoRegion || "eu"}</strong>, 
                      utilizatorul standard <strong>emailapikey</strong> și conexiune criptată TLS pe portul 587.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase text-slate-300">
                      Regiune Datacenter ZeptoMail
                    </label>
                    <select
                      value={settings.emailZeptoRegion || "eu"}
                      onChange={(e) => setSettings({ ...settings, emailZeptoRegion: e.target.value })}
                      className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700"
                    >
                      <option value="eu">Europa (smtp.zeptomail.eu)</option>
                      <option value="com">Statele Unite / Global (smtp.zeptomail.com)</option>
                      <option value="in">India (smtp.zeptomail.in)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase text-slate-300">
                      Port ZeptoMail
                    </label>
                    <select
                      value={settings.emailSmtpPort || 587}
                      onChange={(e) => setSettings({ ...settings, emailSmtpPort: Number(e.target.value) })}
                      className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700"
                    >
                      <option value={587}>Port 587 (STARTTLS - Recomandat)</option>
                      <option value={465}>Port 465 (SSL Criptat)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase text-slate-300 flex items-center justify-between">
                    <span>Send Mail Token (Cheie API ZeptoMail) *</span>
                    <button
                      type="button"
                      onClick={() => setShowZeptoToken(!showZeptoToken)}
                      className="text-[11px] text-lime-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {showZeptoToken ? "visibility_off" : "visibility"}
                      </span>
                      <span>{showZeptoToken ? "Ascunde" : "Arată"}</span>
                    </button>
                  </label>
                  <input
                    type={showZeptoToken ? "text" : "password"}
                    placeholder="Zoho-enczapikey: wSsVR6... sau Send Mail Token"
                    value={settings.emailZeptoToken || ""}
                    onChange={(e) => setSettings({ ...settings, emailZeptoToken: e.target.value })}
                    className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    Găsești tokenul în ZeptoMail Dashboard → Mail Agents → Nume Agent → Setup Info.
                  </p>
                </div>
              </div>
            )}

            {/* Provider: Custom SMTP Specific Fields */}
            {settings.emailProvider === "smtp" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase text-slate-300">
                      Server SMTP (Host) *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: mail.domeniu.ro sau smtp.gmail.com"
                      value={settings.emailSmtpHost || ""}
                      onChange={(e) => setSettings({ ...settings, emailSmtpHost: e.target.value })}
                      className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-headline font-bold uppercase text-slate-300">Port SMTP</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={settings.emailSmtpPort || 587}
                      onChange={(e) => setSettings({ ...settings, emailSmtpPort: Number(e.target.value) })}
                      className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase text-slate-300">
                    Utilizator / Cont SMTP (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: contact@domeniu.ro sau cont@gmail.com"
                    value={settings.emailSmtpUser || ""}
                    onChange={(e) => setSettings({ ...settings, emailSmtpUser: e.target.value })}
                    className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase text-slate-300 flex items-center justify-between">
                    <span>Parolă SMTP</span>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[11px] text-lime-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {showSmtpPass ? "visibility_off" : "visibility"}
                      </span>
                      <span>{showSmtpPass ? "Ascunde" : "Arată"}</span>
                    </button>
                  </label>
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    placeholder="Parola căsuței de email sau App Password"
                    value={settings.emailSmtpPass || ""}
                    onChange={(e) => setSettings({ ...settings, emailSmtpPass: e.target.value })}
                    className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.emailSmtpSecure}
                      onChange={(e) => setSettings({ ...settings, emailSmtpSecure: e.target.checked })}
                      className="rounded accent-lime-400"
                    />
                    <span>Conexiune directă SSL (folosește obligatoriu dacă portul este 465)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Provider: Sendmail Specific Fields */}
            {settings.emailProvider === "sendmail" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase text-slate-300">
                    Cale Executabil Sendmail
                  </label>
                  <input
                    type="text"
                    placeholder="/usr/sbin/sendmail"
                    value={settings.emailSendmailPath || "/usr/sbin/sendmail"}
                    onChange={(e) => setSettings({ ...settings, emailSendmailPath: e.target.value })}
                    className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Pe majoritatea serverelor Linux Debian/Ubuntu calea implicită este <code>/usr/sbin/sendmail</code>.
                  </p>
                </div>
              </div>
            )}

            {/* Provider: Resend Specific Fields */}
            {settings.emailProvider === "resend" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-headline font-bold uppercase text-slate-300 flex items-center justify-between">
                    <span>Cheie API Resend (re_...)</span>
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="text-[11px] text-lime-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span className="material-symbols-outlined text-xs">
                        {showSmtpPass ? "visibility_off" : "visibility"}
                      </span>
                      <span>{showSmtpPass ? "Ascunde" : "Arată"}</span>
                    </button>
                  </label>
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    placeholder="re_123456789..."
                    value={settings.emailSmtpPass || ""}
                    onChange={(e) => setSettings({ ...settings, emailSmtpPass: e.target.value })}
                    className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card B: Sender Identity & Addresses */}
          <div className="card p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-black">
                  <span className="material-symbols-outlined text-lg">badge</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base uppercase text-white">
                    Identitate Expeditor (From &amp; Reply-To)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Numele și adresa care apar în căsuța de email a utilizatorilor
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold uppercase text-slate-300">
                  Nume Expeditor (From Name)
                </label>
                <input
                  type="text"
                  placeholder="ex: Pro Ligue România"
                  value={settings.emailSenderName || ""}
                  onChange={(e) => setSettings({ ...settings, emailSenderName: e.target.value })}
                  className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold uppercase text-slate-300">
                  Adresă Email Expeditor (From Email) *
                </label>
                <input
                  type="email"
                  placeholder="noreply@ligue.ro"
                  value={settings.emailSenderEmail || ""}
                  onChange={(e) => setSettings({ ...settings, emailSenderEmail: e.target.value })}
                  className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                />
                {settings.emailProvider === "zeptomail" && (
                  <p className="text-[10px] text-amber-400/90 font-mono">
                    Atenție: Adresa de email trebuie să aparțină domeniului verificat în ZeptoMail (SPF/DKIM).
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-headline font-bold uppercase text-slate-300">
                  Adresă Răspuns (Reply-To)
                </label>
                <input
                  type="email"
                  placeholder="contact@ligue.ro"
                  value={settings.emailReplyTo || ""}
                  onChange={(e) => setSettings({ ...settings, emailReplyTo: e.target.value })}
                  className="input text-xs w-full py-2.5 rounded-xl bg-slate-950 border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Quick Save Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              {savedFeedback ? (
                <span className="text-xs text-lime-400 font-bold flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {savedFeedback}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">
                  Toate modificările se aplică instantaneu.
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{saving ? "Se salvează..." : "Salvează Configurația Gateway"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 4. DIAGNOSTIC TEST EMAIL MODULE */}
      <div className="card p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/10 text-sky-400 flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-xl">speed</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-base uppercase text-white">
                Testare Conexiune &amp; Livrare Instantanee
              </h3>
              <p className="text-xs text-slate-400">
                Trimite un mesaj de probă pentru a verifica dacă serverul acceptă datele și expediază corect
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Provider activ: <strong className="text-lime-400 uppercase">{settings.emailProvider}</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              alternate_email
            </span>
            <input
              type="email"
              placeholder="Introdu adresa ta de email pentru primirea testului..."
              value={testEmailTarget}
              onChange={(e) => setTestEmailTarget(e.target.value)}
              className="input pl-10 pr-4 text-xs w-full py-3 rounded-xl bg-slate-950 border-slate-700 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testingEmail}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-headline font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            <span>{testingEmail ? "Se trimite testul..." : "Trimite Email de Diagnostic"}</span>
          </button>
        </div>

        {/* Test Result Display Box */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs animate-in fade-in space-y-2 ${
              testResult.ok
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/40 border-red-500/40 text-red-200"
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  {testResult.ok ? "check_circle" : "error"}
                </span>
                <span>{testResult.ok ? "Diagnostic Pozitiv: Email Livrat!" : "Eroare la Trimitere"}</span>
              </span>
              {testResult.latencyMs && (
                <span className="font-mono text-[11px] opacity-80">
                  Latență: {testResult.latencyMs} ms
                </span>
              )}
            </div>

            <p className="text-[12px] leading-relaxed">
              {testResult.ok
                ? testResult.message
                : `Cauză eroare: ${testResult.error || "Nu s-a putut stabili conexiunea cu serverul SMTP."}`}
            </p>

            {testResult.messageId && (
              <p className="font-mono text-[10px] text-emerald-300/80">
                Message ID: {testResult.messageId}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. EMAIL LOGS & ACTIVITY HISTORY */}
      <div className="card p-6 sm:p-7 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400 text-lg">history</span>
              <h3 className="font-headline font-black text-base uppercase text-white">
                Jurnal Emailuri Tranzacționale Recente
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Toate invitațiile, notificările și testele procesate pe platformă
            </p>
          </div>

          {/* Counts Pills & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLogFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                logFilter === "all" ? "bg-slate-700 text-white" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Toate ({logCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter("sent")}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                logFilter === "sent" ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Trimise ({logCounts.sent})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter("failed")}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                logFilter === "failed" ? "bg-red-500/30 text-red-300 border border-red-500/40" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Eșuate ({logCounts.failed})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter("dev_logged")}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                logFilter === "dev_logged" ? "bg-amber-500/30 text-amber-300 border border-amber-500/40" : "bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              Simulator ({logCounts.dev_logged})
            </button>

            <button
              type="button"
              onClick={loadLogs}
              disabled={loadingLogs}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition ml-2"
              title="Reîmprospătează jurnal"
            >
              <span className={`material-symbols-outlined text-base ${loadingLogs ? "animate-spin" : ""}`}>
                refresh
              </span>
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition"
              title="Golește jurnalul"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-950 rounded-2xl border border-slate-800">
            Nu există niciun email înregistrat în jurnal pentru filtrul selectat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Data &amp; Ora</th>
                  <th className="py-3 px-3">Destinatar</th>
                  <th className="py-3 px-3">Subiect</th>
                  <th className="py-3 px-3">Gateway</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-body">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ro-RO")}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white font-bold">{log.to}</td>
                    <td className="py-2.5 px-3 text-slate-200 truncate max-w-[260px]">{log.subject}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 uppercase">
                      {log.provider || "smtp"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          log.status === "sent"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : log.status === "failed"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {log.status === "sent" ? "Trimis" : log.status === "failed" ? "Eșuat" : "Simulat"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-[11px] transition inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        <span>Previzualizează</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. MODAL PREVIEW CONTENT */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Previzualizare Mesaj Tranzacțional
                </span>
                <h3 className="font-headline font-black text-base text-white mt-0.5">
                  {previewLog.subject}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Către: <strong className="text-lime-400">{previewLog.to}</strong> •{" "}
                  {new Date(previewLog.createdAt).toLocaleString("ro-RO")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {previewLog.error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                Eroare: {previewLog.error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white text-slate-900">
              <div
                dangerouslySetInnerHTML={{ __html: previewLog.html }}
                className="prose prose-sm max-w-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewLog(null)}
                className="btn btn-secondary text-xs uppercase font-bold py-2 px-4 rounded-xl"
              >
                Închide Fereastra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
