import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { AdminSuperPanel } from "@/components/AdminSuperPanel";
import Link from "next/link";

import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminMasterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Consolă SuperAdmin • Gestiune Baze &amp; Utilizatori"
          subtitle="Control complet peste cele 33 de arene din Județul Timiș și conturile platformei"
        />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-black uppercase tracking-wider font-label shadow-sm">
                  SuperAdmin Mode
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-label">
                  Județul Timiș (Fotbal, Baschet, Volei, Multifuncțional)
                </span>
              </div>
              <h1 className="text-3xl font-black italic tracking-tight font-headline uppercase text-slate-900 dark:text-white mt-1">
                Gestiune Arene &amp; Toți Utilizatorii
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/venues"
                className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl"
              >
                Catalog Public Arene ↗
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-5 rounded-xl bg-primary text-white hover:bg-slate-800 shadow-sm"
              >
                Panou Turnee
              </Link>
            </div>
          </div>

          <AdminSuperPanel />
        </main>
      </div>
    </div>
  );
}
