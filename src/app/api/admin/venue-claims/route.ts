import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "superadmin") {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const claims = await prisma.venueClaim.findMany({
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          location: true,
          county: true,
          capacity: true,
          sport: true,
          ownerId: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    claims,
    pendingCount: claims.filter((c) => c.status === "pending").length,
  });
}
