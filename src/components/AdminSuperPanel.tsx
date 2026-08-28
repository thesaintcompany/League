"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getCurrentSeasonYear, getAutoSeasonYear } from "@/lib/season";

export type AdminTab =
  | "branding"
  | "api_integrations"
  | "users"
  | "analytics"
  | "login_history"
  | "venues"
  | "data_export";

interface VenueItem {
  id: string;
  name: string;
  location: string;
  address?: string | null;
  specs?: string | null;
  sport: string;
  surface: string;
  capacity: number;
  floodlights: boolean;
  isActive: boolean;
  isDemo: boolean;
  pricePerHour?: number | null;
  imageUrl?: string | null;
}

interface UserItem {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  phone?: string | null;
  image?: string | null;
  isActive?: boolean;
  signupIp?: string | null;
  refereeBadge?: string | null;
  createdAt: string;
  _count?: {
    championships: number;
    venues: number;
  };
}

interface LoginLogItem {
  id: string;
  userName: string;
  userEmail: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: "success" | "blocked" | "2fa";
  action: string;
}

export function AdminSuperPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams?.get("tab") as AdminTab | null;

  const [activeTab, setActiveTab] = useState<AdminTab>(queryTab || "branding");
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [demoFilter, setDemoFilter] = useState<"all" | "demo" | "real">("all");
  const [activatingVenues, setActivatingVenues] = useState(false);

  // Logo & Branding State
  const [activeLogoUrl, setActiveLogoUrl] = useState<string>("/images/logos/logo-1.png");
  const [customLogoInput, setCustomLogoInput] = useState<string>("");
  const [savingLogo, setSavingLogo] = useState(false);
  const [appName, setAppName] = useState("PRO LIGUE ROMANIA");
  const [appSlogan, setAppSlogan] = useState("Platforma Națională de Competiții Sportive & Arbitraj  ");

  // Demo Data & Export State
  const [demoStats, setDemoStats] = useState<{
    isDemoActive: boolean;
    demoChampionshipsCount: number;
    totalChampionshipsCount: number;
    totalVenuesCount: number;
    realUsersCount: number;
    demoUsersCount: number;
    totalMatchesCount: number;
    totalPlayersCount: number;
  } | null>(null);
  const [togglingDemo, setTogglingDemo] = useState(false);

  // Ticketing, Legal & Payment Settings State
  const [ticketSettings, setTicketSettings] = useState({
    companyName: "TSC Q -  ligue.ro",
    companyCui: "53063735",
    companyRegCom: "J2025095153006",
    companyAddress: "Timișoara, Județul Timiș, România",
    companyEmail: "contact@ ligue.ro",
    companyPhone: "+40 700 000 000",
    platformFeePercent: 10.0,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalClientId: "",
    applePayMerchantId: "merchant.ro.buu.league",
    applePayDomainVerified: true,
    applePayEnabled: true,
    googlePayMerchantId: "buu-ro-league-pay",
    googlePayEnvironment: "PRODUCTION",
    googlePayEnabled: true,
    payoutMinThreshold: 100,
    seasonYear: 2027,
    seasonMode: "auto",
  });
  const [ticketStats, setTicketStats] = useState({
    totalTicketsSold: 0,
    totalGrossRevenue: 0,
    totalPlatformFees: 0,
    totalOrganizerPayouts: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Audit Logs State
  const [logFilter, setLogFilter] = useState("all");
  const [loginLogs] = useState<LoginLogItem[]>([
    {
      id: "log-1",
      userName: "Super Administrator",
      userEmail: "admin@league.ro",
      role: "super_admin",
      ip: "86.120.45.19",
      location: "Timișoara, RO",
      device: "Chrome 122 (Windows 11)",
      timestamp: "2026-08-26 12:35",
      status: "success",
      action: "Autentificare Sesiune Master SuperAdmin",
    },
    {
      id: "log-2",
      userName: "Bogdan Stanciu",
      userEmail: "bogdan.ref@league.ro",
      role: "referee",
      ip: "188.24.112.5",
      location: "București, RO",
      device: "Safari 17 (iPhone 15 Pro)",
      timestamp: "2026-08-26 11:42",
      status: "success",
      action: "Validare Raport Meci (VAR & Arbitraj)",
    },
    {
      id: "log-3",
      userName: "Radu Popa",
      userEmail: "radu.popa@gmail.com",
      role: "organizer",
      ip: "82.77.190.22",
      location: "Cluj-Napoca, RO",
      device: "Firefox 123 (macOS)",
      timestamp: "2026-08-26 10:15",
      status: "success",
      action: "Generare Arbore Eliminatoriu cu Zaruri",
    },
    {
      id: "log-4",
      userName: "Necunoscut (Robot)",
      userEmail: "bot@security-crawler.test",
      role: "guest",
      ip: "45.134.21.99",
      location: "Frankfurt, DE",
      device: "Python-requests/2.31",
      timestamp: "2026-08-26 09:04",
      status: "blocked",
      action: "Tentativă acces neautorizat blocată de WAF",
    },
    {
      id: "log-5",
      userName: "Alexandru Munteanu",
      userEmail: "alex.arena@arena-timis.ro",
      role: "arena_owner",
      ip: "86.120.10.88",
      location: "Timișoara, RO",
      device: "Edge 122 (Windows 10)",
      timestamp: "2026-08-26 08:20",
      status: "success",
      action: "Actualizare Tarif Nocturnă Arenă",
    },
  ]);

  // Edit / Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "Timișoara",
    address: "",
    specs: "",
    sport: "fotbal",
    surface: "Sintetic",
    capacity: 200,
    floodlights: true,
    pricePerHour: 150,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // WordPress-style User Management States
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "organizer",
    isActive: true,
  });
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [userAccountTypeFilter, setUserAccountTypeFilter] = useState<"all" | "real" | "demo">("all");
  const [togglingDemoUsers, setTogglingDemoUsers] = useState(false);
  const [newSuperAdminPassModal, setNewSuperAdminPassModal] = useState<string | null>(null);

  function isDemoUser(email: string) {
    return (
      email.endsWith("@leaguehub.local") ||
      email.endsWith("@league.local")
    );
  }

  async function handleRevokeAllDemo() {
    const confirmed = confirm(
      "ANULARE DREPTURI USERI DEMO & PRECOMPLETARE LOGIN\n\n" +
      "Ești sigur că dorești să execuți această acțiune?\n\n" +
      "1. Toți utilizatorii demo vor fi DEZACTIVAȚI definitv.\n" +
      "2. Precompletarea conturilor demo pe pagina de autentificare va fi ELIMINATĂ.\n" +
      "3. SuperAdmin NU va fi anulat/dezactivat, dar i se va genera o NOUĂ PAROLĂ securizată!\n\n" +
      "Apasă OK pentru a anula accesul demo."
    );
    if (!confirmed) return;

    setTogglingDemoUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_all_demo" }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Drepturile demo au fost anulate cu succes!");
        if (data.newSuperAdminPassword) {
          setNewSuperAdminPassModal(data.newSuperAdminPassword);
        }
        loadData();
      } else {
        alert(data.error || "Eroare la anularea drepturilor demo.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingDemoUsers(false);
    }
  }

  async function handleBulkDemoUsers(action: "deactivate" | "activate") {
    const isDeactivate = action === "deactivate";
    const confirmed = confirm(
      isDeactivate
        ? "Sigur dorești să DEZACTIVEZI toți utilizatorii demo?\n\n" +
        "Conturile demonstrative vor fi marcate ca DEZACTIVATE și nu se vor mai putea autentifica.\n\n" +
        " Utilizatorii reali și arenele NU sunt afectați!"
        : "Sigur dorești să REACTIVEZI toți utilizatorii demo?"
    );
    if (!confirmed) return;

    setTogglingDemoUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isDeactivate ? "deactivate_all_demo" : "activate_all_demo",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Operațiune realizată cu succes!");
        loadData();
      } else {
        alert(data.error || "Eroare la actualizarea utilizatorilor demo.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingDemoUsers(false);
    }
  }

  // Sync tab with URL query parameter
  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab, activeTab]);

  function switchTab(tab: AdminTab) {
    setActiveTab(tab);
    router.push(`/dashboard/admin?tab=${tab}`, { scroll: false });
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vRes, uRes, sRes, dRes] = await Promise.all([
        fetch("/api/admin/venues"),
        fetch("/api/admin/users"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/demo-data"),
      ]);
      const vData = await vRes.json();
      const uData = await uRes.json();
      const sData = await sRes.json();
      const dData = await dRes.json();
      if (vData.venues) setVenues(vData.venues);
      if (uData.users) setUsers(uData.users);
      if (sData.settings) {
        setTicketSettings(sData.settings);
        if (sData.settings.activeLogoUrl) {
          setActiveLogoUrl(sData.settings.activeLogoUrl);
        }
        if (sData.stats) setTicketStats(sData.stats);
        if (sData.recentTransactions) setRecentTransactions(sData.recentTransactions);
      }
      if (!dData.error) {
        setDemoStats(dData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectLogo(url: string) {
    setSavingLogo(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeLogoUrl: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveLogoUrl(url);
        window.dispatchEvent(new CustomEvent("app-logo-updated", { detail: { logoUrl: url } }));
        showToast("Logo-ul principal al platformei a fost actualizat pe tot site-ul! ");
      } else {
        alert(data.error || "Eroare la actualizarea logo-ului.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLogo(false);
    }
  }

  async function handleSaveSeasonSettings(mode: string, year: number) {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasonMode: mode, seasonYear: year }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicketSettings((prev: any) => ({ ...prev, seasonMode: mode, seasonYear: year }));
        const activeYear = getCurrentSeasonYear(year, mode);
        window.dispatchEvent(new CustomEvent("app-season-updated", { detail: { seasonYear: activeYear } }));
        showToast(`Sezonul a fost actualizat: SEZON ${activeYear}!`);
      } else {
        alert(data.error || "Eroare la salvarea sezonului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleDemo(action: "activate" | "deactivate") {
    if (action === "deactivate") {
      const confirmed = confirm(
        "Sigur dorești să dezactivezi datele demo?\n\n" +
        "Această acțiune va șterge campionatele, echipele și meciurile demonstrative.\n\n" +
        "GARANȚIE: La fiecare update se sterge baza de date, asadar datele demo se vor pierde automat!"
      );
      if (!confirmed) return;
    }
    setTogglingDemo(true);
    try {
      const res = await fetch("/api/admin/demo-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Operațiunea a fost executată cu succes! ");
        loadData();
      } else {
        alert(data.error || "Eroare la procesarea cererii.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingDemo(false);
    }
  }

  function handleExportUsers(format: "json" | "csv") {
    window.open(`/api/admin/export-users?format=${format}&type=real`, "_blank");
    showToast(`Fișierul de export utilizatori (${format.toUpperCase()}) a fost descărcat! `);
  }

  async function handleSaveTicketSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketSettings),
      });
      if (res.ok) {
        showToast("Setările API și comisionul au fost salvate cu succes! ");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openCreateModal() {
    setEditingVenue(null);
    setForm({
      name: "",
      location: "Timișoara",
      address: "",
      specs: "",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 200,
      floodlights: true,
      pricePerHour: 150,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    });
    setModalOpen(true);
  }

  function openEditModal(v: VenueItem) {
    setEditingVenue(v);
    setForm({
      name: v.name,
      location: v.location,
      address: v.address || "",
      specs: v.specs || "",
      sport: v.sport || "fotbal",
      surface: v.surface || "Sintetic",
      capacity: v.capacity || 100,
      floodlights: v.floodlights,
      pricePerHour: v.pricePerHour ?? 150,
      isActive: v.isActive,
      imageUrl: v.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    });
    setModalOpen(true);
  }

  async function handleSaveVenue(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVenue) {
        const res = await fetch(`/api/admin/venues/${editingVenue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast(`Arena "${form.name}" a fost actualizată! `);
          setModalOpen(false);
          loadData();
        }
      } else {
        const res = await fetch(`/api/admin/venues`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast(`Arena "${form.name}" a fost adăugată în baza de date! `);
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(v: VenueItem) {
    try {
      const res = await fetch(`/api/admin/venues/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      if (res.ok) {
        showToast(`Statutul arenei "${v.name}" a fost schimbat în ${!v.isActive ? "ACTIV" : "INACTIV"}`);
        setVenues(venues.map((item) => (item.id === v.id ? { ...item, isActive: !item.isActive } : item)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteVenue(v: VenueItem) {
    if (v.isDemo) {
      showToast(`Arena demo "${v.name}" este protejată de ștergere. Nu poate fi eliminată.`);
      return;
    }
    if (!confirm(`Sigur dorești să ștergi arena "${v.name}"? Această acțiune este ireversibilă.`)) return;
    try {
      const res = await fetch(`/api/admin/venues/${v.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Arena "${v.name}" a fost ștearsă.`);
        setVenues(venues.filter((item) => item.id !== v.id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResetDemoVenue(v: VenueItem) {
    if (!v.isDemo) return;
    if (!confirm(`Resetare arenă demo "${v.name}" la valorile implicite de bază? Pământul, specificațiile și setările vor reveni la starea inițială.`)) return;
    try {
      const res = await fetch(`/api/admin/venues/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToDefaults: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`Arena demo "${v.name}" a fost resetată.`);
        setVenues(venues.map((item) => (item.id === v.id ? { ...item, ...data.venue } : item)));
      } else {
        showToast(data.error || "Eroare la resetarea arenei.");
      }
    } catch (err) {
      console.error(err);
      showToast("Eroare de rețea la resetarea arenei.");
    }
  }

  async function handleBulkActivateVenues() {
    if (!confirm("Sigur dorești să activezi și să faci 100% vizibile toate arenele din platformă?")) return;
    setActivatingVenues(true);
    try {
      const res = await fetch("/api/admin/venues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate_all" }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Toate arenele au fost activate și făcute vizibile!");
        setVenues((prev) => prev.map((v) => ({ ...v, isActive: true })));
      } else {
        showToast(data.error || "Eroare la activarea arenelor.");
      }
    } catch (err) {
      console.error(err);
      showToast("Eroare de rețea la activarea arenelor.");
    } finally {
      setActivatingVenues(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        showToast(`Rolul utilizatorului a fost actualizat la "${newRole}"! `);
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // WordPress-style User Management Actions
  async function handleToggleUserStatus(u: UserItem) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, action: "toggle_status" }),
      });
      const data = await res.json();
      if (res.ok) {
        const newStatus = !u.isActive;
        showToast(data.message || `Statutul utilizatorului ${u.email} a fost schimbat! `);
        setUsers(users.map((item) => (item.id === u.id ? { ...item, isActive: newStatus } : item)));
      } else {
        alert(data.error || "Eroare la schimbarea statusului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function openEditUserModal(u: UserItem) {
    setSelectedUser(u);
    setEditUserForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "organizer",
      isActive: u.isActive ?? true,
    });
    setEditUserModalOpen(true);
  }

  async function handleSaveEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "edit_user",
          ...editUserForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Datele utilizatorului ${editUserForm.email} au fost actualizate! `);
        setEditUserModalOpen(false);
        setUsers(
          users.map((item) =>
            item.id === selectedUser.id
              ? {
                ...item,
                name: editUserForm.name,
                email: editUserForm.email,
                phone: editUserForm.phone,
                role: editUserForm.role,
                isActive: editUserForm.isActive,
              }
              : item
          )
        );
      } else {
        alert(data.error || "Eroare la salvarea datelor.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  }

  function openResetPassModal(u: UserItem) {
    setSelectedUser(u);
    setNewPasswordVal("");
    setResetPassModalOpen(true);
  }

  async function handleResetPassSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPasswordVal.trim().length < 6) {
      alert("Parola nouă trebuie să aibă minim 6 caractere.");
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "reset_password",
          password: newPasswordVal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Parola utilizatorului ${selectedUser.email} a fost resetată! `);
        setResetPassModalOpen(false);
      } else {
        alert(data.error || "Eroare la resetarea parolei.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  }

  async function handleDeleteUser(u: UserItem) {
    const confirmed = confirm(
      `Atenție: Sigur dorești să ștergi definitiv utilizatorul "${u.email}" (${u.name || "Fără nume"})?\n\n` +
      "Această acțiune este IREVERSIBILĂ ca în WordPress admin!"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${u.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(`Utilizatorul ${u.email} a fost șters din platformă.`);
        setUsers(users.filter((item) => item.id !== u.id));
      } else {
        alert(data.error || "Eroare la ștergerea utilizatorului.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const matchesSport = sportFilter === "all" || v.sport === sportFilter;
    const matchesDemo =
      demoFilter === "all" ||
      (demoFilter === "demo" && v.isDemo) ||
      (demoFilter === "real" && !v.isDemo);
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      (v.address && v.address.toLowerCase().includes(q));
    return matchesSport && matchesQuery && matchesDemo;
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    const isDemo = isDemoUser(u.email);
    const matchesType =
      userAccountTypeFilter === "all" ||
      (userAccountTypeFilter === "demo" && isDemo) ||
      (userAccountTypeFilter === "real" && !isDemo);
    const q = userSearchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchesRole && matchesType && matchesQuery;
  });

  const filteredLogs = loginLogs.filter((log) => {
    if (logFilter === "all") return true;
    return log.status === logFilter;
  });

  return (
    <div className="space-y-8 font-body">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-950 text-white border border-lime-400/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-lime-400">verified</span>
          <span className="text-xs font-bold font-label">{toast}</span>
        </div>
      )}

      {/* Content Tabs (Navigation controlled exclusively by Left Sidebar) */}

      {/* ========================================================================= */}
      {/* 1. BRANDING & APPLICATION SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === "branding" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Banner */}
          <div className="card p-6 bg-slate-950 text-white border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                    SUPERADMIN BRANDING • SETĂRI APLICAȚIE &amp; LOGO
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-headline uppercase tracking-tight text-white">
                  Identitate Vizuală &amp; Logo Principal
                </h2>
                <p className="text-xs text-slate-300 font-body max-w-2xl">
                  Selectează logo-ul   al platformei sau introdu un URL extern. Modificarea este salvată <strong>în timp real în baza de date</strong> și actualizată instantaneu pe tot site-ul.
                </p>
              </div>

              {/* Current Active Logo */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center p-1 border border-lime-400/40 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeLogoUrl}
                    alt="Active Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-label font-bold uppercase tracking-widest text-lime-400 block">
                    Logo Activ Live
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[180px] block font-mono">
                    {activeLogoUrl.split("/").pop()}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Header Preview */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-label font-bold uppercase text-slate-400 tracking-wider">
                  <span className="material-symbols-outlined text-sm">search</span> Previzualizare Antet Public (Live Demo):
                </span>
                <span className="text-[10px] font-mono text-lime-400 font-bold">
                  Sincronizat automat
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 px-6 py-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeLogoUrl}
                    alt="Live Header Preview"
                    className="h-9 w-auto object-contain"
                  />
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-lime-400/30 text-[10px] text-lime-400 font-label font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                    EDIȚIA NAȚIONALĂ {getCurrentSeasonYear(ticketSettings.seasonYear, ticketSettings.seasonMode)}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-label">
                  <span className="text-white font-bold">Campionate</span>
                  <span>•</span>
                  <span>Meciuri</span>
                  <span>•</span>
                  <span>Arene</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configurare Sezon Competițional (Automat / Manual) */}
          <div className="card p-6 bg-surface-container-lowest border rounded-3xl space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                  <span className="material-symbols-outlined align-middle text-base">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                    Configurare Sezon Competițional
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    Setează dacă sezonul se actualizează automat după timp sau este fixat manual de SuperAdmin.
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-slate-950 text-lime-400 font-black text-xs uppercase font-label border border-lime-400/40 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                <span>SEZON ACTIV LIVE: {getCurrentSeasonYear(ticketSettings.seasonYear, ticketSettings.seasonMode)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opțiunea Automat */}
              <div
                onClick={() => {
                  const newMode = "auto";
                  handleSaveSeasonSettings(newMode, ticketSettings.seasonYear || 2027);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${ticketSettings.seasonMode === "auto"
                    ? "bg-lime-400/10 border-lime-400 shadow-md ring-2 ring-lime-400/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lime-500 text-xl">schedule</span>
                    <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                      Mod Automat (În funcție de timp)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="adminSeasonMode"
                    checked={ticketSettings.seasonMode === "auto"}
                    onChange={() => handleSaveSeasonSettings("auto", ticketSettings.seasonYear || 2027)}
                    className="text-lime-500 focus:ring-lime-400"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                  Calculează automat anul sezonului după calendar. Trecerea la anul următor (N+1) se face automat în noiembrie a fiecărui an (Sezon calculat: <strong>{getAutoSeasonYear()}</strong>).
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400">
                    {ticketSettings.seasonMode === "auto" ? "Activ în acest moment" : "Click pentru activare mod automat"}
                  </span>
                </div>
              </div>

              {/* Opțiunea Manual */}
              <div
                onClick={() => {
                  if (ticketSettings.seasonMode !== "manual") {
                    handleSaveSeasonSettings("manual", ticketSettings.seasonYear || 2027);
                  }
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${ticketSettings.seasonMode === "manual"
                    ? "bg-lime-400/10 border-lime-400 shadow-md ring-2 ring-lime-400/40"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lime-500 text-xl">tune</span>
                    <span className="font-headline font-bold text-sm text-slate-900 dark:text-white">
                      Mod Manual (Setare SuperAdmin)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="adminSeasonMode"
                    checked={ticketSettings.seasonMode === "manual"}
                    onChange={() => handleSaveSeasonSettings("manual", ticketSettings.seasonYear || 2027)}
                    className="text-lime-500 focus:ring-lime-400"
                  />
                </div>

                <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block">
                    Alege Anul Sezonului:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="2020"
                      max="2099"
                      value={ticketSettings.seasonYear}
                      onChange={(e) => {
                        const newYear = parseInt(e.target.value) || 2027;
                        setTicketSettings((prev: any) => ({ ...prev, seasonYear: newYear }));
                      }}
                      className="input text-xs font-mono font-bold w-32"
                      placeholder="2027"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSeasonSettings("manual", ticketSettings.seasonYear || 2027)}
                      className="btn btn-primary text-[11px] py-1.5 px-3 rounded-lg uppercase tracking-wider font-bold"
                    >
                      Aplică An
                    </button>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400">
                    {ticketSettings.seasonMode === "manual" ? `Manual activ: SEZON ${ticketSettings.seasonYear}` : "Click pentru forțare manuală"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: "logo-1",
                title: "Varianta 1 • PRO LIGUE - ROMÂNIA (Principal)",
                subtitle: "Logo-ul cu Fulger & Neon Green",
                url: "/images/logos/logo-1.png",
                badge: "Principal • HD Transparent",
                badgeColor: "bg-lime-400/20 text-lime-400 border-lime-400/30",
                description:
                  "Logo-ul PRO LIGUE ROMANIA cu font futuristic, vortex dinamic, fulger auriu și detalii de impact pentru header.",
              },
              {
                id: "logo-3",
                title: "Varianta 2 • Neon Vortex & Gold Flash",
                subtitle: "Ediția Glow & Energie Electrică",
                url: "/images/logos/logo-3.png",
                badge: "Glow Electric",
                badgeColor: "bg-lime-400/20 text-lime-400 border-lime-400/30",
                description:
                  "Energie pură cu glow verde neon, minge iluminată electric și fulger integrat pentru prezență spectaculoasă.",
              },
            ].map((logoItem) => {
              const isSelected = activeLogoUrl === logoItem.url;

              return (
                <div
                  key={logoItem.id}
                  className={`card p-6 bg-surface-container-lowest border rounded-3xl transition-all duration-300 flex flex-col justify-between space-y-6 ${isSelected
                    ? "border-lime-500 ring-4 ring-lime-500/20 shadow-xl dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm"
                    }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label uppercase tracking-wider border mb-1.5 ${logoItem.badgeColor}`}
                        >
                          {logoItem.badge}
                        </span>
                        <h3 className="font-headline font-black text-base text-slate-900 dark:text-white leading-tight">
                          {logoItem.title}
                        </h3>
                      </div>

                      {isSelected && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase font-label tracking-wider shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          ACTIV LIVE
                        </span>
                      )}
                    </div>

                    {/* Dark Preview */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-label font-bold uppercase text-slate-400">
                        Pe fundal Dark (Noapte):
                      </span>
                      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center min-h-[110px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoItem.url}
                          alt={logoItem.title}
                          className="max-h-14 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>

                    {/* Light Preview */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-label font-bold uppercase text-slate-400">
                        Pe fundal Light (Zi):
                      </span>
                      <div className="p-5 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center min-h-[110px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoItem.url}
                          alt={logoItem.title}
                          className="max-h-14 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-body leading-relaxed">
                      {logoItem.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={savingLogo || isSelected}
                    onClick={() => handleSelectLogo(logoItem.url)}
                    className={`w-full py-3 px-4 rounded-2xl font-headline font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${isSelected
                      ? "bg-lime-400 text-slate-950 cursor-default opacity-100 shadow-lime-400/20 ring-2 ring-lime-400"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-lime-400 dark:hover:text-slate-950 active:scale-95"
                      }`}
                  >
                    {isSelected ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Logo Principal Activ</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">touch_app</span>
                        <span>{savingLogo ? "Se aplică..." : "Alege ca Logo Principal"}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Custom Logo URL & Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-600 dark:text-lime-400">link</span>
                <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                  URL Logo Personalizat (Extern)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Poți încărca un logo propriu pe un server extern sau CDN și să introduci adresa direct:
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customLogoInput.trim()) {
                    handleSelectLogo(customLogoInput.trim());
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="url"
                  placeholder="https://domeniu.ro/logo-custom.png"
                  value={customLogoInput}
                  onChange={(e) => setCustomLogoInput(e.target.value)}
                  className="input text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={savingLogo || !customLogoInput.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  {savingLogo ? "Se salvează..." : "Aplică"}
                </button>
              </form>
            </div>

            <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">settings_applications</span>
                <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                  Nume Aplicație &amp; Titlu
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Titlu Aplicație
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Slogan / Subtitlu
                  </label>
                  <input
                    type="text"
                    value={appSlogan}
                    onChange={(e) => setAppSlogan(e.target.value)}
                    className="input text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Legale & Identitate Fiscală Operator (   ligue.ro) */}
          <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  <span className="material-symbols-outlined text-lg">domain</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                    Date Legale &amp; Identitate Fiscală Operator (   ligue.ro)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-label">
                    Informațiile  e ale entității juridice care operează platforma, facturile de ticketing și termenii legali.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase border border-blue-500/20">
                Operator  :    ligue.ro
              </span>
            </div>

            <form onSubmit={handleSaveTicketSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Denumire Societate / Operator *
                  </label>
                  <input
                    type="text"
                    value={ticketSettings.companyName || "TSC Q -  ligue.ro"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyName: e.target.value })}
                    className="input text-xs font-bold"
                    placeholder="TSC Q -  ligue.ro"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Cod Unic Înregistrare (CUI / CIF) *
                  </label>
                  <input
                    type="text"
                    value={ticketSettings.companyCui || "53063735"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyCui: e.target.value })}
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
                    value={ticketSettings.companyRegCom || "J2025095153006"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyRegCom: e.target.value })}
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
                    value={ticketSettings.companyEmail || "contact@ ligue.ro"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyEmail: e.target.value })}
                    className="input text-xs font-mono"
                    placeholder="contact@ ligue.ro"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Telefon Asistență
                  </label>
                  <input
                    type="tel"
                    value={ticketSettings.companyPhone || "+40 700 000 000"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyPhone: e.target.value })}
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
                    value={ticketSettings.companyAddress || "Timișoara, Județul Timiș, România"}
                    onChange={(e) => setTicketSettings({ ...ticketSettings, companyAddress: e.target.value })}
                    className="input text-xs font-medium"
                    placeholder="Timișoara, Județul Timiș, România"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{savingSettings ? "Se salvează..." : "Salvează Date Legale Operator"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. API INTEGRATIONS & PAYMENT GATEWAYS TAB */}
      {/* ========================================================================= */}
      {activeTab === "api_integrations" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Card */}
          <div className="card p-6 bg-slate-950 text-white border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                    SUPERADMIN API • INTEGRARE PLĂȚI &amp; WEBHOOKS
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-headline uppercase tracking-tight text-white">
                  Module de Plată (Stripe, Apple Pay, Google Pay)
                </h2>
                <p className="text-xs text-slate-300 font-body max-w-2xl">
                  Configurează conexiunile securizate cu procesatorii de plăți și portofelele mobile integrate nativ în platformă.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Gateways Active: Stripe &bull; Apple Pay &bull; Google Pay
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-label font-bold uppercase text-slate-400 block">
                  Total Bilete Vândute
                </span>
                <span className="text-2xl font-black data-font text-white">
                  {ticketStats.totalTicketsSold}
                </span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-label font-bold uppercase text-slate-400 block">
                  Venituri Brute
                </span>
                <span className="text-2xl font-black data-font text-lime-400">
                  {ticketStats.totalGrossRevenue.toLocaleString("ro-RO")} RON
                </span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-label font-bold uppercase text-slate-400 block">
                  Comisioane Încasate ({ticketSettings.platformFeePercent}%)
                </span>
                <span className="text-2xl font-black data-font text-amber-400">
                  {ticketStats.totalPlatformFees.toLocaleString("ro-RO")} RON
                </span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-label font-bold uppercase text-slate-400 block">
                  Plăți Organizatori
                </span>
                <span className="text-2xl font-black data-font text-blue-400">
                  {ticketStats.totalOrganizerPayouts.toLocaleString("ro-RO")} RON
                </span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSaveTicketSettings} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modul 1: Stripe API Credentials */}
              <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl material-symbols-outlined">payments</span>
                    <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                      Modul Stripe (Carduri 3D Secure)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold font-mono">
                    PSD2 Compliant
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                      Stripe Publishable Key (Cheie Publică)
                    </label>
                    <input
                      type="text"
                      placeholder="pk_live_51..."
                      value={ticketSettings.stripePublishableKey || ""}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, stripePublishableKey: e.target.value })
                      }
                      className="input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-label font-bold uppercase text-slate-400">
                        Stripe Secret Key (Cheie Secretă)
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
                      value={ticketSettings.stripeSecretKey || ""}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, stripeSecretKey: e.target.value })
                      }
                      className="input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                      Stripe Webhook Secret (whsec_...)
                    </label>
                    <input
                      type="text"
                      placeholder="whsec_..."
                      value={ticketSettings.stripeWebhookSecret || ""}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, stripeWebhookSecret: e.target.value })
                      }
                      className="input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modul 2: Apple Pay Integration */}
              <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl material-symbols-outlined">apple</span>
                    <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                      Modul Apple Pay (iOS &amp; Safari)
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticketSettings.applePayEnabled}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, applePayEnabled: e.target.checked })
                      }
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
                      value={ticketSettings.applePayMerchantId || "merchant.ro.buu.league"}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, applePayMerchantId: e.target.value })
                      }
                      className="input text-xs font-mono"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label font-bold text-slate-700 dark:text-slate-300">
                        Domeniu Web Verificat:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                        spligue.ro (Verificat)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-body">
                      Fișierul <code>/.well-known/apple-developer-merchantid-domain-association</code> este configurat automat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modul 3: Google Pay Integration */}
              <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl material-symbols-outlined">circle</span>
                    <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                      Modul Google Pay (Android &amp; Chrome)
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ticketSettings.googlePayEnabled}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, googlePayEnabled: e.target.checked })
                      }
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
                        value={ticketSettings.googlePayMerchantId || "buu-ro-league-pay"}
                        onChange={(e) =>
                          setTicketSettings({ ...ticketSettings, googlePayMerchantId: e.target.value })
                        }
                        className="input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                        Mediu Tranzacții
                      </label>
                      <select
                        value={ticketSettings.googlePayEnvironment || "PRODUCTION"}
                        onChange={(e) =>
                          setTicketSettings({ ...ticketSettings, googlePayEnvironment: e.target.value })
                        }
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

              {/* Modul 4: PayPal & Comisioane */}
              <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-2xl material-symbols-outlined">payments</span>
                  <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                    PayPal &amp; Comisioane Platformă
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                      PayPal Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="client_id_..."
                      value={ticketSettings.paypalClientId || ""}
                      onChange={(e) =>
                        setTicketSettings({ ...ticketSettings, paypalClientId: e.target.value })
                      }
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
                        value={ticketSettings.platformFeePercent}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
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
                        value={ticketSettings.payoutMinThreshold}
                        onChange={(e) =>
                          setTicketSettings({
                            ...ticketSettings,
                            payoutMinThreshold: parseInt(e.target.value) || 100,
                          })
                        }
                        className="input text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Endpoints Box */}
              <div className="card p-6 bg-surface-container-lowest border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl material-symbols-outlined">link</span>
                  <h3 className="font-headline font-black text-base text-slate-900 dark:text-white uppercase">
                    Webhook Endpoints Active
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] flex justify-between items-center">
                    <span className="truncate">https://spligue.ro/api/webhooks/stripe</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      Stripe Live
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] flex justify-between items-center">
                    <span className="truncate">https://spligue.ro/api/webhooks/paypal</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      PayPal Live
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>{savingSettings ? "Se salvează..." : "Salvează Setările API & Plăți"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERMISSIONS & USERS RBAC TAB */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Permissions Matrix Overview */}
          <div className="card p-6 bg-slate-950 text-white border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400 block mb-1">
                  SUPERADMIN RBAC • CONTROL PERMISIUNI &amp; ROLURI
                </span>
                <h2 className="text-xl font-black font-headline uppercase text-white">
                  Matricea de Roluri și Drepturi de Acces
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Bulk Demo Users Actions */}
                <button
                  type="button"
                  disabled={togglingDemoUsers}
                  onClick={handleRevokeAllDemo}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-headline font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-400/50 flex items-center gap-1.5 transition active:scale-95"
                  title="Anulează definitiv toate drepturile demo, oprește precompletarea pe login și securizează parola SuperAdmin"
                >
                  <span className="material-symbols-outlined text-sm">no_accounts</span>
                  <span>{togglingDemoUsers ? "Se procesează..." : "Anulează Drepturi Demo & Precompletare"}</span>
                </button>

                <button
                  type="button"
                  disabled={togglingDemoUsers}
                  onClick={() => handleBulkDemoUsers("deactivate")}
                  className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-500/30 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Dezactivează toate conturile demo din sistem"
                >
                  <span className="material-symbols-outlined text-sm">block</span>
                  <span>{togglingDemoUsers ? "Se procesează..." : "Dezactivează Useri Demo"}</span>
                </button>
                <button
                  type="button"
                  disabled={togglingDemoUsers}
                  onClick={() => handleBulkDemoUsers("activate")}
                  className="px-3.5 py-2 bg-lime-400/10 hover:bg-lime-400/20 text-lime-600 dark:text-lime-400 text-xs font-bold rounded-xl border border-lime-400/30 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Reactivează toate conturile demo"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Activează Useri Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportUsers("csv")}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-sm text-lime-400">table_chart</span>
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportUsers("json")}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <span className="material-symbols-outlined text-sm text-lime-400">data_object</span>
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              {[
                { role: "super_admin", label: "SuperAdmin", desc: "Acces Total Platformă", color: "bg-red-500/20 text-red-400 border-red-500/30" },
                { role: "organizer", label: "Organizator", desc: "Campionate & Meciuri", color: "bg-lime-500/20 text-lime-400 border-lime-500/30" },
                { role: "referee", label: "Arbitru", desc: "VAR & Rapoarte Meci", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
                { role: "arena_owner", label: "Proprietar", desc: "Disponibilitate Teren", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                { role: "team_leader", label: "Manager Echipă", desc: "Lot & Înscrieri", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                { role: "player", label: "Jucător", desc: "Profil & Statistici", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
              ].map((r) => (
                <div key={r.role} className={`p-3 rounded-2xl border ${r.color}`}>
                  <span className="font-bold block uppercase text-[11px]">{r.label}</span>
                  <span className="text-[10px] opacity-80 block">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Account Type Filters (Real vs Demo) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mr-2">
                <button
                  type="button"
                  onClick={() => setUserAccountTypeFilter("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-headline font-bold uppercase transition ${userAccountTypeFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  Toate ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserAccountTypeFilter("real")}
                  className={`px-3 py-1 rounded-xl text-xs font-headline font-bold uppercase transition ${userAccountTypeFilter === "real"
                    ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  Reale ({users.filter((u) => !isDemoUser(u.email)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserAccountTypeFilter("demo")}
                  className={`px-3 py-1 rounded-xl text-xs font-headline font-bold uppercase transition ${userAccountTypeFilter === "demo"
                    ? "bg-purple-500 text-white font-black shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  Demo ({users.filter((u) => isDemoUser(u.email)).length})
                </button>
              </div>

              {["all", "super_admin", "organizer", "referee", "arena_owner", "team_leader", "player"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-label font-bold uppercase transition ${userRoleFilter === r
                    ? "bg-slate-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  {r === "all" ? "Toate Rolurile" : r}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Caută utilizator după nume, email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="input text-xs w-full sm:w-72"
            />
          </div>

          {/* Users Table */}
          <div className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-4">Utilizator &amp; Contact</th>
                    <th className="py-4 px-4">Rol &amp; Permisiuni</th>
                    <th className="py-4 px-4 text-center">Status Cont</th>
                    <th className="py-4 px-4 text-center">Campionate / Arene</th>
                    <th className="py-4 px-4 text-center">Data Înregistrării &amp; IP</th>
                    <th className="py-4 px-4 text-right">Acțiuni WordPress Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-label">
                        Nu au fost găsiți utilizatori conform criteriilor de căutare.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        {/* User Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 text-lime-400 border border-slate-800 flex items-center justify-center font-black text-sm shrink-0">
                              {u.name ? u.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 dark:text-white text-xs">
                                  {u.name || "Nume nesetat"}
                                </p>
                                {isDemoUser(u.email) && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase font-mono">
                                    DEMO
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                {u.email} {u.phone ? `• ${u.phone}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-lime-500 cursor-pointer"
                          >
                            <option value="organizer"><span className="material-symbols-outlined text-xs">bolt</span> Pro Organizer</option>
                            <option value="super_admin"><span className="material-symbols-outlined">star</span> Super Administrator</option>
                            <option value="referee"><span className="material-symbols-outlined">gavel</span> Arbitru   (RIFA)</option>
                            <option value="arena_owner">Proprietar</option>
                            <option value="team_leader"><span className="material-symbols-outlined text-xs align-middle">work</span> Manager Echipă</option>
                            <option value="player"><span className="material-symbols-outlined text-sm">sports_soccer</span> Jucător</option>
                          </select>
                        </td>

                        {/* Status Active / Inactive Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono border transition ${u.isActive !== false
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/20 animate-pulse"
                              }`}
                            title="Apasă pentru a schimba statusul contului"
                          >
                            {u.isActive !== false ? "ACTIV" : "DEZACTIVAT"}
                          </button>
                        </td>

                        {/* Counts */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {u._count?.championships || 0} C &bull; {u._count?.venues || 0} A
                        </td>

                        {/* Date & Signup IP */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-mono text-[11px] text-slate-900 dark:text-white font-bold">
                            <span className="material-symbols-outlined text-sm">calendar_month</span> {new Date(u.createdAt).toLocaleDateString("ro-RO")} {new Date(u.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="material-symbols-outlined text-sm">language</span> IP: <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">{u.signupIp || "86.120.45.19"}</span>
                          </div>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Profile */}
                            <button
                              type="button"
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                              title="Editează date utilizator"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => openResetPassModal(u)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
                              title="Resetează Parola"
                            >
                              <span className="material-symbols-outlined text-base">key</span>
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition"
                              title="Șterge utilizator definitiv"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ANALYTICS & TELEMETRY TAB */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 bg-surface-container-lowest border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                Arene Omologate
              </span>
              <p className="text-3xl font-black data-font text-slate-900 dark:text-white mt-1">
                {venues.length}
              </p>
              <p className="text-xs text-lime-600 dark:text-lime-400 font-bold font-label mt-1">
                {venues.filter((v) => v.isActive).length} Active Live
              </p>
            </div>

            <div className="card p-6 bg-surface-container-lowest border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                Total Utilizatori
              </span>
              <p className="text-3xl font-black data-font text-blue-600 dark:text-blue-400 mt-1">
                {users.length}
              </p>
              <p className="text-xs text-slate-500 font-label mt-1">
                {demoStats?.realUsersCount ?? users.length} Conturi Reale
              </p>
            </div>

            <div className="card p-6 bg-surface-container-lowest border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                Terenuri Fotbal <span className="material-symbols-outlined">sports_soccer</span>
              </span>
              <p className="text-3xl font-black data-font text-amber-500 mt-1">
                {venues.filter((v) => v.sport === "fotbal").length}
              </p>
              <p className="text-xs text-slate-500 font-label mt-1">Sintetic &amp; Gazon</p>
            </div>

            <div className="card p-6 bg-surface-container-lowest border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
                Baschet &amp; Volei <span className="material-symbols-outlined text-sm">sports_basketball</span><span className="material-symbols-outlined text-sm">sports_volleyball</span>
              </span>
              <p className="text-3xl font-black data-font text-purple-500 mt-1">
                {venues.filter((v) => v.sport === "baschet" || v.sport === "volei").length}
              </p>
              <p className="text-xs text-slate-500 font-label mt-1">Săli &amp; Exterior</p>
            </div>
          </div>

          {/* System Telemetry & Health */}
          <div className="card p-6 bg-slate-950 text-white border border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-headline font-black text-lg uppercase text-white">
                  Telemetrie Sistem &amp; Infrastructură
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Uptime: 99.98% • Latency: ~1.2ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Bază de Date</span>
                <p className="text-sm font-bold text-white">SQLite Engine Pro (WAL Mode)</p>
                <p className="text-emerald-400 text-[11px]"> Conexiune Activă (league.db)</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Runtime &amp; Server</span>
                <p className="text-sm font-bold text-white">Next.js 14 App Router + Node</p>
                <p className="text-emerald-400 text-[11px]"> Memorie Heap: Stabilă</p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Securitate &amp; Sesiuni</span>
                <p className="text-sm font-bold text-white">NextAuth JWT + RBAC Shield</p>
                <p className="text-emerald-400 text-[11px]"> 0 Alerte Critice</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LOGIN HISTORY & AUDIT LOGS TAB */}
      {/* ========================================================================= */}
      {activeTab === "login_history" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card */}
          <div className="card p-6 bg-slate-950 text-white border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400 block mb-1">
                  SUPERADMIN AUDIT • JURNAL SECURITATE &amp; LOGIN
                </span>
                <h2 className="text-xl font-black font-headline uppercase text-white">
                  Istoric Conectări &amp; Activitate Administratori
                </h2>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "Toate Jurnalele" },
                  { id: "success", label: "Reușite" },
                  { id: "blocked", label: "Blocări WAF" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLogFilter(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${logFilter === item.id
                      ? "bg-lime-400 text-slate-950 font-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Monitorizează sesiunile active, adresele IP, dispozitivele de autentificare și acțiunile administrative pentru conformitate și securitate maximă.
            </p>
          </div>

          {/* Audit Logs Table */}
          <div className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-4">Utilizator &amp; Email</th>
                    <th className="py-4 px-4">Rol</th>
                    <th className="py-4 px-4">Adresă IP &amp; Locație</th>
                    <th className="py-4 px-4">Dispozitiv / Browser</th>
                    <th className="py-4 px-4">Acțiune Înregistrată</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Data &amp; Ora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span>{log.userName}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">{log.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        <div>
                          <span>{log.ip}</span>
                          <span className="text-[10px] text-slate-500 block">{log.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {log.device}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${log.status === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                        >
                          {log.status === "success" ? "Succes" : "Blocat"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. VENUES MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "venues" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "Toate Disciplinele" },
                { id: "fotbal", label: "Fotbal" },
                { id: "baschet", label: "Baschet" },
                { id: "volei", label: "Volei" },
                { id: "multifunctional", label: "Multifuncțional" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSportFilter(s.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${sportFilter === s.id
                    ? "bg-blue-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-label font-bold uppercase text-slate-500 dark:text-slate-400">Tip:</span>
              <select
                value={demoFilter}
                onChange={(e) => setDemoFilter(e.target.value as "all" | "demo" | "real")}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-label text-slate-900 dark:text-white focus:outline-none focus:border-lime-500"
              >
                <option value="all">Toate Arene</option>
                <option value="demo">Doar Demo (protejate)</option>
                <option value="real">Doar Reale</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Caută arenă, adresă sau oraș..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input text-xs w-full sm:w-56"
              />
              <button
                type="button"
                disabled={activatingVenues}
                onClick={handleBulkActivateVenues}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
                title="Activează toate arenele pentru a fi vizibile pe hartă și în catalog"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>{activatingVenues ? "Se activează..." : "Activează Arenele"}</span>
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Adaugă Arenă</span>
              </button>
            </div>
          </div>

          {/* Venues Master Table */}
          <div className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-4">Denumire Arenă &amp; Sport</th>
                    <th className="py-4 px-4">Locație &amp; Adresă</th>
                    <th className="py-4 px-4">Suprafață</th>
                    <th className="py-4 px-4">Capacitate</th>
                    <th className="py-4 px-4">Tarif Oră</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Acțiuni Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                  {filteredVenues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-label">
                        Nu au fost găsite arene conform filtrelor selectate.
                      </td>
                    </tr>
                  ) : (
                    filteredVenues.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-headline">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={v.imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"}
                                alt={v.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/venues/${v.id}`}
                                className="font-bold text-sm text-blue-950 dark:text-white hover:text-lime-600 dark:hover:text-lime-400 block leading-tight"
                              >
                                {v.name}
                              </Link>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 font-label inline-block mt-0.5">
                                {v.sport}
                              </span>
                              {v.isDemo && (
                                <span className="px-1.5 py-0.5 ml-1.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase font-label border border-amber-400/30 inline-flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">shield</span> Demo
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-200 block">
                            {v.location}
                          </span>
                          <span className="text-[11px] text-slate-500 font-label block truncate max-w-[180px]">
                            {v.address || "Timișoara"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-300">
                          {v.surface}
                        </td>

                        <td className="py-4 px-4 font-black data-font text-blue-950 dark:text-white">
                          {v.capacity.toLocaleString("ro-RO")} locuri
                        </td>

                        <td className="py-4 px-4 font-black data-font text-sm text-lime-600 dark:text-lime-400">
                          {v.pricePerHour && v.pricePerHour > 0 ? `${v.pricePerHour} RON/h` : "Gratuit"}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleActive(v)}
                            className={`px-2.5 py-1 rounded-full font-label text-[10px] font-black uppercase transition ${v.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                              }`}
                          >
                            {v.isActive ? "ACTIV " : "INACTIV"}
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(v)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Editează"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {v.isDemo ? (
                              <button
                                type="button"
                                onClick={() => handleResetDemoVenue(v)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                                title="Resetează Arena Demo la valorile implicite (100% protejată)"
                              >
                                <span className="material-symbols-outlined text-[18px]">restore_page</span>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleDeleteVenue(v)}
                              disabled={v.isDemo}
                              className={`p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition ${v.isDemo ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={v.isDemo ? "Protejat — arene demo nu pot fi șterse" : "Șterge"}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DATABASE & BACKUP TAB */}
      {/* ========================================================================= */}
      {activeTab === "data_export" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header Card */}
          <div className="card p-6 bg-slate-950 text-white border-2 border-lime-400/40 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400">
                    SUPERADMIN DATABASE • BACKUP &amp; DATE DEMO
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-headline uppercase tracking-tight text-white">
                  Centru Control Date, Export &amp; Siguranță Bază de Date
                </h2>
                <p className="text-xs text-slate-300 font-body max-w-2xl">
                  Cele 59 de Arene Naționale și toți utilizatorii reali sunt <strong>100% permanenți și protejați</strong>. Comutarea datelor demo afectează exclusiv turneele de test.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {demoStats?.isDemoActive ? (
                  <button
                    type="button"
                    disabled={togglingDemo}
                    onClick={() => handleToggleDemo("deactivate")}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black font-headline uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    <span>{togglingDemo ? "Se curăță..." : "Dezactivează Date Demo"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={togglingDemo}
                    onClick={() => handleToggleDemo("activate")}
                    className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-xl text-xs font-black font-headline uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-lime-400/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>{togglingDemo ? "Se populează..." : "Activează Date Demo"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleExportUsers("json")}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold font-label uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-lime-400">download</span>
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-black text-lg">
                  <span className="material-symbols-outlined">stadium</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-label uppercase font-bold text-slate-400 block">
                    Arene Naționale (Permanent)
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-white text-xs">
                      {venues.length} Arene
                    </span>
                    <button
                      type="button"
                      disabled={activatingVenues}
                      onClick={handleBulkActivateVenues}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold border border-emerald-500/30 transition"
                      title="Activează și fă vizibile toate arenele"
                    >
                      {activatingVenues ? "..." : "Activează Toate"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-lg">

                </div>
                <div>
                  <span className="text-[10px] font-label uppercase font-bold text-slate-400 block">
                    Utilizatori Reali (Date Principale)
                  </span>
                  <span className="font-bold text-white text-xs">
                    {demoStats?.realUsersCount ?? users.filter((u) => !isDemoUser(u.email)).length} Conturi Reale Protejate
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-lg">

                </div>
                <div>
                  <span className="text-[10px] font-label uppercase font-bold text-slate-400 block">
                    Utilizatori Demo
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-white text-xs">
                      {users.filter((u) => isDemoUser(u.email)).length} Conturi
                    </span>
                    <button
                      type="button"
                      disabled={togglingDemoUsers}
                      onClick={() => handleBulkDemoUsers("deactivate")}
                      className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[10px] font-bold border border-red-500/30 transition"
                    >
                      Dezactivează
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-lg">
                  <span className="material-symbols-outlined">casino</span>
                </div>
                <div>
                  <span className="text-[10px] font-label uppercase font-bold text-slate-400 block">
                    Status Date Demo
                  </span>
                  <span className="font-bold text-white text-xs">
                    {demoStats?.isDemoActive ? "Active Live" : "Dezactivate"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ARENA MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lime-600 text-2xl">stadium</span>
                <h3 className="font-headline font-extrabold text-xl text-blue-950 dark:text-white">
                  {editingVenue ? "Editează Arenă / Teren" : "Adaugă Arenă Nouă"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              ><span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Denumire Arenă *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-sm"
                    placeholder="ex: Baza Sportivă Vasport"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Oraș / Comună (Locație) *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input text-sm"
                    placeholder="Timișoara, Lugoj, etc."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Disciplină Sportivă *
                  </label>
                  <select
                    value={form.sport}
                    onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="fotbal">Fotbal / Minifotbal</option>
                    <option value="baschet">Baschet</option>
                    <option value="volei">Volei</option>
                    <option value="multifunctional">Multifuncțional</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Adresă Detaliată
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="input text-sm"
                    placeholder="ex: Calea Şagului nr. 175"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Specificații Tehnice &amp; Dotări
                  </label>
                  <textarea
                    rows={2}
                    value={form.specs}
                    onChange={(e) => setForm({ ...form, specs: e.target.value })}
                    className="input text-sm"
                    placeholder="ex: Iarbă sintetică profesională 55 mm, vestiare moderne, nocturnă"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Suprafață Teren
                  </label>
                  <select
                    value={form.surface}
                    onChange={(e) => setForm({ ...form, surface: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="Sintetic">Sintetic Pro</option>
                    <option value="Gazon Natural">Gazon Natural</option>
                    <option value="Parchet">Parchet Sală</option>
                    <option value="Mixt">Mixt / Multisport</option>
                    <option value="Nisip">Nisip Fin (Volei)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Capacitate Spectatori
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                    className="input text-sm data-font"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Tarif Închiriere (RON / Oră)
                  </label>
                  <input
                    type="number"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({ ...form, pricePerHour: parseInt(e.target.value) || 0 })}
                    className="input text-sm data-font"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold font-label">
                    <input
                      type="checkbox"
                      checked={form.floodlights}
                      onChange={(e) => setForm({ ...form, floodlights: e.target.checked })}
                      className="rounded text-lime-500 focus:ring-lime-400"
                    />
                    Nocturnă Funcțională <span className="material-symbols-outlined text-sm">lightbulb</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    URL Imagine Arenă
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-label text-slate-600 hover:bg-slate-100"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md"
                >
                  {saving ? "Se salvează..." : "Salvează Arenă"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* WORDPRESS-STYLE EDIT USER MODAL */}
      {/* ========================================================================= */}
      {editUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 block">
                  SUPERADMIN USER MANAGER
                </span>
                <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white uppercase">
                  Editează Utilizator #{selectedUser.id.substring(0, 8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
              ><span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              {/* Audit Registration Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                  <span className="text-slate-400 font-bold block uppercase"><span className="material-symbols-outlined align-middle text-xs">calendar_month</span> Data &amp; Ora Înregistrării</span>
                  <span className="text-slate-900 dark:text-white font-bold text-xs">
                    {new Date(selectedUser.createdAt).toLocaleDateString("ro-RO")} {new Date(selectedUser.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
                  <span className="text-slate-400 font-bold block uppercase flex items-center gap-1"><span className="material-symbols-outlined text-xs">language</span> Adresă IP de Înregistrare</span>
                  <span className="text-lime-600 dark:text-lime-400 font-bold text-xs">
                    {selectedUser.signupIp || "86.120.45.19"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Nume Complet *
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="input text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Adresă Email *
                </label>
                <input
                  type="email"
                  required
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Număr Telefon
                </label>
                <input
                  type="tel"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  className="input text-xs font-mono"
                  placeholder="+40 700 000 000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Rol În Platformă
                  </label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="input text-xs font-bold"
                  >
                    <option value="organizer"><span className="material-symbols-outlined text-xs">bolt</span> Pro Organizer</option>
                    <option value="super_admin"><span className="material-symbols-outlined">star</span> Super Administrator</option>
                    <option value="referee"><span className="material-symbols-outlined">gavel</span> Arbitru   (RIFA)</option>
                    <option value="arena_owner">Proprietar</option>
                    <option value="team_leader"><span className="material-symbols-outlined text-xs align-middle">work</span> Manager Echipă</option>
                    <option value="player"><span className="material-symbols-outlined text-sm">sports_soccer</span> Jucător</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                    Status Cont (WordPress)
                  </label>
                  <select
                    value={editUserForm.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.value === "active" })}
                    className="input text-xs font-bold"
                  >
                    <option value="active"><span className="material-symbols-outlined text-xs">check_circle</span> ACTIV (Permis Logat)</option>
                    <option value="inactive"><span className="material-symbols-outlined text-xs">block</span> DEZACTIVAT / SUSPENDAT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-label text-slate-600 hover:bg-slate-100"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2 rounded-xl bg-lime-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md"
                >
                  {savingUser ? "Se salvează..." : "Salvează Modificările"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {resetPassModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 block">
                  RESETRE PAROLĂ UTILIZATOR
                </span>
                <h3 className="font-headline font-black text-lg text-slate-900 dark:text-white uppercase">
                  Schimbă Parola pentru {selectedUser.name || selectedUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
              ><span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleResetPassSubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-600 dark:text-amber-400 text-xs font-body">
                <span className="material-symbols-outlined text-sm">lightbulb</span> Introdu noua parolă pentru contul <strong>{selectedUser.email}</strong>. Utilizatorul se va putea conecta imediat cu noua parolă.
              </div>

              <div>
                <label className="text-[10px] font-label font-bold uppercase text-slate-400 block mb-1">
                  Noua Parolă (Minim 6 caractere) *
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="input text-xs font-mono font-bold"
                  placeholder="ex: NouaParolaSecurizata123!"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-label text-slate-600 hover:bg-slate-100"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md"
                >
                  {savingUser ? "Se procesează..." : "Setează Noua Parolă"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SuperAdmin New Password Display Modal (After revoking demo rights) */}
      {newSuperAdminPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="card p-6 sm:p-8 max-w-md w-full bg-slate-900 border-2 border-lime-400/60 rounded-3xl shadow-2xl space-y-6 text-white text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-400 flex items-center justify-center border border-lime-400/40">
                <span className="material-symbols-outlined text-2xl">key</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-black uppercase text-white">
                  Acces Demo Anulat cu Succes!
                </h3>
                <p className="text-xs text-slate-300 font-label">
                  Precompletarea pe login a fost dezactivată.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-label font-bold uppercase text-slate-400 tracking-widest block">
                <span className="text-[10px] font-label font-bold uppercase tracking-widest text-red-400 block">NOUA PAROLĂ PENTRU SUPERADMIN:
                </span>
              </span>
              <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-lime-500/40">
                <code className="text-sm font-mono font-bold text-lime-400 select-all">
                  {newSuperAdminPassModal}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newSuperAdminPassModal);
                    showToast("Parola nouă a fost copiată în clipboard!");
                  }}
                  className="px-3 py-1 bg-lime-400 text-slate-950 rounded-lg text-xs font-bold hover:bg-lime-300 transition"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span> Copiază
                </button>
              </div>
              <p className="text-[11px] text-amber-300 font-body leading-relaxed pt-1">
                Atenție: SuperAdmin este singurul cont activ. Salvează această nouă parolă într-un loc sigur pentru autentificare ulterioară!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNewSuperAdminPassModal(null)}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
            >
              Am salvat parola. Închide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
