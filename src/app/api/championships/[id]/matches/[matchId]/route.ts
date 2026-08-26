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

async function advanceBracketWinner(updatedMatch: any) {
  if (updatedMatch.status !== "finished") return;

  const homeScore = updatedMatch.homeScore ?? 0;
  const awayScore = updatedMatch.awayScore ?? 0;

  // Determine winner team ID
  let winnerId = updatedMatch.homeTeamId;
  if (awayScore > homeScore) {
    winnerId = updatedMatch.awayTeamId;
  } else if (homeScore === awayScore) {
    // If tied, check penalties if available or default to home team
    const homePen = parseInt(updatedMatch.homePenalties || "0") || 0;
    const awayPen = parseInt(updatedMatch.awayPenalties || "0") || 0;
    if (awayPen > homePen) {
      winnerId = updatedMatch.awayTeamId;
    }
  }

  if (!winnerId) return;

  const currentRound = updatedMatch.round || 1;
  const currentBracketIndex = updatedMatch.bracketIndex ?? 0;
  const currentStage = updatedMatch.stage || "quarter_final";

  // If already at final (round 3 or stage === "final"), no next match to advance to
  if (currentStage === "final" || currentRound >= 3) return;

  const nextRound = currentRound + 1;
  const nextStage = currentStage === "quarter_final" ? "semi_final" : "final";
  const nextBracketIndex = Math.floor(currentBracketIndex / 2);
  const isHomeSlot = currentBracketIndex % 2 === 0;

  // Find existing next match in bracket
  const existingNextMatch = await prisma.match.findFirst({
    where: {
      championshipId: updatedMatch.championshipId,
      OR: [
        { round: nextRound, bracketIndex: nextBracketIndex },
        { stage: nextStage, bracketIndex: nextBracketIndex },
      ],
    },
  });

  if (existingNextMatch) {
    // Update existing next match with advancing winner
    await prisma.match.update({
      where: { id: existingNextMatch.id },
      data: isHomeSlot ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
    });
  } else {
    // Get another team from championship as fallback opponent if needed
    const champTeams = await prisma.team.findMany({
      where: { championshipId: updatedMatch.championshipId },
      take: 2,
    });
    const fallbackOpponent = champTeams.find((t) => t.id !== winnerId)?.id || winnerId;

    await prisma.match.create({
      data: {
        championshipId: updatedMatch.championshipId,
        round: nextRound,
        stage: nextStage,
        bracketIndex: nextBracketIndex,
        homeTeamId: isHomeSlot ? winnerId : fallbackOpponent,
        awayTeamId: !isHomeSlot ? winnerId : fallbackOpponent,
        scheduledAt: new Date((updatedMatch.scheduledAt ? new Date(updatedMatch.scheduledAt).getTime() : Date.now()) + 2 * 86400000),
        status: "scheduled",
        venue: updatedMatch.venue || "Stadion Principal",
        notes: `Precompletat automat - Câștigătoarea din Meciul #${currentBracketIndex + 1} (${currentStage})`,
      },
    });
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string; matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const match = await prisma.match.findUnique({
    where: { id: ctx.params.matchId },
    include: { championship: true },
  });

  if (!match) return NextResponse.json({ error: "Meciul nu a fost găsit" }, { status: 404 });

  // Check strict RBAC authorization:
  // 1. Organizer owner or organizer role
  // 2. Assigned referee matching name or referee role
  const isOrganizer = user.role === "organizer" || match.championship.ownerId === user.id;
  const isAssignedReferee =
    user.role === "referee" &&
    (!match.referee ||
      match.referee.toLowerCase().includes(user.name?.toLowerCase() || "") ||
      (user.name && user.name.toLowerCase().includes(match.referee.toLowerCase())));

  if (!isOrganizer && !isAssignedReferee) {
    return NextResponse.json(
      {
        error:
          "Acces interzis: Doar arbitrul delegat la acest meci sau organizatorul campionatului pot modifica scorul, telemetria și raportul oficial.",
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
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

  if (updated.status === "finished") {
    await advanceBracketWinner(updated);
  }

  return NextResponse.json({ match: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string; matchId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const match = await prisma.match.findUnique({
    where: { id: ctx.params.matchId },
    include: { championship: true },
  });
  if (!match) return NextResponse.json({ error: "Meciul nu a fost găsit" }, { status: 404 });

  const isOrganizer = user.role === "organizer" || match.championship.ownerId === user.id;
  if (!isOrganizer) {
    return NextResponse.json(
      { error: "Doar organizatorul campionatului poate șterge meciuri." },
      { status: 403 }
    );
  }

  await prisma.match.delete({ where: { id: match.id } });
  return NextResponse.json({ ok: true });
}
