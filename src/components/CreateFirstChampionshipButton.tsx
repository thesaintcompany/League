"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isOrganizer, isTeamLeader } from "@/lib/permissions";

export function CreateFirstChampionshipButton() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick() {
    if (!session?.user) {
      router.push("/signin?callbackUrl=/dashboard/new");
      return;
    }

    if (!isOrganizer(session.user) && !isTeamLeader(session.user)) {
      router.push("/signin?error=organizer_required");
      return;
    }

    router.push("/dashboard/new");
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
