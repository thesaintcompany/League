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
  sport: z.enum(["fotbal", "baschet", "volei", "multifunctional"]).default("fotbal"),
  surface: z.string().max(50).default("Sintetic"),
  capacity: z.number().int().min(0).default(100),
  floodlights: z.boolean().default(true),
  pricePerHour: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
});

import { isArenaAdmin } from "@/lib/permissions";

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

  const venue = await prisma.venue.create({
    data: {
      ...parsed.data,
      ownerId: user.id,
    },
  });

  return NextResponse.json({ venue }, { status: 201 });
}
