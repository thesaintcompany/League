"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  email?: string | null;
  number: number | null;
  position: string | null;
  status: string;
  isStarter: boolean;
  goals: number;
  assists: number;
  rating: number;
}

interface Match {
  id: string;
  scheduledAt: string;
  venue?: string | null;
  stage?: string | null;
  round: number;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  championship?: { id: string; name: string; season?: string | null };
}

interface TeamData {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  logoUrl?: string | null;
  description?: string | null;
  headCoach: string | null;
  assistantCoach: string | null;
  medic: string | null;
  fitnessCoach: string | null;
  formation: string | null;
  homeArena: string | null;
  championship?: { id: string; name: string; season?: string | null };
  players: Player[];
  homeMatches: Match[];
  awayMatches: Match[];
}

interface ManagedTeamSummary {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  logoUrl?: string | null;
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
}

interface TeamManagerPanelProps {
  initialTeam: TeamData;
  teamCount?: number;
  managedTeams?: ManagedTeamSummary[];
  teamSubscriptionPrice?: number;
  freeTeamLimit?: number;
  invitations?: any[];
  currentUser?: { id: string; name?: string | null; email?: string | null; role?: string | null } | null;
  defaultTab?: "roster" | "tactics" | "invites" | "staff" | "calendar" | "matches" | "payments";
}

