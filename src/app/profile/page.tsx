import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopHeader
          title="Profil & Setări"
          subtitle="Gestionează preferințele contului tău de organizator"
        />

        <main className="p-6 lg:p-10 max-w-3xl space-y-6">
          <div className="card p-8 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-md">
                {session.user.name ? session.user.name[0].toUpperCase() : "O"}
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline text-blue-950 dark:text-white">
                  {session.user.name || "Organizator Competiții"}
                </h2>
                <p className="text-xs text-slate-500 font-label">{session.user.email}</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-100 dark:bg-lime-950/40 text-lime-800 dark:text-lime-400 text-[10px] font-bold uppercase tracking-wider font-label mt-2">
                  Cont Pro Activ
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex justify-between items-center">
                <div>
                  <p className="text-xs font-label uppercase tracking-wider text-slate-400 font-bold">
                    Nume Afișat
                  </p>
                  <p className="text-sm font-bold text-blue-950 dark:text-white mt-0.5">
                    {session.user.name || "Nespecificat"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-slate-800/40 flex justify-between items-center">
                <div>
                  <p className="text-xs font-label uppercase tracking-wider text-slate-400 font-bold">
                    Adresă Email
                  </p>
                  <p className="text-sm font-bold text-blue-950 dark:text-white mt-0.5">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
