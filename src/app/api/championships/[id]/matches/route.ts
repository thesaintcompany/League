import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  scheduledAt: z.string(),
  venue: z.string().max(120).optional().nullable(),
  round: z.number().int().min(1).max(50).default(1),
});

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const matches = await prisma.match.findMany({
    where: { championshipId: champ.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ matches });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.homeTeamId === parsed.data.awayTeamId) {
    return NextResponse.json(
      { error: "Home and away teams must differ" },
      { status: 400 }
    );
  }

  // verify teams belong to championship
  const teams = await prisma.team.findMany({
    where: { championshipId: champ.id, id: { in: [parsed.data.homeTeamId, parsed.data.awayTeamId] } },
  });
  if (teams.length !== 2) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      championshipId: champ.id,
      homeTeamId: parsed.data.homeTeamId,
      awayTeamId: parsed.data.awayTeamId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      venue: parsed.data.venue ?? null,
      round: parsed.data.round,
      status: "scheduled",
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}
