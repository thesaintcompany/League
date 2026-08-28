"use client";

import React, { useState } from "react";

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: "breaking" | "transfer" | "comunicat" | "match" | "attendance";
  badge: string;
  badgeColor?: string;
  author: string;
  createdAt: string | Date;
  isAutomated?: boolean;
}

interface TeamNewsFeedProps {
  news: NewsArticle[];
  teamId: string;
  teamName: string;
  isManager?: boolean;
}

export function TeamNewsFeed({ news, teamId, teamName, isManager = false }: TeamNewsFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New post form state for manager
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("comunicat");
  const [newBadge, setNewBadge] = useState("COMUNICAT OFICIAL");
  const [publishing, setPublishing] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>(news);

  const filteredNews = articles.filter((n) => {
    if (selectedFilter === "all") return true;
    return n.category === selectedFilter;
  });

  async function handleShareNews(article: NewsArticle) {
    const text = `[${article.badge}] ${article.title}\n\n${article.content}\n\n${teamName} • Știri Oficiale`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/teams/${teamId}` : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text,
          url,
        });
        return;
      } catch {
        // cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      // fallback
    }
  }

  async function handlePublishArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/team/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          title: newTitle,
          content: newContent,
          category: newCategory,
          badge: newBadge,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setArticles((prev) => [
          {
            id: data.news.id,
            title: data.news.title,
            content: data.news.content,
            category: data.news.category,
            badge: data.news.badge,
            badgeColor: "bg-sky-500 text-white",
            author: data.news.author,
            createdAt: data.news.createdAt,
            isAutomated: false,
          },
          ...prev,
        ]);
        setNewTitle("");
        setNewContent("");
        setShowAddModal(false);
      } else {
        alert(data.error || "Eroare la publicare");
      }
    } catch {
      alert("Eroare de rețea");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Filters and Manager Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {[
            { id: "all", label: "Toate Știrile", icon: "newspaper" },
            { id: "transfer", label: "Transferuri", icon: "swap_horiz" },
            { id: "breaking", label: "Breaking News", icon: "bolt" },
            { id: "comunicat", label: "Comunicate", icon: "campaign" },
            { id: "match", label: "Meciuri & Rezultate", icon: "sports_soccer" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition flex items-center gap-1.5 ${
                selectedFilter === f.id
                  ? "bg-lime-400 text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Manager Post Button */}
        {isManager && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Publică Comunicat Nou</span>
          </button>
        )}
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">feed</span>
            <p className="font-bold text-sm">Nu există știri în această categorie momentan.</p>
          </div>
        ) : (
          filteredNews.map((article) => {
            const dateStr = new Date(article.createdAt).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={article.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-lime-400/40 dark:hover:border-lime-400/40 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
              >
                {/* Top Badge & Time */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider shadow-sm ${
                        article.badgeColor || "bg-rose-500 text-white"
                      }`}
                    >
                      {article.badge}
                    </span>

                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-slate-600 dark:text-slate-300">schedule</span>
                      {dateStr}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-headline font-black text-base uppercase tracking-tight text-slate-900 dark:text-white leading-snug">
                    {article.title}
                  </h3>

                  {/* Content snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {article.content}
                  </p>
                </div>

                {/* Footer: Author + Share */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold truncate">
                    <span className="material-symbols-outlined text-sm text-lime-500">verified</span>
                    <span className="truncate">{article.author}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShareNews(article)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase transition flex items-center gap-1 shrink-0"
                    title="Distribuie pe WhatsApp sau copiază știrea"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedId === article.id ? "done" : "share"}
                    </span>
                    <span>{copiedId === article.id ? "Copiat!" : "Distribuie"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Announcement Modal (Manager Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-headline font-black text-base uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lime-500">campaign</span>
                Publică Știre / Comunicat Oficial
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400">Tip Știre</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      if (e.target.value === "breaking") setNewBadge("BREAKING NEWS");
                      if (e.target.value === "comunicat") setNewBadge("COMUNICAT OFICIAL");
                      if (e.target.value === "transfer") setNewBadge("TRANSFER NOU");
                      if (e.target.value === "match") setNewBadge("ANUNȚ MECI");
                    }}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    <option value="comunicat">Comunicat Oficial</option>
                    <option value="breaking">Breaking News</option>
                    <option value="transfer">Transfer / Înscriere</option>
                    <option value="match">Anunț Meci</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-label uppercase text-slate-400">Etichetă (Badge)</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-label uppercase text-slate-400">Titlu Știre / Anunț</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Breaking: Antrenament special vineri..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-label uppercase text-slate-400">Conținut Detaliat</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Scrie textul comunicatului pentru părinți și copii..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-headline font-black text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {publishing ? "Se publică..." : "Publică Știrea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
