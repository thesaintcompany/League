"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const user = session?.user as any;
  const isImpersonating = Boolean(user?.isImpersonating || user?.impersonator);
  const impersonator = user?.impersonator;

  if (!isImpersonating || !impersonator) {
    return null;
  }

  const roleLabels: Record<string, string> = {
    super_admin: "Super Administrator",
    superadmin: "Super Administrator",
    organizer: "Organizator Campionat",
    referee: "Arbitru Omologat",
    arena_owner: "Proprietar Arenă",
    team_leader: "Manager Echipă",
    player: "Jucător",
  };

  const currentRole = roleLabels[user?.role] || user?.role || "Utilizator";

  async function handleExitImpersonation() {
    if (isExiting) return;
    setIsExiting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/impersonate/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Nu s-a putut genera tokenul de revenire.");
      }

      // Re-authenticate as original SuperAdmin
      const signInResult = await signIn("credentials", {
        impersonateToken: data.token,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Force full reload and navigate back to users tab in superadmin dashboard
      window.location.href = data.destination || "/dashboard/admin?tab=users";
    } catch (err: any) {
      console.error("[Exit Impersonation Error]", err);
      setErrorMsg(err?.message || "Eroare la revenire");
      setIsExiting(false);
    }
  }

  return (
    <div className="sticky top-0 z-[9999] w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-3 sm:px-6 py-2.5 shadow-xl border-b border-amber-400/60 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Left Side Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-md">
            <span className="material-symbols-outlined text-lg animate-pulse">switch_account</span>
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 font-mono font-black text-[9px] uppercase tracking-wider shadow-sm">
                Mod Impersonare Activ
              </span>
              <span className="text-xs font-headline font-black text-slate-950 truncate">
                {user?.name || user?.email}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-slate-950 font-bold text-[10px] font-mono">
                {currentRole}
              </span>
            </div>

            <p className="text-[11px] text-slate-900/90 font-medium truncate mt-0.5">
              Autentificat prin SuperAdmin:{" "}
              <strong>{impersonator.name || impersonator.email}</strong>
            </p>
          </div>
        </div>

        {/* Right Side Action Button */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {errorMsg && (
            <span className="text-[10px] font-bold text-red-950 bg-red-200 px-2 py-1 rounded">
              {errorMsg}
            </span>
          )}

          <button
            type="button"
            onClick={handleExitImpersonation}
            disabled={isExiting}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {isExiting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Revenire în curs...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">undo</span>
                <span>Revino la SuperAdmin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