export function TeamManagerPanel({
  initialTeam,
  teamCount = 1,
  managedTeams = [],
  teamSubscriptionPrice = 60.0,
  freeTeamLimit = 1,
  invitations: initialInvitations = [],
  currentUser = null,
  defaultTab = "roster",
}: TeamManagerPanelProps) {
  const [team, setTeam] = useState<TeamData>(initialTeam);
  const [activeTab, setActiveTab] = useState<"roster" | "tactics" | "invites" | "staff" | "calendar" | "matches" | "payments">(defaultTab);

  // Edit Team State
  const [teamName, setTeamName] = useState(team.name);
  const [shortName, setShortName] = useState(team.shortName || "");
  const [color, setColor] = useState(team.color || "#84cc16");
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");
  const [description, setDescription] = useState(team.description || "");
  const [formation, setFormation] = useState(team.formation || "4-3-3");
  const [homeArena, setHomeArena] = useState(team.homeArena || "Stadionul propriu");

  // Invitations State
  const [invitations, setInvitations] = useState<any[]>(initialInvitations);
  const [invitationActionLoading, setInvitationActionLoading] = useState<string | null>(null);

  // Staff State
  const [headCoach, setHeadCoach] = useState(team.headCoach || "");
  const [assistantCoach, setAssistantCoach] = useState(team.assistantCoach || "");
  const [medic, setMedic] = useState(team.medic || "");
  const [fitnessCoach, setFitnessCoach] = useState(team.fitnessCoach || "");

  // New Player Form State
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState<number | "">("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("Mijlocaș");
  const [newPlayerIsStarter, setNewPlayerIsStarter] = useState(true);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteNumber, setInviteNumber] = useState<number | "">("");
  const [invitePosition, setInvitePosition] = useState("Atacant");
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Team creation state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamShortName, setNewTeamShortName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#84cc16");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "invoice">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payment methods & invoices state
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [activePaymentTab, setActivePaymentTab] = useState<"cards" | "invoices">("cards");

  function notify(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  }

  async function loadPaymentData() {
    try {
      const res = await fetch("/api/team/payments");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods || []);
        setInvoices(data.invoices || []);
      }
    } catch {
      // silent fail
    }
  }

  async function handleDeletePaymentMethod(id: string) {
    const confirmDelete = confirm("Ești sigur că vrei să ștergi această metodă de plată?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/team/payments/methods/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        notify("✓ Metoda de plată a fost ștearsă.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare de rețea.");
    }
  }

  async function handleSetDefaultPayment(id: string) {
    try {
      const res = await fetch(`/api/team/payments/methods/${id}/default`, { method: "POST" });
      if (res.ok) {
        setPaymentMethods((prev) =>
          prev.map((m) => ({ ...m, isDefault: m.id === id }))
        );
        notify("✓ Metoda de plată implicită a fost actualizată.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare de rețea.");
    }
  }

  async function handleAddCard() {
    if (!newCardNumber.trim() || !newCardHolder.trim()) {
      notify("⚠️ Completează numărul cardului și numele titularului.");
      return;
    }
    try {
      const res = await fetch("/api/team/payments/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stripe_card",
          provider: "stripe",
          cardBrand: detectCardBrand(newCardNumber),
          cardLast4: newCardNumber.replace(/\s/g, "").slice(-4),
          cardExpMonth: Number(newCardExpiry.split("/")[0]),
          cardExpYear: Number(newCardExpiry.split("/")[1]),
          cardHolder: newCardHolder,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods((prev) => [...prev, data.paymentMethod]);
        setShowAddCard(false);
        setNewCardNumber("");
        setNewCardExpiry("");
        setNewCardCvc("");
        setNewCardHolder("");
        notify("✓ Cardul a fost adăugat ca metodă de plată.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare de rețea.");
    }
  }

  function detectCardBrand(number: string): string {
    const n = number.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    if (/^6/.test(n)) return "Discover";
    return "Card";
  }

  // Load payment data on mount
  useEffect(() => {
    loadPaymentData();
  }, []);

  async function handleInvitationAction(invitationId: string, action: "accept" | "reject") {
    setInvitationActionLoading(invitationId);
    try {
      const res = await fetch("/api/team/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        notify(data.error || "Eroare la procesarea invitației.");
        return;
      }

      notify(data.message || "Invitația a fost procesată.");
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch {
      notify("Eroare de rețea. Te rugăm să reîncerci.");
    } finally {
      setInvitationActionLoading(null);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Selectează o imagine validă.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify("Imaginea este prea mare. Folosește un fișier sub 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) return;
      try {
        const res = await fetch("/api/team", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: team.id, logoUrl: result }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setTeam((prev) => ({ ...prev, logoUrl: data.team?.logoUrl || result }));
          setLogoUrl(result);
          notify("✓ Logo-ul echipei a fost actualizat!");
        } else {
          notify("Eroare la actualizarea logo-ului.");
        }
      } catch {
        notify("Eroare de rețea la încărcarea logo-ului.");
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    async function loadInvitations() {
      try {
        const res = await fetch("/api/team/invitations");
        if (res.ok) {
          const data = await res.json();
          setInvitations(data.invitations || []);
        }
      } catch {
        // silent fail for invitations load
      }
    }

    loadInvitations();
  }, []);

  async function handleCreateTeam() {
    setBusy(true);
    setPaymentError(null);
    setPaymentRequired(false);
    try {
      const res = await fetch("/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName,
          shortName: newTeamShortName,
          color: newTeamColor,
          description: newTeamDescription,
          paymentMethod,
          paymentConfirmed: !paymentRequired,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === "payment_required") {
          const hasPaymentMethod = paymentMethods.some((m) => m.isActive);
          if (!hasPaymentMethod) {
            setPaymentError("💳 Nu ai o metodă de plată activă. Adaugă un card înainte de a crea o echipă plătită.");
          } else {
            setPaymentError(data.message || "Plată necesară pentru echipă suplimentară.");
          }
          setPaymentRequired(true);
          setBusy(false);
          return;
        }
        setPaymentError(data.error || "Eroare la crearea echipei.");
        setBusy(false);
        return;
      }

      notify(data.message || "Echipa a fost creată cu succes!");
      setShowCreateTeamModal(false);
      setNewTeamName("");
      setNewTeamShortName("");
      setNewTeamColor("#84cc16");
      setNewTeamDescription("");
      setPaymentRequired(false);
      setPaymentError(null);
      window.location.reload();
    } catch {
      setPaymentError("Eroare de rețea. Te rugăm să reîncerci.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmPaymentAndCreateTeam() {
    setIsProcessingPayment(true);
    setTimeout(async () => {
      await handleCreateTeam();
      setIsProcessingPayment(false);
    }, 1200);
  }

  // Save Team & Tactics
  async function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          name: teamName,
          shortName,
          color,
          description,
          formation,
          homeArena,
          headCoach,
          assistantCoach,
          medic,
          fitnessCoach,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeam((prev) => ({ ...prev, ...data.team }));
        notify("✓ Configurația clubului și staff-ul au fost salvate cu succes!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare la salvare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare la salvare.");
    } finally {
      setBusy(false);
    }
  }

  // Toggle Starter / Reserve
  async function togglePlayerStarter(playerId: string, currentStarter: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/team/players", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          isStarter: !currentStarter,
        }),
      });
      if (res.ok) {
        setTeam((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === playerId ? { ...p, isStarter: !currentStarter } : p
          ),
        }));
        notify(`✓ Jucătorul a fost trecut ca ${!currentStarter ? "TITULAR" : "REZERVĂ"}.`);
      }
    } catch {
      notify("⚠️ Eroare la actualizare statut.");
    } finally {
      setBusy(false);
    }
  }

  // Add Direct Player
  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/team/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          name: newPlayerName,
          number: newPlayerNumber === "" ? null : Number(newPlayerNumber),
          position: newPlayerPosition,
          isStarter: newPlayerIsStarter,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeam((prev) => ({
          ...prev,
          players: [...prev.players, data.player],
        }));
        setNewPlayerName("");
        setNewPlayerNumber("");
        setShowAddPlayer(false);
        notify("✓ Jucător adăugat în lot!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare la adăugare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare la adăugare.");
    } finally {
      setBusy(false);
    }
  }

  // Delete Player
  async function handleDeletePlayer(playerId: string, playerName: string) {
    if (!confirm(`Sigur dorești să elimini jucătorul "${playerName}" din lot?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/team/players?id=${playerId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTeam((prev) => ({
          ...prev,
          players: prev.players.filter((p) => p.id !== playerId),
        }));
        notify("✓ Jucător eliminat din lot.");
      }
    } catch {
      notify("⚠️ Eroare la ștergere.");
    } finally {
      setBusy(false);
    }
  }

  // Send Email Invite
  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          email: inviteEmail,
          name: inviteName,
          number: inviteNumber === "" ? null : Number(inviteNumber),
          position: invitePosition,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastInviteLink(data.inviteLink);
        setTeam((prev) => ({
          ...prev,
          players: [...prev.players, data.player],
        }));
        setInviteEmail("");
        setInviteName("");
        setInviteNumber("");
        notify("✓ Invitația pe email a fost generată și trimisă!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`⚠️ Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("⚠️ Eroare la trimiterea invitației.");
    } finally {
      setBusy(false);
    }
  }

  const starters = team.players.filter((p) => p.isStarter);
  const reserves = team.players.filter((p) => !p.isStarter);
  const allMatches = [...team.homeMatches, ...team.awayMatches].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <div className="space-y-8 font-body text-white">
      {/* 1. Header Hero Card */}
      <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-2xl text-white shadow-xl border-2 border-white/20"
              style={{ backgroundColor: team.color || "#84cc16" }}
            >
              {team.shortName || team.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label">
                  👔 PANOU MANAGER ECHIPĂ
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 text-xs font-label font-bold">
                  {team.players.length} Jucători în Lot
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-label">
                  {team.championship?.name || "Liga Pro România"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-headline uppercase tracking-tight text-white mt-1">
                {team.name}
              </h1>
              <p className="text-xs text-slate-400 font-label">
                Arenă Gazdă: <strong className="text-slate-200">{team.homeArena || "Stadionul Dan Păltinișanu"}</strong> • Formație: <strong className="text-lime-400">{team.formation || "4-3-3"}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("invites")}
              className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">forward_to_inbox</span>
              Invită Jucător pe Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tactics")}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase transition border border-slate-700 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">sports</span>
              Așezare Tactică
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-2xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold font-label animate-in fade-in">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Team Management Section */}
      <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
              Echipele Mele
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-label mt-1">
              {teamCount}/{freeTeamLimit} echipă gratuită • Următoarele: {teamSubscriptionPrice} EUR / an
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPaymentRequired(false);
              setPaymentError(null);
              setShowCreateTeamModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            {teamCount >= freeTeamLimit ? "Creează Echipă (Plătită)" : "Creează Echipă Gratuită"}
          </button>
        </div>

        {managedTeams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {managedTeams.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 ${t.id === team.id
                    ? "border-lime-500 bg-lime-500/10 text-white shadow-md"
                    : "border-slate-700 bg-slate-800/60 text-slate-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md uppercase shrink-0 border border-white/10"
                    style={{ backgroundColor: t.color || "#84cc16" }}
                  >
                    {t.shortName?.substring(0, 3) || t.name.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline font-bold text-sm leading-tight truncate">{t.name}</p>
                    <p className="text-[10px] font-label text-slate-400 uppercase">
                      {t.subscriptionActive ? `Abonament activ • ${t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt).toLocaleDateString("ro-RO") : ""}` : "Plan gratuit"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400 text-2xl">mail</span>
            <div>
              <h2 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
                Invitații Primite
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-label mt-0.5">
                Organizatorii te invita să participi la campionate. Acceptă sau refuză participarea.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl border border-slate-700 bg-slate-800/60 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-headline font-bold text-sm text-white truncate">
                    {inv.championship?.name || "Campionat"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-label">
                    {inv.championship?.sport || "Sport"} • Sezon {inv.championship?.season || "2026"} • {inv.championship?.county || ""}
                  </p>
                  <p className="text-[10px] text-slate-500 font-label mt-1">
                    Invitat de {inv.inviter?.name || inv.inviter?.email || "Organizator"} • Echipa: {inv.team?.name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleInvitationAction(inv.id, "accept")}
                    disabled={invitationActionLoading === inv.id}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase transition disabled:opacity-50"
                  >
                    Acceptă
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInvitationAction(inv.id, "reject")}
                    disabled={invitationActionLoading === inv.id}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-headline font-bold text-xs uppercase transition disabled:opacity-50"
                  >
                    Refuză
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-slate-900 dark:text-white">
                Creează Echipă Nouă
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setPaymentRequired(false);
                  setPaymentError(null);
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
              </button>
            </div>

            {paymentRequired && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold space-y-2">
                <p className="font-bold">{paymentError}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "card", label: "Card Stripe", icon: "credit_card" },
                    { id: "apple_pay", label: "Apple Pay", icon: "apple" },
                    { id: "google_pay", label: "Google Pay", icon: "google" },
                    { id: "invoice", label: "Factură", icon: "receipt" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${paymentMethod === m.id
                          ? "border-lime-500 bg-lime-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      <span className="material-symbols-outlined text-lg">{m.icon}</span>
                      <span className="text-[10px] font-bold font-label">{m.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPaymentAndCreateTeam}
                  disabled={isProcessingPayment || busy}
                  className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                >
                  {isProcessingPayment ? "Se procesează plata..." : `Plătește ${teamSubscriptionPrice} EUR / an`}
                </button>
              </div>
            )}

            {!paymentRequired && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTeam();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Nume Echipa
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="ex. FC Stars"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Scurt
                    </label>
                    <input
                      type="text"
                      value={newTeamShortName}
                      onChange={(e) => setNewTeamShortName(e.target.value)}
                      placeholder="STAR"
                      maxLength={5}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                      Culoare
                    </label>
                    <input
                      type="color"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                      className="w-full h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Descriere (opțional)
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="ex: Echipa noastră de fotbal din Timișoara, fondată în 2010..."
                    maxLength={300}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-500 resize-none"
                  />
                </div>

                {paymentError && <p className="text-xs text-red-500 font-semibold">{paymentError}</p>}

                <button
                  type="submit"
                  disabled={busy || isProcessingPayment}
                  className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                >
                  {busy ? "Se creează..." : "Creează Echipa"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "roster", label: `Lot Jucători (${team.players.length})`, icon: "groups" },
          { id: "tactics", label: "Configurare Club & Tactică", icon: "tune" },
          { id: "invites", label: "Invită Jucători pe Email", icon: "mail" },
          { id: "staff", label: "Staff Tehnic & Antrenori", icon: "badge" },
          { id: "calendar", label: `Calendar & Traseu Meciuri (${allMatches.length})`, icon: "calendar_month" },
          { id: "matches", label: "Meciuri & Invitații", icon: "sports_soccer" },
          { id: "payments", label: "Metode de Plată & Facturi", icon: "payments" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-2 border ${activeTab === t.id
              ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB 1: Lot Jucători (Titulari vs Rezerve) */}
      {activeTab === "roster" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold font-headline uppercase text-white">
                Gestiune Titulari &amp; Rezerve
              </h3>
              <p className="text-xs text-slate-400 font-label">
                Treci jucătorii între primul 11 și banca de rezerve cu un singur click
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPlayer((s) => !s)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-label font-bold uppercase transition border border-lime-400/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Adaugă Jucător în Lot
            </button>
          </div>

          {showAddPlayer && (
            <form
              onSubmit={handleAddPlayer}
              className="card p-6 bg-slate-900 border border-lime-400/50 rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in"
            >
              <div className="sm:col-span-2">
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1">
                  Nume &amp; Prenume Jucător *
                </label>
                <input
                  required
                  placeholder="ex: Andrei Popescu"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1">
                  Număr Tricou
                </label>
                <input
                  type="number"
                  placeholder="ex: 10"
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1">
                  Poziție
                </label>
                <select
                  value={newPlayerPosition}
                  onChange={(e) => setNewPlayerPosition(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Portar">Portar (GK)</option>
                  <option value="Fundaș Central">Fundaș Central (CB)</option>
                  <option value="Fundaș Lateral">Fundaș Lateral (LB/RB)</option>
                  <option value="Mijlocaș">Mijlocaș (CM/CAM)</option>
                  <option value="Extremă">Extremă (LW/RW)</option>
                  <option value="Atacant">Atacant (ST/CF)</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-between items-center pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs font-label text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlayerIsStarter}
                    onChange={(e) => setNewPlayerIsStarter(e.target.checked)}
                    className="w-4 h-4 rounded text-lime-400 focus:ring-0"
                  />
                  <span>Adaugă direct ca Titular în Primul 11</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-400"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !newPlayerName.trim()}
                    className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    Salvează Jucător
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Section: Titulari (Starting XI) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
              <h4 className="text-base font-bold font-headline uppercase text-lime-400 tracking-wide">
                Titulari (Primul 11) - {starters.length} Jucători
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {starters.map((p) => (
                <div
                  key={p.id}
                  className="card p-4 bg-slate-900 border border-lime-400/30 rounded-2xl shadow-md flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 font-black text-sm flex items-center justify-center font-mono shadow-md">
                        #{p.number ?? "—"}
                      </div>
                      <div>
                        <h5 className="font-headline font-bold text-sm text-white">
                          {p.name}
                        </h5>
                        <span className="text-[10px] font-label uppercase font-bold text-lime-400">
                          {p.position || "Mijlocaș"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePlayer(p.id, p.name)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Șterge"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-label">
                    <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 font-bold text-[10px] uppercase">
                      Titular ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePlayerStarter(p.id, true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] uppercase transition"
                    >
                      Treci pe Rezervă ⇄
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Banca de Rezerve */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h4 className="text-base font-bold font-headline uppercase text-amber-300 tracking-wide">
                Banca de Rezerve - {reserves.length} Jucători
              </h4>
            </div>

            {reserves.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl italic">
                Nu există jucători pe banca de rezerve.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reserves.map((p) => (
                  <div
                    key={p.id}
                    className="card p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 font-black text-sm flex items-center justify-center font-mono">
                          #{p.number ?? "—"}
                        </div>
                        <div>
                          <h5 className="font-headline font-bold text-sm text-white">
                            {p.name}
                          </h5>
                          <span className="text-[10px] font-label uppercase font-bold text-slate-400">
                            {p.position || "Rezervă"} {p.status === "invited" ? "• Invitație Trimisă" : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-label">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                        Rezervă
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePlayerStarter(p.id, false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold text-[11px] uppercase transition"
                      >
                        Treci ca Titular ⇄
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: Configurare Club & Așezare Tactică */}
      {activeTab === "tactics" && (
        <form onSubmit={handleSaveTeam} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Team Settings Form */}
            <div className="lg:col-span-6 card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-lg font-bold font-headline uppercase text-white pb-3 border-b border-slate-800">
                Date  e Club
              </h3>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Nume Club
                </label>
                <input
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Prescurtare (3 litere)
                  </label>
                  <input
                    maxLength={5}
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white font-mono uppercase focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                    Culoare Reprezentativă
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-12 rounded-xl bg-slate-950 border border-slate-800 p-1 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Descriere echipei
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ex: Echipa noastră de fotbal din Timișoara, fondată în 2010..."
                  maxLength={300}
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-lime-400 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Arenă / Stadion Gazdă
                </label>
                <input
                  value={homeArena}
                  onChange={(e) => setHomeArena(e.target.value)}
                  placeholder="ex: Stadionul Dan Păltinișanu (Timișoara)"
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Formație Tactică de Joc
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormation(f)}
                      className={`p-2.5 rounded-xl border text-xs font-headline font-bold uppercase transition ${formation === f
                        ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Logo Echipa
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo echipa" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-500 text-3xl">image</span>
                    )}
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white cursor-pointer hover:border-lime-400 transition">
                    {logoUrl ? "Schimbă Logo" : "Încarcă Logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 font-label mt-1">
                  Format recomandat: PNG sau JPG, dimensiune maximă 5MB.
                </p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95"
              >
                {busy ? "Se salvează..." : "Salvează Modificările Clubului 💾"}
              </button>
            </div>

            {/* Right Col: Virtual Tactical Pitch */}
            <div className="lg:col-span-6 card p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold font-headline uppercase text-white">
                  Tactic Board • {formation}
                </h3>
                <span className="text-xs font-label text-lime-400 font-bold">
                  {starters.length}/11 Jucători pe Teren
                </span>
              </div>

              {/* Pitch Visualizer */}
              <div className="relative w-full h-[360px] rounded-2xl bg-emerald-900 border-2 border-emerald-500/40 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Center Circle & Lines */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/30"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-emerald-500/30"></div>

                {/* Top: Attackers */}
                <div className="flex justify-around items-center relative z-10">
                  {starters.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-lime-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-white">
                        #{p.number ?? idx + 9}
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
                        {p.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mid: Midfielders */}
                <div className="flex justify-around items-center relative z-10">
                  {starters.slice(3, 6).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-white">
                        #{p.number ?? idx + 6}
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
                        {p.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Defense */}
                <div className="flex justify-around items-center relative z-10">
                  {starters.slice(6, 10).map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-white">
                        #{p.number ?? idx + 2}
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
                        {p.name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Goalkeeper */}
                <div className="flex justify-center items-center relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-lg border border-white">
                      #1
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow mt-0.5">
                      Portar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 5. TAB 3: Invitații Email Jucători */}
      {activeTab === "invites" && (
        <div className="space-y-8">
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">forward_to_inbox</span>
                Trimite Invitație pe Email pentru Creare Cont Jucător
              </h3>
              <p className="text-xs text-slate-400 font-label mt-1">
                Jucătorul primește un link securizat prin care își creează contul propriu, își poate uploada poza de profil și își completează fișa atletică  !
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Adresă Email Jucător *
                </label>
                <input
                  required
                  type="email"
                  placeholder="ex: fotbalist@echipa.ro"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Nume &amp; Prenume Jucător
                </label>
                <input
                  placeholder="ex: Cristian Chivu"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-label text-slate-300 uppercase block mb-1.5">
                  Poziție Recomandată
                </label>
                <select
                  value={invitePosition}
                  onChange={(e) => setInvitePosition(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Portar">Portar (GK)</option>
                  <option value="Fundaș Central">Fundaș Central (CB)</option>
                  <option value="Mijlocaș">Mijlocaș (CM)</option>
                  <option value="Atacant">Atacant (ST)</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={busy || !inviteEmail.trim()}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg transition active:scale-95"
                >
                  {busy ? "Se trimite..." : "Generează & Trimite Invitația ✉️"}
                </button>
              </div>
            </form>

            {lastInviteLink && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-lime-400/50 space-y-2 animate-in fade-in">
                <span className="text-[10px] font-label font-bold text-lime-400 uppercase tracking-widest block">
                  Link Unic de Înregistrare Generat:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={lastInviteLink}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900 text-xs text-lime-300 font-mono select-all border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(lastInviteLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    {copiedLink ? "Copiat! ✓" : "Copiază"}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🏆 Ai fost invitat să faci parte din lotul ${team.name}! Înregistrează-ți contul de jucător aici: ${lastInviteLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Staff Tehnic & Antrenori */}
      {activeTab === "staff" && (
        <form onSubmit={handleSaveTeam} className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">badge</span>
              Staff Tehnic, Antrenori &amp; Personal Medical
            </h3>
            <p className="text-xs text-slate-400 font-label mt-1">
              Înregistrează antrenorii licențiați, preparatorii fizici și medicul   al clubului
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold font-label text-lime-400 uppercase block">
                Antrenor Principal (Head Coach)
              </label>
              <input
                value={headCoach}
                onChange={(e) => setHeadCoach(e.target.value)}
                placeholder="ex: Dan Alexa (Licență UEFA Pro)"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold font-label text-cyan-400 uppercase block">
                Antrenor Secund (Assistant Coach)
              </label>
              <input
                value={assistantCoach}
                onChange={(e) => setAssistantCoach(e.target.value)}
                placeholder="ex: Sorin Rădoi (Secund)"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold font-label text-rose-400 uppercase block">
                Medic Echipă / Kinetoterapeut
              </label>
              <input
                value={medic}
                onChange={(e) => setMedic(e.target.value)}
                placeholder="ex: Dr. Mihai Popescu"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold font-label text-amber-400 uppercase block">
                Preparator Fizic (Fitness Coach)
              </label>
              <input
                value={fitnessCoach}
                onChange={(e) => setFitnessCoach(e.target.value)}
                placeholder="ex: Alexandru Radu"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-lg transition"
            >
              {busy ? "Se salvează..." : "Salvează Staff-ul Tehnic 💾"}
            </button>
          </div>
        </form>
      )}

      {/* 7. TAB 5: Calendar & Traseu Meciuri Următoare */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400">route</span>
              Calendar Meciuri &amp; Traseu Deplasare
            </h3>
            <p className="text-xs text-slate-400 font-label">
              Programul complet al evenimentelor viitoare cu arene, indicații GPS și traseu de călătorie
            </p>
          </div>

          {allMatches.length === 0 ? (
            <div className="card p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-500 block">
                event_busy
              </span>
              <p className="font-bold text-white text-sm">
                Nu există meciuri programate în acest moment pentru {team.name}.
              </p>
              <p className="text-xs text-slate-400">
                Organizatorul va stabili calendarul etapelor sau tragerile la sorți cu zaruri.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {allMatches.map((m) => {
                const isHome = m.homeTeam.id === team.id;
                const opponent = isHome ? m.awayTeam : m.homeTeam;
                const dateObj = new Date(m.scheduledAt);
                const venueName = m.venue || team.homeArena || "Stadionul Dan Păltinișanu";

                return (
                  <div
                    key={m.id}
                    className="card p-6 bg-slate-900 border border-slate-800 hover:border-lime-400/50 rounded-3xl shadow-lg space-y-4 transition"
                  >
                    <div className="flex justify-between items-center text-[10px] font-label text-slate-400 uppercase">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 font-bold border border-lime-400/30">
                        {isHome ? "🏠 Meci pe Teren Propriu" : "🚌 Deplasare  ă"}
                      </span>
                      <span>
                        {dateObj.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })} • {dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-y border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                          style={{ backgroundColor: team.color || "#84cc16" }}
                        >
                          {team.shortName || team.name.substring(0, 3)}
                        </div>
                        <span className="font-headline font-bold text-sm text-white">
                          {team.name}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-500 px-2">VS</span>

                      <div className="flex items-center gap-3">
                        <span className="font-headline font-bold text-sm text-white text-right">
                          {opponent.name}
                        </span>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                          style={{ backgroundColor: opponent.color || "#38bdf8" }}
                        >
                          {opponent.shortName || opponent.name.substring(0, 3)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-label">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>🏟️ Arenă / Stadion:</span>
                        <strong className="text-white">{venueName}</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>🏆 Competiție:</span>
                        <span>{m.championship?.name || "Liga Pro România"}</span>
                      </div>
                    </div>

                    {/* Traseu & GPS Directions Button */}
                    <div className="pt-2 flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName + " Romania")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-label font-bold uppercase transition flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <span className="material-symbols-outlined text-sm">navigation</span>
                        Traseu GPS Google Maps ↗
                      </a>
                      <Link
                        href={`/matches/${m.id}/promo`}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-label font-bold uppercase transition border border-slate-700 flex items-center justify-center"
                        title="Poster Social Media"
                      >
                        <span className="material-symbols-outlined text-sm">campaign</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 6: Meciuri & Invitații */}
      {activeTab === "matches" && (
        <div className="space-y-8">
          {/* Pending Invitation Section */}
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="material-symbols-outlined text-lime-400 text-2xl">mail</span>
              <div>
                <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
                  Invitații la Campionate
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-label mt-0.5">
                  Acceptă sau refuză invitațiile primite de la organizerii de campionate. După acceptare, echipa ta este înscrisă în campionatul respectiv.
                </p>
              </div>
            </div>

            {invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl border border-slate-700 bg-slate-800/60 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md"
                          style={{ backgroundColor: inv.team?.color || "#84cc16" }}
                        >
                          {inv.team?.shortName || inv.team?.name?.substring(0, 3)?.toUpperCase() || "TV"}
                        </span>
                        <p className="font-headline font-bold text-sm text-white truncate">
                          {inv.championship?.name || "Campionat"}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400 font-label mt-1">
                        {inv.championship?.sport || "Sport"} • Sezon {inv.championship?.season || "2026"} • {inv.championship?.county || "Național"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-label">
                        Echipa: {inv.team?.name || "N/A"} • Invitat de {inv.inviter?.name || inv.inviter?.email || "Organizator"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInvitationAction(inv.id, "accept")}
                        disabled={invitationActionLoading === inv.id}
                        className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase transition disabled:opacity-50"
                      >
                        Acceptă
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInvitationAction(inv.id, "reject")}
                        disabled={invitationActionLoading === inv.id}
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-headline font-bold text-xs uppercase transition disabled:opacity-50"
                      >
                        Refuză
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl italic">
                Nu ai invitații în așteptare la niciun campionat.
              </div>
            )}
          </div>

          {/* Confirmed Matches Section */}
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="material-symbols-outlined text-lime-400 text-2xl">sports_soccer</span>
              <div>
                <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
                  Meciurile Echipei {team.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-label mt-0.5">
                  Meciurile programate pentru echipa ta. După ce accepți unui campionat, toate meciurile programate vor apărea aici.
                </p>
              </div>
            </div>

            {allMatches.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl italic">
                Nu există meciuri programate în acest moment pentru {team.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allMatches.map((m) => {
                  const isHome = m.homeTeam.id === team.id;
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const dateObj = new Date(m.scheduledAt);

                  return (
                    <div
                      key={m.id}
                      className="card p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-md space-y-3"
                    >
                      <div className="flex justify-between items-center text-[10px] font-label text-slate-400 uppercase">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 font-bold border border-lime-400/30">
                          {isHome ? "🏠 Acasă" : "🚌 Deplasare"}
                        </span>
                        <span>
                          {dateObj.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })} • {dateObj.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-t border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow"
                            style={{ backgroundColor: team.color || "#84cc16" }}
                          >
                            {team.shortName || team.name.substring(0, 3)}
                          </span>
                          <span className="font-headline font-bold text-xs text-white">
                            {team.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500">VS</span>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-xs text-white text-right">
                            {opponent.name}
                          </span>
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow"
                            style={{ backgroundColor: opponent.color || "#38bdf8" }}
                          >
                            {opponent.shortName || opponent.name.substring(0, 3)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        <span>🏟️ {m.venue || team.homeArena || "Stadionul Dan Păltinișanu"}</span> • <span>🏆 {m.championship?.name || "Campionat"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 7: Metode de Plată & Facturi */}
      {activeTab === "payments" && (
        <div className="space-y-8">
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActivePaymentTab("cards")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-2 border ${activePaymentTab === "cards"
                  ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">credit_card</span>
                <span>Metode de Plată</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentTab("invoices")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-headline font-bold uppercase tracking-wider transition flex items-center gap-2 border ${activePaymentTab === "invoices"
                  ? "bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>Facturi</span>
              </button>
            </div>

            {/* Payment Methods Tab */}
            {activePaymentTab === "cards" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-headline uppercase text-white">Cardurile de Plată Salonate</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCard(true)}
                    className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase flex items-center gap-1.5 shadow-md transition"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Adaugă Card
                  </button>
                </div>

                {showAddCard && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-in fade-in">
                    <h4 className="text-sm font-bold font-headline uppercase text-emerald-400">Adaugă Card Nou (Stripe)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1.5">
                          Număr Card
                        </label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          maxLength={19}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1.5">
                          Data Expirării
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={newCardExpiry}
                          onChange={(e) => setNewCardExpiry(e.target.value)}
                          maxLength={5}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1.5">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={newCardCvc}
                          onChange={(e) => setNewCardCvc(e.target.value)}
                          maxLength={4}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400 font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-label font-bold text-slate-400 uppercase block mb-1.5">
                          Numele pe Card
                        </label>
                        <input
                          type="text"
                          placeholder="ex: Maria Ionescu"
                          value={newCardHolder}
                          onChange={(e) => setNewCardHolder(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCard(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                      >
                        Anulează
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCard}
                        className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase shadow-md"
                      >
                        Salvează Cardul
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethods.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl italic">
                    Nu ai nicio metodă de plată salvată. Adaugă un card pentru a crea echipe plătite.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className="p-4 rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-slate-500">
                            {pm.cardBrand === "Visa" ? "credit_card" : pm.cardBrand === "Mastercard" ? "credit_card" : "payment"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-bold text-sm text-white">{pm.cardBrand || "Card"}</span>
                              <span className="text-xs text-slate-500">•••• •••• •••• {pm.cardLast4 || "____"}</span>
                              {pm.cardExpMonth && pm.cardExpYear && (
                                <span className="text-xs text-slate-500">
                                  {String(pm.cardExpMonth).padStart(2, "0")}/{String(pm.cardExpYear).slice(-2)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {pm.isDefault ? "Implicit" : "Secundar"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!pm.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultPayment(pm.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-lime-400 text-xs font-bold transition"
                            >
                              Setează ca Implicit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 text-xs transition"
                            title="Șterge"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activePaymentTab === "invoices" && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-headline uppercase text-white">Factura Ta</h3>

                {invoices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl italic">
                    Nu ai emis încă nicio factură. Facturile tale apar aici după crearea unei echipe plătite.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-2xl border border-slate-700 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lime-400">receipt</span>
                            <span className="font-headline font-bold text-sm text-white">
                              {inv.invoiceNumber || inv.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs font-label text-slate-400">
                            <span>📅 Emisă: {new Date(inv.issueDate).toLocaleDateString("ro-RO")}</span>
                            <span>📅 Scadentă: {new Date(inv.dueDate).toLocaleDateString("ro-RO")}</span>
                            <span className={`font-bold ${inv.status === "paid" ? "text-emerald-400" : inv.status === "pending" ? "text-amber-400" : "text-red-400"
                              }`}>
                              {inv.status === "paid" ? "Plătită" : inv.status === "pending" ? "În Așteptare" : inv.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-headline font-black text-lg text-white">
                            {inv.totalAmount} {inv.currency || "EUR"}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {inv.lineItems ? "Detaliu disponibil" : "Fără detalii"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Info Panel */}
          <div className="card p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-headline uppercase text-white">
              Informații de Facturare ale Contului
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-label">
              <div>
                <span className="text-slate-500">Nume Cont Manager:</span>
                <span className="text-white font-bold ml-2">{currentUser?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>
                <span className="text-white font-bold ml-2">{currentUser?.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500">Companie:</span>
                <span className="text-white font-bold ml-2">buu.ro S.R.L.</span>
              </div>
              <div>
                <span className="text-slate-500">Preț Abonament Echipă:</span>
                <span className="text-lime-400 font-bold ml-2">{teamSubscriptionPrice} EUR / an</span>
              </div>
              <div>
                <span className="text-slate-500">Echipe Gratuite:</span>
                <span className="text-white font-bold ml-2">{freeTeamLimit}</span>
              </div>
              <div>
                <span className="text-slate-500">Echipe Create:</span>
                <span className="text-white font-bold ml-2">{teamCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
