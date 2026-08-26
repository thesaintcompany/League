"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { OrganizerTeamsPanel } from "@/components/OrganizerTeamsPanel";

export default function OrganizerTeamsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Echipe Organizator & Invitații"
          subtitle="Gestiune invitații echipe, înscriere manageri noi și extragere prin sistemul de zaruri"
        />

        <main className="p-4 sm:p-6 lg:p-10">
          <OrganizerTeamsPanel />
        </main>
      </div>
    </div>
  );
}
