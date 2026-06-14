import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const championships = await prisma.championship.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true, matches: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Campionatele tale</h1>
            <p className="mt-1 text-sm text-slate-600">
              Bun venit, {session.user.name || session.user.email}!
            </p>
          </div>
          <Link href="/dashboard/new" className="btn-primary gap-1">
            <Plus className="h-4 w-4" /> Campionat nou
          </Link>
        </div>

        {championships.length === 0 ? (
          <div className="mt-12 card p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Niciun campionat încă</h2>
            <p className="mt-2 text-sm text-slate-600">
              Creează primul campionat și începe să adaugi echipe și meciuri.
            </p>
            <Link href="/dashboard/new" className="btn-primary mt-6 inline-flex">
              <Plus className="h-4 w-4 mr-1" /> Creează primul campionat
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {championships.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/championships/${c.id}`}
                className="card p-6 transition hover:shadow-md hover:border-brand-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge-slate">{c.sport}</span>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 line-clamp-1">{c.name}</h3>
                    {c.season && <p className="text-sm text-slate-500">{c.season}</p>}
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-slate-600">
                  <span>{c._count.teams} echipe</span>
                  <span>•</span>
                  <span>{c._count.matches} meciuri</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
