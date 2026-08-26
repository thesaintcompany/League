import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isArenaAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isArenaAdmin(session.user as any)) {
    return NextResponse.json({ error: "Acces interzis: Doar Admin Arenă sau SuperAdmin." }, { status: 403 });
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
