"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DigitalTeamSheetModal } from "./DigitalTeamSheetModal";
import { CheckInModal } from "./CheckInModal";
import { TeamNewsFeed } from "./TeamNewsFeed";
import { generateClubNewsFeed } from "@/lib/teamNewsGenerator";
import { ManagerGamificationWidget } from "./ManagerGamificationWidget";
// next/navigation not needed: tab switching is client-side with window.history.replaceState

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
  image?: string | null;
  invitationToken?: string | null;
  yellowCards: number;
  redCards: number;
  suspensions: number;
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
  coverPhotoUrl?: string | null;
  description?: string | null;
  headCoach: string | null;
  assistantCoach: string | null;
  medic: string | null;
  fitnessCoach: string | null;
  formation: string | null;
  homeArena: string | null;
  sport?: string | null;
  lastCheckInAt?: string | Date | null;
  checkInVenue?: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInVerified?: boolean;
  attendanceReport?: string | null;
  championship?: { id: string; name: string; season?: string | null; championshipId?: string };
  players: Player[];
  homeMatches: Match[];
  awayMatches: Match[];
  news?: any[];
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
  currentUser?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    managerXp?: number;
    managerBadge?: string | null;
  } | null;
  defaultTab?: "roster" | "tactics" | "invites" | "staff" | "calendar" | "matches" | "news" | "payments";
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
  const [activeTab, setActiveTabState] = useState<"roster" | "tactics" | "invites" | "staff" | "calendar" | "matches" | "news" | "payments">(defaultTab);

  // Sync activeTab when sidebar navigation causes a full page re-render (defaultTab changes)
  useEffect(() => {
    setActiveTabState(defaultTab);
  }, [defaultTab]);

  function setActiveTab(tab: string) {
    setActiveTabState(tab as any);
    // Update URL for sidebar highlight without triggering a full page navigation
    window.history.replaceState(null, "", `/dashboard/team?tab=${tab}`);
  }

  // Edit Team State
  const [teamName, setTeamName] = useState(team.name);
  const [shortName, setShortName] = useState(team.shortName || "");
  const [color, setColor] = useState(team.color || "#84cc16");
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(team.coverPhotoUrl || "");
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

  // Search Platform Players Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingPlayerId, setAddingPlayerId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteNumber, setInviteNumber] = useState<number | "">("");
  const [invitePosition, setInvitePosition] = useState("Atacant");
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Inline hero editing state
  const [editingHero, setEditingHero] = useState(false);
  const [showTeamSheetModal, setShowTeamSheetModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

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
        notify(" Metoda de plată a fost ștearsă.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare de rețea.");
    }
  }

  async function handleSetDefaultPayment(id: string) {
    try {
      const res = await fetch(`/api/team/payments/methods/${id}/default`, { method: "POST" });
      if (res.ok) {
        setPaymentMethods((prev) =>
          prev.map((m) => ({ ...m, isDefault: m.id === id }))
        );
        notify(" Metoda de plată implicită a fost actualizată.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare de rețea.");
    }
  }

  async function handleAddCard() {
    if (!newCardNumber.trim() || !newCardHolder.trim()) {
      notify("Completează numărul cardului și numele titularului.");
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
        notify(" Cardul a fost adăugat ca metodă de plată.");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare de rețea.");
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
          notify(" Logo-ul echipei a fost actualizat!");
        } else {
          notify("Eroare la actualizarea logo-ului.");
        }
      } catch {
        notify("Eroare de rețea la încărcarea logo-ului.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleCoverPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Selectează o imagine validă.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify("Imaginea este prea mare. Folosește un fișier sub 8MB.");
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
          body: JSON.stringify({ teamId: team.id, coverPhotoUrl: result }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setTeam((prev) => ({ ...prev, coverPhotoUrl: data.team?.coverPhotoUrl || result }));
          setCoverPhotoUrl(result);
          notify(" Poza de grup / banner-ul echipei a fost actualizată!");
        } else {
          notify("Eroare la actualizarea imaginii de grup.");
        }
      } catch {
        notify("Eroare de rețea la încărcarea imaginii.");
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
            setPaymentError(" Nu ai o metodă de plată activă. Adaugă un card înainte de a crea o echipă plătită.");
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
          logoUrl,
          coverPhotoUrl,
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
        notify(" Configurația clubului și staff-ul au fost salvate cu succes!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare la salvare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare la salvare.");
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
        notify(` Jucătorul a fost trecut ca ${!currentStarter ? "TITULAR" : "REZERVĂ"}.`);
      }
    } catch {
      notify("Eroare la actualizare statut.");
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
        notify(" Jucător adăugat în lot!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare la adăugare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare la adăugare.");
    } finally {
      setBusy(false);
    }
  }

  // Search Platform Players
  async function handleSearchPlatformPlayers(query: string) {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}&teamId=${team.id}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      } else {
        notify("Eroare la căutarea jucătorilor.");
      }
    } catch {
      notify("Eroare de rețea la căutare.");
    } finally {
      setIsSearching(false);
    }
  }

  // Add Found Platform Player to Team
  async function handleAddPlatformPlayer(p: any, asStarter: boolean = true) {
    setAddingPlayerId(p.id);
    try {
      const res = await fetch("/api/team/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          name: p.name,
          email: p.email || null,
          number: p.number || null,
          position: p.position || "Mijlocaș",
          isStarter: asStarter,
          image: p.image || null,
          goals: p.stats?.goals || 0,
          assists: p.stats?.assists || 0,
          yellowCards: p.stats?.yellowCards || 0,
          redCards: p.stats?.redCards || 0,
          suspensions: 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.player) {
        setTeam((prev) => ({
          ...prev,
          players: [...prev.players, data.player],
        }));
        notify(`Jucătorul "${p.name}" a fost adăugat în lot ca ${asStarter ? "TITULAR" : "REZERVĂ"}!`);
        setSearchResults((prev) => prev.filter((item) => item.id !== p.id));
      } else {
        notify(`Eroare: ${data.error || "Nu s-a putut adăuga jucătorul"}`);
      }
    } catch {
      notify("Eroare de rețea.");
    } finally {
      setAddingPlayerId(null);
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
        notify(" Jucător eliminat din lot.");
      }
    } catch {
      notify("Eroare la ștergere.");
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
          championshipId: team.championship?.id,
          sport: team.sport,
          email: inviteEmail,
          name: inviteName,
          number: inviteNumber === "" ? null : Number(inviteNumber),
          position: invitePosition,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastInviteLink(data.acceptLink);
        setTeam((prev) => ({
          ...prev,
          players: [...prev.players, data.player],
        }));
        setInviteEmail("");
        setInviteName("");
        setInviteNumber("");
        notify(" Invitația pe email a fost generată și trimisă!");
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(`Eroare: ${errData.error || res.statusText}`);
      }
    } catch {
      notify("Eroare la trimiterea invitației.");
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
            {/* Color swatch / logo - clickable in edit mode */}
            {editingHero ? (
              <label className="w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-2xl text-white shadow-xl border-2 border-lime-400 cursor-pointer relative overflow-hidden" style={{ backgroundColor: color }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <>{shortName || team.name.substring(0, 3).toUpperCase()}</>
                )}
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" title="Schimba culoarea" />
              </label>
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-headline font-black text-2xl text-white shadow-xl border-2 border-white/20 overflow-hidden"
                style={{ backgroundColor: team.color || "#84cc16" }}
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <>{team.shortName || team.name.substring(0, 3).toUpperCase()}</>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label">
                  <span className="material-symbols-outlined text-xs align-middle">work</span> PANOU MANAGER ECHIPĂ
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-lime-400 text-xs font-label font-bold">
                  {team.players.length} Jucatori in Lot
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-label">
                  {team.championship?.name || "Liga Pro Romania"}
                </span>
              </div>

              {editingHero ? (
                <div className="mt-2 space-y-3">
                  {/* Inline: Nume Club */}
                  <div>
                    <label className="text-[10px] font-bold font-label text-slate-400 uppercase block mb-1">Nume Club</label>
                    <input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-lg font-black font-headline uppercase text-white focus:outline-none focus:border-lime-400 transition"
                      placeholder="Numele echipei tale"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Prescurtare */}
                    <div>
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block mb-1">Prescurtare</label>
                      <input
                        maxLength={5}
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-lime-400"
                      />
                    </div>

                    {/* Arena */}
                    <div className="col-span-2 sm:col-span-2">
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block mb-1">Arena Gazda</label>
                      <input
                        value={homeArena}
                        onChange={(e) => setHomeArena(e.target.value)}
                        placeholder="ex: Arena Sporturilor"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Formatie */}
                    <div>
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block mb-1">Formatie</label>
                      <select
                        value={formation}
                        onChange={(e) => setFormation(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                      >
                        <option value="4-3-3">4-3-3</option>
                        <option value="4-4-2">4-4-2</option>
                        <option value="3-5-2">3-5-2</option>
                        <option value="4-2-3-1">4-2-3-1</option>
                      </select>
                    </div>

                    {/* Descriere */}
                    <div>
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block mb-1">Descriere</label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descriere scurta..."
                        maxLength={300}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  {/* Media Uploads: Logo & Group Photo Cover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block">Siglă / Fanion Club</label>
                      <label className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white cursor-pointer hover:border-lime-400 transition flex items-center gap-1.5 w-fit">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        {logoUrl ? "Schimbă Sigla" : "Încarcă Siglă"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      {logoUrl && (
                        <div className="flex items-center gap-2">
                          <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-700 p-0.5" />
                          <span className="text-[10px] text-lime-400 font-label">Siglă activă</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-[10px] font-bold font-label text-slate-400 uppercase block">Poză de Grup cu Echipa / Banner</label>
                      <label className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white cursor-pointer hover:border-lime-400 transition flex items-center gap-1.5 w-fit">
                        <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                        {coverPhotoUrl ? "Schimbă Poza de Grup" : "Încarcă Poză de Grup"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoUpload} />
                      </label>
                      {coverPhotoUrl && (
                        <div className="flex items-center gap-2">
                          <img src={coverPhotoUrl} alt="Group Cover" className="w-14 h-8 rounded-lg object-cover bg-slate-900 border border-slate-700" />
                          <span className="text-[10px] text-lime-400 font-label">Poză de grup activă</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save & Cancel */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async (e) => {
                        await handleSaveTeam(e as any);
                        setEditingHero(false);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      {busy ? "Se salveaza..." : "Salveaza"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamName(team.name);
                        setShortName(team.shortName || "");
                        setColor(team.color || "#84cc16");
                        setDescription(team.description || "");
                        setFormation(team.formation || "4-3-3");
                        setHomeArena(team.homeArena || "");
                        setLogoUrl(team.logoUrl || "");
                        setCoverPhotoUrl(team.coverPhotoUrl || "");
                        setEditingHero(false);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase transition border border-slate-700"
                    >
                      Anuleaza
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-4xl font-black font-headline uppercase tracking-tight text-white mt-1">
                      {team.name}
                    </h1>
                    {team.checkInVerified && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white font-black text-[10px] uppercase font-mono shadow-md border border-sky-400 mt-1"
                        title={`Check-in GPS validat la ${team.checkInVenue || "teren"}`}
                      >
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>Verificat pe Teren</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-label">
                    Arena Gazda: <strong className="text-slate-200">{team.homeArena || "Alege un stadion"}</strong> • Formatie: <strong className="text-lime-400">{team.formation || "4-3-3"}</strong>
                    {team.checkInVerified && team.lastCheckInAt && (
                      <span className="text-sky-400 ml-2 font-bold">• Check-in: {new Date(team.lastCheckInAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* GPS Stadium Check-in */}
            <button
              type="button"
              onClick={() => setShowCheckInModal(true)}
              className={`px-4 py-2.5 rounded-2xl font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95 ${
                team.checkInVerified
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "bg-slate-800 text-sky-400 hover:bg-slate-700 border border-sky-400/40"
              }`}
              title="Realizează check-in prin GPS pe terenul de joc și generează raportul de prezență al copiilor"
            >
              <span className="material-symbols-outlined text-base">
                {team.checkInVerified ? "verified" : "where_to_vote"}
              </span>
              <span>{team.checkInVerified ? "Check-in Confirmat" : "Check-in la Stadion"}</span>
            </button>

            {/* Digital Team Sheet & Validation */}
            <button
              type="button"
              onClick={() => setShowTeamSheetModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
              title="Validează lotul pentru meci și generează foaia de meci digitală sau PDF"
            >
              <span className="material-symbols-outlined text-base">description</span>
              Foaie de Meci Digitală
            </button>

            {/* View Public Team Page */}
            <Link
              href={`/teams/${team.id}`}
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
              title="Deschide pagina publică a echipei pentru vizitatori"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              Pagina Publică ↗
            </Link>

            {/* Share Public Team Page Link */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const url = `${window.location.origin}/teams/${team.id}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                    notify(" Link-ul public al paginii echipei a fost copiat în clipboard!");
                  }
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase transition border border-slate-700 flex items-center gap-1.5 active:scale-95"
              title="Copiază link-ul direct pentru a-l trimite suporterilor sau pe social media"
            >
              <span className="material-symbols-outlined text-base">share</span>
              Distribuie
            </button>

            {!editingHero && (
              <button
                type="button"
                onClick={() => setEditingHero(true)}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Editează Date Club
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("invites")}
              className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">forward_to_inbox</span>
              Invita Jucator pe Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tactics")}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-label font-bold text-xs uppercase transition border border-slate-700 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">sports</span>
              Asezare Tactica
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-2xl bg-lime-950/80 border border-lime-400 text-lime-300 text-xs font-bold font-label animate-in fade-in">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Manager Gamification & XP System */}
      <ManagerGamificationWidget
        managerXp={currentUser?.managerXp || 0}
        managerBadge={currentUser?.managerBadge}
        teamId={team.id}
        teamName={team.name}
        playersCount={team.players.length}
        checkInVerified={team.checkInVerified}
        matches={[...(team.homeMatches || []), ...(team.awayMatches || [])]}
      />

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
            title="Adaugă o altă echipă atașată clubului"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span>Adaugă</span>
              <span className="text-[10px] font-mono font-bold text-slate-800 normal-case">
                (o altă echipă atașată clubului)
              </span>
            </div>
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

      {/* Navigation is handled by the Sidebar — no duplicate tab bar */}

      {/* 3. TAB 1: Lot Jucători (Titulari vs Rezerve) */}
      {activeTab === "roster" && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold font-headline uppercase text-slate-900 dark:text-white">
                Gestiune Titulari &amp; Rezerve
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-label">
                Treci jucătorii între primul 11 și banca de rezerve cu un singur click
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-label font-bold uppercase transition border border-slate-700 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base text-amber-400">print</span>
                Printează Foaie A4
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(true);
                  if (searchResults.length === 0) {
                    handleSearchPlatformPlayers("");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-sky-100 dark:bg-sky-950 hover:bg-sky-200 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 text-xs font-label font-bold uppercase transition border border-sky-300 dark:border-sky-700/50 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base text-sky-600 dark:text-sky-400">person_search</span>
                Caută în Platformă
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlayer((s) => !s)}
                className="px-4 py-2 rounded-xl bg-lime-100 dark:bg-slate-800 hover:bg-lime-200 dark:hover:bg-slate-700 text-lime-700 dark:text-lime-400 text-xs font-label font-bold uppercase transition border border-lime-300 dark:border-lime-400/30 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Adaugă Manual
              </button>
            </div>
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
              <span className="w-2.5 h-2.5 rounded-full bg-lime-600 dark:bg-lime-400 animate-pulse"></span>
              <h4 className="text-base font-bold font-headline uppercase text-lime-700 dark:text-lime-400 tracking-wide">
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

                  <div className="flex justify-around items-center pt-2 pb-1 border-t border-slate-800 text-xs">
                    <div className="flex flex-col items-center" title="Cartonașe Galbene">
                      <span className="text-[10px] text-yellow-500 font-bold uppercase">CG</span>
                      <span className="font-bold text-white">{p.yellowCards || 0}</span>
                    </div>
                    <div className="flex flex-col items-center" title="Cartonașe Roșii">
                      <span className="text-[10px] text-red-500 font-bold uppercase">CR</span>
                      <span className="font-bold text-white">{p.redCards || 0}</span>
                    </div>
                    <div className="flex flex-col items-center" title="Suspendări (Etape)">
                      <span className="text-[10px] text-orange-500 font-bold uppercase">Susp</span>
                      <span className="font-bold text-white">{p.suspensions || 0}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-label">
                    <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 font-bold text-[10px] uppercase">
                      Titular
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
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
              <h4 className="text-base font-bold font-headline uppercase text-amber-600 dark:text-amber-300 tracking-wide">
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

                    <div className="flex justify-around items-center pt-2 pb-1 border-t border-slate-800 text-xs">
                      <div className="flex flex-col items-center" title="Cartonașe Galbene">
                        <span className="text-[10px] text-yellow-500 font-bold uppercase">CG</span>
                        <span className="font-bold text-white">{p.yellowCards || 0}</span>
                      </div>
                      <div className="flex flex-col items-center" title="Cartonașe Roșii">
                        <span className="text-[10px] text-red-500 font-bold uppercase">CR</span>
                        <span className="font-bold text-white">{p.redCards || 0}</span>
                      </div>
                      <div className="flex flex-col items-center" title="Suspendări (Etape)">
                        <span className="text-[10px] text-orange-500 font-bold uppercase">Susp</span>
                        <span className="font-bold text-white">{p.suspensions || 0}</span>
                      </div>
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

      {/* 4. TAB 2: Tactic Board */}
      {activeTab === "tactics" && (
        <div className="space-y-8">
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
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
      )}

      {/* 5. TAB 3: Invitații Campionate & Jucători */}
      {activeTab === "invites" && (
        <div className="space-y-8">
          {/* Card 1: Official Championship Invitations from Organizers */}
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lime-400 text-2xl">mark_email_unread</span>
                <div>
                  <h3 className="font-headline font-black text-lg sm:text-xl uppercase text-white tracking-tight">
                    Invitații Oficiale Primite de la Organizatori
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-label mt-0.5">
                    Organizatorii te invită să participi la campionate. Acceptă punctual pentru a înscrie echipa în competiție.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 text-xs font-bold font-mono border border-lime-400/30">
                {invitations.length} în așteptare
              </span>
            </div>

            {invitations.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <span className="material-symbols-outlined text-slate-600 text-4xl block">mail_outline</span>
                <p className="text-sm font-bold text-slate-300 font-headline uppercase">Nu ai invitații noi în acest moment</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-body">
                  Când un organizator de campionat trimite o invitație oficială către echipa ta ({team.name}), aceasta va apărea aici pentru a o accepta cu un singur click.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl border border-slate-700 bg-slate-950/80 text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-lime-400/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-lime-400/20 text-lime-400 text-[10px] font-black uppercase font-mono">
                          {inv.championship?.sport || "Sport"}
                        </span>
                        <h4 className="font-headline font-black text-base text-white truncate">
                          {inv.championship?.name || "Campionat Oficial"}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 font-label">
                        Sezon: <strong className="text-white">{inv.championship?.season || "2026"}</strong> • Regiune: <strong className="text-white">{inv.championship?.county || "Național"}{inv.championship?.city ? ` (${inv.championship.city})` : ""}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Invitat de {inv.inviter?.name || inv.inviter?.email || "Organizator"} • Pentru echipa: <strong className="text-slate-300">{inv.team?.name || team.name}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInvitationAction(inv.id, "accept")}
                        disabled={invitationActionLoading === inv.id}
                        className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>{invitationActionLoading === inv.id ? "Se procesează..." : "Acceptă Invitația"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInvitationAction(inv.id, "reject")}
                        disabled={invitationActionLoading === inv.id}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-headline font-bold text-xs uppercase transition border border-slate-700 disabled:opacity-50"
                      >
                        Refuză
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Send Player Invites */}
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400">person_add</span>
                Invită Jucători Noi în Lotul Tău (Email &amp; WhatsApp)
              </h3>
              <p className="text-xs text-slate-400 font-label mt-1">
                Jucătorul primește un link securizat prin care își creează contul propriu, își poate uploada poza de profil și își completează fișa atletică!
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
                  {busy ? "Se trimite..." : "Generează & Trimite Invitația ️"}
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
                    {copiedLink ? "Copiat! " : "Copiază"}
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`  Ai fost invitat să faci parte din lotul ${team.name}! Înregistrează-ți contul de jucător aici: ${lastInviteLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1"
                  >
                    <span><span className="material-symbols-outlined align-middle text-sm">chat_bubble</span></span> WhatsApp
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
              {busy ? "Se salvează..." : "Salvează Staff-ul Tehnic "}
            </button>
          </div>
        </form>
      )}

      {/* 7. TAB 5: Calendar & Traseu Meciuri Următoare */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="text-xl font-bold font-headline uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-700 dark:text-lime-400">route</span>
              Calendar Meciuri &amp; Traseu Deplasare
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-label">
              Programul complet al evenimentelor viitoare cu arene, indicații GPS și traseu de călătorie
            </p>
          </div>

          {allMatches.length === 0 ? (
            <div className="card p-12 text-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500 block">
                event_busy
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Nu există meciuri programate în acest moment pentru {team.name}.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
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
                        {isHome ? " Meci pe Teren Propriu" : " Deplasare Oficială"}
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
                        <span>  Arenă / Stadion:</span>
                        <strong className="text-white">{venueName}</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>  Competiție:</span>
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
                          {isHome ? " Acasă" : " Deplasare"}
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
                        <span>  {m.venue || team.homeArena || "Stadionul Dan Păltinișanu"}</span> • <span>  {m.championship?.name || "Campionat"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 6: Știri & Comunicate Oficiale */}
      {activeTab === "news" && (
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold font-headline uppercase text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lime-400">campaign</span>
                  Gestiune Știri &amp; Comunicate Oficiale
                </h3>
                <p className="text-xs text-slate-400 font-label mt-1">
                  Feed generat automat cu știri, transferuri și comunicate oficiale pentru părinți și copii
                </p>
              </div>
            </div>

            <TeamNewsFeed
              news={generateClubNewsFeed(team)}
              teamId={team.id}
              teamName={team.name}
              isManager={true}
            />
          </div>
        </div>
      )}

      {/* 9. TAB 7: Metode de Plată & Facturi */}
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
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span> Emisă: {new Date(inv.issueDate).toLocaleDateString("ro-RO")}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_month</span> Scadentă: {new Date(inv.dueDate).toLocaleDateString("ro-RO")}</span>
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
                <span className="text-white font-bold ml-2"> ligue.ro S.R.L.</span>
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

      {/* Search Platform Players Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4 p-6 sm:p-7 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">person_search</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base sm:text-lg uppercase text-slate-900 dark:text-white">
                    Caută &amp; Adaugă Jucători din Platformă
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Găsește jucători înregistrați sau din alte echipe după nume, email sau club
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Caută după nume jucător, email sau nume de echipă..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchPlatformPlayers(e.target.value);
                }}
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleSearchPlatformPlayers("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {isSearching ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-2xl text-sky-500">progress_activity</span>
                  <span>Se caută jucătorii în baza de date...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <span className="material-symbols-outlined text-3xl text-slate-400 block">search_off</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {hasSearched && searchQuery ? `Niciun jucător găsit pentru "${searchQuery}".` : "Nu există jucători de afișat."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Încearcă să cauți după numele întreg, o parte din nume, clubul actual sau adresa de email.
                  </p>
                </div>
              ) : (
                searchResults.map((p) => {
                  const isAlreadyInTeam = team.players.some(
                    (tp) => tp.name.toLowerCase() === p.name.toLowerCase() || (p.email && tp.email?.toLowerCase() === p.email.toLowerCase())
                  );

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-400/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 font-black text-xs flex items-center justify-center font-mono shrink-0 border border-slate-700">
                          {p.number ? `#${p.number}` : p.position?.substring(0, 2).toUpperCase() || "JU"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {p.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] uppercase border border-sky-200 dark:border-sky-800/60">
                              {p.position || "Mijlocaș"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {p.teamName ? (
                              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                                <span className="material-symbols-outlined text-[13px] text-lime-500">shield</span>
                                {p.teamName} {p.championshipName ? `(${p.championshipName})` : ""}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Jucător liber de contract / Profil utilizator</span>
                            )}
                            {p.email && <span className="text-slate-400">• {p.email}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {isAlreadyInTeam ? (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-emerald-500">check</span>
                            În Lotul Tău
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={addingPlayerId === p.id}
                              onClick={() => handleAddPlatformPlayer(p, true)}
                              className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs uppercase shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                              title="Adaugă direct în Primul 11 (Titular)"
                            >
                              {addingPlayerId === p.id ? "Se adaugă..." : "+ Titular"}
                            </button>
                            <button
                              type="button"
                              disabled={addingPlayerId === p.id}
                              onClick={() => handleAddPlatformPlayer(p, false)}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase transition disabled:opacity-50"
                              title="Adaugă pe Banca de Rezerve"
                            >
                              + Rezervă
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>Găsite: {searchResults.length} profiluri</span>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Add Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4 p-6 sm:p-7 max-h-[90vh] flex flex-col text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">group_add</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base sm:text-lg uppercase">
                    Adaugă Echipă Nouă
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O altă echipă atașată clubului tău
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTeamModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTeamName.trim()) return;
                setBusy(true);
                try {
                  const res = await fetch("/api/team/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newTeamName.trim(),
                      shortName: newTeamShortName.trim() || undefined,
                      color: newTeamColor,
                      description: newTeamDescription.trim() || undefined,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    notify("Echipa a fost creată cu succes!");
                    setShowCreateTeamModal(false);
                    window.location.reload();
                  } else {
                    notify(data.error || "Eroare la crearea echipei");
                  }
                } catch {
                  notify("Eroare de rețea");
                } finally {
                  setBusy(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
                  Nume Echipă Nouă *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: FC Juniori U17, Echipa B, etc."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
                    Abreviere (3 litere)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="ex: JUN, FCB"
                    value={newTeamShortName}
                    onChange={(e) => setNewTeamShortName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
                    Culoare Principală
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTeamColor}
                      onChange={(e) => setNewTeamColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="font-mono text-xs text-slate-400">{newTeamColor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400">
                  Descriere Scurtă (Opțional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descrierea echipei sau a grupei de vârstă..."
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <p>
                  Această echipă va fi administrată din același cont de manager de club.
                  {teamCount >= freeTeamLimit && (
                    <span className="block mt-1 text-amber-500 font-bold">
                      Abonament: {teamSubscriptionPrice} EUR / an conform setărilor de club.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={busy || !newTeamName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>{busy ? "Se creează..." : "Creează Echipă"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print-only View (A4 Match Sheet - Centered & Scaled with App Logo) */}
      <div className="hidden print:block fixed inset-0 bg-white text-slate-900 z-[99999] overflow-hidden font-sans">
        <style>{`
          @page {
            size: A4 portrait;
            margin: 6mm auto;
          }
          @media print {
            html, body {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              display: block !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body * { visibility: hidden !important; }
            #print-area, #print-area * { visibility: visible !important; }
            #print-area {
              position: relative !important;
              left: auto !important;
              right: auto !important;
              top: auto !important;
              margin: 0 auto !important;
              width: 190mm !important;
              max-width: 190mm !important;
              box-sizing: border-box !important;
              padding: 0 !important;
            }
          }
        `}</style>
        <div id="print-area" className="w-[190mm] mx-auto space-y-2.5 text-slate-900">
          {/* Official App Logo & Platform Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-base shadow-sm border border-lime-300">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <div>
                <span className="text-base font-black italic tracking-tight uppercase font-headline block leading-none text-slate-950">
                  PRO LIGUE ROMÂNIA
                </span>
                <span className="text-[7.5px] font-mono font-bold tracking-widest uppercase text-lime-800">
                  PLATFORMĂ OFICIALĂ DE MANAGEMENT SPORTIV • LIGUE.RO
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-lime-400 text-[8px] font-mono font-black uppercase tracking-wider">
                DOCUMENT OFICIAL VERIFICAT
              </span>
              <span className="block text-[7.5px] text-slate-500 font-mono mt-0.5">GENERAT AUTOMAT • {new Date().toLocaleDateString("ro-RO")}</span>
            </div>
          </div>

          {/* Header Banner with Team Color */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 rounded-xl border-2 border-slate-800 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              {team.logoUrl ? (
                <img src={team.logoUrl} className="w-12 h-12 object-contain rounded-lg bg-white/10 p-1 border border-white/20" alt="Logo" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-lime-400 text-slate-950 flex items-center justify-center font-black text-xl font-mono border border-lime-300">
                  {team.shortName || team.name.substring(0, 3).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black uppercase tracking-tight m-0 text-white leading-none">{team.name}</h1>
                  <span className="bg-lime-400/20 text-lime-300 border border-lime-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    {team.formation || "4-3-3"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-300 mt-1">
                  <span><strong className="text-white">Competiție:</strong> {team.championship?.name || "Liga Pro România 2026"}</span>
                  <span>•</span>
                  <span><strong className="text-white">Arenă:</strong> {team.homeArena || "Stadion Principal"}</span>
                </div>
              </div>
            </div>

            <div className="text-right border-l border-slate-700 pl-3">
              <div className="text-xs font-black uppercase tracking-wider text-lime-400">FOAIE OFICIALĂ DE JOC</div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">Data: {new Date().toLocaleDateString("ro-RO")}</div>
              <div className="text-[9px] text-slate-400 uppercase">Sport: {team.sport || "Fotbal"} • {team.players.length} Jucători</div>
            </div>
          </div>

          {/* Two-Column Grid: Roster Table & Technical Staff */}
          <div className="grid grid-cols-12 gap-3 items-start">
            {/* Left Column: Player Roster (7 cols) */}
            <div className="col-span-7 border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-1.5 flex justify-between items-center">
                <span>Lot Jucători Oficial (Titulari &amp; Rezerve)</span>
                <span className="text-lime-400 font-mono text-[9px]">{team.players.length} Înscriși</span>
              </div>
              <table className="w-full text-[9.5px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold uppercase text-[8.5px]">
                    <th className="py-1 px-1.5 w-6 text-center">Nr</th>
                    <th className="py-1 px-1.5">Nume &amp; Prenume</th>
                    <th className="py-1 px-1.5 w-16">Poziție</th>
                    <th className="py-1 px-1.5 w-14 text-center">Statut</th>
                    <th className="py-1 px-1.5 w-20 text-center">Sancțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {team.players.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
                      <td className="py-1 px-1.5 font-bold font-mono text-center text-slate-900">
                        {p.number ?? "-"}
                      </td>
                      <td className="py-1 px-1.5 font-semibold text-slate-900 truncate max-w-[110px]">
                        {p.name}
                      </td>
                      <td className="py-1 px-1.5 text-[8.5px] text-slate-600 font-medium truncate">
                        {p.position || "Mijlocaș"}
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${
                            p.isStarter
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {p.isStarter ? "Titular" : "Rezervă"}
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-center text-[8px]">
                        {p.yellowCards > 0 && <span className="mr-0.5 font-bold text-amber-700 bg-amber-100 px-1 rounded">CG:{p.yellowCards}</span>}
                        {p.redCards > 0 && <span className="mr-0.5 font-bold text-red-700 bg-red-100 px-1 rounded">CR:{p.redCards}</span>}
                        {p.suspensions > 0 && <span className="font-bold text-orange-800 bg-orange-100 px-1 rounded">Susp:{p.suspensions}</span>}
                        {!p.yellowCards && !p.redCards && !p.suspensions && <span className="text-slate-400">-</span>}
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows for manual writing */}
                  {Array.from({ length: Math.max(0, 13 - team.players.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-5">
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right Column: Staff Tehnic & Semnături (5 cols) */}
            <div className="col-span-5 space-y-2.5">
              {/* Technical Staff Card */}
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-1.5 flex justify-between items-center">
                  <span>Bancă Tehnică &amp; Oficiali</span>
                  <span className="material-symbols-outlined text-xs text-lime-400">badge</span>
                </div>
                <div className="p-2 space-y-1.5 text-[9.5px]">
                  <div className="border-l-3 border-sky-500 pl-2 bg-sky-50/50 py-0.5 rounded-r">
                    <span className="block text-[8px] font-bold text-sky-800 uppercase">Antrenor Principal</span>
                    <span className="font-bold text-slate-900">{team.headCoach || "_____________________"}</span>
                  </div>
                  <div className="border-l-3 border-teal-500 pl-2 bg-teal-50/50 py-0.5 rounded-r">
                    <span className="block text-[8px] font-bold text-teal-800 uppercase">Antrenor Secund</span>
                    <span className="font-bold text-slate-900">{team.assistantCoach || "_____________________"}</span>
                  </div>
                  <div className="border-l-3 border-rose-500 pl-2 bg-rose-50/50 py-0.5 rounded-r">
                    <span className="block text-[8px] font-bold text-rose-800 uppercase">Medic / Kinetoterapeut</span>
                    <span className="font-bold text-slate-900">{team.medic || "_____________________"}</span>
                  </div>
                  <div className="border-l-3 border-amber-500 pl-2 bg-amber-50/50 py-0.5 rounded-r">
                    <span className="block text-[8px] font-bold text-amber-800 uppercase">Preparator Fizic</span>
                    <span className="font-bold text-slate-900">{team.fitnessCoach || "_____________________"}</span>
                  </div>
                  <div className="border-l-3 border-purple-500 pl-2 bg-purple-50/50 py-0.5 rounded-r">
                    <span className="block text-[8px] font-bold text-purple-800 uppercase">Căpitan Echipă (Nr. / Nume)</span>
                    <span className="font-bold text-slate-900">_____________________</span>
                  </div>
                </div>
              </div>

              {/* Official Stamp & Signature Block */}
              <div className="border border-slate-300 rounded-xl p-2 bg-slate-50 text-[8.5px] space-y-1.5">
                <p className="text-slate-600 leading-tight italic text-[8px]">
                  Subsemnatul, delegat al clubului, confirm că toți sportivii înscriși pe foaie sunt apți medical și legitimați conform regulamentului competiției.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div className="border border-dashed border-slate-400 rounded-lg p-1.5 text-center bg-white h-16 flex flex-col justify-between">
                    <span className="font-bold uppercase text-[7.5px] text-slate-500">Semnătură Delegat</span>
                    <div className="border-b border-slate-400 w-full mb-1"></div>
                  </div>
                  <div className="border border-dashed border-slate-400 rounded-lg p-1.5 text-center bg-white h-16 flex flex-col justify-between">
                    <span className="font-bold uppercase text-[7.5px] text-slate-500">Ștampilă Club / Arbitru</span>
                    <div className="border-b border-slate-400 w-full mb-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Team Sheet Validation Modal */}
      {showTeamSheetModal && (
        <DigitalTeamSheetModal
          team={team}
          onClose={() => setShowTeamSheetModal(false)}
        />
      )}

      {/* GPS Stadium Check-In Modal */}
      {showCheckInModal && (
        <CheckInModal
          team={team}
          onClose={() => setShowCheckInModal(false)}
          onCheckInSuccess={(updated) => setTeam((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
}
