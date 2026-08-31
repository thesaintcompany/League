"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ChampionshipItem {
  id: string;
  name: string;
  sport: string;
  format: string;
  season?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  scope: string;
  county?: string | null;
  city?: string | null;
  logoUrl?: string | null;
  status: string;
  isArchived: boolean;
  isCancelled: boolean;
  cancellationReason?: string | null;
  isBracketPublished: boolean;
  diceRollCount: number;
  silentDice: boolean;
  refereeEnabled: boolean;
  singleVenueEnabled: boolean;
  defaultVenue?: string | null;
  shareCode?: string | null;
  ownerId: string;
  createdAt: string;
  owner?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    image?: string | null;
  } | null;
  teams?: {
    id: string;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    status: string;
    isArchived: boolean;
    _count?: {
      players: number;
    };
  }[];
  _count?: {
    teams: number;
    matches: number;
  };
}

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  color?: string | null;
  logoUrl?: string | null;
  coverPhotoUrl?: string | null;
  championshipId: string;
  managerId?: string | null;
  managerEmail?: string | null;
  headCoach?: string | null;
  assistantCoach?: string | null;
  medic?: string | null;
  fitnessCoach?: string | null;
  formation?: string | null;
  homeArena?: string | null;
  sport?: string | null;
  description?: string | null;
  sponsors?: string | null;
  status: string;
  isArchived: boolean;
  fairPlayScore?: number | null;
  subscriptionActive: boolean;
  createdAt: string;
  championship: {
    id: string;
    name: string;
    sport: string;
    season?: string | null;
    status?: string;
    owner?: {
      id: string;
      name?: string | null;
      email: string;
    } | null;
  };
  manager?: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
    image?: string | null;
  } | null;
  players?: {
    id: string;
    name: string;
    number?: number | null;
    position?: string | null;
    status: string;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  }[];
  _count?: {
    players: number;
    homeMatches: number;
    awayMatches: number;
  };
}

interface OrganizerOption {
  id: string;
  name: string | null;
  email: string;
}

