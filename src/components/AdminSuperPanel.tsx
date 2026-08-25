"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  refereeBadge?: string | null;
  createdAt: string;
  _count?: {
    championships: number;
    venues: number;
  };
}

export function AdminSuperPanel() {
  const [activeTab, setActiveTab] = useState<"venues" | "users">("venues");
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");

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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        fetch("/api/admin/venues"),
        fetch("/api/admin/users"),
      ]);
      const vData = await vRes.json();
      const uData = await uRes.json();
      if (vData.venues) setVenues(vData.venues);
      if (uData.users) setUsers(uData.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        // PATCH
        const res = await fetch(`/api/admin/venues/${editingVenue.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast(`Arena "${form.name}" a fost actualizată! ✓`);
          setModalOpen(false);
          loadData();
        }
      } else {
        // POST
        const res = await fetch(`/api/admin/venues`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showToast(`Arena "${form.name}" a fost adăugată în baza de date! ✓`);
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

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        showToast(`Rolul utilizatorului a fost actualizat la "${newRole}"! ✓`);
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const matchesSport = sportFilter === "all" || v.sport === sportFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      (v.address && v.address.toLowerCase().includes(q));
    return matchesSport && matchesQuery;
  });

  const footballCount = venues.filter((v) => v.sport === "fotbal").length;
  const basketballCount = venues.filter((v) => v.sport === "baschet").length;
  const volleyballCount = venues.filter((v) => v.sport === "volei").length;
  const multiCount = venues.filter((v) => v.sport === "multifunctional").length;

  return (
    <div className="space-y-8 font-body">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-blue-950 text-white border border-lime-400/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-lime-400">verified</span>
          <span className="text-xs font-bold font-label">{toast}</span>
        </div>
      )}

      {/* Hero Stats Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Total Arene Timiș
          </span>
          <p className="text-3xl font-black data-font text-blue-950 dark:text-white mt-1">
            {venues.length}
          </p>
          <p className="text-[11px] text-lime-600 dark:text-lime-400 font-label font-bold mt-1">
            {venues.filter((v) => v.isActive).length} Active Live ✓
          </p>
        </div>

        <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Terenuri Fotbal ⚽
          </span>
          <p className="text-3xl font-black data-font text-blue-950 dark:text-white mt-1">
            {footballCount}
          </p>
          <p className="text-[11px] text-slate-500 font-label">Timișoara &amp; Județ</p>
        </div>

        <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Terenuri Baschet 🏀
          </span>
          <p className="text-3xl font-black data-font text-amber-500 mt-1">
            {basketballCount}
          </p>
          <p className="text-[11px] text-slate-500 font-label">Parchet &amp; Aer Liber</p>
        </div>

        <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Terenuri Volei 🏐
          </span>
          <p className="text-3xl font-black data-font text-cyan-500 mt-1">
            {volleyballCount}
          </p>
          <p className="text-[11px] text-slate-500 font-label">Sală &amp; Nisip Fin</p>
        </div>

        <div className="card p-5 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400">
            Multifuncționale 🏟️
          </span>
          <p className="text-3xl font-black data-font text-purple-500 mt-1">
            {multiCount}
          </p>
          <p className="text-[11px] text-slate-500 font-label">Timiș 4 All, UPT etc.</p>
        </div>
      </div>

      {/* Main Tab Switcher & Action Bar */}
      <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("venues")}
            className={`px-5 py-2.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "venues"
                ? "bg-primary text-white shadow-sm font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-blue-950"
            }`}
          >
            🏟️ Gestiune Arene ({venues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition ${
              activeTab === "users"
                ? "bg-primary text-white shadow-sm font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-blue-950"
            }`}
          >
            👥 Toți Utilizatorii ({users.length})
          </button>
        </div>

        {activeTab === "venues" && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Caută arenă, adresă sau oraș..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-xs min-w-[240px] flex-1"
            />
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Adaugă Arenă Nouă
            </button>
          </div>
        )}
      </div>

      {/* 1. VENUES TAB */}
      {activeTab === "venues" && (
        <div className="space-y-4">
          {/* Sport filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Toate Disciplinele" },
              { id: "fotbal", label: "⚽ Fotbal" },
              { id: "baschet", label: "🏀 Baschet" },
              { id: "volei", label: "🏐 Volei" },
              { id: "multifunctional", label: "🏟️ Multifuncțional" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSportFilter(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-label font-bold uppercase tracking-wider transition ${
                  sportFilter === s.id
                    ? "bg-blue-950 text-white dark:bg-lime-400 dark:text-slate-950 font-black shadow-sm"
                    : "bg-surface-container-low text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Venues Master Table */}
          <div className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-4">Denumire Arenă &amp; Sport</th>
                    <th className="py-4 px-4">Locație &amp; Adresă</th>
                    <th className="py-4 px-4">Specificații &amp; Suprafață</th>
                    <th className="py-4 px-4">Capacitate &amp; Nocturnă</th>
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
                        {/* Name & Sport */}
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
                            </div>
                          </div>
                        </td>

                        {/* Location & Address */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-200 block">
                            {v.location}
                          </span>
                          <span className="text-[11px] text-slate-500 font-label block truncate max-w-[200px]">
                            {v.address || "Timișoara"}
                          </span>
                        </td>

                        {/* Specs & Surface */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-300 block">
                            {v.surface}
                          </span>
                          <span className="text-[11px] text-slate-500 font-label block truncate max-w-[240px]">
                            {v.specs || "Dotare standard"}
                          </span>
                        </td>

                        {/* Capacity & Floodlights */}
                        <td className="py-4 px-4">
                          <span className="font-black text-sm data-font text-blue-950 dark:text-white block">
                            {v.capacity.toLocaleString("ro-RO")} locuri
                          </span>
                          <span className="text-[10px] text-slate-500 font-label flex items-center gap-1">
                            {v.floodlights ? "💡 Nocturnă Activă" : "Fără nocturnă"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-black data-font text-sm text-lime-600 dark:text-lime-400">
                          {v.pricePerHour && v.pricePerHour > 0 ? `${v.pricePerHour} RON/h` : "Gratuit"}
                        </td>

                        {/* Status Switch */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleActive(v)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase font-label transition ${
                              v.isActive
                                ? "bg-lime-100 text-lime-900 dark:bg-lime-950/60 dark:text-lime-400 border border-lime-300"
                                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200"
                            }`}
                          >
                            {v.isActive ? "ACTIV ✓" : "INACTIV ✕"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(v)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                              title="Editează Arenă"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVenue(v)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 transition"
                              title="Șterge Arenă"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
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

      {/* 2. USERS TAB */}
      {activeTab === "users" && (
        <div className="card bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="font-label text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-4">Utilizator</th>
                  <th className="py-4 px-4">Email &amp; Telefon</th>
                  <th className="py-4 px-4">Rol Utilizator (Modificabil)</th>
                  <th className="py-4 px-4">Ecuson / Acreditare</th>
                  <th className="py-4 px-4">Campionate / Arene</th>
                  <th className="py-4 px-4 text-right">Data Înregistrării</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-body">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    {/* User Profile */}
                    <td className="py-4 px-4 font-headline">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {u.name?.substring(0, 2).toUpperCase() || "US"}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-blue-950 dark:text-white block leading-tight">
                            {u.name || "Fără Nume"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-label block">
                            ID: {u.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-900 dark:text-slate-200 block">
                        {u.email}
                      </span>
                      <span className="text-[11px] text-slate-500 font-label block">
                        {u.phone || "Fără telefon"}
                      </span>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={u.role || "organizer"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="input text-xs font-bold font-label py-1.5 px-3 rounded-xl bg-surface-container-low"
                      >
                        <option value="organizer">👑 Organizator Oficial</option>
                        <option value="referee">⚖️ Arbitru Licențiat</option>
                        <option value="player">🏃 Fotbalist / Jucător</option>
                        <option value="arena_owner">🏟️ Proprietar Arenă</option>
                        <option value="team_leader">🛡️ Lider Club / Echipă</option>
                      </select>
                    </td>

                    {/* Badge */}
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {u.refereeBadge || "—"}
                      </span>
                    </td>

                    {/* Count */}
                    <td className="py-4 px-4 text-xs font-label">
                      <span className="text-slate-600 dark:text-slate-400">
                        {u._count?.championships || 0} Campionate • {u._count?.venues || 0} Arene
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-right text-xs font-label text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              >
                ✕
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
                    <option value="fotbal">⚽ Fotbal / Minifotbal</option>
                    <option value="baschet">🏀 Baschet</option>
                    <option value="volei">🏐 Volei</option>
                    <option value="multifunctional">🏟️ Multifuncțional</option>
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
                    Nocturnă Funcțională 💡
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
                  {saving ? "Se salvează..." : "Salvează Arenă ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
