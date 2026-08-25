import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1, "Numele campionatului este obligatoriu").max(120),
  sport: z.string().default("Fotbal"),
  format: z.string().default("round_robin"),
  season: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const championships = await prisma.championship.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true, matches: true } } },
  });

  return NextResponse.json({ championships });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Date invalide: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { name, sport, format, season, startDate, endDate, description } = parsed.data;

    let parsedStartDate = new Date();
    if (startDate && startDate.trim() !== "") {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) parsedStartDate = d;
    }

    let parsedEndDate: Date | null = null;
    if (endDate && endDate.trim() !== "") {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) parsedEndDate = d;
    }

    const champ = await prisma.championship.create({
      data: {
        ownerId: (session.user as any).id,
        name: name.trim(),
        sport: sport?.trim() || "Fotbal",
        format: format?.trim() || "round_robin",
        season: season?.trim() || "2025-2026",
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ championship: champ }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating championship:", err);
    return NextResponse.json(
      { error: err.message || "Eroare la crearea campionatului." },
      { status: 500 }
    );
  }
}
