"use client";

import React, { useState, useEffect } from "react";

interface PlayerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: {
    id: string;
    name: string;
    email?: string | null;
    number?: number | null;
    position?: string | null;
    image?: string | null;
    userId?: string | null;
  } | null;
  teamId: string;
  teamName: string;
  onSendInvite: (playerId: string, email: string) => Promise<{ acceptLink?: string; directSignupLink?: string } | void>;
}

export function PlayerInviteModal({
  isOpen,
  onClose,
  player,
  teamId,
  teamName,
  onSendInvite,
}: PlayerInviteModalProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setEmail(player.email || "");
      setInviteLink(null);
      setStatusMsg(null);
      setErrorMsg(null);
    }
  }, [player, isOpen]);

  if (!isOpen || !player) return null;

  const isUserLinked = Boolean(player.userId);

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Introdu o adresă de email validă.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const res = await onSendInvite(player!.id, email.trim().toLowerCase());
      if (res && res.directSignupLink) {
        setInviteLink(res.directSignupLink);
      } else if (res && res.acceptLink) {
        setInviteLink(res.acceptLink);
      }
      setStatusMsg(`Invitația pe email a fost transmisă către ${email.trim()}!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Eroare la generarea invitației.");
    } finally {
      setBusy(false);
    }
  }

  const initials = (player.name || "J")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "J";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-body">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-400 border border-lime-400/40 flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div>
              <h3 className="font-headline font-black text-lg uppercase text-white tracking-tight">
                Înrolare &amp; Invitație Jucător
              </h3>
              <p className="text-xs text-slate-400 font-label">
                Conectează jucătorul la profilul presetat de tine
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

        {/* Player Profile Summary */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-white font-bold text-sm shrink-0">
              {player.image ? (
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h4 className="font-headline font-black text-sm text-white">{player.name}</h4>
              <p className="text-xs text-slate-400 font-label">
                #{player.number ?? "—"} • {player.position || "Jucător"} • {teamName}
              </p>
            </div>
          </div>

          <div>
            {isUserLinked ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Cont Activ
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">pending</span>
                În Așteptare
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Action Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold font-label text-slate-300 uppercase block mb-1.5">
              Emailul Jucătorului
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: jucator@email.ro"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span>{busy ? "Se generează..." : "Trimite Invitație & Generează Link"}</span>
          </button>
        </form>

        {/* Link Result Box */}
        {inviteLink && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-400/50 space-y-2 animate-in fade-in">
            <span className="text-[10px] font-mono text-lime-400 uppercase font-bold block">
              Link Direct de Creare Cont Presetat:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-lime-300 font-mono select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-3.5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase shrink-0"
              >
                {copiedLink ? "Copiat!" : "Copiază"}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Salut ${player.name}! Ți-am pregătit profilul pentru echipa ${teamName}. Creează-ți contul aici: ${inviteLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400 font-label pt-1">
              Jucătorul își setează doar parola, iar profilul creat de tine (poza, număr, poziție) va fi instant activ pe contul său!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
