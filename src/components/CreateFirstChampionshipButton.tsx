"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isOrganizer, isTeamLeader } from "@/lib/permissions";

export function CreateFirstChampionshipButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = (session?.user as any)?.role?.toLowerCase() || "";
  const isTeamManager = userRole === "team_leader" || userRole === "team_manager";

  function handleClick() {
    if (isTeamManager) return;

    if (!session?.user) {
      router.push("/signup?role=organizer&callbackUrl=/dashboard/new");
      return;
    }

    if (!isOrganizer(session.user)) {
      router.push("/signin?error=organizer_required");
      return;
    }

    router.push("/dashboard/new");
  }

  if (isTeamManager) {
    return (
      <button
        type="button"
        disabled
        title="Managerii de echipă nu pot crea campionate (doar organizatorii)"
        className="btn mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-3 px-6 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60 shadow-none"
      >
        <span className="material-symbols-outlined text-[18px]">lock</span>
        Creează Primul Campionat (Inactiv)
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-primary mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-3 px-6 rounded-xl bg-slate-950 dark:bg-lime-400 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-lime-300 shadow-md"
    >
      <span className="material-symbols-outlined text-[18px]">add_circle</span>
      Creează Primul Campionat
    </button>
  );
}
