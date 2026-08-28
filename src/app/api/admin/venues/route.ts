import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const venueSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(120),
  address: z.string().max(200).optional().nullable(),
  specs: z.string().max(500).optional().nullable(),
  sport: z.string().default("fotbal"),
  surface: z.string().max(50).default("Sintetic"),
  capacity: z.number().int().min(0).default(100),
  floodlights: z.boolean().default(true),
  pricePerHour: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
});

import { isArenaAdmin } from "@/lib/permissions";
import { logAuditAction } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport");
  const query = searchParams.get("q");

  const where: any = {};
  if (sport && sport !== "all") {
    where.sport = sport;
  }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { location: { contains: query } },
      { address: { contains: query } },
    ];
  }

  const venues = await prisma.venue.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ venues });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isArenaAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis: Doar Admin Arenă sau SuperAdmin." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = venueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let dbUser = user.id ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
  if (!dbUser && session.user.email) {
    dbUser = await prisma.user.findUnique({ where: { email: session.user.email.trim().toLowerCase() } });
  }

  const venue = await prisma.venue.create({
    data: {
      ...parsed.data,
      ownerId: dbUser?.id || null,
    },
  });

  await logAuditAction({
    userId: user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    userRole: user.role || "arena_owner",
    action: "VENUE_CREATE",
    details: `A fost adăugată arena "${venue.name}" (${venue.location}, sport: ${venue.sport})`,
    entityType: "venue",
    entityId: venue.id,
  });

  return NextResponse.json({ venue }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isArenaAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "activate_all") {
    const updated = await prisma.venue.updateMany({
      data: {
        isActive: true,
        status: "activ",
      },
    });

    await logAuditAction({
      userId: user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userRole: user.role || "super_admin",
      action: "VENUE_BULK_ACTIVATE",
      details: `Au fost activate și făcute vizibile live toate cele ${updated.count} arene din baza de date.`,
      entityType: "venue",
    });

    return NextResponse.json({
      success: true,
      message: `Toate cele ${updated.count} arene au fost activate și sunt acum 100% vizibile pe platformă!`,
      count: updated.count,
    });
  }

  if (action === "deactivate_all") {
    const updated = await prisma.venue.updateMany({
      data: {
        isActive: false,
      },
    });

    await logAuditAction({
      userId: user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      userRole: user.role || "super_admin",
      action: "VENUE_BULK_DEACTIVATE",
      details: `Au fost dezactivate ${updated.count} arene.`,
      entityType: "venue",
    });

    return NextResponse.json({
      success: true,
      message: `${updated.count} arene au fost dezactivate.`,
      count: updated.count,
    });
  }

  return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
}
