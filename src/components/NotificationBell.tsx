"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  teamId?: string | null;
  teamName?: string | null;
  teamLogo?: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  async function handleDeleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      const target = notifications.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silent
    }
  }

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center justify-center border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
        aria-label="Notificări"
        title="Notificări & Invitații"
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">
          {unreadCount > 0 ? "notifications_active" : "notifications"}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse font-mono shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-600 dark:text-lime-400 text-lg">notifications</span>
              <h3 className="font-headline font-black text-xs sm:text-sm uppercase text-slate-900 dark:text-white">
                Notificări &amp; Invitații
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                  {unreadCount} noi
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold"
              >
                Marchează citite
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-3xl text-slate-400 block">notifications_off</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">Nu ai nicio notificare</p>
                <p className="text-[11px] text-slate-400">Invitațiile în loturi de echipă și anunțurile vor apărea aici.</p>
              </div>
            ) : (
              notifications.map((n) => {
                let badgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                let iconName = "info";

                if (n.type === "team_invite") {
                  badgeColor = "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300 border border-lime-300/40";
                  iconName = "mail";
                } else if (n.type === "team_removed") {
                  badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/40";
                  iconName = "person_remove";
                } else if (n.type === "team_joined") {
                  badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40";
                  iconName = "how_to_reg";
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) handleMarkAsRead(n.id);
                    }}
                    className={`p-3.5 sm:p-4 transition flex items-start gap-3 cursor-pointer ${
                      n.read
                        ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-80"
                        : "bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${badgeColor}`}>
                      <span className="material-symbols-outlined text-base">{iconName}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(n.createdAt).toLocaleDateString("ro-RO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>

                      {n.link && (
                        <div className="mt-2">
                          <Link
                            href={n.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-700 dark:text-lime-400 hover:underline"
                          >
                            <span>Vezi Detalii / Răspunde</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(n.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition shrink-0"
                      title="Șterge notificare"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-center shrink-0">
            <Link
              href="/profile?tab=notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-lime-600 dark:hover:text-lime-400 uppercase tracking-wider block py-1"
            >
              Vezi Toate Notificările în Profil ↗
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
