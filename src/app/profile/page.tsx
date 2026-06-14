import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Profilul meu</h1>

        <div className="mt-8 card p-6 space-y-4">
          <div>
            <label className="label">Nume</label>
            <div className="text-slate-900">{session.user.name || "—"}</div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="text-slate-900">{session.user.email}</div>
          </div>
          <p className="text-sm text-slate-500 pt-4 border-t border-slate-100">
            Opțiunile de editare a profilului vor fi adăugate în curând.
          </p>
        </div>
      </main>
    </>
  );
}