export function AdminManagementPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubTab = (searchParams?.get("section") as "championships" | "teams" | "overview") || "championships";

  const [activeSection, setActiveSection] = useState<"championships" | "teams" | "overview">(initialSubTab);
  const [championships, setChampionships] = useState<ChampionshipItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Filters for Championships
  const [champSearch, setChampSearch] = useState("");
  const [champSportFilter, setChampSportFilter] = useState("all");
  const [champStatusFilter, setChampStatusFilter] = useState("all");
  const [champFormatFilter, setChampFormatFilter] = useState("all");

  // Filters for Teams
  const [teamSearch, setTeamSearch] = useState("");
  const [teamChampFilter, setTeamChampFilter] = useState("all");
  const [teamSportFilter, setTeamSportFilter] = useState("all");
  const [teamStatusFilter, setTeamStatusFilter] = useState("all");

  // Modals state
  const [champModalOpen, setChampModalOpen] = useState(false);
  const [editingChamp, setEditingChamp] = useState<ChampionshipItem | null>(null);
  const [champForm, setChampForm] = useState({
    name: "",
    sport: "fotbal",
    format: "round_robin",
    season: "2026-2027",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "",
    scope: "national",
    county: "",
    city: "",
    logoUrl: "",
    status: "active",
    isArchived: false,
    isCancelled: false,
    cancellationReason: "",
    silentDice: false,
    refereeEnabled: true,
    singleVenueEnabled: false,
    defaultVenue: "",
    shareCode: "",
    ownerId: "",
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetChamp, setCancelTargetChamp] = useState<ChampionshipItem | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("Anulat din motive organizatorice de către SuperAdministrator");

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    shortName: "",
    color: "#84cc16",
    logoUrl: "",
    coverPhotoUrl: "",
    championshipId: "",
    managerEmail: "",
    headCoach: "",
    assistantCoach: "",
    medic: "",
    fitnessCoach: "",
    formation: "4-3-3",
    homeArena: "",
    sport: "fotbal",
    description: "",
    fairPlayScore: 5.0,
    status: "active",
    isArchived: false,
    subscriptionActive: false,
  });

  const [moveTeamModalOpen, setMoveTeamModalOpen] = useState(false);
  const [moveTeamTarget, setMoveTeamTarget] = useState<TeamItem | null>(null);
  const [targetChampForMove, setTargetChampForMove] = useState("");

  const [playersModalOpen, setPlayersModalOpen] = useState(false);
  const [playersModalTeam, setPlayersModalTeam] = useState<TeamItem | null>(null);

  const [savingAction, setSavingAction] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [champRes, teamRes, userRes] = await Promise.all([
        fetch("/api/admin/championships"),
        fetch("/api/admin/teams"),
        fetch("/api/admin/users"),
      ]);

      if (champRes.ok) {
        const cData = await champRes.json();
        setChampionships(cData.championships || []);
      }
      if (teamRes.ok) {
        const tData = await teamRes.json();
        setTeams(tData.teams || []);
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        const orgList = (uData.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }));
        setOrganizers(orgList);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast("Eroare la încărcarea datelor de administrare.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update URL search params when section changes
  function handleSectionChange(sec: "championships" | "teams" | "overview") {
    setActiveSection(sec);
    const url = new URL(window.location.href);
    url.searchParams.set("section", sec);
    window.history.replaceState({}, "", url.toString());
  }

  // ==========================================
  // CHAMPIONSHIP ACTIONS
  // ==========================================
  function openCreateChampModal() {
    setEditingChamp(null);
    setChampForm({
      name: "",
      sport: "fotbal",
      format: "round_robin",
      season: "2026-2027",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
      scope: "national",
      county: "",
      city: "",
      logoUrl: "",
      status: "active",
      isArchived: false,
      isCancelled: false,
      cancellationReason: "",
      silentDice: false,
      refereeEnabled: true,
      singleVenueEnabled: false,
      defaultVenue: "",
      shareCode: "",
      ownerId: organizers.length > 0 ? organizers[0].id : "",
    });
    setChampModalOpen(true);
  }

  function openEditChampModal(c: ChampionshipItem) {
    setEditingChamp(c);
    setChampForm({
      name: c.name || "",
      sport: c.sport || "fotbal",
      format: c.format || "round_robin",
      season: c.season || "2026-2027",
      startDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "",
      description: c.description || "",
      scope: c.scope || "national",
      county: c.county || "",
      city: c.city || "",
      logoUrl: c.logoUrl || "",
      status: c.status || (c.isCancelled ? "cancelled" : c.isArchived ? "archived" : "active"),
      isArchived: Boolean(c.isArchived),
      isCancelled: Boolean(c.isCancelled),
      cancellationReason: c.cancellationReason || "",
      silentDice: Boolean(c.silentDice),
      refereeEnabled: Boolean(c.refereeEnabled),
      singleVenueEnabled: Boolean(c.singleVenueEnabled),
      defaultVenue: c.defaultVenue || "",
      shareCode: c.shareCode || "",
      ownerId: c.ownerId || "",
    });
    setChampModalOpen(true);
  }

  async function handleSaveChamp(e: React.FormEvent) {
    e.preventDefault();
    if (!champForm.name.trim()) {
      alert("Numele campionatului este obligatoriu.");
      return;
    }
    setSavingAction(true);
    try {
      if (editingChamp) {
        // Edit
        const res = await fetch("/api/admin/championships", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            championshipId: editingChamp.id,
            ...champForm,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Campionatul "${champForm.name}" a fost actualizat cu succes!`);
          setChampModalOpen(false);
          loadData();
        } else {
          alert(data.error || "Eroare la salvarea campionatului.");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/championships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(champForm),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Campionatul "${champForm.name}" a fost creat cu succes!`);
          setChampModalOpen(false);
          loadData();
        } else {
          alert(data.error || "Eroare la crearea campionatului.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Eroare de rețea la salvarea campionatului.");
    } finally {
      setSavingAction(false);
    }
  }

  async function handleToggleArchiveChamp(c: ChampionshipItem) {
    const isCurrentlyArchived = c.isArchived || c.status === "archived";
    const newArchived = !isCurrentlyArchived;
    try {
      const res = await fetch("/api/admin/championships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: c.id,
          action: "archive",
          isArchived: newArchived,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || (newArchived ? "Campionat arhivat!" : "Campionat reactivat!"));
        setChampionships((prev) =>
          prev.map((item) =>
            item.id === c.id
              ? { ...item, isArchived: newArchived, status: newArchived ? "archived" : "active" }
              : item
          )
        );
      } else {
        alert(data.error || "Eroare la schimbarea stării campionatului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function openCancelChampModal(c: ChampionshipItem) {
    setCancelTargetChamp(c);
    setCancelReasonInput(c.cancellationReason || "Anulat din motive organizatorice de către SuperAdministrator");
    setCancelModalOpen(true);
  }

  async function handleConfirmCancelChamp(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelTargetChamp) return;
    setSavingAction(true);
    try {
      const res = await fetch("/api/admin/championships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: cancelTargetChamp.id,
          action: "cancel",
          cancellationReason: cancelReasonInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Campionatul "${cancelTargetChamp.name}" a fost anulat.`);
        setCancelModalOpen(false);
        setChampionships((prev) =>
          prev.map((item) =>
            item.id === cancelTargetChamp.id
              ? { ...item, isCancelled: true, status: "cancelled", cancellationReason: cancelReasonInput }
              : item
          )
        );
      } else {
        alert(data.error || "Eroare la anularea campionatului.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAction(false);
    }
  }

  async function handleReactivateChamp(c: ChampionshipItem) {
    try {
      const res = await fetch("/api/admin/championships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: c.id,
          action: "activate",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Campionatul "${c.name}" a fost reactivat!`);
        setChampionships((prev) =>
          prev.map((item) =>
            item.id === c.id
              ? { ...item, isCancelled: false, isArchived: false, status: "active", cancellationReason: null }
              : item
          )
        );
      } else {
        alert(data.error || "Eroare la reactivarea campionatului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResetDice(c: ChampionshipItem) {
    if (!confirm(`Resetare aruncări de zaruri pentru "${c.name}"? Organizatorul va avea din nou 3 aruncări disponibile.`)) return;
    try {
      const res = await fetch("/api/admin/championships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: c.id,
          action: "reset_dice",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Zarurile au fost resetate pentru "${c.name}".`);
        setChampionships((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, diceRollCount: 0 } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClearBracket(c: ChampionshipItem) {
    if (!confirm(`Sigur dorești să resetezi tabloul eliminatoriu pentru "${c.name}"? Meciurile din fazele finale vor fi șterse și starea va redeveni nepublicată.`)) return;
    try {
      const res = await fetch("/api/admin/championships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championshipId: c.id,
          action: "clear_bracket",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Tabloul a fost resetat pentru "${c.name}".`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteChamp(c: ChampionshipItem) {
    const teamsCount = c._count?.teams || c.teams?.length || 0;
    const matchesCount = c._count?.matches || 0;
    const confirmed = confirm(
      `ATENȚIE - ȘTERGERE DEFINITIVĂ CAMPIONAT:\n\n` +
      `Ești sigur că dorești să elimini definitiv campionatul "${c.name}"?\n\n` +
      `Vor fi șterse:\n` +
      `- ${teamsCount} echipe înscrise\n` +
      `- ${matchesCount} meciuri și scoruri\n` +
      `- Toate invitațiile și setările asociate\n\n` +
      `Această acțiune este IREVERSIBILĂ!`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/championships?championshipId=${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Campionatul "${c.name}" a fost șters definitiv.`);
        setChampionships((prev) => prev.filter((item) => item.id !== c.id));
        setTeams((prev) => prev.filter((t) => t.championshipId !== c.id));
      } else {
        alert(data.error || "Eroare la ștergerea campionatului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================================
  // TEAM ACTIONS
  // ==========================================
  function openCreateTeamModal() {
    setEditingTeam(null);
    setTeamForm({
      name: "",
      shortName: "",
      color: "#84cc16",
      logoUrl: "",
      coverPhotoUrl: "",
      championshipId: championships.length > 0 ? championships[0].id : "",
      managerEmail: "",
      headCoach: "",
      assistantCoach: "",
      medic: "",
      fitnessCoach: "",
      formation: "4-3-3",
      homeArena: "",
      sport: championships.length > 0 ? championships[0].sport : "fotbal",
      description: "",
      fairPlayScore: 5.0,
      status: "active",
      isArchived: false,
      subscriptionActive: false,
    });
    setTeamModalOpen(true);
  }

  function openEditTeamModal(t: TeamItem) {
    setEditingTeam(t);
    setTeamForm({
      name: t.name || "",
      shortName: t.shortName || "",
      color: t.color || "#84cc16",
      logoUrl: t.logoUrl || "",
      coverPhotoUrl: t.coverPhotoUrl || "",
      championshipId: t.championshipId || "",
      managerEmail: t.managerEmail || t.manager?.email || "",
      headCoach: t.headCoach || "",
      assistantCoach: t.assistantCoach || "",
      medic: t.medic || "",
      fitnessCoach: t.fitnessCoach || "",
      formation: t.formation || "4-3-3",
      homeArena: t.homeArena || "",
      sport: t.sport || t.championship?.sport || "fotbal",
      description: t.description || "",
      fairPlayScore: t.fairPlayScore ?? 5.0,
      status: t.status || (t.isArchived ? "archived" : "active"),
      isArchived: Boolean(t.isArchived),
      subscriptionActive: Boolean(t.subscriptionActive),
    });
    setTeamModalOpen(true);
  }

  async function handleSaveTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamForm.name.trim()) {
      alert("Numele echipei este obligatoriu.");
      return;
    }
    if (!teamForm.championshipId) {
      alert("Selectează campionatul în care va fi înscrisă echipa.");
      return;
    }

    setSavingAction(true);
    try {
      if (editingTeam) {
        // Edit
        const res = await fetch("/api/admin/teams", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId: editingTeam.id,
            ...teamForm,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Echipa "${teamForm.name}" a fost actualizată!`);
          setTeamModalOpen(false);
          loadData();
        } else {
          alert(data.error || "Eroare la salvarea echipei.");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamForm),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Echipa "${teamForm.name}" a fost creată!`);
          setTeamModalOpen(false);
          loadData();
        } else {
          alert(data.error || "Eroare la crearea echipei.");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Eroare de rețea la salvarea echipei.");
    } finally {
      setSavingAction(false);
    }
  }

  function openMoveTeamModal(t: TeamItem) {
    setMoveTeamTarget(t);
    setTargetChampForMove(t.championshipId);
    setMoveTeamModalOpen(true);
  }

  async function handleConfirmMoveTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!moveTeamTarget || !targetChampForMove) return;
    if (targetChampForMove === moveTeamTarget.championshipId) {
      alert("Echipa se află deja în acest campionat.");
      return;
    }

    setSavingAction(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: moveTeamTarget.id,
          action: "change_championship",
          newChampionshipId: targetChampForMove,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Echipa a fost mutată.`);
        setMoveTeamModalOpen(false);
        loadData();
      } else {
        alert(data.error || "Eroare la mutarea echipei.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAction(false);
    }
  }

  async function handleToggleArchiveTeam(t: TeamItem) {
    const isCurrentlyArchived = t.isArchived || t.status === "archived";
    const newArchived = !isCurrentlyArchived;
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: t.id,
          action: "archive",
          isArchived: newArchived,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || (newArchived ? "Echipă arhivată." : "Echipă reactivată."));
        setTeams((prev) =>
          prev.map((item) =>
            item.id === t.id
              ? { ...item, isArchived: newArchived, status: newArchived ? "archived" : "active" }
              : item
          )
        );
      } else {
        alert(data.error || "Eroare la modificarea echipei.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleSuspendTeam(t: TeamItem) {
    const isCurrentlySuspended = t.status === "suspended";
    const newStatus = isCurrentlySuspended ? "active" : "suspended";
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: t.id,
          action: isCurrentlySuspended ? "activate" : "suspend",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || (isCurrentlySuspended ? "Echipa a fost reactivată." : "Echipa a fost suspendată."));
        setTeams((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, status: newStatus } : item))
        );
      } else {
        alert(data.error || "Eroare la modificarea echipei.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTeam(t: TeamItem) {
    const playersCount = t._count?.players || t.players?.length || 0;
    const confirmed = confirm(
      `ATENȚIE - ȘTERGERE DEFINITIVĂ ECHIPĂ:\n\n` +
      `Sigur dorești să ștergi echipa "${t.name}" (${t.shortName || "FC"}) din campionatul "${t.championship?.name}"?\n\n` +
      `Vor fi eliminați ${playersCount} jucători din lot și legăturile meciurilor.\n\n` +
      `Această acțiune este IREVERSIBILĂ!`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/teams?teamId=${t.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Echipa "${t.name}" a fost ștearsă definitiv.`);
        setTeams((prev) => prev.filter((item) => item.id !== t.id));
      } else {
        alert(data.error || "Eroare la ștergerea echipei.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function openPlayersModal(t: TeamItem) {
    setPlayersModalTeam(t);
    setPlayersModalOpen(true);
  }

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredChampionships = useMemo(() => {
    return championships.filter((c) => {
      const matchesSport =
        champSportFilter === "all" ||
        (c.sport && c.sport.toLowerCase().includes(champSportFilter.toLowerCase()));

      let matchesStatus = true;
      if (champStatusFilter === "active") {
        matchesStatus = !c.isArchived && !c.isCancelled && c.status === "active";
      } else if (champStatusFilter === "archived") {
        matchesStatus = Boolean(c.isArchived) || c.status === "archived";
      } else if (champStatusFilter === "cancelled") {
        matchesStatus = Boolean(c.isCancelled) || c.status === "cancelled";
      } else if (champStatusFilter === "completed") {
        matchesStatus = c.status === "completed";
      }

      const matchesFormat = champFormatFilter === "all" || c.format === champFormatFilter;

      const q = champSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.county && c.county.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.shareCode && c.shareCode.toLowerCase().includes(q)) ||
        (c.owner?.name && c.owner.name.toLowerCase().includes(q)) ||
        (c.owner?.email && c.owner.email.toLowerCase().includes(q));

      return matchesSport && matchesStatus && matchesFormat && matchesSearch;
    });
  }, [championships, champSearch, champSportFilter, champStatusFilter, champFormatFilter]);

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesChamp = teamChampFilter === "all" || t.championshipId === teamChampFilter;
      const matchesSport =
        teamSportFilter === "all" ||
        (t.sport && t.sport.toLowerCase().includes(teamSportFilter.toLowerCase())) ||
        (t.championship?.sport && t.championship.sport.toLowerCase().includes(teamSportFilter.toLowerCase()));

      let matchesStatus = true;
      if (teamStatusFilter === "active") {
        matchesStatus = !t.isArchived && t.status === "active";
      } else if (teamStatusFilter === "archived") {
        matchesStatus = Boolean(t.isArchived) || t.status === "archived";
      } else if (teamStatusFilter === "suspended") {
        matchesStatus = t.status === "suspended";
      }

      const q = teamSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.shortName && t.shortName.toLowerCase().includes(q)) ||
        (t.homeArena && t.homeArena.toLowerCase().includes(q)) ||
        (t.managerEmail && t.managerEmail.toLowerCase().includes(q)) ||
        (t.manager?.name && t.manager.name.toLowerCase().includes(q)) ||
        (t.championship?.name && t.championship.name.toLowerCase().includes(q));

      return matchesChamp && matchesSport && matchesStatus && matchesSearch;
    });
  }, [teams, teamSearch, teamChampFilter, teamSportFilter, teamStatusFilter]);

  // Telemetry KPIs
  const stats = useMemo(() => {
    const totalChamps = championships.length;
    const activeChamps = championships.filter((c) => !c.isArchived && !c.isCancelled && c.status === "active").length;
    const archivedChamps = championships.filter((c) => c.isArchived || c.status === "archived").length;
    const cancelledChamps = championships.filter((c) => c.isCancelled || c.status === "cancelled").length;

    const totalTeamsCount = teams.length;
    const activeTeams = teams.filter((t) => !t.isArchived && t.status === "active").length;
    const teamsWithManager = teams.filter((t) => Boolean(t.managerId || t.managerEmail)).length;
    const totalPlayersRostered = teams.reduce((acc, t) => acc + (t._count?.players || t.players?.length || 0), 0);

    return {
      totalChamps,
      activeChamps,
      archivedChamps,
      cancelledChamps,
      totalTeamsCount,
      activeTeams,
      teamsWithManager,
      totalPlayersRostered,
    };
  }, [championships, teams]);

  function getSportIcon(sport: string) {
    const s = (sport || "").toLowerCase();
    if (s.includes("baschet") || s.includes("basketball")) return "sports_basketball";
    if (s.includes("volei") || s.includes("volleyball")) return "sports_volleyball";
    if (s.includes("handbal") || s.includes("handball")) return "sports_handball";
    if (s.includes("tenis") || s.includes("padel")) return "sports_tennis";
    if (s.includes("ping") || s.includes("masa")) return "circle";
    return "sports_soccer";
  }

  function getStatusBadge(item: { status?: string; isArchived?: boolean; isCancelled?: boolean }) {
    if (item.isCancelled || item.status === "cancelled") {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">cancel</span>
          Anulat
        </span>
      );
    }
    if (item.isArchived || item.status === "archived") {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">archive</span>
          Arhivat
        </span>
      );
    }
    if (item.status === "suspended") {
      return (
        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider border border-purple-500/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">pause_circle</span>
          Suspendat
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-lime-500/20 text-lime-700 dark:text-lime-400 text-[10px] font-black uppercase tracking-wider border border-lime-500/30 flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">check_circle</span>
        Activ
      </span>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-950 text-white border border-lime-400/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-lime-400">verified</span>
          <span className="text-xs font-bold font-label">{toast}</span>
        </div>
      )}

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Campionate &amp; Turnee
            </span>
            <span className="material-symbols-outlined text-lime-400 text-2xl">military_tech</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-headline font-black italic text-white">{stats.totalChamps}</span>
            <span className="text-xs text-lime-400 font-bold">({stats.activeChamps} active)</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span>{stats.archivedChamps} arhivate</span>
            <span>•</span>
            <span className="text-red-400">{stats.cancelledChamps} anulate</span>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Echipe Înregistrate
            </span>
            <span className="material-symbols-outlined text-lime-400 text-2xl">shield</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-headline font-black italic text-white">{stats.totalTeamsCount}</span>
            <span className="text-xs text-lime-400 font-bold">({stats.activeTeams} active)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>{stats.teamsWithManager} cu manager atribuit</span>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
              Loturi &amp; Jucători
            </span>
            <span className="material-symbols-outlined text-lime-400 text-2xl">groups</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-headline font-black italic text-white">{stats.totalPlayersRostered}</span>
            <span className="text-xs text-slate-400">în loturi</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Profiluri &amp; legitimații sportive</span>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-lime-400">
              SuperAdmin Control
            </span>
            <h4 className="text-sm font-headline font-bold text-white mt-1">Autoritate Totală</h4>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={openCreateChampModal}
              className="flex-1 py-2 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition active:scale-95 text-center"
            >
              + Campionat
            </button>
            <button
              type="button"
              onClick={openCreateTeamModal}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-headline font-bold text-xs uppercase tracking-wider transition active:scale-95 text-center border border-slate-700"
            >
              + Echipă
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSectionChange("championships")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition ${
              activeSection === "championships"
                ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 shadow-md font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">military_tech</span>
            <span>Campionate ({championships.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSectionChange("teams")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition ${
              activeSection === "teams"
                ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 shadow-md font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">shield</span>
            <span>Echipe &amp; Cluburi ({teams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSectionChange("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-wider transition ${
              activeSection === "overview"
                ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 shadow-md font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Rapoarte &amp; Distribuție</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            title="Reîncarcă datele live"
          >
            <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CHAMPIONSHIPS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSection === "championships" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filters Bar */}
          <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Caută după titlu campionat, oraș, județ, cod share sau organizator..."
                  value={champSearch}
                  onChange={(e) => setChampSearch(e.target.value)}
                  className="input pl-10 text-xs w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                {champSearch && (
                  <button
                    type="button"
                    onClick={() => setChampSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Add New Button */}
              <button
                type="button"
                onClick={openCreateChampModal}
                className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Creează Campionat Nou</span>
              </button>
            </div>

            {/* Sub-Filters: Sport, Status, Format */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-label font-bold text-slate-400 uppercase mr-1">Sport:</span>
              {["all", "fotbal", "baschet", "volei", "handbal", "tenis", "padel"].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setChampSportFilter(sp)}
                  className={`px-3 py-1.5 rounded-xl font-label font-bold uppercase transition ${
                    champSportFilter === sp
                      ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {sp === "all" ? "Toate" : sp}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

              <span className="text-[11px] font-label font-bold text-slate-400 uppercase mr-1">Status:</span>
              {[
                { id: "all", label: "Toate" },
                { id: "active", label: "Active" },
                { id: "archived", label: "Arhivate" },
                { id: "cancelled", label: "Anulate" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setChampStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-label font-bold uppercase transition ${
                    champStatusFilter === st.id
                      ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

              <span className="text-[11px] font-label font-bold text-slate-400 uppercase mr-1">Format:</span>
              {[
                { id: "all", label: "Toate" },
                { id: "round_robin", label: "Ligă" },
                { id: "knockout", label: "Eliminatoriu" },
                { id: "groups_knockout", label: "Grupe + Tablou" },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setChampFormatFilter(fmt.id)}
                  className={`px-3 py-1.5 rounded-xl font-label font-bold uppercase transition ${
                    champFormatFilter === fmt.id
                      ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Championships Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl animate-spin text-lime-400">progress_activity</span>
              <p className="text-sm font-bold font-label">Se încarcă lista de campionate...</p>
            </div>
          ) : filteredChampionships.length === 0 ? (
            <div className="card p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-white">
                Niciun campionat găsit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Nu există campionate care să corespundă criteriilor selectate. Încearcă să resetezi filtrele sau să creezi un campionat nou.
              </p>
              <button
                type="button"
                onClick={() => {
                  setChampSearch("");
                  setChampSportFilter("all");
                  setChampStatusFilter("all");
                  setChampFormatFilter("all");
                }}
                className="btn btn-secondary text-xs uppercase font-bold py-2 px-4 rounded-xl mt-2"
              >
                Resetează Filtrele
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredChampionships.map((c) => {
                const isArchived = Boolean(c.isArchived) || c.status === "archived";
                const isCancelled = Boolean(c.isCancelled) || c.status === "cancelled";
                const teamsCount = c._count?.teams || c.teams?.length || 0;
                const matchesCount = c._count?.matches || 0;

                return (
                  <div
                    key={c.id}
                    className={`card p-6 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm transition-all relative flex flex-col justify-between ${
                      isCancelled
                        ? "border-red-500/40 bg-red-950/5 dark:bg-red-950/20"
                        : isArchived
                        ? "border-amber-500/40 opacity-80"
                        : "border-slate-200 dark:border-slate-800 hover:border-lime-400/50"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                            {c.logoUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={c.logoUrl} alt={c.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="material-symbols-outlined text-2xl text-lime-600 dark:text-lime-400">
                                {getSportIcon(c.sport)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-headline font-black italic tracking-tight text-slate-900 dark:text-white">
                                {c.name}
                              </h3>
                              {getStatusBadge(c)}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-label mt-0.5">
                              <span className="capitalize font-bold text-lime-600 dark:text-lime-400">{c.sport}</span>
                              <span>•</span>
                              <span>{c.season || "2026-2027"}</span>
                              <span>•</span>
                              <span className="capitalize">{c.format === "round_robin" ? "Ligă" : c.format}</span>
                              {c.shareCode && (
                                <>
                                  <span>•</span>
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px]">
                                    {c.shareCode}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location Badge */}
                        <div className="text-right shrink-0">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-label font-bold uppercase tracking-wider block">
                            {c.city || c.county || "România"}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation reason banner if cancelled */}
                      {isCancelled && c.cancellationReason && (
                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                          <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                          <div>
                            <strong className="font-bold block">Motiv Anulare:</strong>
                            <p className="text-[11px] opacity-90">{c.cancellationReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Organizer Details */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                          <span className="text-slate-500 dark:text-slate-400">Organizator:</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {c.owner?.name || c.owner?.email || "SuperAdmin"}
                          </span>
                          <span className="text-[10px] text-slate-400">({c.owner?.email})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(c.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                      </div>

                      {/* Quick Stats: Teams enrolled & Matches */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-label font-bold block">Echipe</span>
                          <span className="text-base font-headline font-black text-slate-900 dark:text-white">
                            {teamsCount}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-label font-bold block">Meciuri</span>
                          <span className="text-base font-headline font-black text-slate-900 dark:text-white">
                            {matchesCount}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-label font-bold block">Zaruri</span>
                          <span className="text-base font-headline font-black text-slate-900 dark:text-white">
                            {c.diceRollCount}/3
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar (SuperAdmin Operations) */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditChampModal(c)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm text-lime-500">edit</span>
                          <span>Editează</span>
                        </button>

                        {/* Archive / Unarchive */}
                        <button
                          type="button"
                          onClick={() => handleToggleArchiveChamp(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isArchived
                              ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isArchived ? "unarchive" : "archive"}
                          </span>
                          <span>{isArchived ? "Dezarhivează" : "Arhivează"}</span>
                        </button>

                        {/* Cancel / Reactivate */}
                        {isCancelled ? (
                          <button
                            type="button"
                            onClick={() => handleReactivateChamp(c)}
                            className="px-3 py-1.5 rounded-xl bg-lime-400/20 text-lime-600 dark:text-lime-400 hover:bg-lime-400/30 text-xs font-bold transition flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                            <span>Reactivează</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCancelChampModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-bold transition flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">block</span>
                            <span>Anulează</span>
                          </button>
                        )}

                        {/* Reset Dice */}
                        {c.diceRollCount > 0 && (
                          <button
                            type="button"
                            onClick={() => handleResetDice(c)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-xs font-bold transition flex items-center gap-1"
                            title="Resetează aruncările cu zarul la 0"
                          >
                            <span className="material-symbols-outlined text-sm">casino</span>
                            <span>Reset Zaruri</span>
                          </button>
                        )}

                        {/* Reset Bracket if published */}
                        {c.isBracketPublished && (
                          <button
                            type="button"
                            onClick={() => handleClearBracket(c)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-xs font-bold transition flex items-center gap-1"
                            title="Resetează tabloul eliminatoriu"
                          >
                            <span className="material-symbols-outlined text-sm">account_tree</span>
                            <span>Reset Tablou</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Public Link */}
                        <Link
                          href={`/campionat/${c.id}`}
                          target="_blank"
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                          title="Vezi pagina publică a campionatului"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </Link>

                        {/* Organizer Dashboard Link */}
                        <Link
                          href={`/dashboard/championships/${c.id}`}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                          title="Accesează panoul de organizator pentru acest campionat"
                        >
                          <span className="material-symbols-outlined text-base">tune</span>
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteChamp(c)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                          title="Șterge definitiv campionatul"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TEAMS & CLUBS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSection === "teams" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Teams Filters Bar */}
          <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Caută după nume echipă, cod scurt, manager, arenă acasă sau campionat..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="input pl-10 text-xs w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                {teamSearch && (
                  <button
                    type="button"
                    onClick={() => setTeamSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Championship Dropdown Filter */}
              <div className="w-full md:w-64">
                <select
                  value={teamChampFilter}
                  onChange={(e) => setTeamChampFilter(e.target.value)}
                  className="input text-xs w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="all">Toate Campionatele ({championships.length})</option>
                  {championships.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add New Team */}
              <button
                type="button"
                onClick={openCreateTeamModal}
                className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Creează Echipă Nouă</span>
              </button>
            </div>

            {/* Sub-Filters: Sport & Status */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-label font-bold text-slate-400 uppercase mr-1">Sport:</span>
              {["all", "fotbal", "baschet", "volei", "handbal", "tenis", "padel"].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setTeamSportFilter(sp)}
                  className={`px-3 py-1.5 rounded-xl font-label font-bold uppercase transition ${
                    teamSportFilter === sp
                      ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {sp === "all" ? "Toate" : sp}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

              <span className="text-[11px] font-label font-bold text-slate-400 uppercase mr-1">Status:</span>
              {[
                { id: "all", label: "Toate" },
                { id: "active", label: "Active" },
                { id: "archived", label: "Arhivate" },
                { id: "suspended", label: "Suspendate" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setTeamStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-label font-bold uppercase transition ${
                    teamStatusFilter === st.id
                      ? "bg-slate-900 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teams Table / Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl animate-spin text-lime-400">progress_activity</span>
              <p className="text-sm font-bold font-label">Se încarcă lista de echipe...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="card p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-white">
                Nicio echipă găsită
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Nu există echipe conform filtrelor alese. Încearcă să resetezi căutarea sau să adaugi o echipă nouă.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTeamSearch("");
                  setTeamChampFilter("all");
                  setTeamSportFilter("all");
                  setTeamStatusFilter("all");
                }}
                className="btn btn-secondary text-xs uppercase font-bold py-2 px-4 rounded-xl mt-2"
              >
                Resetează Filtrele
              </button>
            </div>
          ) : (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-4 px-4">Echipă &amp; Identitate</th>
                      <th className="py-4 px-4">Campionat Înscris</th>
                      <th className="py-4 px-4">Manager Atribuit</th>
                      <th className="py-4 px-4 text-center">Lot Jucători</th>
                      <th className="py-4 px-4 text-center">Meciuri</th>
                      <th className="py-4 px-4 text-center">Fair Play</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 text-right">Acțiuni SuperAdmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                    {filteredTeams.map((t) => {
                      const isArchived = Boolean(t.isArchived) || t.status === "archived";
                      const isSuspended = t.status === "suspended";
                      const playersCount = t._count?.players || t.players?.length || 0;
                      const matchesCount = (t._count?.homeMatches || 0) + (t._count?.awayMatches || 0);

                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                            isSuspended
                              ? "bg-purple-950/5 dark:bg-purple-950/20"
                              : isArchived
                              ? "opacity-75 bg-amber-950/5"
                              : ""
                          }`}
                        >
                          {/* Team Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center p-1 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
                                style={{ backgroundColor: t.color ? `${t.color}20` : undefined }}
                              >
                                {t.logoUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={t.logoUrl} alt={t.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="font-headline font-black text-xs text-slate-800 dark:text-white">
                                    {t.shortName || t.name.slice(0, 3).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                                    {t.name}
                                  </span>
                                  {t.shortName && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold">
                                      {t.shortName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="capitalize">{t.sport || "fotbal"}</span>
                                  {t.homeArena && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[140px]" title={t.homeArena}>
                                        {t.homeArena}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Championship */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {t.championship?.name || "Fără campionat"}
                              </span>
                              <span className="text-[10px] text-slate-400 capitalize">
                                {t.championship?.sport} ({t.championship?.season || "2026-2027"})
                              </span>
                            </div>
                          </td>

                          {/* Manager */}
                          <td className="py-3.5 px-4">
                            {t.manager || t.managerEmail ? (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block text-xs">
                                    {t.manager?.name || "Manager Invitat"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {t.manager?.email || t.managerEmail}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Neatribuit</span>
                            )}
                          </td>

                          {/* Players Count & Action */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => openPlayersModal(t)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs inline-flex items-center gap-1 transition"
                            >
                              <span className="material-symbols-outlined text-sm text-lime-500">groups</span>
                              <span>{playersCount} jucători</span>
                            </button>
                          </td>

                          {/* Matches Count */}
                          <td className="py-3.5 px-4 text-center font-headline font-bold text-slate-700 dark:text-slate-300">
                            {matchesCount}
                          </td>

                          {/* Fair Play */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-lg bg-lime-400/10 text-lime-600 dark:text-lime-400 font-bold text-xs inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                              <span>{(t.fairPlayScore ?? 5.0).toFixed(1)}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(t)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openEditTeamModal(t)}
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                                title="Editează datele echipei"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>

                              {/* Move Championship */}
                              <button
                                type="button"
                                onClick={() => openMoveTeamModal(t)}
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                                title="Mută echipa în alt campionat"
                              >
                                <span className="material-symbols-outlined text-base">swap_horiz</span>
                              </button>

                              {/* Archive */}
                              <button
                                type="button"
                                onClick={() => handleToggleArchiveTeam(t)}
                                className={`p-1.5 rounded-xl transition ${
                                  isArchived
                                    ? "bg-amber-500/20 text-amber-500"
                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                                }`}
                                title={isArchived ? "Dezarhivează echipa" : "Arhivează echipa"}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {isArchived ? "unarchive" : "archive"}
                                </span>
                              </button>

                              {/* Suspend */}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspendTeam(t)}
                                className={`p-1.5 rounded-xl transition ${
                                  isSuspended
                                    ? "bg-purple-500/20 text-purple-500"
                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                                }`}
                                title={isSuspended ? "Reactivare echipă" : "Suspendă echipă"}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {isSuspended ? "play_circle" : "pause_circle"}
                                </span>
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(t)}
                                className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                                title="Șterge definitiv echipa"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: OVERVIEW & RAPOARTE */}
      {/* ========================================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sport distribution */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-headline font-bold text-slate-900 dark:text-white">
                  Distribuție Campionate pe Discipline Sportive
                </h3>
                <span className="material-symbols-outlined text-lime-400">sports</span>
              </div>
              <div className="space-y-3 pt-2">
                {["fotbal", "baschet", "volei", "handbal", "tenis", "padel"].map((sp) => {
                  const count = championships.filter((c) => (c.sport || "").toLowerCase().includes(sp)).length;
                  const percent = championships.length > 0 ? Math.round((count / championships.length) * 100) : 0;
                  return (
                    <div key={sp} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold capitalize">
                        <span className="text-slate-700 dark:text-slate-300">{sp}</span>
                        <span className="text-slate-400">
                          {count} campionate ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-lime-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick SuperAdmin Actions */}
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-headline font-bold text-slate-900 dark:text-white">
                  Acțiuni Globale &amp; Mentenanță
                </h3>
                <span className="material-symbols-outlined text-lime-400">settings_suggest</span>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Creează Campionat Rapid</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Lansează o competiție nouă direct pe platformă</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateChampModal}
                    className="btn btn-secondary text-xs uppercase font-bold py-2 px-3 rounded-xl"
                  >
                    Lansează
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Creează Echipă Rapid</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Înregistrează un club într-unul din campionate</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateTeamModal}
                    className="btn btn-secondary text-xs uppercase font-bold py-2 px-3 rounded-xl"
                  >
                    Adaugă
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Catalog Arene &amp; Terenuri</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gestionează arenele partenere din țară</p>
                  </div>
                  <Link
                    href="/dashboard/admin?tab=venues"
                    className="btn btn-secondary text-xs uppercase font-bold py-2 px-3 rounded-xl"
                  >
                    Arene ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT CHAMPIONSHIP */}
      {/* ========================================================================= */}
      {champModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="card w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400 text-2xl">
                  {editingChamp ? "edit" : "add_circle"}
                </span>
                <h3 className="text-xl font-headline font-black italic tracking-tight text-slate-900 dark:text-white">
                  {editingChamp ? `Editează "${editingChamp.name}"` : "Creează Campionat Nou (SuperAdmin)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChampModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveChamp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">
                    Nume Campionat / Turneu *
                  </label>
                  <input
                    type="text"
                    required
                    value={champForm.name}
                    onChange={(e) => setChampForm({ ...champForm, name: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="Ex: Liga Campionilor Timișoara 2027"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Sport</label>
                  <select
                    value={champForm.sport}
                    onChange={(e) => setChampForm({ ...champForm, sport: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="fotbal">Fotbal / Minifotbal</option>
                    <option value="baschet">Baschet</option>
                    <option value="volei">Volei</option>
                    <option value="handbal">Handbal</option>
                    <option value="tenis">Tenis de Câmp</option>
                    <option value="padel">Padel</option>
                    <option value="pingpong">Tenis de Masă</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Format Competiție</label>
                  <select
                    value={champForm.format}
                    onChange={(e) => setChampForm({ ...champForm, format: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="round_robin">Sistem Ligă (Round-Robin)</option>
                    <option value="knockout">Eliminatoriu Direct (Knockout)</option>
                    <option value="groups_knockout">Faza Grupelor + Tablou Eliminatoriu</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Sezon</label>
                  <input
                    type="text"
                    value={champForm.season}
                    onChange={(e) => setChampForm({ ...champForm, season: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="2026-2027"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Proprietar / Organizator</label>
                  <select
                    value={champForm.ownerId}
                    onChange={(e) => setChampForm({ ...champForm, ownerId: e.target.value })}
                    className="input text-xs w-full"
                  >
                    {organizers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name || o.email} ({o.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Data Începerii</label>
                  <input
                    type="date"
                    value={champForm.startDate}
                    onChange={(e) => setChampForm({ ...champForm, startDate: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Data Încheierii (Opțional)</label>
                  <input
                    type="date"
                    value={champForm.endDate}
                    onChange={(e) => setChampForm({ ...champForm, endDate: e.target.value })}
                    className="input text-xs w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Județ</label>
                  <input
                    type="text"
                    value={champForm.county}
                    onChange={(e) => setChampForm({ ...champForm, county: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="Ex: Timiș, Cluj, București"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Oraș / Localitate</label>
                  <input
                    type="text"
                    value={champForm.city}
                    onChange={(e) => setChampForm({ ...champForm, city: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="Ex: Timișoara"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">URL Siglă / Logo</label>
                  <input
                    type="url"
                    value={champForm.logoUrl}
                    onChange={(e) => setChampForm({ ...champForm, logoUrl: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="https://..."
                  />
                </div>

                {editingChamp && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-label font-bold uppercase text-[10px] text-slate-400">Status Campionat</label>
                    <select
                      value={champForm.status}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChampForm({
                          ...champForm,
                          status: val,
                          isArchived: val === "archived",
                          isCancelled: val === "cancelled",
                        });
                      }}
                      className="input text-xs w-full"
                    >
                      <option value="active">Activ (Desfășurare Normală)</option>
                      <option value="archived">Arhivat (Încheiat / Păstrat în istoric)</option>
                      <option value="cancelled">Anulat (Competiție Anulată)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={champForm.refereeEnabled}
                    onChange={(e) => setChampForm({ ...champForm, refereeEnabled: e.target.checked })}
                    className="rounded text-lime-400 focus:ring-lime-400"
                  />
                  <span>Modul Arbitraj Activ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={champForm.silentDice}
                    onChange={(e) => setChampForm({ ...champForm, silentDice: e.target.checked })}
                    className="rounded text-lime-400 focus:ring-lime-400"
                  />
                  <span>Tragere la Sorți Silent</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setChampModalOpen(false)}
                  className="btn btn-secondary text-xs uppercase font-bold py-2.5 px-4 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="btn btn-primary text-xs uppercase font-bold py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  {savingAction && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  <span>{editingChamp ? "Salvează Modificările" : "Creează Campionatul"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANCEL CHAMPIONSHIP WITH REASON */}
      {/* ========================================================================= */}
      {cancelModalOpen && cancelTargetChamp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card w-full max-w-md bg-white dark:bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <span className="material-symbols-outlined text-3xl">block</span>
              <h3 className="text-lg font-headline font-black text-slate-900 dark:text-white">
                Anulare Campionat
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ești pe cale să anulezi campionatul <strong>&ldquo;{cancelTargetChamp.name}&rdquo;</strong>. Te rugăm să introduci motivul anulării:
            </p>

            <form onSubmit={handleConfirmCancelChamp} className="space-y-4 text-xs">
              <textarea
                rows={3}
                required
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="input w-full p-3 text-xs"
                placeholder="Ex: Anulat din cauza condițiilor meteo / Decizie organizatorică"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="btn btn-secondary text-xs uppercase font-bold py-2 px-3 rounded-xl"
                >
                  Înapoi
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  {savingAction ? "Se anulează..." : "Confirmă Anularea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT TEAM */}
      {/* ========================================================================= */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="card w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-400 text-2xl">
                  {editingTeam ? "edit" : "add_circle"}
                </span>
                <h3 className="text-xl font-headline font-black italic tracking-tight text-slate-900 dark:text-white">
                  {editingTeam ? `Editează Echipa "${editingTeam.name}"` : "Creează Echipă Nouă"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTeamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Nume Echipă *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="Ex: FC Real Timișoara"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Cod Scurt (3 litere)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={teamForm.shortName}
                    onChange={(e) => setTeamForm({ ...teamForm, shortName: e.target.value.toUpperCase() })}
                    className="input text-xs w-full font-mono font-bold"
                    placeholder="REAL"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Campionat Înscris *</label>
                  <select
                    required
                    value={teamForm.championshipId}
                    onChange={(e) => setTeamForm({ ...teamForm, championshipId: e.target.value })}
                    className="input text-xs w-full font-bold"
                  >
                    <option value="">-- Selectează Campionatul --</option>
                    {championships.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.sport}) - {c.city || "România"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Email Manager / Lider</label>
                  <input
                    type="email"
                    value={teamForm.managerEmail}
                    onChange={(e) => setTeamForm({ ...teamForm, managerEmail: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="manager@echipa.ro"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Culoare Echipă</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamForm.color}
                      onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })}
                      className="w-10 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={teamForm.color}
                      onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })}
                      className="input text-xs flex-1 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">URL Logo Echipă</label>
                  <input
                    type="url"
                    value={teamForm.logoUrl}
                    onChange={(e) => setTeamForm({ ...teamForm, logoUrl: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Arenă Acasă</label>
                  <input
                    type="text"
                    value={teamForm.homeArena}
                    onChange={(e) => setTeamForm({ ...teamForm, homeArena: e.target.value })}
                    className="input text-xs w-full"
                    placeholder="Ex: Arena Banat"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Așezare / Tactică</label>
                  <select
                    value={teamForm.formation}
                    onChange={(e) => setTeamForm({ ...teamForm, formation: e.target.value })}
                    className="input text-xs w-full"
                  >
                    <option value="4-3-3">4-3-3</option>
                    <option value="4-4-2">4-4-2</option>
                    <option value="3-5-2">3-5-2</option>
                    <option value="5-3-2">5-3-2</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-label font-bold uppercase text-[10px] text-slate-400">Descriere / Despre Club</label>
                  <textarea
                    rows={2}
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    className="input text-xs w-full p-2.5"
                    placeholder="Informații suplimentare despre echipă..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="btn btn-secondary text-xs uppercase font-bold py-2.5 px-4 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="btn btn-primary text-xs uppercase font-bold py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  {savingAction && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  <span>{editingTeam ? "Salvează Echipa" : "Creează Echipa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MOVE TEAM TO ANOTHER CHAMPIONSHIP */}
      {/* ========================================================================= */}
      {moveTeamModalOpen && moveTeamTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-lime-400">swap_horiz</span>
              <h3 className="text-lg font-headline font-black text-slate-900 dark:text-white">
                Mută Echipa în Alt Campionat
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mută <strong>&ldquo;{moveTeamTarget.name}&rdquo;</strong> din campionatul curent (<em>{moveTeamTarget.championship?.name}</em>) în altă competiție:
            </p>

            <form onSubmit={handleConfirmMoveTeam} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-label font-bold uppercase text-[10px] text-slate-400">
                  Selectează Noul Campionat Destinație
                </label>
                <select
                  required
                  value={targetChampForMove}
                  onChange={(e) => setTargetChampForMove(e.target.value)}
                  className="input text-xs w-full font-bold"
                >
                  {championships.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport}) {c.id === moveTeamTarget.championshipId ? "• [Curent]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveTeamModalOpen(false)}
                  className="btn btn-secondary text-xs uppercase font-bold py-2 px-3 rounded-xl"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="btn btn-primary text-xs uppercase font-bold py-2 px-4 rounded-xl"
                >
                  {savingAction ? "Se mută..." : "Confirmă Mutarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW & MANAGE ROSTER PLAYERS */}
      {/* ========================================================================= */}
      {playersModalOpen && playersModalTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="card w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: playersModalTeam.color ? `${playersModalTeam.color}20` : undefined }}
                >
                  {playersModalTeam.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={playersModalTeam.logoUrl} alt={playersModalTeam.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-headline font-bold text-xs">
                      {playersModalTeam.shortName || playersModalTeam.name.slice(0, 3)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-headline font-black text-slate-900 dark:text-white">
                    Lot Jucători: {playersModalTeam.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-label">
                    {playersModalTeam.championship?.name} • {playersModalTeam.players?.length || 0} sportivi înregistrați
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlayersModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Players list */}
            {(!playersModalTeam.players || playersModalTeam.players.length === 0) ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-3xl">groups</span>
                <p className="text-xs">Această echipă nu are încă jucători înscriși în lot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Nr.</th>
                      <th className="py-2.5 px-3">Nume Jucător</th>
                      <th className="py-2.5 px-3">Poziție</th>
                      <th className="py-2.5 px-3 text-center">Goluri</th>
                      <th className="py-2.5 px-3 text-center">Pase</th>
                      <th className="py-2.5 px-3 text-center">Cartonașe</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                    {playersModalTeam.players.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">
                          #{p.number || "-"}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {p.position || "Jucător"}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-lime-600 dark:text-lime-400">
                          {p.goals}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400">
                          {p.assists}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-amber-500 font-bold">{p.yellowCards}G</span>
                          {" / "}
                          <span className="text-red-500 font-bold">{p.redCards}R</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-600 dark:text-lime-400 text-[10px] font-bold">
                            {p.status || "activ"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPlayersModalOpen(false)}
                className="btn btn-secondary text-xs uppercase font-bold py-2 px-4 rounded-xl"
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
