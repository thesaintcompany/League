import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicRefereesCatalog } from "@/components/PublicRefereesCatalog";

export const dynamic = "force-dynamic";

export default async function PublicRefereesPage() {
  const referees = await prisma.user.findMany({
    where: { role: "referee" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      refereeBadge: true,
      experienceYears: true,
      bio: true,
      image: true,
      coverPhotoUrl: true,
    },
    orderBy: { experienceYears: "desc" },
  });

  const formattedReferees = referees.map((r) => ({
    id: r.id,
    name: r.name || "Arbitru Oficial",
    email: r.email,
    phone: r.phone,
    refereeBadge: r.refereeBadge,
    experienceYears: r.experienceYears,
    bio: r.bio,
    image: r.image,
    coverPhotoUrl: r.coverPhotoUrl,
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <PublicHeader currentTab="referees" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <PublicRefereesCatalog initialReferees={formattedReferees} />
      </main>

      <PublicFooter />
    </div>
  );
}
