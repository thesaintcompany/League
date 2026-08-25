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
  referee: z.string().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  events: z.string().optional().nullable(),
  homeOffsides: z.number().int().min(0).optional(),
  awayOffsides: z.number().int().min(0).optional(),
  homeFouls: z.number().int().min(0).optional(),
  awayFouls: z.number().int().min(0).optional(),
  homeCorners: z.number().int().min(0).optional(),
  awayCorners: z.number().int().min(0).optional(),
  homePenalties: z.string().optional().nullable(),
  awayPenalties: z.string().optional().nullable(),
  pitchCondition: z.string().optional().nullable(),
  crowdConduct: z.string().optional().nullable(),
  refereeNotes: z.string().max(2000).optional().nullable(),
  signedBy: z.string().max(120).optional().nullable(),
  signedAt: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  ctx: { params: { id: string; matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const match = await prisma.match.findUnique({
    where: { id: ctx.params.matchId },
    include: { championship: true },
  });

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
  if (parsed.data.referee !== undefined) data.referee = parsed.data.referee;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  if (parsed.data.events !== undefined) data.events = parsed.data.events;
  if (parsed.data.homeOffsides !== undefined) data.homeOffsides = parsed.data.homeOffsides;
  if (parsed.data.awayOffsides !== undefined) data.awayOffsides = parsed.data.awayOffsides;
  if (parsed.data.homeFouls !== undefined) data.homeFouls = parsed.data.homeFouls;
  if (parsed.data.awayFouls !== undefined) data.awayFouls = parsed.data.awayFouls;
  if (parsed.data.homeCorners !== undefined) data.homeCorners = parsed.data.homeCorners;
  if (parsed.data.awayCorners !== undefined) data.awayCorners = parsed.data.awayCorners;
  if (parsed.data.homePenalties !== undefined) data.homePenalties = parsed.data.homePenalties;
  if (parsed.data.awayPenalties !== undefined) data.awayPenalties = parsed.data.awayPenalties;
  if (parsed.data.pitchCondition !== undefined) data.pitchCondition = parsed.data.pitchCondition;
  if (parsed.data.crowdConduct !== undefined) data.crowdConduct = parsed.data.crowdConduct;
  if (parsed.data.refereeNotes !== undefined) data.refereeNotes = parsed.data.refereeNotes;
  if (parsed.data.signedBy !== undefined) data.signedBy = parsed.data.signedBy;
  if (parsed.data.signedAt) data.signedAt = new Date(parsed.data.signedAt);

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

  const match = await prisma.match.findUnique({
    where: { id: ctx.params.matchId },
    include: { championship: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.match.delete({ where: { id: match.id } });
  return NextResponse.json({ ok: true });
}
