import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  sport: z.string().min(2).max(40),
  format: z.enum(["round_robin", "knockout", "groups_knockout"]),
  season: z.string().max(40).optional().nullable(),
  startDate: z.string().min(8),
  endDate: z.string().min(8).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
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

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const champ = await prisma.championship.create({
    data: {
      ownerId: (session.user as any).id,
      name: parsed.data.name,
      sport: parsed.data.sport,
      format: parsed.data.format,
      season: parsed.data.season ?? null,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      description: parsed.data.description ?? null,
    },
  });

  return NextResponse.json({ championship: champ }, { status: 201 });
}
