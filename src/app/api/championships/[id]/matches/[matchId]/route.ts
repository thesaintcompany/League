import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["scheduled", "live", "finished"]).optional(),
  homeScore: z.number().int().min(0).optional().nullable(),
  awayScore: z.number().int().min(0).optional().nullable(),
  scheduledAt: z.string().optional(),
  venue: z.string().max(120).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

async function ownMatch(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { championship: true },
  });
  if (!match || match.championship.ownerId !== userId) return null;
  return match;
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string; matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const match = await ownMatch((session.user as any).id, ctx.params.matchId);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data: any = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.homeScore !== undefined) data.homeScore = parsed.data.homeScore;
  if (parsed.data.awayScore !== undefined) data.awayScore = parsed.data.awayScore;
  if (parsed.data.scheduledAt) data.scheduledAt = new Date(parsed.data.scheduledAt);
  if (parsed.data.venue !== undefined) data.venue = parsed.data.venue;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

  // if going live/finished, ensure scores are set
  if ((data.status === "live" || data.status === "finished") &&
      (data.homeScore == null || data.awayScore == null)) {
    return NextResponse.json(
      { error: "Scores required for live/finished" },
      { status: 400 }
    );
  }

  const updated = await prisma.match.update({
    where: { id: match.id },
    data,
  });

  return NextResponse.json({ match: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string; matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const match = await ownMatch((session.user as any).id, ctx.params.matchId);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.match.delete({ where: { id: match.id } });
  return NextResponse.json({ ok: true });
}
